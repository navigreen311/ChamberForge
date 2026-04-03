"""RiskReview SQLAlchemy model."""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class RiskReview(Base):
    __tablename__ = "risk_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    item_type = Column(String(50), nullable=False)       # "offer", "problem", "output"
    item_id = Column(UUID(as_uuid=True), nullable=False)
    risk_level = Column(String(20), nullable=False)       # low/medium/high/critical
    reason = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="pending", index=True)
    reviewer_id = Column(UUID(as_uuid=True), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        sa.Index("ix_risk_reviews_workspace_status", "workspace_id", "status"),
        sa.Index("ix_risk_reviews_item", "item_type", "item_id"),
    )

    def __repr__(self) -> str:
        return f"<RiskReview {self.id} [{self.risk_level}] {self.status}>"
