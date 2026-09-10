"""SandboxEnvironment - a demo environment with a real boundary.

P-01 creates the table; P-02 moves the sandbox onto it. Today `sandbox.py`
keeps "isolated" environments in a class-level dict, so they are process-local,
lost on restart, and isolated from nothing. `is_sandbox` is the boundary: a row
carrying it must never be visible to a production query.
"""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa

from app.db.session import Base


class SandboxEnvironment(Base):
    __tablename__ = "sandbox_environments"

    id = sa.Column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = sa.Column(sa.String(36), nullable=False, index=True)
    name = sa.Column(sa.String(255), nullable=False)
    status = sa.Column(sa.String(30), nullable=False, default="active")
    is_sandbox = sa.Column(sa.Boolean, nullable=False, default=True)
    synthetic_data = sa.Column(sa.JSON, nullable=False, default=dict)
    seeded_at = sa.Column(sa.DateTime(timezone=True), nullable=True)
    created_at = sa.Column(
        sa.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
