"""Tests for email drip sequence engine and Celery tasks."""
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest

from app.models.drip_status import DripStatus
from app.services.backbone.email_drip import (
    DRIP_SEQUENCES,
    advance_drip,
    get_drip_sequence,
    get_user_drip_status,
    stop_drip,
)


# ---------------------------------------------------------------------------
# Sequence definition tests
# ---------------------------------------------------------------------------


class TestGetDripSequence:
    def test_onboarding_sequence_has_5_steps(self):
        seq = get_drip_sequence("onboarding")
        assert len(seq) == 5

    def test_trial_expiring_sequence_has_3_steps(self):
        seq = get_drip_sequence("trial_expiring")
        assert len(seq) == 3

    def test_re_engagement_sequence_has_3_steps(self):
        seq = get_drip_sequence("re_engagement")
        assert len(seq) == 3

    def test_unknown_sequence_raises_key_error(self):
        with pytest.raises(KeyError, match="Unknown drip sequence"):
            get_drip_sequence("nonexistent")

    def test_onboarding_first_step_is_immediate(self):
        seq = get_drip_sequence("onboarding")
        assert seq[0]["delay_hours"] == 0
        assert seq[0]["template_name"] == "onboarding_welcome"

    def test_onboarding_delays_are_correct(self):
        seq = get_drip_sequence("onboarding")
        expected_delays = [0, 24, 72, 168, 336]
        actual_delays = [s["delay_hours"] for s in seq]
        assert actual_delays == expected_delays

    def test_each_step_has_required_keys(self):
        required_keys = {"step", "delay_hours", "template_name", "subject_template", "conditions"}
        for name, seq in DRIP_SEQUENCES.items():
            for step_def in seq:
                assert required_keys.issubset(step_def.keys()), (
                    f"Missing keys in {name} step {step_def.get('step')}"
                )


# ---------------------------------------------------------------------------
# User drip status tests
# ---------------------------------------------------------------------------


class TestGetUserDripStatus:
    def test_returns_not_started_when_no_record(self, db):
        user_id = str(uuid.uuid4())
        result = get_user_drip_status(db, user_id, "onboarding")
        assert result["started"] is False
        assert result["current_step"] == 0
        assert result["completed"] is False

    def test_returns_status_when_record_exists(self, db):
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        status = DripStatus(
            user_id=user_id,
            sequence_name="onboarding",
            current_step=2,
            last_sent_at=now,
            next_send_at=now + timedelta(hours=48),
            created_at=now,
        )
        db.add(status)
        db.flush()

        result = get_user_drip_status(db, user_id, "onboarding")
        assert result["started"] is True
        assert result["current_step"] == 2
        assert result["next_step_info"] is not None
        assert result["next_step_info"]["template_name"] == "onboarding_first_discovery"


# ---------------------------------------------------------------------------
# Advance drip tests
# ---------------------------------------------------------------------------


class TestAdvanceDrip:
    def test_advance_creates_status_if_missing(self, db):
        user_id = str(uuid.uuid4())
        result = advance_drip(db, user_id, "onboarding")
        assert result["action"] == "sent"
        assert result["step"] == 0
        assert result["template_name"] == "onboarding_welcome"

    def test_advance_moves_to_next_step(self, db):
        user_id = str(uuid.uuid4())

        # First advance — step 0
        r1 = advance_drip(db, user_id, "onboarding")
        assert r1["step"] == 0
        assert r1["completed"] is False

        # Second advance — step 1
        r2 = advance_drip(db, user_id, "onboarding")
        assert r2["step"] == 1
        assert r2["template_name"] == "onboarding_getting_started"

    def test_advance_completes_sequence_at_last_step(self, db):
        user_id = str(uuid.uuid4())

        # Advance through all 5 onboarding steps
        for i in range(5):
            result = advance_drip(db, user_id, "onboarding")
            assert result["action"] == "sent"
            assert result["step"] == i

        # The last advance should have marked completed
        assert result["completed"] is True

    def test_advance_after_completion_is_noop(self, db):
        user_id = str(uuid.uuid4())

        # Complete the sequence
        for _ in range(5):
            advance_drip(db, user_id, "onboarding")

        # Further advance should be a no-op
        result = advance_drip(db, user_id, "onboarding")
        assert result["action"] == "none"
        assert result["reason"] == "sequence_completed"

    def test_advance_sets_next_send_at(self, db):
        user_id = str(uuid.uuid4())
        result = advance_drip(db, user_id, "onboarding")

        # After step 0, next_send_at should be set (24 hrs later)
        assert result["next_send_at"] is not None

        status = (
            db.query(DripStatus)
            .filter(DripStatus.user_id == user_id, DripStatus.sequence_name == "onboarding")
            .first()
        )
        assert status.next_send_at is not None
        assert status.current_step == 1

    def test_advance_unknown_sequence_raises(self, db):
        with pytest.raises(KeyError):
            advance_drip(db, str(uuid.uuid4()), "nonexistent")


