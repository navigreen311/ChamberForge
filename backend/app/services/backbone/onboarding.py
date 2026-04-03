"""OnboardingService — manages the 5-step user onboarding flow."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.onboarding import OnboardingProgress

ONBOARDING_STEPS = [
    {"id": 1, "title": "Profile setup"},
    {"id": 2, "title": "First problem discovery"},
    {"id": 3, "title": "Activate a playbook"},
    {"id": 4, "title": "Create first offer"},
    {"id": 5, "title": "Invite team member"},
]

TOTAL_STEPS = len(ONBOARDING_STEPS)


class OnboardingService:
    """Manages user first-run onboarding progress."""

    @staticmethod
    def _get_or_create(db: Session, user_id: str) -> OnboardingProgress:
        """Fetch existing progress or create a fresh record."""
        progress = (
            db.query(OnboardingProgress)
            .filter(OnboardingProgress.user_id == user_id)
            .first()
        )
        if not progress:
            progress = OnboardingProgress(user_id=user_id)
            db.add(progress)
            db.flush()
        return progress

    @staticmethod
    def _build_steps(progress: OnboardingProgress) -> list[dict]:
        completed = progress.completed_steps or []
        skipped = progress.skipped_steps or []
        return [
            {
                "id": step["id"],
                "title": step["title"],
                "completed": step["id"] in completed,
                "skipped": step["id"] in skipped,
            }
            for step in ONBOARDING_STEPS
        ]

    @classmethod
    def get_onboarding_status(cls, db: Session, user_id: str) -> dict:
        """Return the full onboarding status for a user."""
        progress = cls._get_or_create(db, user_id)
        return {
            "completed": progress.completed_at is not None,
            "current_step": progress.current_step,
            "total_steps": TOTAL_STEPS,
            "steps": cls._build_steps(progress),
        }

    @classmethod
    def complete_step(cls, db: Session, user_id: str, step_id: int) -> dict:
        """Mark a step as completed and advance current_step."""
        if step_id < 1 or step_id > TOTAL_STEPS:
            raise ValueError(f"Invalid step_id: {step_id}")

        progress = cls._get_or_create(db, user_id)
        completed = list(progress.completed_steps or [])

        if step_id not in completed:
            completed.append(step_id)
            progress.completed_steps = completed

        # Advance current_step to next incomplete/unskipped step
        skipped = progress.skipped_steps or []
        cls._advance_step(progress, completed, skipped)

        db.commit()
        return cls.get_onboarding_status(db, user_id)

    @classmethod
    def skip_step(cls, db: Session, user_id: str, step_id: int) -> dict:
        """Mark a step as skipped and advance current_step."""
        if step_id < 1 or step_id > TOTAL_STEPS:
            raise ValueError(f"Invalid step_id: {step_id}")

        progress = cls._get_or_create(db, user_id)
        skipped = list(progress.skipped_steps or [])

        if step_id not in skipped:
            skipped.append(step_id)
            progress.skipped_steps = skipped

        completed = progress.completed_steps or []
        cls._advance_step(progress, completed, skipped)

        db.commit()
        return cls.get_onboarding_status(db, user_id)

    @classmethod
    def dismiss(cls, db: Session, user_id: str) -> dict:
        """Dismiss onboarding entirely — mark as completed."""
        progress = cls._get_or_create(db, user_id)
        progress.completed_at = datetime.now(timezone.utc)
        db.commit()
        return cls.get_onboarding_status(db, user_id)

    @staticmethod
    def _advance_step(
        progress: OnboardingProgress,
        completed: list[int],
        skipped: list[int],
    ) -> None:
        """Set current_step to the next actionable step, or mark complete."""
        for step_id in range(1, TOTAL_STEPS + 1):
            if step_id not in completed and step_id not in skipped:
                progress.current_step = step_id
                return
        # All steps handled — mark onboarding as complete
        progress.current_step = TOTAL_STEPS
        progress.completed_at = datetime.now(timezone.utc)
