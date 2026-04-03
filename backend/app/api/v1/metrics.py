"""Application metrics endpoint with detailed operational metrics."""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.performance import get_performance_metrics
from app.models.ai_usage import AIUsageLog
from app.services.backbone.system_health import (
    get_alerts,
    get_operational_metrics,
    get_system_health,
)

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


@router.get("/detailed")
async def detailed_metrics(db: Session = Depends(get_db)) -> dict:
    """Return detailed operational metrics including system health and alerts."""
    perf = get_performance_metrics()

    # AI usage aggregates (all-time)
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

    # DB connection pool stats
    db_pool_stats = {}
    try:
        pool = db.get_bind().pool
        db_pool_stats = {
            "pool_size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
        }
    except Exception:
        db_pool_stats = {"pool_size": 0, "checked_in": 0, "checked_out": 0, "overflow": 0}

    # Redis stats
    redis_stats = {}
    try:
        import redis

        r = redis.from_url("redis://localhost:6379/0", socket_timeout=2)
        info = r.info(section="memory")
        redis_stats = {
            "connected": True,
            "used_memory_mb": round(info.get("used_memory", 0) / (1024 * 1024), 2),
            "used_memory_peak_mb": round(info.get("used_memory_peak", 0) / (1024 * 1024), 2),
            "connected_clients": r.info(section="clients").get("connected_clients", 0),
        }
    except Exception:
        redis_stats = {"connected": False, "used_memory_mb": 0, "used_memory_peak_mb": 0, "connected_clients": 0}

    # Elasticsearch stats
    es_stats = {}
    try:
        from elasticsearch import Elasticsearch

        es = Elasticsearch(["http://localhost:9200"], request_timeout=2)
        health = es.cluster.health()
        stats = es.indices.stats()
        es_stats = {
            "cluster_status": health.get("status", "unknown"),
            "number_of_nodes": health.get("number_of_nodes", 0),
            "active_shards": health.get("active_shards", 0),
            "total_documents": stats.get("_all", {}).get("primaries", {}).get("docs", {}).get("count", 0),
        }
    except Exception:
        es_stats = {"cluster_status": "unavailable", "number_of_nodes": 0, "active_shards": 0, "total_documents": 0}

    # Celery worker stats
    celery_stats = {}
    try:
        from app.worker import celery_app

        inspector = celery_app.control.inspect(timeout=2)
        active = inspector.active() or {}
        celery_stats = {
            "worker_count": len(active),
            "active_tasks": sum(len(tasks) for tasks in active.values()),
        }
    except Exception:
        celery_stats = {"worker_count": 0, "active_tasks": 0}

    # Operational metrics (entity counts, DAU, AI 24h)
    ops = get_operational_metrics(db)

    # System health
    health = get_system_health(db)

    # Alerts
    alerts = get_alerts(db)

    return {
        "performance": {
            "requests_total": perf["requests_total"],
            "avg_latency_ms": perf["avg_latency_ms"],
            "error_count": perf["error_count"],
        },
        "ai_usage": {
            "calls_total": ai_calls_total,
            "cost_total": ai_cost_total,
            "calls_24h": ops.get("ai_calls_24h", 0),
            "cost_24h": ops.get("ai_cost_24h", 0.0),
        },
        "db_pool": db_pool_stats,
        "redis": redis_stats,
        "elasticsearch": es_stats,
        "celery": celery_stats,
        "entities": {
            "workspaces": ops.get("workspace_count", 0),
            "users": ops.get("user_count", 0),
            "problems": ops.get("problem_count", 0),
            "daily_active_users": ops.get("daily_active_users", 0),
        },
        "health": health,
        "alerts": alerts,
    }
