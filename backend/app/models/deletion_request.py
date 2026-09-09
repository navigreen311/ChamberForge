"""DeletionRequest model — tracks GDPR/CCPA data deletion workflows."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

import sqlalchemy as sa
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import JSON

from app.db.session import Base


class DeletionRequest(Base):
    __tablename__ = "deletion_requests"

    id = Column(sa.String(36), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(sa.String(36), nullable=False, index=True)
    client_id = Column(sa.String(36), nullable=False, index=True)
    requested_by = Column(sa.String(36), nullable=False)
    status = Column(
        String(20),
        nullable=False,
        default="pending",
        index=True,
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

    __table_args__ = (
        sa.Index("ix_deletion_requests_workspace_status", "workspace_id", "status"),
    )
