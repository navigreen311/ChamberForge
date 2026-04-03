"""Client model — an HNW/UHNW client record."""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa
from sqlalchemy import Column, String, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base
from app.models.enums import WealthTier, ClientStatus


class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    wealth_tier = Column(String(30), nullable=False, default=WealthTier.HNW.value)
    status = Column(String(20), nullable=False, default=ClientStatus.PROSPECT.value, index=True)
    health_score = Column(Float, nullable=True, default=100.0, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        sa.Index("ix_clients_workspace_status", "workspace_id", "status"),
        sa.Index("ix_clients_workspace_wealth_tier", "workspace_id", "wealth_tier"),
    )
