"""Notifications API endpoints."""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_workspace_id
from app.db.session import get_db
from app.models.user import User
from app.services.backbone.notifications import NotificationService

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])

svc = NotificationService()


# --- Schemas ---

class NotificationOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    workspace_id: uuid.UUID
    type: str
    title: str
    body: str
    action_url: str | None = None
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True


class UnreadCountOut(BaseModel):
    count: int


class CleanupOut(BaseModel):
    deleted: int


class MarkedAllReadOut(BaseModel):
    marked: int


# --- Helpers ---

def _to_out(n) -> dict:
    return {
        "id": n.id,
        "user_id": n.user_id,
        "workspace_id": n.workspace_id,
        "type": n.type,
        "title": n.title,
        "body": n.body,
        "action_url": n.action_url,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat(),
    }


# --- Endpoints ---
# NOTE: In production, user_id comes from auth (JWT). Here we accept it as a
# query param for development/testing convenience.

@router.get("/", response_model=list[NotificationOut])
def list_notifications(
    user_id: uuid.UUID = Query(...),
    type_filter: str | None = Query(None, alias="type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """List notifications with optional type filter and pagination."""
    results = svc.get_all(db, user_id, type_filter=type_filter, skip=skip, limit=limit)
    return [_to_out(n) for n in results]


@router.get("/unread", response_model=list[NotificationOut])
def list_unread(
    user_id: uuid.UUID = Query(...),
    limit: int = Query(50, ge=1, le=200),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Get unread notifications."""
    results = svc.get_unread(db, user_id, limit=limit)
    return [_to_out(n) for n in results]


@router.get("/count", response_model=UnreadCountOut)
def unread_count(
    user_id: uuid.UUID = Query(...),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Get unread notification count."""
    count = svc.get_unread_count(db, user_id)
    return {"count": count}


@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_read(
    notification_id: uuid.UUID,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Mark a single notification as read."""
    notification = svc.mark_read(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return _to_out(notification)


@router.put("/read-all", response_model=MarkedAllReadOut)
def mark_all_read(
    user_id: uuid.UUID = Query(...),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Mark all notifications as read for a user."""
    count = svc.mark_all_read(db, user_id)
    return {"marked": count}


@router.delete("/old", response_model=CleanupOut)
def cleanup_old(
    days: int = Query(90, ge=1),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Delete notifications older than N days (admin endpoint)."""
    count = svc.delete_old(db, days=days)
    return {"deleted": count}
