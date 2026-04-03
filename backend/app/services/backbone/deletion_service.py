"""GDPR / CCPA data-deletion service — cascading purge of client records."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.deletion_request import DeletionRequest

# Tables that may contain client data (ordered for FK-safe deletion).
_CLIENT_TABLES = [
    "consents",
    "messages",
    "notifications",
    "audit_logs",
    "evidence_links",
    "offers",
    "household_graph",
    "clients",
]


def request_deletion(
    db: Session,
    workspace_id: uuid.UUID,
    client_id: uuid.UUID,
    requested_by: uuid.UUID,
) -> dict:
    """Create a new deletion request (status='pending')."""
    req = DeletionRequest(
        workspace_id=workspace_id,
        client_id=client_id,
        requested_by=requested_by,
        status="pending",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return _to_dict(req)


def execute_deletion(db: Session, deletion_request_id: uuid.UUID) -> dict:
    """Execute a deletion request — cascade delete from all known tables."""
    req: DeletionRequest = db.query(DeletionRequest).filter(
        DeletionRequest.id == deletion_request_id
    ).first()
    if req is None:
        raise ValueError("Deletion request not found")

    req.status = "executing"
    db.commit()

    tables_cleaned: list[str] = []
    total_deleted = 0

    try:
        for table in _CLIENT_TABLES:
            result = db.execute(
                text(f"DELETE FROM {table} WHERE client_id = :cid"),
                {"cid": str(req.client_id)},
            )
            count = result.rowcount
            if count > 0:
                tables_cleaned.append(table)
                total_deleted += count

        db.commit()

        req.status = "completed"
        req.tables_cleaned = tables_cleaned
        req.records_deleted = total_deleted
        req.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(req)
    except Exception:
        db.rollback()
        req.status = "failed"
        db.commit()
        raise

    return _to_dict(req)


def verify_deletion(db: Session, client_id: uuid.UUID) -> dict:
    """Verify that no records remain for a given client across all tables."""
    remaining: Dict[str, int] = {}
    for table in _CLIENT_TABLES:
        result = db.execute(
            text(f"SELECT COUNT(*) FROM {table} WHERE client_id = :cid"),
            {"cid": str(client_id)},
        )
        count = result.scalar()
        if count and count > 0:
            remaining[table] = count

    return {
        "client_id": str(client_id),
        "records_remaining": remaining,
        "verified_clean": len(remaining) == 0,
    }


def get_deletion_requests(db: Session, workspace_id: uuid.UUID) -> list[dict]:
    """Return all deletion requests for a workspace."""
    rows = (
        db.query(DeletionRequest)
        .filter(DeletionRequest.workspace_id == workspace_id)
        .order_by(DeletionRequest.requested_at.desc())
        .all()
    )
    return [_to_dict(r) for r in rows]


# ------------------------------------------------------------------
def _to_dict(req: DeletionRequest) -> dict:
    return {
        "id": str(req.id),
        "workspace_id": str(req.workspace_id),
        "client_id": str(req.client_id),
        "requested_by": str(req.requested_by),
        "status": req.status,
        "tables_cleaned": req.tables_cleaned or [],
        "records_deleted": req.records_deleted or 0,
        "requested_at": req.requested_at.isoformat() if req.requested_at else None,
        "completed_at": req.completed_at.isoformat() if req.completed_at else None,
    }
