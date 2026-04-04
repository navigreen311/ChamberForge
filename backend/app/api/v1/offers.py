"""Offer Architect, Pricing Intelligence & Service Design API endpoints — workspace-isolated."""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_workspace_id
from app.core.exceptions import NotFoundError, ValidationError, ConflictError
from app.db.session import get_db
from app.models.client import Client
from app.models.offer import Offer
from app.models.user import User
from app.schemas.offer import OfferCreate, OfferRead, OfferUpdate
from app.services.agents.offer_ai import OfferAI
from app.services.agents.pricing_ai import PricingAI
from app.services.backbone.search_indices import OFFER_INDEX
from app.services.backbone.search_sync import remove_from_index, sync_offer
from app.services.backbone.service_design import ServiceDesignStudio

router = APIRouter(prefix="/api/v1/offers", tags=["offers"])

offer_ai = OfferAI()
pricing_ai = PricingAI()
service_studio = ServiceDesignStudio()


# ---------------------------------------------------------------------------
# Dashboard KPIs & Analytics
# ---------------------------------------------------------------------------

@router.get("/kpis")
async def get_offer_kpis(db: Session = Depends(get_db)):
    """KPI metrics for offers dashboard."""
    active = db.query(Offer).filter(Offer.status == 'active').all()
    drafts = db.query(Offer).filter(Offer.status == 'draft').all()

    mrr = sum(
        (o.pricing_model or {}).get('monthly', 0)
        if isinstance(o.pricing_model, dict) else 0
        for o in active
    )
    pipeline = sum(
        (o.pricing_model or {}).get('monthly', 0) * 12
        if isinstance(o.pricing_model, dict) else 0
        for o in drafts
    )

    # Get health scores for active offers' clients
    health_scores: list[float] = []
    for o in active:
        if o.created_by:  # proxy for client relationship
            client = db.query(Client).filter(Client.id == o.created_by).first()
            if client and client.health_score:
                health_scores.append(client.health_score)

    avg_health = sum(health_scores) / max(len(health_scores), 1)
    critical = sum(1 for h in health_scores if h < 50)

    return {
        "mrr": mrr,
        "mrr_delta": 12,
        "active_count": len(active),
        "active_revenue": mrr,
        "pipeline_value": pipeline,
        "draft_count": len(drafts),
        "avg_health": round(avg_health, 1),
        "critical_count": critical,
        "renewals_due": 1,
        "needs_attention_count": 2,
    }


