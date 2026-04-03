"""ClientRetention — Health score algorithm, upsell triggers, and renewal cadence."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any
from uuid import uuid4


class ClientRetention:
    """Manages client health scoring, upsell detection, and renewal scheduling."""

    # Health score weights
    WEIGHT_ENGAGEMENT = 0.3
    WEIGHT_SATISFACTION = 0.3
    WEIGHT_USAGE = 0.2
    WEIGHT_PAYMENT = 0.2

    def __init__(self) -> None:
        self._clients: dict[str, dict] = {}

    def register_client(
        self,
        client_id: str,
        client_name: str,
        contract_start: str,
        contract_months: int = 12,
        monthly_value: float = 0.0,
    ) -> dict:
        """Register a client for retention tracking."""
        start = datetime.fromisoformat(contract_start)
        renewal_date = start + timedelta(days=contract_months * 30)

        client = {
            "id": client_id,
            "name": client_name,
            "contract_start": contract_start,
            "contract_months": contract_months,
            "renewal_date": renewal_date.isoformat(),
            "monthly_value": monthly_value,
            "metrics": {
                "engagement": 5.0,
                "satisfaction": 5.0,
                "usage": 5.0,
                "payment_history": 10.0,
            },
            "health_score": 0.0,
            "risk_level": "medium",
            "upsell_triggers": [],
            "notes": [],
        }
        client["health_score"] = self._calculate_health_score(client["metrics"])
        client["risk_level"] = self._risk_from_score(client["health_score"])
        self._clients[client_id] = client
        return client

    @classmethod
    def _calculate_health_score(cls, metrics: dict) -> float:
        """Calculate health score using weighted formula.

        engagement * 0.3 + satisfaction * 0.3 + usage * 0.2 + payment_history * 0.2
        All inputs on 1-10 scale. Output on 1-10 scale.
        """
        score = (
            metrics.get("engagement", 5) * cls.WEIGHT_ENGAGEMENT
            + metrics.get("satisfaction", 5) * cls.WEIGHT_SATISFACTION
            + metrics.get("usage", 5) * cls.WEIGHT_USAGE
            + metrics.get("payment_history", 5) * cls.WEIGHT_PAYMENT
        )
        return round(min(max(score, 1.0), 10.0), 2)

    @staticmethod
    def calculate_health_score(
        engagement: float,
        satisfaction: float,
        usage: float,
        payment_history: float,
    ) -> float:
        """Public static method for health score calculation.

        All inputs on 1-10 scale. Returns score on 1-10 scale.
        """
        score = (
            engagement * 0.3
            + satisfaction * 0.3
            + usage * 0.2
            + payment_history * 0.2
        )
        return round(min(max(score, 1.0), 10.0), 2)

    @staticmethod
    def _risk_from_score(score: float) -> str:
        if score >= 8.0:
            return "low"
        elif score >= 5.0:
            return "medium"
        else:
            return "high"

    def update_metrics(
        self,
        client_id: str,
        engagement: float | None = None,
        satisfaction: float | None = None,
        usage: float | None = None,
        payment_history: float | None = None,
    ) -> dict | None:
        """Update client metrics and recalculate health score."""
        client = self._clients.get(client_id)
        if not client:
            return None

        m = client["metrics"]
        if engagement is not None:
            m["engagement"] = min(max(engagement, 1.0), 10.0)
        if satisfaction is not None:
            m["satisfaction"] = min(max(satisfaction, 1.0), 10.0)
        if usage is not None:
            m["usage"] = min(max(usage, 1.0), 10.0)
        if payment_history is not None:
            m["payment_history"] = min(max(payment_history, 1.0), 10.0)

        client["health_score"] = self._calculate_health_score(m)
        client["risk_level"] = self._risk_from_score(client["health_score"])

        # Check upsell triggers
        client["upsell_triggers"] = self._detect_upsell_triggers(client)

        return client

    def _detect_upsell_triggers(self, client: dict) -> list[dict]:
        """Detect upsell opportunities based on metrics."""
        triggers = []
        m = client["metrics"]

        if m["usage"] >= 8.0:
            triggers.append({
                "type": "high_usage",
                "message": "Client is maxing out current plan. Ideal for tier upgrade.",
                "confidence": "high",
            })

        if m["satisfaction"] >= 9.0 and m["engagement"] >= 8.0:
            triggers.append({
                "type": "happy_engaged",
                "message": "Highly satisfied and engaged. Perfect for cross-sell or referral ask.",
                "confidence": "high",
            })

        if m["engagement"] >= 8.0 and m["usage"] >= 7.0:
            triggers.append({
                "type": "power_user",
                "message": "Power user pattern detected. Consider premium add-ons.",
                "confidence": "medium",
            })

        # Renewal approaching
        try:
            renewal = datetime.fromisoformat(client["renewal_date"])
            days_to_renewal = (renewal - datetime.utcnow()).days
            if 0 < days_to_renewal <= 60:
                triggers.append({
                    "type": "renewal_approaching",
                    "message": f"Renewal in {days_to_renewal} days. Lock in multi-year deal.",
                    "confidence": "high",
                })
        except (ValueError, TypeError):
            pass

        return triggers

    def get_health_score(self, client_id: str) -> dict | None:
        """Get the current health score for a client."""
        client = self._clients.get(client_id)
        if not client:
            return None
        return {
            "client_id": client_id,
            "client_name": client["name"],
            "health_score": client["health_score"],
            "risk_level": client["risk_level"],
            "metrics": client["metrics"],
            "upsell_triggers": client["upsell_triggers"],
        }

    def get_all_clients(self) -> list[dict]:
        """Get all clients sorted by health score (lowest first for attention priority)."""
        return sorted(
            [
                {
                    "client_id": c["id"],
                    "client_name": c["name"],
                    "health_score": c["health_score"],
                    "risk_level": c["risk_level"],
                    "renewal_date": c["renewal_date"],
                    "monthly_value": c["monthly_value"],
                }
                for c in self._clients.values()
            ],
            key=lambda c: c["health_score"],
        )

    def generate_renewal_cadence(self, client_id: str) -> dict | None:
        """Generate a renewal outreach cadence for a client.

        Returns:
            dict with touchpoints leading up to renewal date
        """
        client = self._clients.get(client_id)
        if not client:
            return None

        try:
            renewal = datetime.fromisoformat(client["renewal_date"])
        except (ValueError, TypeError):
            return None

        cadence = {
            "client_id": client_id,
            "client_name": client["name"],
            "renewal_date": client["renewal_date"],
            "health_score": client["health_score"],
            "risk_level": client["risk_level"],
            "touchpoints": [
                {
                    "days_before_renewal": 90,
                    "date": (renewal - timedelta(days=90)).isoformat(),
                    "action": "Quarterly business review — share ROI report",
                    "owner": "Account Manager",
                    "status": "pending",
                },
                {
                    "days_before_renewal": 60,
                    "date": (renewal - timedelta(days=60)).isoformat(),
                    "action": "Renewal intent discussion — gauge satisfaction",
                    "owner": "Account Manager",
                    "status": "pending",
                },
                {
                    "days_before_renewal": 45,
                    "date": (renewal - timedelta(days=45)).isoformat(),
                    "action": "Present renewal options with incentive for multi-year",
                    "owner": "Account Manager",
                    "status": "pending",
                },
                {
                    "days_before_renewal": 30,
                    "date": (renewal - timedelta(days=30)).isoformat(),
                    "action": "Executive touchpoint — leadership thank-you call",
                    "owner": "VP/Director",
                    "status": "pending",
                },
                {
                    "days_before_renewal": 14,
                    "date": (renewal - timedelta(days=14)).isoformat(),
                    "action": "Final renewal proposal with terms",
                    "owner": "Account Manager",
                    "status": "pending",
                },
                {
                    "days_before_renewal": 7,
                    "date": (renewal - timedelta(days=7)).isoformat(),
                    "action": "Urgency touchpoint — contract expiration reminder",
                    "owner": "Account Manager",
                    "status": "pending",
                },
            ],
        }

        # Adjust for high-risk clients
        if client["risk_level"] == "high":
            cadence["touchpoints"].insert(0, {
                "days_before_renewal": 120,
                "date": (renewal - timedelta(days=120)).isoformat(),
                "action": "URGENT: Risk intervention — executive save meeting",
                "owner": "VP/Director",
                "status": "pending",
            })

        return cadence
