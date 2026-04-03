"""Sandbox Service — Demo environments with synthetic data."""
import uuid
from datetime import datetime, timezone


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
        """Create a new sandbox environment."""
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

        # Auto-load synthetic data on creation
        cls._load_synthetic_data_internal(sandbox_id)

        return sandbox

    @classmethod
    def _load_synthetic_data_internal(cls, sandbox_id: str) -> dict:
        """Generate synthetic demo data for a sandbox."""
        synthetic_data = {
            "households": [
                {
                    "id": str(uuid.uuid4()),
                    "name": "The Harrison Family",
                    "net_worth": 45_000_000,
                    "members": [
                        {"name": "James Harrison", "role": "Patriarch"},
                        {"name": "Eleanor Harrison", "role": "Matriarch"},
                        {"name": "William Harrison", "role": "Heir"},
                    ],
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "The Chen Dynasty",
                    "net_worth": 120_000_000,
                    "members": [
                        {"name": "David Chen", "role": "Patriarch"},
                        {"name": "Mei Chen", "role": "Matriarch"},
                    ],
                },
            ],
            "clients": [
                {"id": str(uuid.uuid4()), "name": "James Harrison", "tier": "UHNW"},
                {"id": str(uuid.uuid4()), "name": "David Chen", "tier": "UHNW"},
                {"id": str(uuid.uuid4()), "name": "Sarah Mitchell", "tier": "HNW"},
            ],
            "problems": [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Estate tax optimization",
                    "status": "open",
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Succession planning",
                    "status": "in_progress",
                },
            ],
            "offers": [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Family Office Setup",
                    "price": 250_000,
                    "status": "draft",
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Wealth Transfer Strategy",
                    "price": 150_000,
                    "status": "active",
                },
            ],
        }

        if sandbox_id in cls._sandboxes:
            cls._sandboxes[sandbox_id]["synthetic_data"] = synthetic_data

        return synthetic_data

    @classmethod
    def load_synthetic_data(cls, db, sandbox_id: str) -> dict:  # noqa: ARG003
        """Generate fake household graph, clients, problems, offers for demo."""
        if sandbox_id not in cls._sandboxes:
            raise ValueError(f"Sandbox {sandbox_id} not found")

        data = cls._load_synthetic_data_internal(sandbox_id)
        return {
            "sandbox_id": sandbox_id,
            "data_loaded": True,
            "record_counts": {
                "households": len(data["households"]),
                "clients": len(data["clients"]),
                "problems": len(data["problems"]),
                "offers": len(data["offers"]),
            },
        }

    @classmethod
    def reset_sandbox(cls, db, sandbox_id: str) -> dict:  # noqa: ARG003
        """Reset a sandbox to clean state and reload synthetic data."""
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
