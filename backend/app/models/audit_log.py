"""AuditLog model."""
import uuid

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

from app.db.session import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = sa.Column(sa.String(36), primary_key=True, default=uuid.uuid4)
    workspace_id = sa.Column(sa.String(36), nullable=False, index=True)
    user_id = sa.Column(sa.String(36), nullable=True, index=True)
    action = sa.Column(sa.String, nullable=False)
    resource_type = sa.Column(sa.String, nullable=False, index=True)
    resource_id = sa.Column(sa.String(36), nullable=True)
    details = sa.Column(pg.JSON, default=dict)
    ip_address = sa.Column(sa.String, nullable=True)
    timestamp = sa.Column(sa.DateTime, server_default=sa.func.now(), nullable=False)

    __table_args__ = (
        sa.Index("ix_audit_logs_workspace_timestamp", "workspace_id", "timestamp"),
    )
