"""Client model."""
import uuid

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

from app.db.session import Base


class Client(Base):
    __tablename__ = "clients"

    id = sa.Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = sa.Column(
        pg.UUID(as_uuid=True), sa.ForeignKey("workspaces.id"), nullable=False
    )
    name = sa.Column(sa.String, nullable=False)
    company = sa.Column(sa.String, nullable=True)
    wealth_tier = sa.Column(sa.String, nullable=True)
    buyer_type = sa.Column(sa.String, nullable=True)
    life_stage = sa.Column(sa.String, nullable=True)
    status = sa.Column(sa.String, default="prospect", nullable=False)
    onboarded_at = sa.Column(sa.DateTime, nullable=True)
    health_score = sa.Column(sa.Float, default=100.0)
    created_at = sa.Column(sa.DateTime, server_default=sa.func.now(), nullable=False)
    updated_at = sa.Column(
        sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False
    )
