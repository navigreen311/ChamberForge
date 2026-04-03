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

router = APIRouter(prefix="/api/v1/playbooks", tags=["playbooks"])


# ── Request / Response schemas ────────────────────────────────────────

class ActivateRequest(BaseModel):
    workspace_id: uuid.UUID


class CustomizeRequest(BaseModel):
    overrides: dict = Field(default_factory=dict)


class SectionUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(complete|in_progress|not_started)$")


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


@router.get("/{slug}")
def get_playbook(slug: str, db: Session = Depends(get_db)):
    """Get detailed playbook by slug."""
    playbook = PlaybookEngine.get_playbook(db, slug)
    if not playbook:
        raise HTTPException(status_code=404, detail=f"Playbook '{slug}' not found")
    return playbook.to_dict()


@router.post("/{slug}/activate")
def activate_playbook(slug: str, body: ActivateRequest, db: Session = Depends(get_db)):
    """Activate a playbook for a workspace."""
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
