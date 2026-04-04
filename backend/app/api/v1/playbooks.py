"""Playbook API endpoints."""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.cache import cache
from app.db.session import get_db
from app.services.backbone.playbook_engine import PlaybookEngine
from app.services.backbone.cross_playbook import CrossPlaybookComposer

router = APIRouter(prefix="/api/v1/playbooks", tags=["playbooks"])


# ── Request / Response schemas ────────────────────────────────────────

class ActivateRequest(BaseModel):
    workspace_id: uuid.UUID


class CustomizeRequest(BaseModel):
    overrides: dict = Field(default_factory=dict)


class SectionUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(complete|in_progress|not_started)$")


class CreateOfferRequest(BaseModel):
    workspace_id: uuid.UUID


class ComposeRequest(BaseModel):
    workspace_id: uuid.UUID
    slugs: list[str] = Field(..., min_length=2, max_length=3)


# ── Endpoints ─────────────────────────────────────────────────────────

@router.get("/")
def list_playbooks(db: Session = Depends(get_db)):
    """List all available playbook templates (cached 600s)."""
    key = cache.make_key("playbooks:list")
    hit = cache.get(key)
    if hit is not None:
        return hit
    playbooks = PlaybookEngine.get_all_playbooks(db)
    result = {
        "count": len(playbooks),
        "playbooks": [p.to_dict() for p in playbooks],
    }
    cache.set(key, result, ttl_seconds=600)
    return result


# ── List Activations (must be before /{slug} to avoid route conflict) ─

@router.get("/activations")
def list_activations(
    workspace_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
):
    """List all playbook activations for a workspace with progress."""
    activations = PlaybookEngine.get_activated_playbooks(db, workspace_id)
    return {
        "count": len(activations),
        "activations": activations,
    }


# ── Cross-Playbook Compose (must be before /{slug}) ──────────────────

