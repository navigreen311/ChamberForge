"""AI Runtime - usage reporting over the metered call path.

P-04 moved enforcement out of here and into `budget_guard`. What remains
is reporting: dashboards and per-agent performance. The distinction is
the point of the package - this module answers questions, and something
else refuses calls.
"""
import logging

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ai_usage import AIUsageLog
from app.services.backbone.budget_guard import BudgetGuard

logger = logging.getLogger("chamberforge.ai_runtime")


class AIRuntime:
    """Tracks AI agent usage, costs, and performance metrics."""

    @staticmethod
    def track_usage(
        db: Session,
        workspace_id: str,
        agent_name: str,
        tokens_in: int,
        tokens_out: int,
        latency_ms: int,
        cost_usd: float,
    ) -> AIUsageLog:
        """Record a single AI agent invocation."""
        log = AIUsageLog(
            workspace_id=workspace_id,
            agent_name=agent_name,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            latency_ms=latency_ms,
            cost_usd=cost_usd,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def get_usage_dashboard(db: Session, workspace_id: str) -> dict:
        """Aggregate usage dashboard for a workspace."""
        base = db.query(AIUsageLog).filter(
            AIUsageLog.workspace_id == workspace_id
        )

        total_cost = base.with_entities(func.sum(AIUsageLog.cost_usd)).scalar() or 0.0
        total_tokens = base.with_entities(
            func.sum(AIUsageLog.tokens_in + AIUsageLog.tokens_out)
        ).scalar() or 0
        avg_latency = base.with_entities(
            func.avg(AIUsageLog.latency_ms)
        ).scalar() or 0.0
        count = base.count()

        # Cost by agent
        cost_by_agent_rows = (
            base.with_entities(
                AIUsageLog.agent_name,
                func.sum(AIUsageLog.cost_usd).label("cost"),
            )
            .group_by(AIUsageLog.agent_name)
            .all()
        )
        cost_by_agent = {row[0]: round(row[1], 6) for row in cost_by_agent_rows}

        top_agent = max(cost_by_agent, key=cost_by_agent.get) if cost_by_agent else None

        return {
            "total_cost": round(total_cost, 6),
            "cost_by_agent": cost_by_agent,
            "total_tokens": total_tokens,
            "avg_latency_ms": round(float(avg_latency), 2),
            "cache_hit_rate": 0.0,  # Placeholder for cache integration
            "top_agent_by_cost": top_agent,
            "invocation_count": count,
        }

    @staticmethod
    def check_budget(
        db: Session, workspace_id: str, monthly_budget: float | None = None
    ) -> dict:
        """Report this workspace spend against its **persisted** ceiling.

        `monthly_budget` is ignored and kept only so the existing route
        signature on `primitives.py` still binds - that file belongs to
        P-02 and cannot be edited here. It was the whole defect: the
        caller supplied the limit it was measured against, so any client
        could pass a large number and read back `over_budget: False`.

        This reports. `BudgetGuard.assert_within_ceiling` enforces.
        """
        if monthly_budget is not None:
            logger.info(
                "ignoring caller-supplied budget %.2f for workspace %s; the persisted ceiling governs",
                monthly_budget,
                workspace_id,
            )
        return BudgetGuard.status(db, workspace_id).as_dict()

    @staticmethod
    def get_agent_performance(
        db: Session, workspace_id: str, agent_name: str
    ) -> dict:
        """Get performance metrics for a specific agent."""
        base = db.query(AIUsageLog).filter(
            AIUsageLog.workspace_id == workspace_id,
            AIUsageLog.agent_name == agent_name,
        )

        invocations = base.count()
        avg_latency = base.with_entities(
            func.avg(AIUsageLog.latency_ms)
        ).scalar() or 0.0
        total_cost = base.with_entities(
            func.sum(AIUsageLog.cost_usd)
        ).scalar() or 0.0

        return {
            "agent_name": agent_name,
            "invocations": invocations,
            "avg_latency": round(float(avg_latency), 2),
            "error_rate": 0.0,  # Placeholder for error tracking
            "total_cost": round(total_cost, 6),
        }
