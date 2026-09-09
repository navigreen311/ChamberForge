"""WhiteLabelConfig model — enterprise white-label branding per workspace."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, String

from app.db.session import Base


class WhiteLabelConfig(Base):
    __tablename__ = "white_label_configs"

    id = Column(String(36), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String(36), unique=True, nullable=False, index=True)
    brand_name = Column(String(255), nullable=False, default="ChamberForge")
    logo_url = Column(String(1024), nullable=True)
    primary_color = Column(String(7), nullable=False, default="#fbbf24")
    secondary_color = Column(String(7), nullable=False, default="#102a43")
    favicon_url = Column(String(1024), nullable=True)
    custom_domain = Column(String(255), nullable=True)
    email_from_name = Column(String(255), nullable=True)
    email_from_address = Column(String(255), nullable=True)
    portal_footer_text = Column(String(500), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<WhiteLabelConfig workspace={self.workspace_id} brand={self.brand_name}>"
