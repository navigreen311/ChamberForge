"""Sandbox Service - demo environments with a real boundary.

P-02 (T-020). This kept its "isolated" environments in a class-level dict,
which meant they were process-local, lost on every restart, invisible to a
second worker, and isolated from nothing. The spec asked for "data isolation
from production"; a dictionary provides none.

Now backed by `sandbox_environments` (P-01, revision 004). The boundary is
the `is_sandbox` column: a sandbox row must never surface in a production
read, and a production row must never surface in a sandbox one. Both
directions are asserted in tests/test_operator_scope.py.

The public method signatures are unchanged - `primitives.py` calls them and
that router is P-02's only route surface, so a signature change here would
be a change there too.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.data.demo_scenarios import (
    ALL_SCENARIOS,
    get_all_clients,
    get_all_evidence,
    get_all_household_graphs,
    get_all_notifications,
    get_all_offers,
    get_all_playbook_activations,
    get_all_problems,
)
from app.db.scope import current_scope
from app.models.sandbox_environment import SandboxEnvironment


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _synthetic_payload() -> dict:
    """The demo dataset every sandbox is seeded with."""
    return {
        "scenarios": ALL_SCENARIOS,
        "clients": get_all_clients(),
        "problems": get_all_problems(),
        "offers": get_all_offers(),
        "household_graphs": get_all_household_graphs(),
        "evidence": get_all_evidence(),
        "notifications": get_all_notifications(),
        "playbook_activations": get_all_playbook_activations(),
        "health_scores": [s["health_score"] for s in ALL_SCENARIOS],
        "kpis": {s["client"]["name"]: s["kpis"] for s in ALL_SCENARIOS},
        "crisis_incidents": [
            s["crisis_incident"] for s in ALL_SCENARIOS if "crisis_incident" in s
        ],
        "users": [
            {
                "id": str(uuid.uuid4()),
                "email": "demo-advisor@chamberforge.com",
                "name": "Demo Advisor",
                "role": "admin",
            },
            {
                "id": str(uuid.uuid4()),
                "email": "demo-operator@chamberforge.com",
                "name": "Demo Operator",
                "role": "operator",
            },
        ],
        "workspaces": [
            {
                "id": str(uuid.uuid4()),
                "name": "ChamberForge Demo Workspace",
                "plan": "enterprise",
                "settings": {"demo_mode": True},
            },
        ],
    }


def _as_dict(row: SandboxEnvironment, *, include_data: bool = False) -> dict:
    out = {
        "sandbox_id": row.id,
        "workspace_id": row.workspace_id,
        "name": row.name,
        "status": row.status,
        "is_sandbox": row.is_sandbox,
        "synthetic_data_loaded": bool(row.seeded_at),
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }
    if include_data:
        out["synthetic_data"] = row.synthetic_data or {}
    return out


class SandboxService:
    """Sandbox environments, isolated from production by `is_sandbox`."""

    @classmethod
    def _reset(cls) -> None:
        """No-op, kept so existing test teardown keeps working.

        State lives in the database now, and tests roll their transaction
        back. Removing this would break callers in another package's tests
        for no benefit.
        """
        return None

    @staticmethod
    def _guard(workspace_id: str) -> str:
        """Refuse a workspace the caller does not own.

        The audit found `list_sandboxes` filtering by a workspace id taken
        straight from the URL, so anyone could enumerate anyone's sandboxes
        by editing the path. Where a scope is bound, it wins.
        """
        scope = current_scope()
        if scope is None:
            return workspace_id
        if workspace_id and workspace_id != scope.workspace_id:
            raise PermissionError(
                "workspace %r does not belong to this operator" % workspace_id
            )
        return scope.workspace_id

    @classmethod
    def create_sandbox(cls, db: Session, workspace_id: str, name: str) -> dict:
        """Create a sandbox pre-loaded with the demo scenarios."""
        workspace_id = cls._guard(workspace_id)

        row = SandboxEnvironment(
            id=str(uuid.uuid4()),
            workspace_id=workspace_id,
            name=name,
            status="active",
            is_sandbox=True,
            synthetic_data=_synthetic_payload(),
            seeded_at=_now(),
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return _as_dict(row)

    @classmethod
    def _get(cls, db: Session, sandbox_id: str) -> SandboxEnvironment:
        row = (
            db.query(SandboxEnvironment)
            .filter(
                SandboxEnvironment.id == sandbox_id,
                SandboxEnvironment.is_sandbox.is_(True),
            )
            .first()
        )
        if row is None:
            raise ValueError(f"Sandbox {sandbox_id} not found")
        cls._guard(row.workspace_id)
        return row

    @classmethod
    def load_synthetic_data(cls, db: Session, sandbox_id: str) -> dict:
        """Reload the demo data, returning record counts."""
        row = cls._get(db, sandbox_id)
        data = _synthetic_payload()
        row.synthetic_data = data
        row.seeded_at = _now()
        db.commit()

        return {
            "sandbox_id": sandbox_id,
            "data_loaded": True,
            "record_counts": {key: len(data[key]) for key in (
                "scenarios",
                "clients",
                "problems",
                "offers",
                "household_graphs",
                "evidence",
                "notifications",
                "playbook_activations",
                "health_scores",
                "crisis_incidents",
                "users",
                "workspaces",
            )},
        }

    @classmethod
    def reset_sandbox(cls, db: Session, sandbox_id: str) -> dict:
        """Clear a sandbox and reload the demo data."""
        row = cls._get(db, sandbox_id)
        row.synthetic_data = {}
        db.flush()
        row.synthetic_data = _synthetic_payload()
        row.seeded_at = _now()
        db.commit()
        return {"sandbox_id": sandbox_id, "reset": True, "synthetic_data_loaded": True}

    @classmethod
    def list_sandboxes(cls, db: Session, workspace_id: str) -> list[dict]:
        """List this operator's sandboxes.

        Never returns production rows: `is_sandbox` is part of the filter,
        not an attribute of the result.
        """
        workspace_id = cls._guard(workspace_id)
        rows = (
            db.query(SandboxEnvironment)
            .filter(
                SandboxEnvironment.workspace_id == workspace_id,
                SandboxEnvironment.is_sandbox.is_(True),
            )
            .order_by(SandboxEnvironment.created_at.desc())
            .all()
        )
        return [_as_dict(r) for r in rows]

    @classmethod
    def get_sandbox(cls, db: Session, sandbox_id: str) -> dict | None:
        """Fetch one sandbox with its synthetic data, or None."""
        try:
            row = cls._get(db, sandbox_id)
        except ValueError:
            return None
        return _as_dict(row, include_data=True)
