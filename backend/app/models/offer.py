"""Offer model."""
import uuid

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.orm import relationship

from app.db.session import Base


class Offer(Base):
    __tablename__ = "offers"

    id = sa.Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = sa.Column(
        pg.UUID(as_uuid=True), sa.ForeignKey("workspaces.id"), nullable=False
    )
    problem_id = sa.Column(
        pg.UUID(as_uuid=True), sa.ForeignKey("problems.id"), nullable=True
    )
    name = sa.Column(sa.String, nullable=False)
    value_stack = sa.Column(pg.JSON, default=dict)
    delivery_model = sa.Column(sa.String, nullable=True)
    guarantee_framework = sa.Column(pg.JSON, default=dict)
    pricing_model = sa.Column(pg.JSON, default=dict)
    status = sa.Column(sa.String, default="draft", nullable=False)
    created_by = sa.Column(pg.UUID(as_uuid=True), nullable=True)
    created_at = sa.Column(sa.DateTime, server_default=sa.func.now(), nullable=False)
    updated_at = sa.Column(
        sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False
    )

    problem = relationship("Problem", back_populates="offers")
