"""REST endpoints for user onboarding flow."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.backbone.onboarding import OnboardingService

router = APIRouter(prefix="/api/v1/onboarding", tags=["onboarding"])

# In production this comes from auth middleware; hardcoded header for now.
_DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


def _get_user_id() -> str:
    """Placeholder for auth-derived user_id."""
    return _DEFAULT_USER_ID


@router.get("/status")
def get_onboarding_status(
    db: Session = Depends(get_db),
    user_id: str = Depends(_get_user_id),
):
    """Return onboarding progress for the authenticated user."""
    return OnboardingService.get_onboarding_status(db, user_id)


@router.post("/complete/{step_id}")
def complete_step(
    step_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(_get_user_id),
):
    """Mark a specific onboarding step as completed."""
    try:
        return OnboardingService.complete_step(db, user_id, step_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/skip/{step_id}")
def skip_step(
    step_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(_get_user_id),
):
    """Skip a specific onboarding step."""
    try:
        return OnboardingService.skip_step(db, user_id, step_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/dismiss")
def dismiss_onboarding(
    db: Session = Depends(get_db),
    user_id: str = Depends(_get_user_id),
):
    """Dismiss onboarding entirely, marking it as completed."""
    return OnboardingService.dismiss(db, user_id)
