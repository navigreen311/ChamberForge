"""ClientHealth — Client health scoring and churn detection."""
from __future__ import annotations

from typing import Any


class ClientHealth:
    """Calculates health scores and detects churn signals for clients."""

    @staticmethod
    def calculate_health_score(
        engagement: float,
        satisfaction: float,
        usage: float,
        payment: float,
    ) -> float:
        """Weighted average health score, capped 0-100.

        Weights: engagement 30%, satisfaction 30%, usage 20%, payment 20%.
        Each input should be 0.0-1.0; the result is scaled to 0-100.
        """
        raw = (
            engagement * 0.3
            + satisfaction * 0.3
            + usage * 0.2
            + payment * 0.2
        ) * 100
        return round(max(0.0, min(100.0, raw)), 2)

    @staticmethod
    def detect_churn_signals(
        health_history: list[float],
        threshold: float = 60.0,
    ) -> dict[str, Any]:
        """Detect churn risk from a time-series of health scores.

        Returns at_risk flag, trend direction, specific signals, and actions.
        """
        signals: list[str] = []
        actions: list[str] = []

        if not health_history:
            return {
                "at_risk": False,
                "trend": "stable",
                "signals": ["Insufficient data"],
                "recommended_actions": ["Collect more health data"],
            }

        latest = health_history[-1]
        at_risk = latest < threshold

        # Determine trend
        if len(health_history) >= 2:
            diffs = [
                health_history[i] - health_history[i - 1]
                for i in range(1, len(health_history))
            ]
            avg_diff = sum(diffs) / len(diffs)
            if avg_diff > 2:
                trend = "improving"
            elif avg_diff < -2:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "stable"

        # Signal detection
        if latest < threshold:
            signals.append(f"Current score ({latest:.1f}) below threshold ({threshold})")
            actions.append("Schedule immediate client check-in")

        if trend == "declining":
            signals.append("Health score trending downward")
            actions.append("Review recent engagement changes")
            actions.append("Prepare value-reinforcement presentation")

        if len(health_history) >= 3 and all(
            s < threshold for s in health_history[-3:]
        ):
            signals.append("Score below threshold for 3+ consecutive periods")
            actions.append("Escalate to senior relationship manager")

        if len(health_history) >= 2:
            drop = health_history[-2] - latest
            if drop > 15:
                signals.append(f"Sharp score drop ({drop:.1f} points)")
                actions.append("Investigate root cause of sudden decline")

        if not signals:
            signals.append("No churn signals detected")
        if not actions:
            actions.append("Continue standard engagement cadence")

        return {
            "at_risk": at_risk,
            "trend": trend,
            "signals": signals,
            "recommended_actions": actions,
        }

    @staticmethod
    async def get_health_trend(
        db: Any, client_id: str, months: int = 6
    ) -> list[dict[str, Any]]:
        """Retrieve monthly health scores for a client.

        In production this queries the database. Currently returns mock data
        when no real DB session is available.
        """
        # When a real async DB session is wired up, query health_scores table.
        # For now, return a realistic placeholder based on client_id hash.
        import hashlib

        seed = int(hashlib.md5(client_id.encode()).hexdigest()[:8], 16)
        trend: list[dict[str, Any]] = []
        base = 60 + (seed % 30)
        for i in range(months):
            month_label = f"M-{months - i}"
            score = max(0.0, min(100.0, base + ((seed >> (i * 2)) % 11) - 5))
            trend.append({"month": month_label, "score": round(score, 1)})
        return trend
