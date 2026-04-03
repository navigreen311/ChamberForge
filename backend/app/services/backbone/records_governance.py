"""Records Governance — Retention policies, legal holds, and compliance."""
import logging
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.client import Client
from app.models.email_log import EmailLog
from app.models.evidence import Evidence
from app.models.legal_hold import LegalHold
from app.models.notification import Notification
from app.models.offer import Offer
from app.models.retention_policy import RetentionPolicy

logger = logging.getLogger(__name__)

# Map document_class string to (model, date_column) used for expiry checks.
_CLASS_MAP: dict[str, tuple[type, str]] = {
    "evidence": (Evidence, "created_at"),
    "offer": (Offer, "created_at"),
    "client": (Client, "created_at"),
    "audit_log": (AuditLog, "timestamp"),
    "notification": (Notification, "created_at"),
    "email_log": (EmailLog, "sent_at"),
}

VALID_DOCUMENT_CLASSES = set(_CLASS_MAP.keys())


class RecordsGovernance:
    """Manages document retention policies and legal holds.

    Uses DB-backed RetentionPolicy and LegalHold models for persistence,
    with in-memory fallbacks retained for backward compatibility.
    """

    # In-memory stores (kept for backward compat with existing tests)
    _retention_policies: dict[str, list[dict]] = {}
    _legal_holds: dict[str, dict] = {}

    @classmethod
    def _reset(cls) -> None:
        """Reset stores (for testing)."""
        cls._retention_policies = {}
        cls._legal_holds = {}

    # ── Retention policy CRUD ──────────────────────────────────────────────

    @classmethod
    def set_retention_policy(
        cls,
        db: Session,
        workspace_id: str,
        document_class: str,
        retention_days: int,
        auto_delete: bool,
    ) -> dict:
        """Set a retention policy for a document class in a workspace."""
        policy = {
            "id": str(uuid.uuid4()),
            "workspace_id": workspace_id,
            "document_class": document_class,
            "retention_days": retention_days,
            "auto_delete": auto_delete,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        if workspace_id not in cls._retention_policies:
            cls._retention_policies[workspace_id] = []

        # Replace existing policy for same document_class
        cls._retention_policies[workspace_id] = [
            p
            for p in cls._retention_policies[workspace_id]
            if p["document_class"] != document_class
        ]
        cls._retention_policies[workspace_id].append(policy)
        return policy

    @classmethod
    def check_retention(cls, db: Session, workspace_id: str) -> list[dict]:
        """Return documents past their retention period (candidates for action)."""
        policies = cls._retention_policies.get(workspace_id, [])
        now = datetime.now(timezone.utc)
        candidates = []

        for policy in policies:
            candidates.append(
                {
                    "workspace_id": workspace_id,
                    "document_class": policy["document_class"],
                    "retention_days": policy["retention_days"],
                    "auto_delete": policy["auto_delete"],
                    "checked_at": now.isoformat(),
                    "documents_past_retention": 0,
                }
            )

        return candidates

    # ── Legal holds ────────────────────────────────────────────────────────

    @classmethod
    def create_legal_hold(
        cls,
        db: Session,
        workspace_id: str,
        resource_type: str,
        resource_id: str,
        reason: str,
        created_by: str,
    ) -> dict:
        """Create a legal hold preventing deletion of a resource."""
        hold_id = str(uuid.uuid4())
        hold = {
            "id": hold_id,
            "workspace_id": workspace_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "reason": reason,
            "created_by": created_by,
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "released_at": None,
            "released_by": None,
        }
        cls._legal_holds[hold_id] = hold
        return hold

    @classmethod
    def release_legal_hold(cls, db: Session, hold_id: str, released_by: str) -> dict:
        """Release a legal hold."""
        hold = cls._legal_holds.get(hold_id)
        if not hold:
            raise ValueError(f"Legal hold {hold_id} not found")

        hold["status"] = "released"
        hold["released_at"] = datetime.now(timezone.utc).isoformat()
        hold["released_by"] = released_by
        return hold

    @classmethod
    def get_legal_holds(cls, db: Session, workspace_id: str) -> list[dict]:
        """Get all legal holds for a workspace."""
        return [
            h
            for h in cls._legal_holds.values()
            if h["workspace_id"] == workspace_id
        ]

    # ── DB-backed retention enforcement ────────────────────────────────────

    @classmethod
    def _get_held_resource_ids(cls, db: Session, workspace_id: str, resource_type: str) -> set[str]:
        """Return set of resource_id strings under active legal hold."""
        # Check DB-based holds
        db_holds = (
            db.query(LegalHold.resource_id)
            .filter(
                LegalHold.workspace_id == str(workspace_id),
                LegalHold.resource_type == resource_type,
                LegalHold.status == "active",
            )
            .all()
        )
        held = {str(h[0]) for h in db_holds}

        # Also check in-memory holds for backward compat
        for h in cls._legal_holds.values():
            if (
                h["workspace_id"] == str(workspace_id)
                and h["resource_type"] == resource_type
                and h["status"] == "active"
            ):
                held.add(str(h["resource_id"]))

        return held

    @classmethod
    def get_expired_records(cls, db: Session, workspace_id: str) -> list[dict]:
        """For each retention policy, find records older than retention_days.

        Excludes records under active legal hold. Returns a list of dicts
        describing expired records per document class.
        """
        policies = (
            db.query(RetentionPolicy)
            .filter(RetentionPolicy.workspace_id == str(workspace_id))
            .all()
        )
        now = datetime.now(timezone.utc)
        results: list[dict] = []

        for policy in policies:
            doc_class = policy.document_class
            if doc_class not in _CLASS_MAP:
                continue

            model, date_col_name = _CLASS_MAP[doc_class]
            date_col = getattr(model, date_col_name)
            cutoff = now - timedelta(days=policy.retention_days)

            # Find expired records
            expired_q = db.query(model).filter(
                and_(
                    getattr(model, "workspace_id") == str(workspace_id),
                    date_col < cutoff,
                )
            )
            expired_records = expired_q.all()

            # Get held IDs
            held_ids = cls._get_held_resource_ids(db, workspace_id, doc_class)

            eligible = []
            held = []
            for rec in expired_records:
                rid = str(rec.id)
                if rid in held_ids:
                    held.append(rid)
                else:
                    eligible.append(rid)

            results.append({
                "document_class": doc_class,
                "retention_days": policy.retention_days,
                "auto_delete": policy.auto_delete,
                "total_expired": len(expired_records),
                "eligible_for_deletion": len(eligible),
                "under_legal_hold": len(held),
                "eligible_ids": eligible,
                "held_ids": held,
            })

        return results

    @classmethod
    def execute_retention(cls, db: Session, workspace_id: str) -> dict:
        """Delete expired records (respecting legal holds).

        Returns summary with deleted_count, skipped_legal_hold, and by_class breakdown.
        """
        expired = cls.get_expired_records(db, workspace_id)
        deleted_count = 0
        skipped_legal_hold = 0
        by_class: dict[str, int] = {}

        for entry in expired:
            doc_class = entry["document_class"]
            if not entry["auto_delete"]:
                logger.info(
                    "Skipping %s — auto_delete disabled for workspace %s",
                    doc_class,
                    workspace_id,
                )
                continue

            model, _ = _CLASS_MAP[doc_class]
            ids_to_delete = entry["eligible_ids"]

            if ids_to_delete:
                db.query(model).filter(
                    getattr(model, "id").in_(ids_to_delete)
                ).delete(synchronize_session="fetch")
                count = len(ids_to_delete)
                deleted_count += count
                by_class[doc_class] = count

            skipped_legal_hold += entry["under_legal_hold"]

        db.commit()

        result = {
            "workspace_id": str(workspace_id),
            "deleted_count": deleted_count,
            "skipped_legal_hold": skipped_legal_hold,
            "by_class": by_class,
            "executed_at": datetime.now(timezone.utc).isoformat(),
        }
        logger.info("Retention execution result: %s", result)
        return result

    @classmethod
    def get_retention_report(cls, db: Session, workspace_id: str) -> dict:
        """Summary of retention policies, records approaching expiry, and active holds."""
        policies = (
            db.query(RetentionPolicy)
            .filter(RetentionPolicy.workspace_id == str(workspace_id))
            .all()
        )
        now = datetime.now(timezone.utc)

        policy_summaries = []
        approaching_expiry: list[dict] = []

        for policy in policies:
            policy_summaries.append({
                "id": str(policy.id),
                "document_class": policy.document_class,
                "retention_days": policy.retention_days,
                "auto_delete": policy.auto_delete,
            })

            doc_class = policy.document_class
            if doc_class not in _CLASS_MAP:
                continue

            model, date_col_name = _CLASS_MAP[doc_class]
            date_col = getattr(model, date_col_name)

            # Records expiring within the next 30 days
            cutoff = now - timedelta(days=policy.retention_days)
            warning_window = now - timedelta(days=max(policy.retention_days - 30, 0))

            approaching_count = (
                db.query(func.count(model.id))
                .filter(
                    and_(
                        getattr(model, "workspace_id") == str(workspace_id),
                        date_col >= cutoff,
                        date_col < warning_window,
                    )
                )
                .scalar()
            ) or 0

            if approaching_count > 0:
                approaching_expiry.append({
                    "document_class": doc_class,
                    "count": approaching_count,
                    "expires_within_days": 30,
                })

        # Active holds
        db_holds = (
            db.query(LegalHold)
            .filter(
                LegalHold.workspace_id == str(workspace_id),
                LegalHold.status == "active",
            )
            .all()
        )
        active_holds = [
            {
                "id": str(h.id),
                "resource_type": h.resource_type,
                "resource_id": str(h.resource_id),
                "reason": h.reason,
                "created_at": h.created_at.isoformat() if h.created_at else None,
            }
            for h in db_holds
        ]

        # Also include in-memory holds
        for h in cls._legal_holds.values():
            if h["workspace_id"] == str(workspace_id) and h["status"] == "active":
                active_holds.append({
                    "id": h["id"],
                    "resource_type": h["resource_type"],
                    "resource_id": str(h["resource_id"]),
                    "reason": h["reason"],
                    "created_at": h["created_at"],
                })

        return {
            "workspace_id": str(workspace_id),
            "policies": policy_summaries,
            "approaching_expiry": approaching_expiry,
            "active_holds": active_holds,
            "generated_at": now.isoformat(),
        }
