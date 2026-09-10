"""Security & privacy endpoints — deletion requests, legal holds, guardrails."""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.backbone import deletion_service
from app.services.backbone import legal_hold as legal_hold_svc
from app.services.backbone.guardrails_enforcement import check_output, sanitize_output

router = APIRouter(prefix="/api/v1/security", tags=["security"])


# ───── Schemas ─────

class DeletionRequestCreate(BaseModel):
    workspace_id: uuid.UUID
    client_id: uuid.UUID
    requested_by: uuid.UUID


class LegalHoldCreate(BaseModel):
    workspace_id: uuid.UUID
    resource_type: str
    resource_id: uuid.UUID
    reason: str
    created_by: uuid.UUID


class LegalHoldRelease(BaseModel):
    released_by: uuid.UUID


class CheckOutputRequest(BaseModel):
    output_text: str
    context: Optional[dict] = None


# ───── Deletion Requests ─────

@router.post("/deletion-request")
def create_deletion_request(body: DeletionRequestCreate, db: Session = Depends(get_db)):
    result = deletion_service.request_deletion(
        db, body.workspace_id, body.client_id, body.requested_by
    )
    return result


@router.post("/deletion-request/{request_id}/execute")
def execute_deletion_request(request_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        return deletion_service.execute_deletion(db, request_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/deletion-requests")
def list_deletion_requests(workspace_id: uuid.UUID, db: Session = Depends(get_db)):
    return deletion_service.get_deletion_requests(db, workspace_id)


# ───── Legal Holds ─────

@router.post("/legal-hold")
def create_legal_hold(body: LegalHoldCreate, db: Session = Depends(get_db)):
    return legal_hold_svc.create_hold(
        db, body.workspace_id, body.resource_type, body.resource_id,
        body.reason, body.created_by,
    )


@router.get("/legal-holds")
def list_legal_holds(workspace_id: uuid.UUID, db: Session = Depends(get_db)):
    return legal_hold_svc.get_active_holds(db, workspace_id)


@router.post("/legal-hold/{hold_id}/release")
def release_legal_hold(
    hold_id: uuid.UUID, body: LegalHoldRelease, db: Session = Depends(get_db)
):
    try:
        return legal_hold_svc.release_hold(db, hold_id, body.released_by)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ───── Guardrails ─────

@router.post("/check-output")
def check_ai_output(body: CheckOutputRequest):
    result = check_output(body.output_text, body.context)
    if not result["safe"]:
        sanitized = sanitize_output(body.output_text, result["flags"])
        result["sanitized_output"] = sanitized
    return result
