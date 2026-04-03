"""AIUsageLog model for AI runtime tracking."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.db.session import Base
from app.models._types import PortableUUID


class AIUsageLog(Base):
    __tablename__ = "ai_usage_logs"

    id = Column(PortableUUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(PortableUUID, nullable=False, index=True)
    agent_name = Column(String(255), nullable=False, index=True)
    tokens_in = Column(Integer, nullable=False)
    tokens_out = Column(Integer, nullable=False)
    latency_ms = Column(Integer, nullable=False)
    cost_usd = Column(Float, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
