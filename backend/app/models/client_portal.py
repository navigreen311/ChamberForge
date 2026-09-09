"""ClientPortalAccess model — token-based portal access for end clients."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Column, DateTime, String

from app.db.session import Base


class ClientPortalAccess(Base):
    __tablename__ = "client_portal_access"

    id = Column(String(36), primary_key=True, default=uuid.uuid4)
    client_id = Column(String(36), nullable=False, index=True)
    portal_token = Column(String(128), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    last_accessed_at = Column(DateTime(timezone=True), nullable=True)
    settings = Column(JSON, nullable=False, default=dict)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
