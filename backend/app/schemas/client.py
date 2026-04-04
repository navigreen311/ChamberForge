"""Client schemas."""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ClientCreate(BaseModel):
    workspace_id: uuid.UUID | None = None
    name: str
    company: Optional[str] = None
    wealth_tier: Optional[str] = None
    buyer_type: Optional[str] = None
    life_stage: Optional[str] = None
    status: str = "prospect"


class ClientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    company: Optional[str] = None
    wealth_tier: Optional[str] = None
    buyer_type: Optional[str] = None
    life_stage: Optional[str] = None
    status: str
    onboarded_at: Optional[datetime] = None
    health_score: float
    created_at: datetime
    updated_at: datetime


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    wealth_tier: Optional[str] = None
    buyer_type: Optional[str] = None
    life_stage: Optional[str] = None
    status: Optional[str] = None
    onboarded_at: Optional[datetime] = None
    health_score: Optional[float] = None
