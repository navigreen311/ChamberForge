"""Pydantic schemas for Problem CRUD operations."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import (
    WealthTier,
    BuyerType,
    LifeStage,
    TriggerEvent,
    PainCategory,
    WTPProfile,
    TrustChannel,
    ComplianceRisk,
    DeliveryModel,
    ProofMetric,
    LifecycleStage,
)


class ProblemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    workspace_id: str

    wealth_tier: Optional[WealthTier] = None
    buyer_type: Optional[BuyerType] = None
    life_stage: Optional[LifeStage] = None
    trigger_event: Optional[TriggerEvent] = None
    pain_category: Optional[PainCategory] = None
    wtp_profile: Optional[WTPProfile] = None
    trust_channel: Optional[TrustChannel] = None
    compliance_risk: Optional[ComplianceRisk] = None
    delivery_model: Optional[DeliveryModel] = None
    proof_metric: Optional[ProofMetric] = None
    lifecycle_stage: Optional[LifecycleStage] = None

    urgency_score: Optional[int] = Field(default=5, ge=1, le=10)
    wtp_confidence: Optional[float] = Field(default=0.5, ge=0.0, le=1.0)
    source: Optional[str] = None
    geo: Optional[str] = None


class ProblemRead(BaseModel):
    id: str
    workspace_id: str
    title: str
    description: Optional[str] = None

    wealth_tier: Optional[WealthTier] = None
    buyer_type: Optional[BuyerType] = None
    life_stage: Optional[LifeStage] = None
    trigger_event: Optional[TriggerEvent] = None
    pain_category: Optional[PainCategory] = None
    wtp_profile: Optional[WTPProfile] = None
    trust_channel: Optional[TrustChannel] = None
    compliance_risk: Optional[ComplianceRisk] = None
    delivery_model: Optional[DeliveryModel] = None
    proof_metric: Optional[ProofMetric] = None
    lifecycle_stage: Optional[LifecycleStage] = None

    urgency_score: Optional[int] = None
    wtp_confidence: Optional[float] = None
    source: Optional[str] = None
    geo: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProblemUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None

    wealth_tier: Optional[WealthTier] = None
    buyer_type: Optional[BuyerType] = None
    life_stage: Optional[LifeStage] = None
    trigger_event: Optional[TriggerEvent] = None
    pain_category: Optional[PainCategory] = None
    wtp_profile: Optional[WTPProfile] = None
    trust_channel: Optional[TrustChannel] = None
    compliance_risk: Optional[ComplianceRisk] = None
    delivery_model: Optional[DeliveryModel] = None
    proof_metric: Optional[ProofMetric] = None
    lifecycle_stage: Optional[LifecycleStage] = None

    urgency_score: Optional[int] = Field(default=None, ge=1, le=10)
    wtp_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    source: Optional[str] = None
    geo: Optional[str] = None


class ProblemList(BaseModel):
    items: list[ProblemRead]
    total: int
    skip: int
    limit: int
