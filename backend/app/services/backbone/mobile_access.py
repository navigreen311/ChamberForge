"""MobileAccess — Compact mobile-optimized data endpoints."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


class MobileAccess:
    """Provides compact, mobile-optimized views of client data and alerts."""

    @staticmethod
    async def get_mobile_brief(db: Any, client_id: str) -> dict[str, Any]:
        """Compact intelligence brief optimized for mobile display.

        In production, queries the latest intel brief and strips it down.
        """
        return {
            "client_id": client_id,
            "client_name": f"Client {client_id[:8]}",
            "health_score": 82.5,
            "top_facts": [
                "UHNW tier, 3 entities",
                "2 active jurisdictions",
                "No open risks",
            ],
            "next_action": "Quarterly review scheduled",
            "last_meeting": "2026-03-15T10:00:00Z",
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    @staticmethod
    async def get_pending_approvals(db: Any, user_id: str) -> list[dict[str, Any]]:
        """Items awaiting the user's approval, sorted by urgency."""
        # In production: query approvals table filtered by user_id
        return [
            {
                "id": "appr-001",
                "type": "proposal",
                "title": "New engagement proposal — Client Alpha",
                "submitted_by": "analyst-team",
                "submitted_at": "2026-04-01T14:30:00Z",
                "urgency": "high",
                "status": "pending",
            },
            {
                "id": "appr-002",
                "type": "invoice",
                "title": "Q1 billing adjustment — Client Beta",
                "submitted_by": "billing-team",
                "submitted_at": "2026-04-02T09:15:00Z",
                "urgency": "medium",
                "status": "pending",
            },
        ]

    @staticmethod
    async def get_active_alerts(db: Any, user_id: str) -> list[dict[str, Any]]:
        """Active alerts for a user, sorted by priority (high first)."""
        alerts = [
            {
                "id": "alert-001",
                "priority": "high",
                "type": "churn_risk",
                "message": "Client Gamma health score dropped below 50",
                "client_id": "client-gamma",
                "created_at": "2026-04-03T08:00:00Z",
                "acknowledged": False,
            },
            {
                "id": "alert-002",
                "priority": "medium",
                "type": "meeting_prep",
                "message": "Upcoming meeting with Client Delta in 2 hours",
                "client_id": "client-delta",
                "created_at": "2026-04-03T07:00:00Z",
                "acknowledged": False,
            },
            {
                "id": "alert-003",
                "priority": "low",
                "type": "training",
                "message": "Team member completed HNW Client Psychology module",
                "client_id": None,
                "created_at": "2026-04-02T16:00:00Z",
                "acknowledged": True,
            },
        ]
        # Sort by priority: high > medium > low
        priority_order = {"high": 0, "medium": 1, "low": 2}
        alerts.sort(key=lambda a: priority_order.get(a["priority"], 9))
        return alerts
