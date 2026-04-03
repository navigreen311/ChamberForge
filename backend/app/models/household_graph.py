"""HouseholdGraph model — full relationship map for a client household."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class HouseholdGraph(Base):
    __tablename__ = "household_graphs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(
        UUID(as_uuid=True),
        ForeignKey("clients.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    members = Column(JSON, nullable=False, default=list)
    properties = Column(JSON, nullable=False, default=list)
    staff = Column(JSON, nullable=False, default=list)
    vendors = Column(JSON, nullable=False, default=list)
    entities = Column(JSON, nullable=False, default=list)
    risk_exposures = Column(JSON, nullable=False, default=list)
    jurisdictions = Column(JSON, nullable=False, default=list)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
