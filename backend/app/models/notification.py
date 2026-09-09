"""Notification model for realtime alerts and user notifications."""
import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy import Boolean, Column, DateTime, String, Text

from app.db.session import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(sa.String(36), primary_key=True, default=uuid.uuid4)
    user_id = Column(sa.String(36), nullable=False, index=True)
    workspace_id = Column(sa.String(36), nullable=False, index=True)
    type = Column(String(20), nullable=False, default="info")  # info|warning|critical|crisis
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    action_url = Column(String(2048), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    __table_args__ = (
        sa.Index("ix_notifications_user_is_read", "user_id", "is_read"),
    )

    def __repr__(self):
        return f"<Notification {self.id} type={self.type} read={self.is_read}>"
