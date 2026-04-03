"""User model."""
import uuid

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = sa.Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = sa.Column(sa.String, unique=True, index=True, nullable=False)
    name = sa.Column(sa.String, nullable=False)
    hashed_password = sa.Column(sa.String, nullable=False)
    role = sa.Column(sa.String, default="operator", nullable=False)
    workspace_id = sa.Column(
        pg.UUID(as_uuid=True), sa.ForeignKey("workspaces.id"), nullable=True
    )
    is_active = sa.Column(sa.Boolean, default=True, nullable=False)
    created_at = sa.Column(sa.DateTime, server_default=sa.func.now(), nullable=False)
    updated_at = sa.Column(
        sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False
    )
