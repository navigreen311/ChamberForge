"""User model with RBAC role and workspace membership."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship

from app.db.session import Base


def _new_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=_new_uuid)
    email = Column(String(320), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(1024), nullable=False)
    role = Column(String(50), nullable=False, default="operator")
    workspace_id = Column(
        String(36), ForeignKey("workspaces.id"), nullable=True
    )
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

    workspace = relationship("Workspace", back_populates="members", foreign_keys=[workspace_id])

    def __repr__(self) -> str:
        return f"<User {self.email}>"
