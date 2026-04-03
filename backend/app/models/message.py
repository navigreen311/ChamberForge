"""Secure message model for encrypted inter-user communication."""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class SecureMessage(Base):
    __tablename__ = "secure_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    sender_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    recipient_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_encrypted = Column(Boolean, nullable=False, default=True)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "workspace_id": str(self.workspace_id),
            "sender_id": str(self.sender_id),
            "recipient_id": str(self.recipient_id),
            "content": self.content,
            "is_encrypted": self.is_encrypted,
            "read_at": self.read_at.isoformat() if self.read_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
