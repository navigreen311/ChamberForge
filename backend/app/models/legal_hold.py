"""LegalHold model — prevents deletion of resources under legal obligation."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class LegalHold(Base):
    __tablename__ = "legal_holds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    status = Column(
        String(20),
        nullable=False,
        default="active",
        comment="active | released",
    )
    created_by = Column(UUID(as_uuid=True), nullable=False)
    released_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    released_at = Column(DateTime(timezone=True), nullable=True)
