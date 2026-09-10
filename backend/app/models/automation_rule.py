"""AutomationRule model for the rules engine."""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa
from sqlalchemy import JSON, Boolean, Column, DateTime, Integer, String

from app.db.session import Base
from app.models._types import PortableUUID


class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(PortableUUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(PortableUUID, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    trigger_type = Column(String(100), nullable=False)
    trigger_conditions = Column(JSON, nullable=False)
    action_type = Column(String(100), nullable=False)
    action_config = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    execution_count = Column(Integer, default=0, nullable=False)
    last_executed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        sa.Index("ix_automation_rules_workspace_active", "workspace_id", "is_active"),
    )
