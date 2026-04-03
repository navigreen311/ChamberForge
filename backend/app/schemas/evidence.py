"""Evidence schemas."""
import uuid
from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class EvidenceCreate(BaseModel):
    problem_id: Optional[uuid.UUID] = None
    workspace_id: uuid.UUID
    source_url: Optional[str] = None
    source_type: Optional[str] = None
    publication_date: Optional[date] = None
    credibility_score: Optional[float] = None
    extracted_claims: list[Any] = []
    contradiction_flags: list[Any] = []
    recency_decay_score: float = 0


class EvidenceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    problem_id: Optional[uuid.UUID] = None
    workspace_id: uuid.UUID
    source_url: Optional[str] = None
    source_type: Optional[str] = None
    publication_date: Optional[date] = None
    credibility_score: Optional[float] = None
    extracted_claims: list[Any]
    contradiction_flags: list[Any]
    recency_decay_score: float
    created_at: datetime
    updated_at: datetime


class EvidenceUpdate(BaseModel):
    problem_id: Optional[uuid.UUID] = None
    source_url: Optional[str] = None
    source_type: Optional[str] = None
    publication_date: Optional[date] = None
    credibility_score: Optional[float] = None
    extracted_claims: Optional[list[Any]] = None
    contradiction_flags: Optional[list[Any]] = None
    recency_decay_score: Optional[float] = None
