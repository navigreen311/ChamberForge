"""Billing API — subscriptions, invoices, revenue, referrals."""
from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.dependencies import get_workspace_id
from app.db.session import get_db
from app.models.billing import Invoice, Subscription
from app.services.backbone.referral_tracker import referral_tracker
from app.services.backbone.stripe_service import stripe_service

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class CreateCustomerReq(BaseModel):
    name: str
    email: str
    metadata: dict | None = None


class CreateSubscriptionReq(BaseModel):
    workspace_id: UUID
    client_id: UUID
    customer_id: str
    amount: float
    plan_name: str
    interval: str = "month"


class CreateInvoiceReq(BaseModel):
    workspace_id: UUID
    client_id: UUID
    customer_id: str
    line_items: list[dict]
    due_date: Optional[str] = None


class CreateReferralReq(BaseModel):
    workspace_id: UUID
    referrer_id: UUID
    referred_client_id: UUID
    deal_value: float
    commission_pct: float = 10.0


# ---------------------------------------------------------------------------
# Customers
# ---------------------------------------------------------------------------

@router.post("/customers")
def create_customer(body: CreateCustomerReq):
    result = stripe_service.create_customer(body.name, body.email, body.metadata)
    return result


# ---------------------------------------------------------------------------
# Subscriptions
# ---------------------------------------------------------------------------

@router.post("/subscriptions")
def create_subscription(body: CreateSubscriptionReq, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    if body.amount is None or body.amount <= 0:
        raise HTTPException(
            status_code=422,
            detail={"error_code": "VALIDATION_ERROR", "message": "Subscription amount must be a positive number", "details": {"amount": f"Got {body.amount}, expected > 0"}},
        )
    result = stripe_service.create_subscription(
        body.customer_id, body.amount, body.plan_name, body.interval
    )
    sub = Subscription(
        workspace_id=workspace_id,
        client_id=str(body.client_id),
        stripe_subscription_id=result["subscription_id"],
        stripe_customer_id=body.customer_id,
        plan_name=body.plan_name,
        amount=body.amount,
        status=result["status"],
        current_period_start=datetime.now(tz=timezone.utc),
        current_period_end=datetime.fromisoformat(result["current_period_end"]),
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    cache.invalidate_pattern("billing:*")
    return {
        "id": str(sub.id),
        "stripe_subscription_id": sub.stripe_subscription_id,
        "status": sub.status,
        "current_period_end": result["current_period_end"],
    }


@router.delete("/subscriptions/{subscription_id}")
def cancel_subscription(subscription_id: str, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    result = stripe_service.cancel_subscription(subscription_id)
    sub = (
        db.query(Subscription)
        .filter(Subscription.stripe_subscription_id == subscription_id, Subscription.workspace_id == workspace_id)
        .first()
    )
    if sub:
        sub.status = "canceled"
        db.commit()
    cache.invalidate_pattern("billing:*")
    return result


# ---------------------------------------------------------------------------
# Invoices
# ---------------------------------------------------------------------------

@router.post("/invoices")
def create_invoice(body: CreateInvoiceReq, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    result = stripe_service.create_invoice(body.customer_id, body.line_items, body.due_date)
    inv = Invoice(
        workspace_id=workspace_id,
        client_id=str(body.client_id),
        stripe_invoice_id=result["invoice_id"],
        amount=result["amount"],
        status=result["status"],
        due_date=date.fromisoformat(body.due_date) if body.due_date else None,
        line_items=body.line_items,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    cache.invalidate_pattern("billing:*")
    return {
        "id": str(inv.id),
        "stripe_invoice_id": inv.stripe_invoice_id,
        "amount": inv.amount,
        "status": inv.status,
    }


@router.get("/invoices")
def list_invoices(workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    invoices = (
        db.query(Invoice)
        .filter(Invoice.workspace_id == workspace_id)
        .order_by(Invoice.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(inv.id),
            "client_id": str(inv.client_id),
            "stripe_invoice_id": inv.stripe_invoice_id,
            "amount": inv.amount,
            "status": inv.status,
            "due_date": inv.due_date.isoformat() if inv.due_date else None,
            "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
            "line_items": inv.line_items,
            "created_at": inv.created_at.isoformat() if inv.created_at else None,
        }
        for inv in invoices
    ]


# ---------------------------------------------------------------------------
# Revenue dashboard
# ---------------------------------------------------------------------------

@router.get("/revenue")
def revenue_dashboard(workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    try:
        result = stripe_service.get_revenue_dashboard(db, workspace_id)
    except Exception:
        result = None
    if not result:
        return {
            "mrr": 0,
            "arr": 0,
            "active_subscriptions": 0,
            "past_due": 0,
            "churn_rate": 0,
            "pending_invoices": 0,
            "total_revenue_ytd": 0,
        }
    return result


# ---------------------------------------------------------------------------
# Referrals
# ---------------------------------------------------------------------------

@router.post("/referrals")
def create_referral(body: CreateReferralReq, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    ref = referral_tracker.create_referral(
        db,
        workspace_id,
        str(body.referrer_id),
        str(body.referred_client_id),
        body.deal_value,
        body.commission_pct,
    )
    return {"id": str(ref.id), "commission_amount": ref.commission_amount, "status": ref.status}


@router.get("/referrals")
def referral_report(workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    return referral_tracker.get_referral_report(db, workspace_id)


@router.put("/referrals/{referral_id}/paid")
def mark_referral_paid(referral_id: UUID, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    try:
        ref = referral_tracker.mark_paid(db, str(referral_id))
        return {"id": str(ref.id), "status": ref.status}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
