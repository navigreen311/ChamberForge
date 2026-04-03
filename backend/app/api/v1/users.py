"""User management endpoints — workspace-scoped, RBAC-protected."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/api/v1/users", tags=["users"])


class UpdateUserRequest(BaseModel):
    name: str | None = None
    role: str | None = None
    is_active: bool | None = None


@router.get("/", response_model=list[UserResponse])
def list_users(
    admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """List all users in the admin's workspace."""
    users = (
        db.query(User)
        .filter(User.workspace_id == admin.workspace_id)
        .all()
    )
    return [
        UserResponse(
            id=str(u.id),
            email=u.email,
            name=u.name,
            role=u.role,
            workspace_id=str(u.workspace_id) if u.workspace_id else None,
            is_active=u.is_active,
        )
        for u in users
    ]


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single user by ID (must be in the same workspace)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.workspace_id != current_user.workspace_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role,
        workspace_id=str(user.workspace_id) if user.workspace_id else None,
        is_active=user.is_active,
    )


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    body: UpdateUserRequest,
    admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Update a user's profile (admin only, same workspace)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.workspace_id != admin.workspace_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if body.name is not None:
        user.name = body.name
    if body.role is not None:
        user.role = body.role
    if body.is_active is not None:
        user.is_active = body.is_active

    db.commit()
    db.refresh(user)
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role,
        workspace_id=str(user.workspace_id) if user.workspace_id else None,
        is_active=user.is_active,
    )


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: str,
    admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Soft-delete a user by setting is_active=False (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.workspace_id != admin.workspace_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = False
    db.commit()
    return {"detail": "User deactivated"}
