"""Trend Radar — lifecycle distribution and opportunity detection."""
from __future__ import annotations

from typing import Any, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.enums import LifecycleStage
from app.models.problem import Problem


class TrendRadar:
    """Analytics layer over the Problem Library."""

    # ------------------------------------------------------------------
    @staticmethod
    def get_lifecycle_distribution(
        db: Session, workspace_id: str
    ) -> dict[str, int]:
        """Count problems per lifecycle stage."""
        rows = (
            db.query(Problem.lifecycle_stage, func.count(Problem.id))
            .filter(Problem.workspace_id == workspace_id)
            .group_by(Problem.lifecycle_stage)
            .all()
        )
        # Ensure every stage key is present even if count is 0
        distribution: dict[str, int] = {s.value: 0 for s in LifecycleStage}
        for stage, count in rows:
            if stage is not None:
                key = stage.value if hasattr(stage, "value") else str(stage)
                distribution[key] = count
        return distribution

    # ------------------------------------------------------------------
    @staticmethod
    def get_opportunities(
        db: Session,
        workspace_id: str,
        geo: Optional[str] = None,
        tier: Optional[str] = None,
    ) -> list[Any]:
        """Return Emerging + Accelerating problems (highest-opportunity stages)."""
        q = (
            db.query(Problem)
            .filter(Problem.workspace_id == workspace_id)
            .filter(
                Problem.lifecycle_stage.in_(
                    [LifecycleStage.EMERGING, LifecycleStage.ACCELERATING]
                )
            )
        )
        if geo:
            q = q.filter(Problem.geo == geo)
        if tier:
            q = q.filter(Problem.wealth_tier == tier)
        return q.order_by(Problem.urgency_score.desc()).all()
