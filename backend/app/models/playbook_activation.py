"""PlaybookActivation model — tracks a workspace's activation of a playbook."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models.types import GUID


class PlaybookActivation(Base):
    __tablename__ = "playbook_activations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(GUID(), nullable=False, index=True)
    playbook_id = Column(
        GUID(),
        ForeignKey("playbooks.id", ondelete="CASCADE"),
        nullable=False,
    )
    customizations = Column(JSON, nullable=False, default=dict)
    progress = Column(JSON, nullable=False, default=dict)
    status = Column(String, nullable=False, default="active")
    activated_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    completed_sections = Column(Integer, nullable=False, default=0)
    total_sections = Column(Integer, nullable=False, default=8)

    playbook = relationship("Playbook", lazy="joined")

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "workspace_id": str(self.workspace_id),
            "playbook_id": str(self.playbook_id),
            "customizations": self.customizations,
            "progress": self.progress,
            "status": self.status,
            "activated_at": self.activated_at.isoformat() if self.activated_at else None,
            "completed_sections": self.completed_sections,
            "total_sections": self.total_sections,
        }
