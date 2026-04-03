"""DeletionRequest model — tracks GDPR/CCPA data deletion workflows."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID

from app.db.session import Base


class DeletionRequest(Base):
    __tablename__ = "deletion_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    client_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    requested_by = Column(UUID(as_uuid=True), nullable=False)
    status = Column(
        String(20),
        nullable=False,
        default="pending",
        comment="pending | approved | executing | completed | failed",
    )
    tables_cleaned = Column(JSON, default=list)
    records_deleted = Column(Integer, default=0)
    requested_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)
