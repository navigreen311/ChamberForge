"""HouseholdGraph model."""
import uuid

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

from app.db.session import Base


class HouseholdGraph(Base):
    __tablename__ = "household_graphs"

    id = sa.Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = sa.Column(
        pg.UUID(as_uuid=True), sa.ForeignKey("clients.id"), unique=True, nullable=False
    )
    members = sa.Column(pg.JSON, default=list)
    properties = sa.Column(pg.JSON, default=list)
    staff = sa.Column(pg.JSON, default=list)
    vendors = sa.Column(pg.JSON, default=list)
    entities = sa.Column(pg.JSON, default=list)
    risk_exposures = sa.Column(pg.JSON, default=list)
    jurisdictions = sa.Column(pg.JSON, default=list)
    updated_at = sa.Column(
        sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False
    )
