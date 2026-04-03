"""Workspace schemas."""
import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class WorkspaceCreate(BaseModel):
    name: str
    slug: str
    plan: str = "core"
    owner_id: Optional[uuid.UUID] = None
    settings: dict[str, Any] = {}


class WorkspaceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    plan: str
    owner_id: Optional[uuid.UUID] = None
    settings: dict[str, Any]
    created_at: datetime
    updated_at: datetime


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    plan: Optional[str] = None
    owner_id: Optional[uuid.UUID] = None
    settings: Optional[dict[str, Any]] = None
