"""Tests for records retention enforcement — policies, legal hold protection, cleanup."""
import uuid
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base
from app.models.audit_log import AuditLog
from app.models.client import Client
from app.models.email_log import EmailLog
from app.models.evidence import Evidence
from app.models.legal_hold import LegalHold
from app.models.notification import Notification
from app.models.offer import Offer
from app.models.retention_policy import RetentionPolicy
from app.services.backbone.records_governance import RecordsGovernance


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def db():
    """In-memory SQLite session with all tables created."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    RecordsGovernance._reset()
    yield session
    session.close()


@pytest.fixture()
def workspace_id():
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_old_evidence(db, workspace_id: str, days_old: int) -> Evidence:
    """Insert an evidence record with created_at set to `days_old` days ago."""
    ev = Evidence(
        id=uuid.uuid4(),
        workspace_id=workspace_id,
        source_url="https://example.com/old",
        source_type="article",
        publication_date=datetime.now(timezone.utc).date(),
        credibility_score=5.0,
        created_at=datetime.now(timezone.utc) - timedelta(days=days_old),
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


def _make_old_offer(db, workspace_id: str, days_old: int) -> Offer:
    """Insert an offer record with created_at set to `days_old` days ago."""
    offer = Offer(
        id=uuid.uuid4(),
        workspace_id=workspace_id,
        name="Old Offer",
        created_at=datetime.now(timezone.utc) - timedelta(days=days_old),
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer


def _create_policy(db, workspace_id: str, doc_class: str, days: int, auto_delete: bool) -> RetentionPolicy:
    """Insert a retention policy."""
    policy = RetentionPolicy(
        id=uuid.uuid4(),
        workspace_id=workspace_id,
        document_class=doc_class,
        retention_days=days,
        auto_delete=auto_delete,
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


def _create_legal_hold(db, workspace_id: str, resource_type: str, resource_id: str) -> LegalHold:
    """Insert an active legal hold."""
    hold = LegalHold(
        id=uuid.uuid4(),
        workspace_id=workspace_id,
        resource_type=resource_type,
        resource_id=resource_id,
        reason="Litigation pending",
        status="active",
        created_by=uuid.uuid4(),
    )
    db.add(hold)
    db.commit()
    db.refresh(hold)
    return hold


# ---------------------------------------------------------------------------
# Tests — get_expired_records
# ---------------------------------------------------------------------------

class TestGetExpiredRecords:
    def test_returns_expired_evidence(self, db, workspace_id):
        """Records older than retention_days should appear as expired."""
        _create_policy(db, workspace_id, "evidence", 90, auto_delete=True)
        old = _make_old_evidence(db, workspace_id, days_old=100)
        fresh = _make_old_evidence(db, workspace_id, days_old=30)

        result = RecordsGovernance.get_expired_records(db, workspace_id)
        assert len(result) == 1
        entry = result[0]
        assert entry["document_class"] == "evidence"
        assert entry["total_expired"] == 1
        assert entry["eligible_for_deletion"] == 1
        assert str(old.id) in entry["eligible_ids"]
        assert str(fresh.id) not in entry["eligible_ids"]

    def test_no_policies_returns_empty(self, db, workspace_id):
        """Without policies, no expired records should be reported."""
        _make_old_evidence(db, workspace_id, days_old=500)
        result = RecordsGovernance.get_expired_records(db, workspace_id)
        assert result == []

    def test_multiple_classes(self, db, workspace_id):
        """Policies for different classes return separate entries."""
        _create_policy(db, workspace_id, "evidence", 60, auto_delete=True)
        _create_policy(db, workspace_id, "offer", 30, auto_delete=False)
        _make_old_evidence(db, workspace_id, days_old=70)
        _make_old_offer(db, workspace_id, days_old=40)

        result = RecordsGovernance.get_expired_records(db, workspace_id)
        classes = {r["document_class"] for r in result}
        assert classes == {"evidence", "offer"}


# ---------------------------------------------------------------------------
# Tests — legal hold protection
# ---------------------------------------------------------------------------

class TestLegalHoldProtection:
    def test_held_records_excluded_from_eligible(self, db, workspace_id):
        """Records under legal hold must not appear in eligible_ids."""
        _create_policy(db, workspace_id, "evidence", 90, auto_delete=True)
        old = _make_old_evidence(db, workspace_id, days_old=100)
        _create_legal_hold(db, workspace_id, "evidence", str(old.id))

        result = RecordsGovernance.get_expired_records(db, workspace_id)
        entry = result[0]
        assert entry["total_expired"] == 1
        assert entry["eligible_for_deletion"] == 0
        assert entry["under_legal_hold"] == 1
        assert str(old.id) in entry["held_ids"]

    def test_released_hold_does_not_protect(self, db, workspace_id):
        """Released holds should not prevent deletion."""
        _create_policy(db, workspace_id, "evidence", 90, auto_delete=True)
        old = _make_old_evidence(db, workspace_id, days_old=100)
        hold = _create_legal_hold(db, workspace_id, "evidence", str(old.id))

        # Release the hold
        hold.status = "released"
        hold.released_at = datetime.now(timezone.utc)
        db.commit()

        result = RecordsGovernance.get_expired_records(db, workspace_id)
        entry = result[0]
        assert entry["eligible_for_deletion"] == 1
        assert entry["under_legal_hold"] == 0

    def test_partial_hold_mixed_records(self, db, workspace_id):
        """When some records are held and some are not, counts are correct."""
        _create_policy(db, workspace_id, "evidence", 90, auto_delete=True)
        held_rec = _make_old_evidence(db, workspace_id, days_old=100)
        free_rec = _make_old_evidence(db, workspace_id, days_old=110)
        _create_legal_hold(db, workspace_id, "evidence", str(held_rec.id))

        result = RecordsGovernance.get_expired_records(db, workspace_id)
        entry = result[0]
        assert entry["total_expired"] == 2
        assert entry["eligible_for_deletion"] == 1
        assert entry["under_legal_hold"] == 1
        assert str(free_rec.id) in entry["eligible_ids"]
        assert str(held_rec.id) in entry["held_ids"]


# ---------------------------------------------------------------------------
# Tests — execute_retention
# ---------------------------------------------------------------------------

class TestExecuteRetention:
    def test_deletes_expired_auto_delete(self, db, workspace_id):
        """execute_retention should delete eligible expired records."""
        _create_policy(db, workspace_id, "evidence", 90, auto_delete=True)
        old = _make_old_evidence(db, workspace_id, days_old=100)
        fresh = _make_old_evidence(db, workspace_id, days_old=30)

        result = RecordsGovernance.execute_retention(db, workspace_id)
        assert result["deleted_count"] == 1
        assert result["by_class"]["evidence"] == 1

        # Old record should be gone
        remaining = db.query(Evidence).filter(Evidence.workspace_id == workspace_id).all()
        remaining_ids = {str(r.id) for r in remaining}
        assert str(old.id) not in remaining_ids
        assert str(fresh.id) in remaining_ids

    def test_skips_non_auto_delete(self, db, workspace_id):
        """Policies with auto_delete=False should not cause deletions."""
        _create_policy(db, workspace_id, "evidence", 90, auto_delete=False)
        _make_old_evidence(db, workspace_id, days_old=100)

        result = RecordsGovernance.execute_retention(db, workspace_id)
        assert result["deleted_count"] == 0
        assert db.query(Evidence).filter(Evidence.workspace_id == workspace_id).count() == 1

    def test_does_not_delete_held_records(self, db, workspace_id):
        """execute_retention must skip records under legal hold."""
        _create_policy(db, workspace_id, "evidence", 90, auto_delete=True)
        old = _make_old_evidence(db, workspace_id, days_old=100)
        _create_legal_hold(db, workspace_id, "evidence", str(old.id))

        result = RecordsGovernance.execute_retention(db, workspace_id)
        assert result["deleted_count"] == 0
        assert result["skipped_legal_hold"] == 1

        # Record should still exist
        assert db.query(Evidence).filter(Evidence.id == old.id).count() == 1

    def test_mixed_auto_delete_and_holds(self, db, workspace_id):
        """Complex scenario: multiple classes, some held, some auto-delete disabled."""
        _create_policy(db, workspace_id, "evidence", 60, auto_delete=True)
        _create_policy(db, workspace_id, "offer", 30, auto_delete=False)

        ev_old = _make_old_evidence(db, workspace_id, days_old=70)
        ev_held = _make_old_evidence(db, workspace_id, days_old=80)
        of_old = _make_old_offer(db, workspace_id, days_old=40)

        _create_legal_hold(db, workspace_id, "evidence", str(ev_held.id))

        result = RecordsGovernance.execute_retention(db, workspace_id)

        # Only ev_old deleted (ev_held is held, offer auto_delete=False)
        assert result["deleted_count"] == 1
        assert result["skipped_legal_hold"] == 1
        assert result["by_class"].get("evidence") == 1
        assert "offer" not in result["by_class"]

        # Verify DB state
        assert db.query(Evidence).filter(Evidence.id == ev_old.id).count() == 0
        assert db.query(Evidence).filter(Evidence.id == ev_held.id).count() == 1
        assert db.query(Offer).filter(Offer.id == of_old.id).count() == 1
