"""Email log model for tracking transactional email delivery."""
import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID

from app.db.session import Base


class EmailLog(Base):
    """Tracks every transactional email sent through the platform."""

    __tablename__ = "email_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    to_email = Column(String(320), nullable=False, index=True)
    template = Column(String(100), nullable=True)
    subject = Column(String(500), nullable=False)
    status = Column(
        String(20),
        nullable=False,
        default="sent",
        index=True,
        comment="sent | delivered | bounced | failed",
    )
    metadata_ = Column("metadata", JSON, nullable=False, default=dict)
    sent_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    delivered_at = Column(DateTime, nullable=True)

    __table_args__ = (
        sa.Index("ix_email_logs_workspace_status", "workspace_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<EmailLog {self.id} to={self.to_email} status={self.status}>"

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "workspace_id": str(self.workspace_id),
            "to_email": self.to_email,
            "template": self.template,
            "subject": self.subject,
            "status": self.status,
            "metadata": self.metadata_,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
        }
