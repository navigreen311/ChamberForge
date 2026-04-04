"""HouseholdGraph model — full relationship map for a client household."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, JSON, ForeignKey


from app.db.session import Base


class HouseholdGraph(Base):
    __tablename__ = "household_graphs"

    id = Column(String(36), primary_key=True, default=uuid.uuid4)
    client_id = Column(
        String(36),
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
