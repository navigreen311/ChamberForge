"""Sandbox Service — Demo environments with rich synthetic data."""
import uuid
from datetime import datetime, timezone

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


class SandboxService:
    """Manages isolated sandbox environments for demos and testing."""

    # In-memory sandbox store
    _sandboxes: dict[str, dict] = {}

    @classmethod
    def _reset(cls) -> None:
        """Reset stores (for testing)."""
        cls._sandboxes = {}

    @classmethod
    def create_sandbox(cls, db, workspace_id: str, name: str) -> dict:  # noqa: ARG003
        """Create a new sandbox environment pre-loaded with demo scenarios."""
        sandbox_id = str(uuid.uuid4())
        sandbox = {
            "sandbox_id": sandbox_id,
            "workspace_id": workspace_id,
            "name": name,
            "synthetic_data_loaded": True,
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        cls._sandboxes[sandbox_id] = sandbox

        # Auto-load rich demo data on creation
        cls._load_synthetic_data_internal(sandbox_id)

        return sandbox

    @classmethod
    def _load_synthetic_data_internal(cls, sandbox_id: str) -> dict:
        """Populate sandbox with all 3 demo scenarios and their full data."""
        synthetic_data = {
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
                s["crisis_incident"]
                for s in ALL_SCENARIOS
                if "crisis_incident" in s
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

        if sandbox_id in cls._sandboxes:
            cls._sandboxes[sandbox_id]["synthetic_data"] = synthetic_data

        return synthetic_data

    @classmethod
    def load_synthetic_data(cls, db, sandbox_id: str) -> dict:  # noqa: ARG003
        """Reload demo data for a sandbox, returning record counts."""
        if sandbox_id not in cls._sandboxes:
            raise ValueError(f"Sandbox {sandbox_id} not found")

        data = cls._load_synthetic_data_internal(sandbox_id)
        return {
            "sandbox_id": sandbox_id,
            "data_loaded": True,
            "record_counts": {
                "scenarios": len(data["scenarios"]),
                "clients": len(data["clients"]),
                "problems": len(data["problems"]),
                "offers": len(data["offers"]),
                "household_graphs": len(data["household_graphs"]),
                "evidence": len(data["evidence"]),
                "notifications": len(data["notifications"]),
                "playbook_activations": len(data["playbook_activations"]),
                "health_scores": len(data["health_scores"]),
                "crisis_incidents": len(data["crisis_incidents"]),
                "users": len(data["users"]),
                "workspaces": len(data["workspaces"]),
            },
        }

    @classmethod
    def reset_sandbox(cls, db, sandbox_id: str) -> dict:  # noqa: ARG003
        """Reset a sandbox to clean state and reload demo data."""
        if sandbox_id not in cls._sandboxes:
            raise ValueError(f"Sandbox {sandbox_id} not found")

        sandbox = cls._sandboxes[sandbox_id]
        sandbox["synthetic_data"] = {}
        cls._load_synthetic_data_internal(sandbox_id)
        sandbox["reset_at"] = datetime.now(timezone.utc).isoformat()

        return {"sandbox_id": sandbox_id, "reset": True, "synthetic_data_loaded": True}

    @classmethod
    def list_sandboxes(cls, db, workspace_id: str) -> list[dict]:  # noqa: ARG003
        """List all sandboxes for a workspace."""
        return [
            {k: v for k, v in s.items() if k != "synthetic_data"}
            for s in cls._sandboxes.values()
            if s["workspace_id"] == workspace_id
        ]

    @classmethod
    def get_sandbox(cls, db, sandbox_id: str) -> dict | None:  # noqa: ARG003
        """Get a sandbox by ID, including its synthetic data."""
        return cls._sandboxes.get(sandbox_id)
