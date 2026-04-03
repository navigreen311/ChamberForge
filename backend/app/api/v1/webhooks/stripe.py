"""Stripe webhook endpoint — receives and routes Stripe events."""
from __future__ import annotations

from fastapi import APIRouter, Header, HTTPException, Request

from app.services.backbone.stripe_service import stripe_service

router = APIRouter(tags=["webhooks"])


@router.post("/api/v1/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
):
    payload = await request.body()
    try:
        result = stripe_service.handle_webhook(payload, stripe_signature or "")
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid payload: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Webhook error: {exc}")
