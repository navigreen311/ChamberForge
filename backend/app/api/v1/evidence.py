"""Evidence Graph API endpoints."""
from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.evidence import (
    EvidenceCreate,
    EvidenceRead,
    EvidenceUpdate,
    IngestRequest,
)
from app.services.agents.research_ai import ResearchAI
from app.services.backbone.evidence_ops import EvidenceOps

router = APIRouter(prefix="/api/v1/evidence", tags=["evidence"])


@router.get("/analyst-queue", response_model=list[EvidenceRead])
def get_analyst_queue(
    workspace_id: UUID,
    db: Session = Depends(get_db),
):
    """Get evidence items needing analyst review."""
    return EvidenceOps.get_analyst_queue(db, workspace_id)


@router.get("/", response_model=list[EvidenceRead])
def list_evidence(
    workspace_id: UUID,
    problem_id: Optional[UUID] = None,
    source_type: Optional[str] = None,
    min_credibility: Optional[float] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """List evidence with optional filters."""
    return EvidenceOps.list(
        db, workspace_id, problem_id, source_type, min_credibility, skip, limit
    )


@router.post("/", response_model=EvidenceRead, status_code=201)
def create_evidence(
    data: EvidenceCreate,
    db: Session = Depends(get_db),
):
    """Create a new evidence record."""
    duplicate = EvidenceOps.check_duplicate(db, data.source_url)
    if duplicate:
        raise HTTPException(status_code=409, detail="Duplicate source URL already exists")
    return EvidenceOps.create(db, data.workspace_id, data)


@router.get("/{evidence_id}", response_model=EvidenceRead)
def get_evidence(
    evidence_id: UUID,
    db: Session = Depends(get_db),
):
    """Get a single evidence record by ID."""
    evidence = EvidenceOps.get(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return evidence


@router.put("/{evidence_id}", response_model=EvidenceRead)
def update_evidence(
    evidence_id: UUID,
    data: EvidenceUpdate,
    db: Session = Depends(get_db),
):
    """Update an evidence record."""
    evidence = EvidenceOps.update(db, evidence_id, data)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return evidence


@router.delete("/{evidence_id}", status_code=204)
def delete_evidence(
    evidence_id: UUID,
    db: Session = Depends(get_db),
):
    """Delete an evidence record."""
    success = EvidenceOps.delete(db, evidence_id)
    if not success:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return None


@router.post("/{evidence_id}/link/{problem_id}", response_model=EvidenceRead)
def link_evidence_to_problem(
    evidence_id: UUID,
    problem_id: UUID,
    db: Session = Depends(get_db),
):
    """Link an evidence record to a problem."""
    evidence = EvidenceOps.link_to_problem(db, evidence_id, problem_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return evidence


@router.post("/ingest", response_model=EvidenceRead, status_code=201)
async def ingest_source(
    request: IngestRequest,
    db: Session = Depends(get_db),
):
    """Ingest a source text: extract claims via AI and save evidence."""
    research_ai = ResearchAI()
    result = await research_ai.ingest_source(request.text, request.source_type)

    data = EvidenceCreate(
        workspace_id=request.workspace_id,
        source_url=request.source_url or f"ingest://{request.source_type}",
        source_type=request.source_type,
        publication_date=request.publication_date or date.today(),
        credibility_score=float(result.get("estimated_credibility", 5)),
        extracted_claims=result.get("claims", []),
    )
    return EvidenceOps.create(db, request.workspace_id, data)


@router.post("/recalculate-decay")
def recalculate_decay(
    workspace_id: UUID,
    db: Session = Depends(get_db),
):
    """Trigger recency decay recalculation for all evidence in a workspace."""
    count = EvidenceOps.recalculate_all_decay(db, workspace_id)
    return {"updated": count, "workspace_id": str(workspace_id)}
