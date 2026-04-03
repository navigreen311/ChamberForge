"""Portal API — token-based client delivery portal endpoints."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.backbone.client_portal import ClientPortalService

router = APIRouter(prefix="/api/v1/portal", tags=["portal"])

service = ClientPortalService()


# ── Admin endpoints (workspace user) ──────────────────────────────

@router.post("/access")
def create_portal_access(
    client_id: uuid.UUID = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    """Create portal access for a client — generates a unique portal token."""
    access = service.create_portal_access(db, client_id)
    return {
        "id": str(access.id),
        "client_id": str(access.client_id),
        "portal_token": access.portal_token,
        "is_active": access.is_active,
        "created_at": str(access.created_at),
    }


@router.get("/access/{client_id}")
def get_portal_access(client_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get portal access info for a client."""
    from app.models.client_portal import ClientPortalAccess

    access = (
        db.query(ClientPortalAccess)
        .filter(ClientPortalAccess.client_id == client_id)
        .first()
    )
    if not access:
        raise HTTPException(status_code=404, detail="Portal access not found")
    return {
        "id": str(access.id),
        "client_id": str(access.client_id),
        "portal_token": access.portal_token,
        "is_active": access.is_active,
        "last_accessed_at": str(access.last_accessed_at) if access.last_accessed_at else None,
        "created_at": str(access.created_at),
    }


@router.delete("/access/{portal_id}")
def revoke_portal_access(portal_id: uuid.UUID, db: Session = Depends(get_db)):
    """Revoke portal access."""
    revoked = service.revoke_access(db, portal_id)
    if not revoked:
        raise HTTPException(status_code=404, detail="Portal access not found")
    return {"status": "revoked", "portal_id": str(portal_id)}


# ── Client-facing endpoints (token-based, no auth) ────────────────

def _validate_and_track(db: Session, token: str) -> "ClientPortalAccess":
    """Validate token and update last-accessed timestamp."""
    access = service.validate_token(db, token)
    if not access:
        raise HTTPException(status_code=404, detail="Invalid or expired portal link")
    service.update_last_accessed(db, access.id)
    return access


@router.get("/{token}/deliverables")
def get_deliverables(token: str, db: Session = Depends(get_db)):
    """Client-facing: list all deliverables for the portal."""
    access = _validate_and_track(db, token)
    deliverables = service.get_client_deliverables(db, access.client_id)
    return {"client_id": str(access.client_id), "deliverables": deliverables}


@router.get("/{token}/kpis")
def get_kpis(token: str, db: Session = Depends(get_db)):
    """Client-facing: current KPIs with values, targets, and trends."""
    access = _validate_and_track(db, token)
    kpis = service.get_client_kpis(db, access.client_id)
    return {"client_id": str(access.client_id), "kpis": kpis}


@router.get("/{token}/reports")
def get_reports(token: str, db: Session = Depends(get_db)):
    """Client-facing: quarterly reports and scorecards."""
    access = _validate_and_track(db, token)
    reports = service.get_client_reports(db, access.client_id)
    return {"client_id": str(access.client_id), "reports": reports}


@router.get("/{token}/download/{doc_id}")
def download_deliverable(token: str, doc_id: str, db: Session = Depends(get_db)):
    """Download a specific deliverable document."""
    access = _validate_and_track(db, token)
    # In production, this would generate a pre-signed S3 URL
    return {
        "client_id": str(access.client_id),
        "doc_id": doc_id,
        "download_url": f"/storage/documents/{doc_id}",
        "expires_in": 3600,
    }
