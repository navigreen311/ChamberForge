"""Drip sequence status model — tracks each user's position in an email drip sequence."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.db.session import Base


def _new_uuid() -> str:
    return str(uuid.uuid4())


class DripStatus(Base):
    """Tracks a user's progress through a named email drip sequence."""

    __tablename__ = "drip_statuses"

    id = Column(String(36), primary_key=True, default=_new_uuid)
    user_id = Column(String(36), nullable=False, index=True)
    sequence_name = Column(String(100), nullable=False, index=True)
    current_step = Column(Integer, nullable=False, default=0)
    last_sent_at = Column(DateTime(timezone=True), nullable=True)
    next_send_at = Column(DateTime(timezone=True), nullable=True)
    completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return (
            f"<DripStatus user={self.user_id} seq={self.sequence_name} "
            f"step={self.current_step} completed={self.completed}>"
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "sequence_name": self.sequence_name,
            "current_step": self.current_step,
            "last_sent_at": self.last_sent_at.isoformat() if self.last_sent_at else None,
            "next_send_at": self.next_send_at.isoformat() if self.next_send_at else None,
            "completed": self.completed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
