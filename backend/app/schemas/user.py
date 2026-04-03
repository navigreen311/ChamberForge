"""User schemas."""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    role: str = "operator"
    workspace_id: Optional[uuid.UUID] = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    name: str
    role: str
    workspace_id: Optional[uuid.UUID] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    workspace_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None