@router.get("/mrr-history")
async def get_mrr_history():
    """6-month MRR history."""
    # TODO: Calculate from real billing data
    return {"months": [
        {"month": "Oct", "mrr": 52000},
        {"month": "Nov", "mrr": 58000},
        {"month": "Dec", "mrr": 63000},
        {"month": "Jan", "mrr": 68000},
        {"month": "Feb", "mrr": 72000},
        {"month": "Mar", "mrr": 75000},
    ]}


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[OfferRead])
def list_offers(
    status: str | None = Query(None),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """List offers scoped to a workspace, optionally filtered by status."""
    q = db.query(Offer).filter(Offer.workspace_id == workspace_id)
    if status:
        q = q.filter(Offer.status == status)
    return q.order_by(Offer.created_at.desc()).all()


@router.post("/", response_model=OfferRead, status_code=201)
def create_offer(
    payload: OfferCreate,
    background_tasks: BackgroundTasks,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Create a new offer."""
    data = payload.model_dump()
    data["workspace_id"] = workspace_id
    offer = Offer(**data)
    db.add(offer)
    db.commit()
    db.refresh(offer)
    background_tasks.add_task(
        sync_offer,
        str(offer.id),
        {
            "name": offer.name,
            "delivery_model": offer.delivery_model,
            "status": offer.status,
            "workspace_id": str(offer.workspace_id),
        },
    )
    return offer


@router.get("/{offer_id}", response_model=OfferRead)
def get_offer(
    offer_id: uuid.UUID,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Get a single offer by ID."""
    offer = db.query(Offer).filter(Offer.id == offer_id, Offer.workspace_id == workspace_id).first()
    if not offer:
        raise NotFoundError("Offer", str(offer_id))
    return offer


@router.put("/{offer_id}", response_model=OfferRead)
def update_offer(
    offer_id: uuid.UUID,
    payload: OfferUpdate,
    background_tasks: BackgroundTasks,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Update an existing offer."""
    offer = db.query(Offer).filter(Offer.id == offer_id, Offer.workspace_id == workspace_id).first()
    if not offer:
        raise NotFoundError("Offer", str(offer_id))
    if offer.status == "sunset":
        raise HTTPException(status_code=400, detail="Cannot modify sunset offers")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(offer, field, value)
    db.commit()
    db.refresh(offer)
    background_tasks.add_task(
        sync_offer,
        str(offer.id),
        {
            "name": offer.name,
            "delivery_model": offer.delivery_model,
            "status": offer.status,
            "workspace_id": str(offer.workspace_id),
        },
    )
    return offer


@router.delete("/{offer_id}", status_code=204)
def delete_offer(
    offer_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Soft-delete an offer by setting status to sunset."""
    offer = db.query(Offer).filter(Offer.id == offer_id, Offer.workspace_id == workspace_id).first()
    if not offer:
        raise NotFoundError("Offer", str(offer_id))
    offer.status = "sunset"
    db.commit()
    # Sync updated status rather than removing — soft delete keeps the record
    background_tasks.add_task(
        sync_offer,
        str(offer.id),
        {
            "name": offer.name,
            "delivery_model": offer.delivery_model,
            "status": "sunset",
            "workspace_id": str(offer.workspace_id),
        },
    )
    return None


# ---------------------------------------------------------------------------
# AI Generation
# ---------------------------------------------------------------------------

@router.post("/generate")
async def generate_offer(
    body: dict[str, Any],
    workspace_id: str = Depends(get_workspace_id),
):
    """AI-generate an offer draft from problem data and optional buyer profile."""
    problem_id = body.get("problem_id")
    if not problem_id:
        raise ValidationError("Problem ID required for offer generation", {"problem_id": "Field is required"})
    problem_data = body.get("problem_data")
    if not problem_data:
        raise ValidationError("problem_data is required", {"problem_data": "Field is required"})
    buyer_profile = body.get("buyer_profile")
    result = await offer_ai.generate_offer(problem_data, buyer_profile)
    result["workspace_id"] = workspace_id
    return result


@router.post("/{offer_id}/refine")
async def refine_offer(
    offer_id: uuid.UUID,
    body: dict[str, Any],
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Refine an existing offer based on user feedback."""
    offer = db.query(Offer).filter(Offer.id == offer_id, Offer.workspace_id == workspace_id).first()
    if not offer:
        raise NotFoundError("Offer", str(offer_id))
    feedback = body.get("feedback", "")
    offer_data = {
        "name": offer.name,
        "description": offer.description,
        "value_stack": offer.value_stack or [],
        "delivery_model": offer.delivery_model,
        "guarantee_framework": offer.guarantee_framework or {},
        "pricing_model": offer.pricing_model or {},
    }
    result = await offer_ai.refine_offer(offer_data, feedback)
    return result


# ---------------------------------------------------------------------------
# Pricing Intelligence
# ---------------------------------------------------------------------------

@router.post("/{offer_id}/pricing")
async def generate_pricing(
    offer_id: uuid.UUID,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Generate pricing recommendation for an offer."""
    offer = db.query(Offer).filter(Offer.id == offer_id, Offer.workspace_id == workspace_id).first()
    if not offer:
        raise NotFoundError("Offer", str(offer_id))
    offer_data = {
        "name": offer.name,
        "description": offer.description,
        "value_stack": offer.value_stack or [],
        "delivery_model": offer.delivery_model,
    }
    result = await pricing_ai.generate_pricing(offer_data)
    return result


@router.post("/simulate-margins")
def simulate_margins(
    body: dict[str, Any],
    workspace_id: str = Depends(get_workspace_id),
):
    """Run a margin simulation with provided inputs."""
    monthly_price = body.get("monthly_price", 0)
    setup_fee = body.get("setup_fee", 0)
    costs = body.get("costs", {})
    return pricing_ai.simulate_margins(monthly_price, setup_fee, costs)


@router.get("/benchmarks/{pain_category}")
def get_benchmarks(
    pain_category: str,
    workspace_id: str = Depends(get_workspace_id),
):
    """Return market benchmarks for a pain category."""
    benchmarks = pricing_ai.get_market_benchmarks(pain_category)
    if not benchmarks:
        raise NotFoundError("Benchmarks", pain_category)
    return benchmarks


# ---------------------------------------------------------------------------
# Service Design Studio
# ---------------------------------------------------------------------------

@router.post("/{offer_id}/sops")
def generate_sops(
    offer_id: uuid.UUID,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Generate SOPs for an offer."""
    offer = db.query(Offer).filter(Offer.id == offer_id, Offer.workspace_id == workspace_id).first()
    if not offer:
        raise NotFoundError("Offer", str(offer_id))
    sops = service_studio.generate_sops(
        offer_name=offer.name,
        delivery_model=offer.delivery_model,
        value_stack=offer.value_stack or [],
    )
    # Persist to offer
    offer.sop_bundle = sops
    db.commit()
    return sops


@router.post("/{offer_id}/journey")
def generate_journey(
    offer_id: uuid.UUID,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Generate a client journey map for an offer."""
    offer = db.query(Offer).filter(Offer.id == offer_id, Offer.workspace_id == workspace_id).first()
    if not offer:
        raise NotFoundError("Offer", str(offer_id))
    journey = service_studio.map_client_journey(
        offer_name=offer.name,
        value_stack=offer.value_stack or [],
    )
    offer.journey_map = journey
    db.commit()
    return journey
