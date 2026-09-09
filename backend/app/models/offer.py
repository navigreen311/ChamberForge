"""Offer model — a packaged service offering."""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa
from sqlalchemy import JSON, Column, DateTime, String, Text

from app.db.session import Base
from app.models.enums import DeliveryModel, OfferStatus


class Offer(Base):
    __tablename__ = "offers"

    id = Column(sa.String(36), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(sa.String(36), nullable=False, index=True)
    problem_id = Column(sa.String(36), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    value_stack = Column(JSON, nullable=True, default=list)
    delivery_model = Column(String(50), nullable=False, default=DeliveryModel.DONE_FOR_YOU.value)
    guarantee_framework = Column(JSON, nullable=True, default=dict)
    pricing_model = Column(JSON, nullable=True, default=dict)
    sop_bundle = Column(JSON, nullable=True, default=dict)
    journey_map = Column(JSON, nullable=True, default=dict)
    status = Column(String(20), nullable=False, default=OfferStatus.DRAFT.value, index=True)
    created_by = Column(sa.String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        sa.Index("ix_offers_workspace_status", "workspace_id", "status"),
    )
