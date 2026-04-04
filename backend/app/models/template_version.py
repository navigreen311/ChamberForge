"""Template versioning model for tracking template changes."""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID

from app.db.session import Base


class TemplateVersion(Base):
    __tablename__ = "template_versions"

    id = Column(sa.String(36), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(sa.String(36), nullable=False, index=True)
    template_type = Column(String(50), nullable=False)  # "offer", "playbook", "sop"
    template_id = Column(sa.String(36), nullable=False, index=True)
    version_number = Column(Integer, nullable=False, default=1)
    content = Column(JSON, nullable=False)
    changes_summary = Column(Text, nullable=True)
    created_by = Column(sa.String(36), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        sa.Index("ix_template_versions_template", "template_type", "template_id"),
        sa.Index("ix_template_versions_workspace_type", "workspace_id", "template_type"),
    )
