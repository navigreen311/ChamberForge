"""Pydantic schemas for Offer endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field

# --- Value & Pricing sub-models ---

class ValueLayer(BaseModel):
    name: str
    description: str
    delivery_method: str
    estimated_hours: float


class PricingRecommendation(BaseModel):
    monthly_price: float
    setup_fee: float
    pricing_model: str
    anchors: list[dict[str, Any]] = []
    margin_estimate: float | None = None


class MarginSimulation(BaseModel):
    revenue: float
    costs: float
    gross_margin: float
    net_margin: float
    breakeven: float


# --- CRUD schemas ---

class OfferCreate(BaseModel):
    workspace_id: uuid.UUID | None = None
    problem_id: uuid.UUID | None = None
    name: str = Field(..., max_length=255)
    description: str | None = None
    value_stack: list[dict[str, Any]] = []
    delivery_model: str
    guarantee_framework: dict[str, Any] = {}
    pricing_model: dict[str, Any] = {}
    sop_bundle: list[dict[str, Any]] = []
    journey_map: dict[str, Any] = {}
    status: str = "draft"
    created_by: uuid.UUID | None = None


class OfferRead(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    problem_id: uuid.UUID | None = None
    name: str
    description: str | None = None
    value_stack: list[dict[str, Any]] = []
    delivery_model: str
    guarantee_framework: dict[str, Any] = {}
    pricing_model: dict[str, Any] = {}
    sop_bundle: list[dict[str, Any]] = []
    journey_map: dict[str, Any] = {}
    status: str
    created_by: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OfferUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    value_stack: Optional[list[dict[str, Any]]] = None
    delivery_model: Optional[str] = None
    guarantee_framework: Optional[dict[str, Any]] = None
    pricing_model: Optional[dict[str, Any]] = None
    sop_bundle: Optional[list[dict[str, Any]]] = None
    journey_map: Optional[dict[str, Any]] = None
    status: Optional[str] = None
