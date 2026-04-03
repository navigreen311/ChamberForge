"""Crisis incident model for crisis management console."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID

from app.db.session import Base


class CrisisIncident(Base):
    __tablename__ = "crisis_incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    severity = Column(String(20), nullable=False)  # "low", "medium", "high", "critical"
    status = Column(String(20), nullable=False, default="active")  # "active", "contained", "resolved"
    timeline = Column(JSON, default=list, nullable=False)
    escalation_tree = Column(JSON, default=list, nullable=False)
    lockdown_actions = Column(JSON, default=list, nullable=False)
    reported_by = Column(UUID(as_uuid=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
