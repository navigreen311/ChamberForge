"""Tests for RiskReviewQueue — add, approve, reject, escalate transitions."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock

from app.services.backbone.risk_review_queue import RiskReviewQueue


class FakeReview:
    """Lightweight stand-in for RiskReview that avoids SQLAlchemy instrumentation."""

    def __init__(self, **kwargs):
        defaults = {
            "id": uuid.uuid4(),
            "workspace_id": uuid.uuid4(),
            "item_type": "offer",
            "item_id": uuid.uuid4(),
            "risk_level": "medium",
            "reason": "Needs review",
            "status": "pending",
            "reviewer_id": None,
            "reviewed_at": None,
            "notes": None,
            "created_at": datetime.now(timezone.utc),
        }
        defaults.update(kwargs)
        for k, v in defaults.items():
            object.__setattr__(self, k, v)


class TestAddItem:
    def test_add_creates_pending_review(self):
        db = MagicMock()
        ws_id = uuid.uuid4()
        item_id = uuid.uuid4()

        # Capture what gets added
        added_items = []
        db.add.side_effect = lambda obj: added_items.append(obj)
        db.refresh.side_effect = lambda obj: None

        review = RiskReviewQueue.add_item(db, ws_id, "offer", item_id, "high", "Risky offer")

        assert db.add.called
        assert db.commit.called
        assert review.status == "pending"
        assert review.risk_level == "high"
        assert review.workspace_id == ws_id


class TestApprove:
    def test_approve_sets_status_and_reviewer(self):
        review = FakeReview()
        db = MagicMock()
        db.query.return_value.filter.return_value.one.return_value = review

        reviewer_id = uuid.uuid4()
        result = RiskReviewQueue.approve(db, review.id, reviewer_id, "Looks good")

        assert result.status == "approved"
        assert result.reviewer_id == reviewer_id
        assert result.reviewed_at is not None
        assert result.notes == "Looks good"
        assert db.commit.called


class TestReject:
    def test_reject_sets_status_and_reason(self):
        review = FakeReview()
        db = MagicMock()
        db.query.return_value.filter.return_value.one.return_value = review

        reviewer_id = uuid.uuid4()
        result = RiskReviewQueue.reject(db, review.id, reviewer_id, "Too risky")

        assert result.status == "rejected"
        assert result.reviewer_id == reviewer_id
        assert result.notes == "Too risky"
        assert db.commit.called


class TestEscalate:
    def test_escalate_sets_status(self):
        review = FakeReview()
        db = MagicMock()
        db.query.return_value.filter.return_value.one.return_value = review

        result = RiskReviewQueue.escalate(db, review.id, "Needs senior review")

        assert result.status == "escalated"
        assert result.notes == "Needs senior review"
        assert db.commit.called


class TestGetQueue:
    def test_get_queue_filters_by_workspace_and_status(self):
        db = MagicMock()
        ws_id = uuid.uuid4()
        mock_query = db.query.return_value.filter.return_value.order_by.return_value
        mock_query.offset.return_value.limit.return_value.all.return_value = []

        result = RiskReviewQueue.get_queue(db, ws_id, "pending", 0, 20)

        assert result == []
        assert db.query.called
