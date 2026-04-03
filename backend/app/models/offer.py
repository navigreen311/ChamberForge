"""Offer model — a packaged service offering."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, JSON, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base
from app.models.enums import OfferStatus, DeliveryModel


class Offer(Base):
    __tablename__ = "offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    problem_id = Column(UUID(as_uuid=True), nullable=True)
    name = Column(String(255), nullable=False)
    value_stack = Column(JSON, nullable=True, default=list)
    delivery_model = Column(String(50), nullable=False, default=DeliveryModel.DONE_FOR_YOU.value)
    guarantee_framework = Column(JSON, nullable=True, default=dict)
    pricing_model = Column(JSON, nullable=True, default=dict)
    sop_bundle = Column(JSON, nullable=True, default=dict)
    status = Column(String(20), nullable=False, default=OfferStatus.DRAFT.value, index=True)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
