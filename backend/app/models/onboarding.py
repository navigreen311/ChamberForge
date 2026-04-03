"""OnboardingProgress model — tracks user first-run onboarding state."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.types import JSON

from app.db.session import Base


def _new_uuid() -> str:
    return str(uuid.uuid4())


class OnboardingProgress(Base):
    __tablename__ = "onboarding_progress"

    id = Column(String(36), primary_key=True, default=_new_uuid)
    user_id = Column(String(36), unique=True, nullable=False, index=True)
    current_step = Column(Integer, nullable=False, default=1)
    completed_steps = Column(JSON, nullable=False, default=list)
    skipped_steps = Column(JSON, nullable=False, default=list)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<OnboardingProgress user={self.user_id} step={self.current_step}>"
