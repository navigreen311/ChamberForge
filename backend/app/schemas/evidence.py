"""Pydantic schemas for Evidence endpoints."""
from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ClaimExtraction(BaseModel):
    claim_text: str
    confidence: float = Field(ge=0.0, le=1.0)
    category: str


class ContradictionFlag(BaseModel):
    claim_a: str
    claim_b: str
    source_a_id: str
    source_b_id: str
    explanation: str


class EvidenceCreate(BaseModel):
    workspace_id: Optional[UUID] = None
    source_url: str
    source_type: str
    publication_date: date
    credibility_score: float = Field(default=5.0, ge=0.0, le=10.0)
    extracted_claims: list[dict] = Field(default_factory=list)
    contradiction_flags: list[dict] = Field(default_factory=list)
    problem_id: Optional[UUID] = None


class EvidenceRead(BaseModel):
    id: UUID
    problem_id: Optional[UUID] = None
    workspace_id: UUID
    source_url: str
    source_type: str
    publication_date: date
    credibility_score: float
    extracted_claims: list[dict]
    contradiction_flags: list[dict]
    recency_decay_score: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class EvidenceUpdate(BaseModel):
    source_url: Optional[str] = None
    source_type: Optional[str] = None
    publication_date: Optional[date] = None
    credibility_score: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    extracted_claims: Optional[list[dict]] = None
    contradiction_flags: Optional[list[dict]] = None
    problem_id: Optional[UUID] = None


class IngestRequest(BaseModel):
    text: str
    source_type: str
    source_url: str = ""
    publication_date: Optional[date] = None
    workspace_id: UUID
