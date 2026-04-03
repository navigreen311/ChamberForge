"""Workspace model."""
import uuid

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

from app.db.session import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id = sa.Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = sa.Column(sa.String, nullable=False)
    slug = sa.Column(sa.String, unique=True, nullable=False)
    plan = sa.Column(sa.String, default="core", nullable=False)
    owner_id = sa.Column(pg.UUID(as_uuid=True), nullable=True)
    settings = sa.Column(pg.JSON, default=dict)
    created_at = sa.Column(sa.DateTime, server_default=sa.func.now(), nullable=False)
    updated_at = sa.Column(
        sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False
    )
