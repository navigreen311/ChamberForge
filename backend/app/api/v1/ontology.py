"""Ontology API — Problem Ontology Engine endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.backbone.ontology_engine import OntologyEngine

router = APIRouter(prefix="/api/v1/ontology", tags=["ontology"])
engine = OntologyEngine()


class ValidateRequest(BaseModel):
    problem_data: dict


class SuggestRequest(BaseModel):
    text: str


class UpdateMappingsRequest(BaseModel):
    field: str
    new_values: list[str]


@router.get("/schema")
def get_schema():
    """Return the full canonical ontology schema."""
    return engine.get_ontology_schema()


@router.post("/validate")
def validate(payload: ValidateRequest):
    """Validate problem data against the ontology."""
    return engine.validate_against_ontology(payload.problem_data)


@router.post("/suggest")
def suggest(payload: SuggestRequest):
    """AI-powered classification suggestion from free text."""
    return engine.suggest_classifications(payload.text)


@router.get("/stats")
def stats(workspace_id: str = "default", db: Session = Depends(get_db)):
    """Distribution counts for each ontology dimension."""
    return engine.get_ontology_stats(db, workspace_id)


@router.post("/mappings")
def update_mappings(payload: UpdateMappingsRequest):
    """Extend allowed values for a field (admin only)."""
    return engine.update_ontology_mappings(payload.field, payload.new_values)
