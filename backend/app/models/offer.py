"""Offer domain model."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, JSON, TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.db.session import Base


class GUID(TypeDecorator):
    """Platform-independent GUID type.

    Uses PostgreSQL's UUID type when available, otherwise stores as CHAR(36).
    """
    impl = CHAR(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is not None:
            if isinstance(value, uuid.UUID):
                return str(value)
            return str(uuid.UUID(value))
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
        return value


class Offer(Base):
    __tablename__ = "offers"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(GUID(), nullable=False, index=True)
    problem_id = Column(GUID(), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    value_stack = Column(JSON, default=list)
    delivery_model = Column(String(50), nullable=False)
    guarantee_framework = Column(JSON, default=dict)
    pricing_model = Column(JSON, default=dict)
    sop_bundle = Column(JSON, default=list)
    journey_map = Column(JSON, default=dict)
    status = Column(String(20), default="draft", index=True)
    created_by = Column(GUID(), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
