"""Playbook schemas."""
import uuid
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class PlaybookCreate(BaseModel):
    slug: str
    name: str
    target_buyer: Optional[str] = None
    price_range_min: Optional[float] = None
    price_range_max: Optional[float] = None
    core_pain: Optional[str] = None
    icp: dict[str, Any] = {}
    pain_triggers: list[Any] = []
    pricing_model: dict[str, Any] = {}
    sop_skeleton: dict[str, Any] = {}
    trust_concerns: list[Any] = []
    kpi_stack: list[Any] = []


class PlaybookRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name: str
    target_buyer: Optional[str] = None
    price_range_min: Optional[float] = None
    price_range_max: Optional[float] = None
    core_pain: Optional[str] = None
    icp: dict[str, Any]
    pain_triggers: list[Any]
    pricing_model: dict[str, Any]
    sop_skeleton: dict[str, Any]
    trust_concerns: list[Any]
    kpi_stack: list[Any]


class PlaybookUpdate(BaseModel):
    name: Optional[str] = None
    target_buyer: Optional[str] = None
    price_range_min: Optional[float] = None
    price_range_max: Optional[float] = None
    core_pain: Optional[str] = None
    icp: Optional[dict[str, Any]] = None
    pain_triggers: Optional[list[Any]] = None
    pricing_model: Optional[dict[str, Any]] = None
    sop_skeleton: Optional[dict[str, Any]] = None
    trust_concerns: Optional[list[Any]] = None
    kpi_stack: Optional[list[Any]] = None
