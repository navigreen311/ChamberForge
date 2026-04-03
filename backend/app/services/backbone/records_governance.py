"""Records Governance — Retention policies, legal holds, and compliance."""
import uuid
from datetime import datetime, timezone


class RecordsGovernance:
    """Manages document retention policies and legal holds.

    Uses in-memory stores for retention policies and legal holds.
    In production these would be persisted to dedicated DB tables.
    """

    # In-memory stores (keyed by workspace_id or hold_id)
    _retention_policies: dict[str, list[dict]] = {}
    _legal_holds: dict[str, dict] = {}

    @classmethod
    def _reset(cls) -> None:
        """Reset stores (for testing)."""
        cls._retention_policies = {}
        cls._legal_holds = {}

    @classmethod
    def set_retention_policy(
        cls,
        db,  # noqa: ARG003 — reserved for future DB persistence
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
    def check_retention(cls, db, workspace_id: str) -> list[dict]:  # noqa: ARG003
        """Return documents past their retention period (candidates for action)."""
        policies = cls._retention_policies.get(workspace_id, [])
        now = datetime.now(timezone.utc)
        candidates = []

        for policy in policies:
            # Simulate checking document ages against retention_days
            candidates.append(
                {
                    "workspace_id": workspace_id,
                    "document_class": policy["document_class"],
                    "retention_days": policy["retention_days"],
                    "auto_delete": policy["auto_delete"],
                    "checked_at": now.isoformat(),
                    "documents_past_retention": 0,  # Would query real docs
                }
            )

        return candidates

    @classmethod
    def create_legal_hold(
        cls,
        db,  # noqa: ARG003
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
    def release_legal_hold(cls, db, hold_id: str, released_by: str) -> dict:  # noqa: ARG003
        """Release a legal hold."""
        hold = cls._legal_holds.get(hold_id)
        if not hold:
            raise ValueError(f"Legal hold {hold_id} not found")

        hold["status"] = "released"
        hold["released_at"] = datetime.now(timezone.utc).isoformat()
        hold["released_by"] = released_by
        return hold

    @classmethod
    def get_legal_holds(cls, db, workspace_id: str) -> list[dict]:  # noqa: ARG003
        """Get all legal holds for a workspace."""
        return [
            h
            for h in cls._legal_holds.values()
            if h["workspace_id"] == workspace_id
        ]
