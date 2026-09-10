"""AuditService — read/write operations for the audit_logs table."""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.services.backbone.audit_chain import (
    ChainVerification,
    hash_for_entry,
    latest_entry,
    next_timestamp,
    verify_workspace_chain,
)


class AuditService:
    """Encapsulates all audit-log persistence and query logic."""

    @staticmethod
    def log_action(
        db: Session,
        workspace_id: uuid.UUID,
        user_id: Optional[uuid.UUID],
        action: str,
        resource_type: str,
        resource_id: Optional[uuid.UUID] = None,
        details: Optional[dict] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        """Create a single audit-log entry, chained to the one before it."""
        entry = AuditLog(
            # The model defaults id to uuid.uuid4, which returns a UUID
            # object into a String(36) column. Postgres coerces it; SQLite
            # refuses to bind it. Setting a string here fixes both dialects
            # without touching the model, which P-01 owns.
            id=str(uuid.uuid4()),
            workspace_id=workspace_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
            timestamp=datetime.now(timezone.utc),
        )

        # Read the tip once, and use it for both the link and the timestamp.
        # Two entries sharing a millisecond would make the chain order
        # ambiguous, because id is a random uuid4 and offers no tiebreaker.
        previous = latest_entry(db, workspace_id, AuditLog)
        entry.timestamp = next_timestamp(previous, entry.timestamp)

        # P-03 (T-012): link this entry to the tip of the workspace's chain.
        # Done before the insert so a row is never written unhashed - a gap
        # in the chain is indistinguishable from a deletion, and an
        # unverifiable trail is the thing this package exists to fix.
        entry.prev_hash = previous.entry_hash if previous else None
        entry.entry_hash = hash_for_entry(entry, entry.prev_hash)

        db.add(entry)
        db.commit()
        return entry

    @staticmethod
    def verify_chain(db: Session, workspace_id: uuid.UUID) -> ChainVerification:
        """Recompute this workspace's chain and report any break.

        P-01's trigger stops UPDATE and DELETE against the live database.
        This catches what a trigger cannot: a restore from a doctored backup,
        or a migration that dropped the trigger and let history be rewritten.
        """
        return verify_workspace_chain(db, workspace_id, AuditLog)

    @staticmethod
    def get_audit_trail(
        db: Session,
        workspace_id: uuid.UUID,
        resource_type: Optional[str] = None,
        user_id: Optional[uuid.UUID] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[AuditLog]:
        """Return paginated, filtered audit trail for a workspace."""
        q = db.query(AuditLog).filter(AuditLog.workspace_id == workspace_id)
        if resource_type:
            q = q.filter(AuditLog.resource_type == resource_type)
        if user_id:
            q = q.filter(AuditLog.user_id == user_id)
        if start_date:
            q = q.filter(AuditLog.timestamp >= start_date)
        if end_date:
            q = q.filter(AuditLog.timestamp <= end_date)
        return q.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_user_activity(
        db: Session,
        user_id: uuid.UUID,
        days: int = 30,
    ) -> list[AuditLog]:
        """Return recent activity for a specific user."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        return (
            db.query(AuditLog)
            .filter(AuditLog.user_id == user_id, AuditLog.timestamp >= cutoff)
            .order_by(AuditLog.timestamp.desc())
            .all()
        )

    @staticmethod
    def export_audit_trail(
        db: Session,
        workspace_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
    ) -> list[dict]:
        """Export audit trail as plain dicts for compliance reporting."""
        rows = (
            db.query(AuditLog)
            .filter(
                AuditLog.workspace_id == workspace_id,
                AuditLog.timestamp >= start_date,
                AuditLog.timestamp <= end_date,
            )
            .order_by(AuditLog.timestamp.asc())
            .all()
        )
        return [
            {
                "id": str(row.id),
                "workspace_id": str(row.workspace_id),
                "user_id": str(row.user_id) if row.user_id else None,
                "action": row.action,
                "resource_type": row.resource_type,
                "resource_id": str(row.resource_id) if row.resource_id else None,
                "details": row.details,
                "ip_address": row.ip_address,
                "timestamp": row.timestamp.isoformat(),
            }
            for row in rows
        ]
