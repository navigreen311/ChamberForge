"""Problem model."""
import uuid

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.orm import relationship

from app.db.session import Base


class Problem(Base):
    __tablename__ = "problems"

    id = sa.Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = sa.Column(
        pg.UUID(as_uuid=True), sa.ForeignKey("workspaces.id"), nullable=False
    )
    title = sa.Column(sa.String, nullable=False)
    description = sa.Column(sa.Text, nullable=True)
    wealth_tier = sa.Column(sa.String, nullable=True)
    buyer_type = sa.Column(sa.String, nullable=True)
    life_stage = sa.Column(sa.String, nullable=True)
    trigger_event = sa.Column(sa.String, nullable=True)
    pain_category = sa.Column(sa.String, nullable=True)
    urgency_score = sa.Column(sa.Integer, nullable=True)
    wtp_profile = sa.Column(sa.String, nullable=True)
    trust_channel = sa.Column(sa.String, nullable=True)
    compliance_risk = sa.Column(sa.String, nullable=True)
    delivery_model = sa.Column(sa.String, nullable=True)
    proof_metric = sa.Column(sa.String, nullable=True)
    lifecycle_stage = sa.Column(sa.String, nullable=True)
    status = sa.Column(sa.String, default="active", nullable=False)
    created_by = sa.Column(
        pg.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True
    )
    created_at = sa.Column(sa.DateTime, server_default=sa.func.now(), nullable=False)
    updated_at = sa.Column(
        sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False
    )

    evidences = relationship("Evidence", back_populates="problem", lazy="select")
    offers = relationship("Offer", back_populates="problem", lazy="select")
