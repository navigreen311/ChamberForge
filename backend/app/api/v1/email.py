"""Email API endpoints — send, templates, history, drip sequences."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.backbone.email_drip import (
    advance_drip,
    get_user_drip_status,
    stop_drip,
)
from app.services.backbone.email_service import EmailService
from app.services.backbone.email_templates import list_templates

router = APIRouter(prefix="/api/v1/email", tags=["email"])

# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------


class SendEmailRequest(BaseModel):
    to: EmailStr
    subject: str
    html_body: str
    from_email: str = "noreply@chamberforge.com"
    workspace_id: str | None = None


class SendTemplateRequest(BaseModel):
    to: EmailStr
    template_name: str
    variables: dict[str, Any] = {}
    from_email: str = "noreply@chamberforge.com"
    workspace_id: str | None = None


class EmailResponse(BaseModel):
    id: str | None
    status: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/send", response_model=EmailResponse)
async def send_email(body: SendEmailRequest):
    """Send a single email (admin)."""
    svc = EmailService()
    result = await svc.send(
        to=body.to,
        subject=body.subject,
        html_body=body.html_body,
        from_email=body.from_email,
        workspace_id=body.workspace_id,
    )
    return result


@router.post("/send-template", response_model=EmailResponse)
async def send_template_email(body: SendTemplateRequest):
    """Send an email using a named template."""
    svc = EmailService()
    try:
        result = await svc.send_template(
            to=body.to,
            template_name=body.template_name,
            variables=body.variables,
            from_email=body.from_email,
            workspace_id=body.workspace_id,
        )
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return result


@router.get("/templates")
async def get_templates():
    """List all available email templates."""
    return {"templates": list_templates()}


# ---------------------------------------------------------------------------
# Drip sequence endpoints
# ---------------------------------------------------------------------------


@router.get("/drip/{user_id}")
def get_drip_status(
    user_id: str,
    sequence_name: str = Query("onboarding"),
    db: Session = Depends(get_db),
):
    """Return a user's drip sequence status."""
    return get_user_drip_status(db, user_id, sequence_name)


@router.post("/drip/{user_id}/advance")
def advance_drip_endpoint(
    user_id: str,
    sequence_name: str = Query("onboarding"),
    db: Session = Depends(get_db),
):
    """Manually advance a user's drip sequence (admin)."""
    try:
        return advance_drip(db, user_id, sequence_name)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/drip/{user_id}/stop")
def stop_drip_endpoint(
    user_id: str,
    sequence_name: str = Query("onboarding"),
    db: Session = Depends(get_db),
):
    """Stop a user's drip sequence."""
    return stop_drip(db, user_id, sequence_name)


@router.get("/history")
async def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    workspace_id: str | None = None,
):
    """Return email send history with pagination.

    NOTE: Full DB-backed implementation requires an async session dependency.
    This stub returns the shape of the expected response for frontend integration.
    """
    # In production this would query EmailLog via the DB session.
    # Returning an empty page so the contract is clear.
    return {
        "items": [],
        "page": page,
        "page_size": page_size,
        "total": 0,
    }
