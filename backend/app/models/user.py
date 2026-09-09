"""User model with RBAC role and workspace membership."""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
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
        String(36), ForeignKey("workspaces.id"), nullable=True, index=True
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

    __table_args__ = (
        sa.Index("ix_users_workspace_role", "workspace_id", "role"),
    )

    workspace = relationship("Workspace", back_populates="members", foreign_keys=[workspace_id])

    def __repr__(self) -> str:
        return f"<User {self.email}>"
