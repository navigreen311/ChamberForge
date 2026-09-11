"""Ontology API - Problem Ontology Engine endpoints.

P-13 (T-008). All five routes were anonymous, and `/stats` took
`workspace_id` as a query parameter defaulting to `"default"` - so any
caller could read another firm's ontology distribution by naming it.
P-09 found that one and flagged it here rather than reaching across the
package boundary; this is the package that owns the file.

The mutating route matters most: `/mappings` extends a workspace's
ontology, and since P-09 those extensions are persisted and scoped. An
anonymous caller could previously have added values to whatever
workspace the engine happened to resolve.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_workspace_id
from app.core.identity import ResolvedIdentity
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
def get_schema(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Return the full canonical ontology schema, including extensions."""
    return engine.get_ontology_schema(db=db, workspace_id=workspace_id)


@router.post("/validate")
def validate(
    payload: ValidateRequest,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Validate problem data against the ontology."""
    return engine.validate_against_ontology(
        payload.problem_data, db=db, workspace_id=workspace_id
    )


@router.post("/suggest")
def suggest(
    payload: SuggestRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    """AI-powered classification suggestion from free text."""
    return engine.suggest_classifications(payload.text)


@router.get("/stats")
def stats(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Distribution counts for each ontology dimension."""
    return engine.get_ontology_stats(db, workspace_id)


@router.post("/mappings")
def update_mappings(
    payload: UpdateMappingsRequest,
    current_user: ResolvedIdentity = Depends(get_current_user),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Extend allowed values for a field.

    The extension is attributed to the session's operator, not to a
    caller-supplied id, and scoped to their workspace.
    """
    return engine.update_ontology_mappings(
        payload.field,
        payload.new_values,
        db=db,
        workspace_id=workspace_id,
        created_by=current_user.id,
    )
