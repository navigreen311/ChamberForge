"""OntologyExtension - workspace-scoped ontology values.

P-01 creates the table; P-09 moves the engine onto it. Today
`ontology_engine.py` holds extensions in a module-level dict, so one
workspace's additions are visible to every other and none survive a restart -
a tenancy leak as well as a durability bug.
"""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa

from app.db.session import Base


class OntologyExtension(Base):
    __tablename__ = "ontology_extensions"
    __table_args__ = (
        sa.UniqueConstraint(
            "workspace_id", "field_name", "value", name="uq_ontology_extensions_ws_field_value"
        ),
        sa.Index("ix_ontology_extensions_ws_field", "workspace_id", "field_name"),
    )

    id = sa.Column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = sa.Column(sa.String(36), nullable=False)
    field_name = sa.Column(sa.String(255), nullable=False)
    value = sa.Column(sa.String(500), nullable=False)
    created_by = sa.Column(sa.String(36), nullable=True)
    created_at = sa.Column(
        sa.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
