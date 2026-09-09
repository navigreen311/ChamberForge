"""AI cost tracking service — monitors token usage and spend per workspace."""
import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ai_usage import AIUsageLog

logger = logging.getLogger("chamberforge.ai_cost")

# Pricing per 1M tokens (Claude claude-sonnet-4-6 default)
COST_PER_1M_INPUT = 3.0
COST_PER_1M_OUTPUT = 15.0
BUDGET_ALERT_THRESHOLD = 0.9  # 90%


class AICostTracker:
    """Track AI API call costs and provide budget alerts."""

    @staticmethod
    def calculate_cost(
        tokens_in: int,
        tokens_out: int,
        cost_per_1m_input: float = COST_PER_1M_INPUT,
        cost_per_1m_output: float = COST_PER_1M_OUTPUT,
    ) -> float:
        """Calculate the USD cost for a given token count."""
        input_cost = (tokens_in / 1_000_000) * cost_per_1m_input
        output_cost = (tokens_out / 1_000_000) * cost_per_1m_output
        return round(input_cost + output_cost, 6)

    @staticmethod
    def track_call(
        db: Session,
        workspace_id: UUID,
        agent_name: str,
        tokens_in: int,
        tokens_out: int,
        latency_ms: int,
        model: str = "claude-sonnet-4-6",
    ) -> dict:
        """Record an AI API call and return the log entry as a dict."""
        cost = AICostTracker.calculate_cost(tokens_in, tokens_out)

        log = AIUsageLog(
            workspace_id=workspace_id,
            agent_name=agent_name,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            latency_ms=latency_ms,
            cost_usd=cost,
            model=model,
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        logger.info(
            "AI call tracked: agent=%s workspace=%s tokens_in=%d tokens_out=%d cost=$%.6f",
            agent_name,
            workspace_id,
            tokens_in,
            tokens_out,
            cost,
        )

        return {
            "id": str(log.id),
            "workspace_id": str(log.workspace_id),
            "agent_name": log.agent_name,
            "tokens_in": log.tokens_in,
            "tokens_out": log.tokens_out,
            "latency_ms": log.latency_ms,
            "cost_usd": log.cost_usd,
            "model": log.model,
            "created_at": log.created_at.isoformat(),
        }

    @staticmethod
    def get_workspace_costs(
        db: Session,
        workspace_id: UUID,
        period_days: int = 30,
    ) -> dict:
        """Aggregate cost data for a workspace over the given period."""
        since = datetime.now(timezone.utc) - timedelta(days=period_days)

        rows = (
            db.query(
                AIUsageLog.agent_name,
                func.sum(AIUsageLog.cost_usd).label("cost"),
                func.count(AIUsageLog.id).label("calls"),
                func.avg(AIUsageLog.latency_ms).label("avg_latency"),
            )
            .filter(
                AIUsageLog.workspace_id == workspace_id,
                AIUsageLog.created_at >= since,
            )
            .group_by(AIUsageLog.agent_name)
            .all()
        )

        cost_by_agent: dict[str, float] = {}
        total_cost = 0.0
        total_calls = 0
        total_latency = 0.0

        for row in rows:
            agent_cost = float(row.cost or 0)
            agent_calls = int(row.calls or 0)
            cost_by_agent[row.agent_name] = round(agent_cost, 6)
            total_cost += agent_cost
            total_calls += agent_calls
            total_latency += float(row.avg_latency or 0) * agent_calls

        avg_latency_ms = round(total_latency / total_calls, 2) if total_calls else 0.0

        return {
            "total_cost": round(total_cost, 6),
            "cost_by_agent": cost_by_agent,
            "total_calls": total_calls,
            "avg_latency_ms": avg_latency_ms,
        }

    @staticmethod
    def check_budget_alert(
        db: Session,
        workspace_id: UUID,
        monthly_budget: float,
    ) -> dict:
        """Check if workspace spend is approaching the monthly budget."""
        costs = AICostTracker.get_workspace_costs(db, workspace_id, period_days=30)
        current_spend = costs["total_cost"]
        pct_used = round((current_spend / monthly_budget) * 100, 2) if monthly_budget > 0 else 0.0
        alert = pct_used >= (BUDGET_ALERT_THRESHOLD * 100)

        if alert:
            logger.warning(
                "Budget alert: workspace=%s spend=$%.4f budget=$%.2f (%.1f%%)",
                workspace_id,
                current_spend,
                monthly_budget,
                pct_used,
            )

        return {
            "current_spend": round(current_spend, 6),
            "budget": monthly_budget,
            "pct_used": pct_used,
            "alert": alert,
        }
