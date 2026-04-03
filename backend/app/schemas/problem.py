"""Problem schemas."""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProblemCreate(BaseModel):
    workspace_id: uuid.UUID
    title: str
    description: Optional[str] = None
    wealth_tier: Optional[str] = None
    buyer_type: Optional[str] = None
    life_stage: Optional[str] = None
    trigger_event: Optional[str] = None
    pain_category: Optional[str] = None
    urgency_score: Optional[int] = None
    wtp_profile: Optional[str] = None
    trust_channel: Optional[str] = None
    compliance_risk: Optional[str] = None
    delivery_model: Optional[str] = None
    proof_metric: Optional[str] = None
    lifecycle_stage: Optional[str] = None
    status: str = "active"
    created_by: Optional[uuid.UUID] = None


class ProblemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    title: str
    description: Optional[str] = None
    wealth_tier: Optional[str] = None
    buyer_type: Optional[str] = None
    life_stage: Optional[str] = None
    trigger_event: Optional[str] = None
    pain_category: Optional[str] = None
    urgency_score: Optional[int] = None
    wtp_profile: Optional[str] = None
    trust_channel: Optional[str] = None
    compliance_risk: Optional[str] = None
    delivery_model: Optional[str] = None
    proof_metric: Optional[str] = None
    lifecycle_stage: Optional[str] = None
    status: str
    created_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime


class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    wealth_tier: Optional[str] = None
    buyer_type: Optional[str] = None
    life_stage: Optional[str] = None
    trigger_event: Optional[str] = None
    pain_category: Optional[str] = None
    urgency_score: Optional[int] = None
    wtp_profile: Optional[str] = None
    trust_channel: Optional[str] = None
    compliance_risk: Optional[str] = None
    delivery_model: Optional[str] = None
    proof_metric: Optional[str] = None
    lifecycle_stage: Optional[str] = None
    status: Optional[str] = None
