"""ClientHealth — Client health scoring and churn detection."""
from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.services.backbone.scoring_store import (
    SCORER_CLIENT_HEALTH,
    get_scores,
    record_score,
)


class ClientHealth:
    """Calculates health scores and detects churn signals for clients."""

    @staticmethod
    def calculate_health_score(
        engagement: float,
        satisfaction: float,
        usage: float,
        payment: float,
        client_id: str | None = None,
        db: Session | None = None,
        workspace_id: str | None = None,
    ) -> float:
        """Weighted average health score, capped 0-100.

        Weights: engagement 30%, satisfaction 30%, usage 20%, payment 20%.
        Each input should be 0.0-1.0; the result is scaled to 0-100.

        P-09: the score is now recorded with its four inputs when a
        `client_id` is supplied. Without them, a health score of 41 is a
        number nobody can act on - the useful question is which of the
        four dimensions moved, and that is unanswerable after the fact
        unless the inputs were kept.
        """
        raw = (
            engagement * 0.3
            + satisfaction * 0.3
            + usage * 0.2
            + payment * 0.2
        ) * 100
        score = round(max(0.0, min(100.0, raw)), 2)

        if client_id:
            record_score(
                scorer=SCORER_CLIENT_HEALTH,
                subject_type="client",
                subject_id=client_id,
                score=score,
                inputs={
                    "engagement": engagement,
                    "satisfaction": satisfaction,
                    "usage": usage,
                    "payment": payment,
                },
                db=db,
                workspace_id=workspace_id,
            )
        return score

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
        """Recorded monthly health scores for a client. Empty when none exist.

        What this returned before:

            seed = int(hashlib.md5(client_id.encode()).hexdigest()[:8], 16)
            base = 60 + (seed % 30)
            score = base + ((seed >> (i * 2)) % 11) - 5

        A six-month health trend for a named client, derived from a hash
        of their id. It was stable, so the same client always showed the
        same history, and it sat in the range a real score occupies - an
        advisor reviewing whether a relationship was deteriorating was
        reading an md5 digest.

        Now it reads the scores this service actually recorded. A client
        with no recorded history returns an empty list, which renders as
        no trend rather than a reassuring one.
        """
        if db is None:
            return []

        rows = get_scores(
            db,
            subject_type="client",
            subject_id=client_id,
            scorer=SCORER_CLIENT_HEALTH,
            limit=months,
        )
        # get_scores returns newest first; a trend reads oldest first.
        return [
            {
                "month": row.created_at.strftime("%Y-%m") if row.created_at else "",
                "score": row.score,
            }
            for row in reversed(rows)
        ]
