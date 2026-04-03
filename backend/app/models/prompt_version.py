"""PromptVersion model for AI Eval Lab prompt management."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String, Text

from app.db.session import Base
from app.models._types import PortableUUID


class PromptVersion(Base):
    __tablename__ = "prompt_versions"

    id = Column(PortableUUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_name = Column(String(255), nullable=False, index=True)
    version = Column(Integer, nullable=False)
    prompt_template = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    test_results = Column(JSON, default=dict)
    created_by = Column(PortableUUID, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
