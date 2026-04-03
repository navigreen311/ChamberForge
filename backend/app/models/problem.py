"""Problem model — core entity for the Problem Discovery Engine."""
import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, Enum, Index
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models.enums import (
    WealthTier,
    BuyerType,
    LifeStage,
    TriggerEvent,
    PainCategory,
    WTPProfile,
    TrustChannel,
    ComplianceRisk,
    DeliveryModel,
    ProofMetric,
    LifecycleStage,
)


class Problem(Base):
    __tablename__ = "problems"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), nullable=False, index=True)

    # Core fields
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Ontology fields
    wealth_tier = Column(
        Enum(WealthTier, name="wealth_tier", create_constraint=False),
        nullable=True,
    )
    buyer_type = Column(
        Enum(BuyerType, name="buyer_type", create_constraint=False),
        nullable=True,
    )
    life_stage = Column(
        Enum(LifeStage, name="life_stage", create_constraint=False),
        nullable=True,
    )
    trigger_event = Column(
        Enum(TriggerEvent, name="trigger_event", create_constraint=False),
        nullable=True,
    )
    pain_category = Column(
        Enum(PainCategory, name="pain_category", create_constraint=False),
        nullable=True,
    )
    wtp_profile = Column(
        Enum(WTPProfile, name="wtp_profile", create_constraint=False),
        nullable=True,
    )
    trust_channel = Column(
        Enum(TrustChannel, name="trust_channel", create_constraint=False),
        nullable=True,
    )
    compliance_risk = Column(
        Enum(ComplianceRisk, name="compliance_risk", create_constraint=False),
        nullable=True,
    )
    delivery_model = Column(
        Enum(DeliveryModel, name="delivery_model", create_constraint=False),
        nullable=True,
    )
    proof_metric = Column(
        Enum(ProofMetric, name="proof_metric", create_constraint=False),
        nullable=True,
    )
    lifecycle_stage = Column(
        Enum(LifecycleStage, name="lifecycle_stage", create_constraint=False),
        nullable=True,
    )

    # Scoring
    urgency_score = Column(Integer, nullable=True, default=5, index=True)
    wtp_confidence = Column(Float, nullable=True, default=0.5)

    # Metadata
    source = Column(String(255), nullable=True)
    geo = Column(String(100), nullable=True)
    status = Column(String(50), default="active", nullable=False)
    created_by = Column(String(36), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        sa.Index("ix_problems_workspace_lifecycle", "workspace_id", "lifecycle_stage"),
        sa.Index("ix_problems_workspace_status", "workspace_id", "status"),
    )

    evidences = relationship("Evidence", back_populates="problem", lazy="select")
    offers = relationship("Offer", back_populates="problem", lazy="select")
