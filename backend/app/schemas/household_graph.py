"""HouseholdGraph schemas."""
import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class HouseholdGraphCreate(BaseModel):
    client_id: uuid.UUID
    members: list[Any] = []
    properties: list[Any] = []
    staff: list[Any] = []
    vendors: list[Any] = []
    entities: list[Any] = []
    risk_exposures: list[Any] = []
    jurisdictions: list[Any] = []


class HouseholdGraphRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    client_id: uuid.UUID
    members: list[Any]
    properties: list[Any]
    staff: list[Any]
    vendors: list[Any]
    entities: list[Any]
    risk_exposures: list[Any]
    jurisdictions: list[Any]
    updated_at: datetime


class HouseholdGraphUpdate(BaseModel):
    members: Optional[list[Any]] = None
    properties: Optional[list[Any]] = None
    staff: Optional[list[Any]] = None
    vendors: Optional[list[Any]] = None
    entities: Optional[list[Any]] = None
    risk_exposures: Optional[list[Any]] = None
    jurisdictions: Optional[list[Any]] = None
