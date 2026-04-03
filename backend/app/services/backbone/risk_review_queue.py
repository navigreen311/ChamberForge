"""RiskReviewQueue — CRUD operations for the risk-review queue."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.risk_review import RiskReview


class RiskReviewQueue:
    """Manage the risk-review queue backed by the risk_reviews table."""

    @staticmethod
    def add_item(
        db: Session,
        workspace_id: uuid.UUID,
        item_type: str,
        item_id: uuid.UUID,
        risk_level: str,
        reason: str,
    ) -> RiskReview:
        review = RiskReview(
            workspace_id=workspace_id,
            item_type=item_type,
            item_id=item_id,
            risk_level=risk_level,
            reason=reason,
            status="pending",
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        return review

    @staticmethod
    def get_queue(
        db: Session,
        workspace_id: uuid.UUID,
        status: str = "pending",
        skip: int = 0,
        limit: int = 20,
    ) -> list[RiskReview]:
        return (
            db.query(RiskReview)
            .filter(RiskReview.workspace_id == workspace_id, RiskReview.status == status)
            .order_by(RiskReview.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def approve(
        db: Session,
        item_id: uuid.UUID,
        reviewer_id: uuid.UUID,
        notes: str = "",
    ) -> RiskReview:
        review = db.query(RiskReview).filter(RiskReview.id == item_id).one()
        review.status = "approved"
        review.reviewer_id = reviewer_id
        review.reviewed_at = datetime.now(timezone.utc)
        review.notes = notes
        db.commit()
        db.refresh(review)
        return review

    @staticmethod
    def reject(
        db: Session,
        item_id: uuid.UUID,
        reviewer_id: uuid.UUID,
        reason: str,
    ) -> RiskReview:
        review = db.query(RiskReview).filter(RiskReview.id == item_id).one()
        review.status = "rejected"
        review.reviewer_id = reviewer_id
        review.reviewed_at = datetime.now(timezone.utc)
        review.notes = reason
        db.commit()
        db.refresh(review)
        return review

    @staticmethod
    def escalate(
        db: Session,
        item_id: uuid.UUID,
        note: str,
    ) -> RiskReview:
        review = db.query(RiskReview).filter(RiskReview.id == item_id).one()
        review.status = "escalated"
        review.notes = note
        db.commit()
        db.refresh(review)
        return review
