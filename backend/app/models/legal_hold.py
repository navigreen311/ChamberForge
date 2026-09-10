"""LegalHold model — prevents deletion of resources under legal obligation."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

import sqlalchemy as sa
from sqlalchemy import Column, DateTime, String, Text

from app.db.session import Base


class LegalHold(Base):
    __tablename__ = "legal_holds"

    id = Column(sa.String(36), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(sa.String(36), nullable=False, index=True)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(sa.String(36), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    status = Column(
        String(20),
        nullable=False,
        default="active",
        comment="active | released",
    )
    created_by = Column(sa.String(36), nullable=False)
    released_by = Column(sa.String(36), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    released_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        sa.Index("ix_legal_holds_workspace_status", "workspace_id", "status"),
        sa.Index("ix_legal_holds_resource", "resource_type", "resource_id"),
    )
