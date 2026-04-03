"""Workspace management endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace

router = APIRouter(prefix="/api/v1/workspaces", tags=["workspaces"])


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    owner_id: str | None = None
    settings: dict

    class Config:
        from_attributes = True


class UpdateWorkspaceRequest(BaseModel):
    name: str | None = None
    settings: dict | None = None


@router.get("/current", response_model=WorkspaceResponse)
def get_current_workspace(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the workspace of the currently authenticated user."""
    if not current_user.workspace_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User has no workspace",
        )
    workspace = db.query(Workspace).filter(Workspace.id == current_user.workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return WorkspaceResponse(
        id=str(workspace.id),
        name=workspace.name,
        slug=workspace.slug,
        plan=workspace.plan,
        owner_id=str(workspace.owner_id) if workspace.owner_id else None,
        settings=workspace.settings or {},
    )


@router.put("/current", response_model=WorkspaceResponse)
def update_current_workspace(
    body: UpdateWorkspaceRequest,
    admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Update the current workspace settings (admin only)."""
    workspace = db.query(Workspace).filter(Workspace.id == admin.workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    if body.name is not None:
        workspace.name = body.name
    if body.settings is not None:
        workspace.settings = body.settings

    db.commit()
    db.refresh(workspace)
    return WorkspaceResponse(
        id=str(workspace.id),
        name=workspace.name,
        slug=workspace.slug,
        plan=workspace.plan,
        owner_id=str(workspace.owner_id) if workspace.owner_id else None,
        settings=workspace.settings or {},
    )
