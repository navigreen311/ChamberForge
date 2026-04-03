"""Playbook model."""
import uuid

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

from app.db.session import Base


class Playbook(Base):
    __tablename__ = "playbooks"

    id = sa.Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = sa.Column(sa.String, unique=True, nullable=False)
    name = sa.Column(sa.String, nullable=False)
    target_buyer = sa.Column(sa.String, nullable=True)
    price_range_min = sa.Column(sa.Float, nullable=True)
    price_range_max = sa.Column(sa.Float, nullable=True)
    core_pain = sa.Column(sa.String, nullable=True)
    icp = sa.Column(pg.JSON, default=dict)
    pain_triggers = sa.Column(pg.JSON, default=list)
    pricing_model = sa.Column(pg.JSON, default=dict)
    sop_skeleton = sa.Column(pg.JSON, default=dict)
    trust_concerns = sa.Column(pg.JSON, default=list)
    kpi_stack = sa.Column(pg.JSON, default=list)
