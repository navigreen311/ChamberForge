"""Offer schemas."""
import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class OfferCreate(BaseModel):
    workspace_id: uuid.UUID
    problem_id: Optional[uuid.UUID] = None
    name: str
    value_stack: dict[str, Any] = {}
    delivery_model: Optional[str] = None
    guarantee_framework: dict[str, Any] = {}
    pricing_model: dict[str, Any] = {}
    status: str = "draft"
    created_by: Optional[uuid.UUID] = None


class OfferRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    problem_id: Optional[uuid.UUID] = None
    name: str
    value_stack: dict[str, Any]
    delivery_model: Optional[str] = None
    guarantee_framework: dict[str, Any]
    pricing_model: dict[str, Any]
    status: str
    created_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime


class OfferUpdate(BaseModel):
    name: Optional[str] = None
    value_stack: Optional[dict[str, Any]] = None
    delivery_model: Optional[str] = None
    guarantee_framework: Optional[dict[str, Any]] = None
    pricing_model: Optional[dict[str, Any]] = None
    status: Optional[str] = None
