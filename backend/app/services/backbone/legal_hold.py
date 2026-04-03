"""Legal-hold service — prevent deletion of resources under legal obligation."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.legal_hold import LegalHold


def create_hold(
    db: Session,
    workspace_id: uuid.UUID,
    resource_type: str,
    resource_id: uuid.UUID,
    reason: str,
    created_by: uuid.UUID,
) -> dict:
    hold = LegalHold(
        workspace_id=workspace_id,
        resource_type=resource_type,
        resource_id=resource_id,
        reason=reason,
        created_by=created_by,
    )
    db.add(hold)
    db.commit()
    db.refresh(hold)
    return _to_dict(hold)


def check_hold(db: Session, resource_type: str, resource_id: uuid.UUID) -> bool:
    """Return True if there is at least one active legal hold on this resource."""
    return (
        db.query(LegalHold)
        .filter(
            LegalHold.resource_type == resource_type,
            LegalHold.resource_id == resource_id,
            LegalHold.status == "active",
        )
        .first()
        is not None
    )


def release_hold(db: Session, hold_id: uuid.UUID, released_by: uuid.UUID) -> dict:
    hold: LegalHold = db.query(LegalHold).filter(LegalHold.id == hold_id).first()
    if hold is None:
        raise ValueError("Legal hold not found")

    hold.status = "released"
    hold.released_by = released_by
    hold.released_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(hold)
    return _to_dict(hold)


def get_active_holds(db: Session, workspace_id: uuid.UUID) -> list[dict]:
    rows = (
        db.query(LegalHold)
        .filter(LegalHold.workspace_id == workspace_id, LegalHold.status == "active")
        .order_by(LegalHold.created_at.desc())
        .all()
    )
    return [_to_dict(h) for h in rows]


# ------------------------------------------------------------------
def _to_dict(hold: LegalHold) -> dict:
    return {
        "id": str(hold.id),
        "workspace_id": str(hold.workspace_id),
        "resource_type": hold.resource_type,
        "resource_id": str(hold.resource_id),
        "reason": hold.reason,
        "status": hold.status,
        "created_by": str(hold.created_by),
        "released_by": str(hold.released_by) if hold.released_by else None,
        "created_at": hold.created_at.isoformat() if hold.created_at else None,
        "released_at": hold.released_at.isoformat() if hold.released_at else None,
    }
