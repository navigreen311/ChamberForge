"""Notification model for realtime alerts and user notifications."""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    type = Column(String(20), nullable=False, default="info")  # info|warning|critical|crisis
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    action_url = Column(String(2048), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Notification {self.id} type={self.type} read={self.is_read}>"
