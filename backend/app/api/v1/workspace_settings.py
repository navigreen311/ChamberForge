"""Workspace settings endpoints — config, members, usage stats."""
import re
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_role
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.ai_usage import AIUsageLog
from app.models.offer import Offer
from app.models.problem import Problem
from app.models.user import User
from app.models.workspace import Workspace

router = APIRouter(prefix="/api/v1/workspace-settings", tags=["workspace-settings"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class WorkspaceSettingsResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    owner_id: str | None = None
    settings: dict[str, Any]
    created_at: datetime
    updated_at: datetime


class WorkspaceSettingsUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    settings: dict[str, Any] | None = None


class MemberResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime


class InviteMember(BaseModel):
    email: str
    role: str = "operator"


class RoleUpdate(BaseModel):
    role: str


class UsageResponse(BaseModel):
    problems_created: int
    offers_active: int
    members_count: int
    ai_calls_this_month: int
    ai_cost_this_month: float


# ── Helpers ──────────────────────────────────────────────────────────────────

def _get_workspace(db: Session, workspace_id: str) -> Workspace:
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )
    return workspace


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/", response_model=WorkspaceSettingsResponse)
def get_workspace_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return workspace settings for the current user's workspace."""
    workspace = _get_workspace(db, str(current_user.workspace_id))
    return WorkspaceSettingsResponse(
        id=str(workspace.id),
        name=workspace.name,
        slug=workspace.slug,
        plan=workspace.plan,
        owner_id=str(workspace.owner_id) if workspace.owner_id else None,
        settings=workspace.settings or {},
        created_at=workspace.created_at,
        updated_at=workspace.updated_at,
    )


@router.put("/", response_model=WorkspaceSettingsResponse)
def update_workspace_settings(
    body: WorkspaceSettingsUpdate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Update workspace name, slug, and/or settings (admin only)."""
    workspace = _get_workspace(db, str(current_user.workspace_id))

    if body.name is not None:
        workspace.name = body.name

    if body.slug is not None:
        slug = re.sub(r"[^a-z0-9]+", "-", body.slug.lower()).strip("-")
        existing = (
            db.query(Workspace)
            .filter(Workspace.slug == slug, Workspace.id != workspace.id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Slug already in use",
            )
        workspace.slug = slug

    if body.settings is not None:
        workspace.settings = body.settings

    workspace.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(workspace)

    return WorkspaceSettingsResponse(
        id=str(workspace.id),
        name=workspace.name,
        slug=workspace.slug,
        plan=workspace.plan,
        owner_id=str(workspace.owner_id) if workspace.owner_id else None,
        settings=workspace.settings or {},
        created_at=workspace.created_at,
        updated_at=workspace.updated_at,
    )


@router.get("/members", response_model=list[MemberResponse])
def list_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all members in the current workspace."""
    members = (
        db.query(User)
        .filter(User.workspace_id == current_user.workspace_id)
        .order_by(User.created_at)
        .all()
    )
    return [
        MemberResponse(
            id=str(m.id),
            email=m.email,
            name=m.name,
            role=m.role,
            is_active=m.is_active,
            created_at=m.created_at,
        )
        for m in members
    ]


@router.post("/members/invite", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def invite_member(
    body: InviteMember,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Invite a new member by email. Creates the user with a temporary password."""
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    if body.role not in ("admin", "advisor", "analyst", "operator", "viewer"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid role",
        )

    temp_password = f"temp-{uuid.uuid4().hex[:12]}"
    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        name=body.email.split("@")[0],
        hashed_password=get_password_hash(temp_password),
        role=body.role,
        workspace_id=str(current_user.workspace_id),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return MemberResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.put("/members/{user_id}/role", response_model=MemberResponse)
def change_member_role(
    user_id: str,
    body: RoleUpdate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Change a workspace member's role (admin only)."""
    target = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.workspace_id == current_user.workspace_id,
        )
        .first()
    )
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in workspace",
        )

    if body.role not in ("admin", "advisor", "analyst", "operator", "viewer"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid role",
        )

    target.role = body.role
    target.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(target)

    return MemberResponse(
        id=str(target.id),
        email=target.email,
        name=target.name,
        role=target.role,
        is_active=target.is_active,
        created_at=target.created_at,
    )


@router.delete("/members/{user_id}")
def remove_member(
    user_id: str,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Remove a member from the workspace (admin only)."""
    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove yourself",
        )

    target = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.workspace_id == current_user.workspace_id,
        )
        .first()
    )
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in workspace",
        )

    target.workspace_id = None
    target.is_active = False
    target.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {"detail": "Member removed from workspace"}


@router.get("/usage", response_model=UsageResponse)
def workspace_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return workspace usage statistics."""
    ws_id = str(current_user.workspace_id)

    problems_created = (
        db.query(func.count(Problem.id))
        .filter(Problem.workspace_id == ws_id)
        .scalar()
    ) or 0

    offers_active = (
        db.query(func.count(Offer.id))
        .filter(Offer.workspace_id == ws_id, Offer.status == "active")
        .scalar()
    ) or 0

    members_count = (
        db.query(func.count(User.id))
        .filter(User.workspace_id == ws_id, User.is_active == True)  # noqa: E712
        .scalar()
    ) or 0

    # AI usage this month
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    ai_stats = (
        db.query(
            func.count(AIUsageLog.id),
            func.coalesce(func.sum(AIUsageLog.cost_usd), 0.0),
        )
        .filter(
            AIUsageLog.workspace_id == ws_id,
            AIUsageLog.created_at >= month_start,
        )
        .first()
    )
    ai_calls = ai_stats[0] if ai_stats else 0
    ai_cost = float(ai_stats[1]) if ai_stats else 0.0

    return UsageResponse(
        problems_created=problems_created,
        offers_active=offers_active,
        members_count=members_count,
        ai_calls_this_month=ai_calls,
        ai_cost_this_month=round(ai_cost, 2),
    )
