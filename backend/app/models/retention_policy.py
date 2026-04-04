"""RetentionPolicy model — defines per-class document retention rules."""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa
from sqlalchemy import Boolean, Column, DateTime, Integer, String


from app.db.session import Base


class RetentionPolicy(Base):
    __tablename__ = "retention_policies"

    id = Column(sa.String(36), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(sa.String(36), nullable=False, index=True)
    document_class = Column(
        String(50),
        nullable=False,
        comment="evidence | offer | client | audit_log | notification | email_log",
    )
    retention_days = Column(Integer, nullable=False)
    auto_delete = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        sa.UniqueConstraint("workspace_id", "document_class", name="uq_retention_workspace_class"),
        sa.Index("ix_retention_policies_workspace_auto", "workspace_id", "auto_delete"),
    )

    def __repr__(self) -> str:
        return f"<RetentionPolicy {self.document_class} retention={self.retention_days}d>"
