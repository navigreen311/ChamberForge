"""Audit API — query and export audit trail."""
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_workspace_id, require_role
from app.db.session import get_db
from app.models.user import User
from app.services.backbone.audit_service import AuditService

router = APIRouter(prefix="/api/v1/audit", tags=["Audit"])


# ── Schemas ──────────────────────────────────────────────────────────────────


class AuditLogResponse(BaseModel):
    id: str
    workspace_id: str
    user_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: dict
    ip_address: Optional[str] = None
    timestamp: datetime

    model_config = {"from_attributes": True}


def _to_response(entry) -> AuditLogResponse:
    return AuditLogResponse(
        id=str(entry.id),
        workspace_id=str(entry.workspace_id),
        user_id=str(entry.user_id) if entry.user_id else None,
        action=entry.action,
        resource_type=entry.resource_type,
        resource_id=str(entry.resource_id) if entry.resource_id else None,
        details=entry.details or {},
        ip_address=entry.ip_address,
        timestamp=entry.timestamp,
    )


# ── Endpoints ────────────────────────────────────────────────────────────────


@router.get("/", response_model=list[AuditLogResponse])
def list_audit_trail(
    resource_type: Optional[str] = Query(None),
    user_id: Optional[uuid.UUID] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List audit trail for the current user's workspace."""
    workspace_id = getattr(current_user, "workspace_id", None)
    if workspace_id is None:
        raise HTTPException(status_code=400, detail="User has no workspace")
    entries = AuditService.get_audit_trail(
        db,
        workspace_id=uuid.UUID(str(workspace_id)),
        resource_type=resource_type,
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit,
    )
    return [_to_response(e) for e in entries]


@router.get("/user/{user_id}", response_model=list[AuditLogResponse])
def user_activity(
    user_id: uuid.UUID,
    days: int = Query(30, ge=1, le=365),
    workspace_id: str = Depends(get_workspace_id),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return recent activity for a specific user within the current workspace."""
    entries = AuditService.get_user_activity(db, user_id=user_id, days=days)
    # Filter entries to current workspace to prevent cross-tenant leakage
    entries = [e for e in entries if str(e.workspace_id) == workspace_id]
    return [_to_response(e) for e in entries]


@router.get("/export", response_model=list[dict])
def export_audit_trail(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Export audit trail as JSON — admin only."""
    workspace_id = getattr(current_user, "workspace_id", None)
    if workspace_id is None:
        raise HTTPException(status_code=400, detail="User has no workspace")
    return AuditService.export_audit_trail(
        db,
        workspace_id=uuid.UUID(str(workspace_id)),
        start_date=start_date,
        end_date=end_date,
    )