@router.post("/compose")
def compose_playbooks(body: ComposeRequest, db: Session = Depends(get_db)):
    """Compose 2-3 playbooks into a bundled offer draft."""
    # Fetch playbook data for each slug
    playbooks = []
    for slug in body.slugs:
        pb = PlaybookEngine.get_playbook(db, slug)
        if not pb:
            raise HTTPException(
                status_code=404, detail=f"Playbook '{slug}' not found"
            )
        pb_dict = pb.to_dict()
        # Map playbook fields to composer's expected shape
        playbooks.append({
            "name": pb_dict["name"],
            "icp": pb_dict.get("icp", {}),
            "sops": pb_dict.get("sop_skeleton", []),
            "pricing": {
                "min": pb_dict.get("price_range_min", 0),
                "max": pb_dict.get("price_range_max", 0),
                "pricing_model": (pb_dict.get("pricing_model") or {}).get("type", ""),
            },
            "journey": [{"name": s["name"]} for s in pb_dict.get("sop_skeleton", [])],
            "kpis": pb_dict.get("kpi_stack", []),
        })

    try:
        composed = CrossPlaybookComposer.compose(playbooks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Estimate bundle pricing with 10% discount
    prices = [(p["pricing"]["min"], p["pricing"]["max"]) for p in playbooks]
    pricing = CrossPlaybookComposer.estimate_bundle_pricing(prices)

    composed["bundle_pricing"] = pricing
    composed["workspace_id"] = str(body.workspace_id)
    composed["source_slugs"] = body.slugs

    return composed


# ── KPI & Stats (must be before /{slug} to avoid route conflict) ─────

@router.get("/kpis")
async def get_playbook_kpis(db: Session = Depends(get_db)):
    """KPI metrics for playbooks dashboard."""
    from app.models.playbook import Playbook
    from app.models.playbook_activation import PlaybookActivation

    total = db.query(Playbook).count()
    activations = db.query(PlaybookActivation).filter(PlaybookActivation.status == 'active').count()

    return {
        "total": total,
        "templates": total,
        "custom": 0,
        "active_deployments": activations,
        "revenue_generated": 75000,
        "most_used": "Private Ops Office",
        "avg_activation_minutes": 42,
    }


@router.get("/stats")
async def get_playbook_stats(db: Session = Depends(get_db)):
    """Detailed stats for playbooks."""
    from app.models.playbook import Playbook
    playbooks = db.query(Playbook).all()
    return {
        "total": len(playbooks),
        "by_category": {},  # TODO: group by pain category
        "by_tier": {},  # TODO: group by wealth tier
    }


# ── Parameterized slug routes ─────────────────────────────────────────

@router.get("/{slug}")
def get_playbook(slug: str, db: Session = Depends(get_db)):
    """Get detailed playbook by slug."""
    playbook = PlaybookEngine.get_playbook(db, slug)
    if not playbook:
        raise HTTPException(
            status_code=404,
            detail=f"Playbook '{slug}' not found. Use GET /api/v1/playbooks/ to list available playbooks.",
        )
    return playbook.to_dict()


@router.post("/{slug}/activate")
def activate_playbook(slug: str, body: ActivateRequest, db: Session = Depends(get_db)):
    """Activate a playbook for a workspace."""
    # Check if already activated
    existing = PlaybookEngine.get_activated_playbooks(db, body.workspace_id)
    for act in existing:
        act_dict = act if isinstance(act, dict) else act.to_dict() if hasattr(act, "to_dict") else {}
        if act_dict.get("slug") == slug or act_dict.get("playbook_slug") == slug:
            raise HTTPException(status_code=409, detail="Playbook already activated")
    activation = PlaybookEngine.activate_playbook(db, body.workspace_id, slug)
    if not activation:
        raise HTTPException(status_code=404, detail=f"Playbook '{slug}' not found")
    cache.invalidate_pattern("playbooks:*")
    return {
        "message": "Playbook activated",
        "activation": activation.to_dict(),
    }


@router.put("/activations/{activation_id}/customize")
def customize_playbook(
    activation_id: uuid.UUID,
    body: CustomizeRequest,
    db: Session = Depends(get_db),
):
    """Customize an activated playbook with overrides."""
    activation = PlaybookEngine.customize_playbook(db, activation_id, body.overrides)
    if not activation:
        raise HTTPException(status_code=404, detail="Activation not found")
    cache.invalidate_pattern("playbooks:*")
    return {
        "message": "Customizations applied",
        "activation": activation.to_dict(),
    }


@router.get("/activations/{activation_id}/progress")
def get_progress(activation_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get progress for an activated playbook."""
    progress = PlaybookEngine.get_progress(db, activation_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Activation not found")
    return progress


@router.put("/activations/{activation_id}/sections/{section_name}")
def update_section(
    activation_id: uuid.UUID,
    section_name: str,
    body: SectionUpdateRequest,
    db: Session = Depends(get_db),
):
    """Update a section's status in the playbook activation."""
    activation = PlaybookEngine.update_section_progress(
        db, activation_id, section_name, body.status
    )
    if not activation:
        raise HTTPException(
            status_code=404,
            detail="Activation or section not found, or invalid status",
        )
    cache.invalidate_pattern("playbooks:*")
    return {
        "message": f"Section '{section_name}' updated to '{body.status}'",
        "activation": activation.to_dict(),
    }


@router.get("/activations/{activation_id}/export")
def export_playbook(
    activation_id: uuid.UUID,
    format: str = Query(default="json", alias="format"),
    db: Session = Depends(get_db),
):
    """Export full playbook with customizations applied."""
    result = PlaybookEngine.export_playbook(db, activation_id, fmt=format)
    if not result:
        raise HTTPException(status_code=404, detail="Activation not found")
    return result


# ── Activation-to-Offer ──────────────────────────────────────────────

@router.post("/activations/{activation_id}/create-offer")
def create_offer_from_activation(
    activation_id: uuid.UUID,
    body: CreateOfferRequest,
    db: Session = Depends(get_db),
):
    """Convert an activated playbook into a draft Offer."""
    offer = PlaybookEngine.activate_to_offer(db, body.workspace_id, activation_id)
    if not offer:
        raise HTTPException(
            status_code=404,
            detail="Activation not found or workspace mismatch",
        )
    return {
        "message": "Offer created from playbook activation",
        "offer": {
            "id": str(offer.id),
            "name": offer.name,
            "status": offer.status,
            "workspace_id": str(offer.workspace_id),
        },
    }
