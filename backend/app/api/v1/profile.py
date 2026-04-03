"""User profile endpoints — view, update, change password, delete account."""
import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.security import get_password_hash, verify_password
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

EMAIL_RE = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


# ── Schemas ──────────────────────────────────────────────────────────────────

class ProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    workspace_id: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ProfileUpdate(BaseModel):
    name: str | None = None
    email: str | None = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Return the current user's profile."""
    return ProfileResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        workspace_id=str(current_user.workspace_id) if current_user.workspace_id else None,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.put("/", response_model=ProfileResponse)
def update_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's name and/or email."""
    if body.email is not None:
        if not EMAIL_RE.match(body.email):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid email format",
            )
        existing = (
            db.query(User)
            .filter(User.email == body.email, User.id != current_user.id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use",
            )
        current_user.email = body.email

    if body.name is not None:
        current_user.name = body.name

    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(current_user)

    return ProfileResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        workspace_id=str(current_user.workspace_id) if current_user.workspace_id else None,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.put("/password")
def change_password(
    body: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change the current user's password after verifying the old one."""
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if len(body.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be at least 8 characters",
        )

    current_user.hashed_password = get_password_hash(body.new_password)
    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {"detail": "Password updated successfully"}


@router.delete("/")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Soft-delete the current user's account (set is_active=False)."""
    current_user.is_active = False
    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {"detail": "Account deactivated successfully"}
