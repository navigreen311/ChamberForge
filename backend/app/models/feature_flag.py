"""FeatureFlag model for entitlements and feature gating."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, String, Text

from app.db.session import Base
from app.models._types import PortableUUID


class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(PortableUUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    enabled = Column(Boolean, default=False, nullable=False)
    plan_requirements = Column(JSON, default=list)
    rollout_percentage = Column(Float, default=0.0)
    conditions = Column(JSON, default=dict)
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
