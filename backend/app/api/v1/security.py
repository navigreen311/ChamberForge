"""Security & privacy endpoints - deletion requests, legal holds, guardrails.

P-16 (T-008). All seven routes were anonymous, and every identity on them was
supplied by the caller:

    class DeletionRequestCreate(BaseModel):
        workspace_id: uuid.UUID
        client_id: uuid.UUID
        requested_by: uuid.UUID      # who asked for the deletion

    class LegalHoldRelease(BaseModel):
        released_by: uuid.UUID       # who released the hold

These are the two fields on the platform that most need to be established
rather than asserted. A deletion request names who authorised destroying a
client's records; a hold release names who decided preservation could end.
Both were free-text on an unauthenticated endpoint, so the resulting record
could name anyone - and would read as authoritative afterwards.

`POST /deletion-request/{id}/execute` is worse still: it took no identity at
all and **performed the deletion**, unauthenticated, for any request id.

Every route now requires an admin session. Every identity comes from it.
`workspace_id` is derived rather than accepted, so an admin cannot act on
another firm's records by naming their workspace.
"""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_workspace_id, require_role
from app.core.identity import ResolvedIdentity
from app.db.session import get_db
from app.services.backbone import deletion_service
from app.services.backbone import legal_hold as legal_hold_svc
from app.services.backbone.guardrails_enforcement import check_output, sanitize_output

router = APIRouter(prefix="/api/v1/security", tags=["security"])


def _as_uuid(value: object, what: str) -> uuid.UUID:
    """Coerce a session-derived id to the UUID these services expect.

    `get_workspace_id` returns a string and the governance services type
    their arguments as UUIDs. Refusing an unparseable value rather than
    coercing it to a placeholder: a deletion recorded against a
    default-shaped id is the record this replaced.
    """
    try:
        return uuid.UUID(str(value))
    except (ValueError, AttributeError, TypeError) as exc:
        raise HTTPException(
            status_code=422,
            detail=f"The signed-in operator has no usable {what}.",
        ) from exc


def _actor(admin: ResolvedIdentity) -> uuid.UUID:
    """The session operator, as these records store the actor.

    The services type the actor as a UUID. An identity that will not parse is
    refused rather than coerced to a placeholder: a deletion authorised by
    "unknown" is exactly the record this replaced.
    """
    return _as_uuid(admin.id, "actor identity")


# ───── Schemas ─────

class DeletionRequestCreate(BaseModel):
    # workspace_id and requested_by removed - both come from the session.
    client_id: uuid.UUID


class LegalHoldCreate(BaseModel):
    # workspace_id and created_by removed - both come from the session.
    resource_type: str
    resource_id: uuid.UUID
    reason: str


class LegalHoldRelease(BaseModel):
    """Deliberately empty of identity.

    Kept as a model so the route still accepts a JSON body, and so a future
    field (a release reason, say) has somewhere to go.
    """


class CheckOutputRequest(BaseModel):
    output_text: str
    context: Optional[dict] = None


# ───── Deletion Requests ─────

@router.post("/deletion-request")
def create_deletion_request(
    body: DeletionRequestCreate,
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Request deletion of a client's records, attributed to the operator."""
    return deletion_service.request_deletion(
        db, _as_uuid(workspace_id, "workspace"), body.client_id, _actor(admin)
    )


@router.post("/deletion-request/{request_id}/execute")
def execute_deletion_request(
    request_id: uuid.UUID,
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Execute an approved deletion request.

    This destroyed client records with no authentication and no identity of
    any kind. It is the single most consequential unauthenticated route found
    in the audit.
    """
    try:
        return deletion_service.execute_deletion(db, request_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/deletion-requests")
def list_deletion_requests(
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return deletion_service.get_deletion_requests(
        db, _as_uuid(workspace_id, "workspace")
    )


# ───── Legal Holds ─────

@router.post("/legal-hold")
def create_legal_hold(
    body: LegalHoldCreate,
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Place a legal hold, attributed to the operator who placed it."""
    return legal_hold_svc.create_hold(
        db,
        _as_uuid(workspace_id, "workspace"),
        body.resource_type,
        body.resource_id,
        body.reason,
        _actor(admin),
    )


@router.get("/legal-holds")
def list_legal_holds(
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return legal_hold_svc.get_active_holds(
        db, _as_uuid(workspace_id, "workspace")
    )


@router.post("/legal-hold/{hold_id}/release")
def release_legal_hold(
    hold_id: uuid.UUID,
    body: LegalHoldRelease,
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Release a legal hold, attributed to the operator who released it.

    `released_by` came from the request body, so the record of who ended a
    preservation obligation could name anybody. Paired with the anonymous
    `POST /admin/records/cleanup`, that made destruction of held data
    possible with no authenticated actor in the trail at all.
    """
    try:
        return legal_hold_svc.release_hold(db, hold_id, _actor(admin))
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ───── Guardrails ─────

@router.post("/check-output")
def check_ai_output(
    body: CheckOutputRequest,
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    """Screen AI output against the guardrails before it reaches a client."""
    result = check_output(body.output_text, body.context or {})
    return {
        **result,
        "sanitized": sanitize_output(body.output_text),
    }