# ---------------------------------------------------------------------------
# Stop drip tests
# ---------------------------------------------------------------------------


class TestStopDrip:
    def test_stop_marks_completed(self, db):
        user_id = str(uuid.uuid4())
        advance_drip(db, user_id, "onboarding")

        result = stop_drip(db, user_id, "onboarding")
        assert result["action"] == "stopped"

        status = (
            db.query(DripStatus)
            .filter(DripStatus.user_id == user_id)
            .first()
        )
        assert status.completed is True
        assert status.next_send_at is None

    def test_stop_nonexistent_returns_not_found(self, db):
        result = stop_drip(db, str(uuid.uuid4()), "onboarding")
        assert result["action"] == "none"
        assert result["reason"] == "not_found"


# ---------------------------------------------------------------------------
# Scheduling logic tests
# ---------------------------------------------------------------------------


class TestSchedulingLogic:
    def test_next_send_at_calculation(self, db):
        """After sending step 0 (delay=0), next should be ~24hrs later for step 1."""
        user_id = str(uuid.uuid4())
        before = datetime.now(timezone.utc)
        advance_drip(db, user_id, "onboarding")
        after = datetime.now(timezone.utc)

        status = (
            db.query(DripStatus)
            .filter(DripStatus.user_id == user_id)
            .first()
        )
        # Step 1 delay is 24hrs, step 0 delay is 0 => delta = 24hrs
        expected_min = before + timedelta(hours=24)
        expected_max = after + timedelta(hours=24)
        # SQLite may strip tzinfo; normalize for comparison
        next_at = status.next_send_at
        if next_at.tzinfo is None:
            next_at = next_at.replace(tzinfo=timezone.utc)
        assert expected_min <= next_at <= expected_max

    def test_completed_sequence_has_no_next_send(self, db):
        user_id = str(uuid.uuid4())
        for _ in range(5):
            advance_drip(db, user_id, "onboarding")

        status = (
            db.query(DripStatus)
            .filter(DripStatus.user_id == user_id)
            .first()
        )
        assert status.completed is True
        assert status.next_send_at is None

    def test_process_drip_sequences_task_exists(self):
        """Verify the Celery task is registered."""
        from app.jobs.tasks.drip_tasks import process_drip_sequences
        assert process_drip_sequences.name == "app.jobs.tasks.drip_tasks.process_drip_sequences"

    def test_enqueue_onboarding_task_exists(self):
        """Verify the Celery task is registered."""
        from app.jobs.tasks.drip_tasks import enqueue_onboarding
        assert enqueue_onboarding.name == "app.jobs.tasks.drip_tasks.enqueue_onboarding"


# ---------------------------------------------------------------------------
# Drip status model tests
# ---------------------------------------------------------------------------


class TestDripStatusModel:
    def test_to_dict(self, db):
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        status = DripStatus(
            user_id=user_id,
            sequence_name="onboarding",
            current_step=1,
            last_sent_at=now,
            next_send_at=now + timedelta(hours=24),
            created_at=now,
        )
        db.add(status)
        db.flush()

        d = status.to_dict()
        assert d["user_id"] == user_id
        assert d["sequence_name"] == "onboarding"
        assert d["current_step"] == 1
        assert d["completed"] is False
        assert d["last_sent_at"] is not None

    def test_repr(self):
        status = DripStatus(
            user_id="abc",
            sequence_name="onboarding",
            current_step=2,
            completed=False,
        )
        r = repr(status)
        assert "abc" in r
        assert "onboarding" in r
