"""MFA configuration model for TOTP-based multi-factor authentication (SOC2 CC6)."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, JSON

from app.db.session import Base


def _new_uuid() -> str:
    return str(uuid.uuid4())


class MFAConfig(Base):
    __tablename__ = "mfa_configs"

    id = Column(String(36), primary_key=True, default=_new_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    secret = Column(String(512), nullable=False)  # encrypted TOTP secret
    is_enabled = Column(Boolean, nullable=False, default=False)
    backup_codes = Column(JSON, nullable=False, default=list)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<MFAConfig user_id={self.user_id} enabled={self.is_enabled}>"
