"""Application metrics endpoint."""
import logging

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.performance import get_performance_metrics
from app.models.ai_usage import AIUsageLog

logger = logging.getLogger("chamberforge.metrics")

router = APIRouter(prefix="/api/v1/metrics", tags=["metrics"])


@router.get("/")
async def metrics(db: Session = Depends(get_db)) -> dict:
    """Return key application metrics."""
    perf = get_performance_metrics()

    # AI usage aggregates
    try:
        ai_row = db.query(
            func.count(AIUsageLog.id).label("total_calls"),
            func.coalesce(func.sum(AIUsageLog.cost_usd), 0).label("total_cost"),
        ).first()
        ai_calls_total = int(ai_row.total_calls) if ai_row else 0
        ai_cost_total = round(float(ai_row.total_cost), 6) if ai_row else 0.0
    except Exception:
        ai_calls_total = 0
        ai_cost_total = 0.0

    return {
        "requests_total": perf["requests_total"],
        "avg_latency_ms": perf["avg_latency_ms"],
        "error_count": perf["error_count"],
        "ai_calls_total": ai_calls_total,
        "ai_cost_total": ai_cost_total,
    }
