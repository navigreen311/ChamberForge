"""System health checks and operational metrics."""

import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func, text
from sqlalchemy.orm import Session

logger = logging.getLogger("chamberforge.system_health")

# Alert thresholds
DB_DISK_USAGE_THRESHOLD = 80  # percent
AI_DAILY_COST_BUDGET = 50.0  # USD
ERROR_RATE_THRESHOLD = 5.0  # percent


def _check_dependency(name: str, check_fn) -> dict:
    """Check a single dependency and measure latency."""
    start = time.monotonic()
    try:
        check_fn()
        latency_ms = round((time.monotonic() - start) * 1000, 1)
        return {"name": name, "status": "healthy", "latency_ms": latency_ms}
    except Exception as e:
        latency_ms = round((time.monotonic() - start) * 1000, 1)
        logger.warning("Health check failed for %s: %s", name, e)
        return {
            "name": name,
            "status": "unhealthy",
            "latency_ms": latency_ms,
            "error": str(e),
        }


def get_system_health(db: Session) -> dict:
    """Check all dependencies (DB, Redis, ES, S3) with latency."""
    results: list[dict] = []

    # Database
    def check_db():
        db.execute(text("SELECT 1"))

    results.append(_check_dependency("database", check_db))

    # Redis
    def check_redis():
        try:
            import redis

            r = redis.from_url("redis://localhost:6379/0", socket_timeout=2)
            r.ping()
        except ImportError:
            raise RuntimeError("redis package not installed")

    results.append(_check_dependency("redis", check_redis))

    # Elasticsearch
    def check_elasticsearch():
        try:
            from elasticsearch import Elasticsearch

            es = Elasticsearch(["http://localhost:9200"], request_timeout=2)
            es.cluster.health()
        except ImportError:
            raise RuntimeError("elasticsearch package not installed")

    results.append(_check_dependency("elasticsearch", check_elasticsearch))

    # S3 / MinIO
    def check_s3():
        try:
            import boto3

            s3 = boto3.client(
                "s3",
                endpoint_url="http://localhost:9000",
                aws_access_key_id="minioadmin",
                aws_secret_access_key="minioadmin",
            )
            s3.list_buckets()
        except ImportError:
            raise RuntimeError("boto3 package not installed")

    results.append(_check_dependency("s3", check_s3))

    all_healthy = all(r["status"] == "healthy" for r in results)
    return {
        "overall": "healthy" if all_healthy else "degraded",
        "dependencies": {r["name"]: r for r in results},
    }


def get_operational_metrics(db: Session) -> dict:
    """Entity counts, daily active users, AI costs for the last 24 hours."""
    from app.models.ai_usage import AIUsageLog

    now = datetime.now(timezone.utc)
    day_ago = now - timedelta(hours=24)
    metrics: dict[str, Any] = {}

    # Entity counts
    try:
        from app.models.workspace import Workspace
        from app.models.user import User
        from app.models.problem import Problem

        metrics["workspace_count"] = db.query(func.count(Workspace.id)).scalar() or 0
        metrics["user_count"] = db.query(func.count(User.id)).scalar() or 0
        metrics["problem_count"] = db.query(func.count(Problem.id)).scalar() or 0
    except Exception as e:
        logger.warning("Failed to fetch entity counts: %s", e)
        metrics["workspace_count"] = 0
        metrics["user_count"] = 0
        metrics["problem_count"] = 0

    # Daily active users (users with AI usage in last 24h as a proxy)
    try:
        metrics["daily_active_users"] = (
            db.query(func.count(func.distinct(AIUsageLog.user_id)))
            .filter(AIUsageLog.created_at >= day_ago)
            .scalar()
            or 0
        )
    except Exception:
        metrics["daily_active_users"] = 0

    # AI costs last 24h
    try:
        row = (
            db.query(
                func.count(AIUsageLog.id).label("calls"),
                func.coalesce(func.sum(AIUsageLog.cost_usd), 0).label("cost"),
            )
            .filter(AIUsageLog.created_at >= day_ago)
            .first()
        )
        metrics["ai_calls_24h"] = int(row.calls) if row else 0
        metrics["ai_cost_24h"] = round(float(row.cost), 6) if row else 0.0
    except Exception:
        metrics["ai_calls_24h"] = 0
        metrics["ai_cost_24h"] = 0.0

    return metrics


def get_alerts(db: Session) -> list[dict]:
    """Check thresholds and return active alerts."""
    alerts: list[dict] = []

    # DB disk usage (via pg_database_size)
    try:
        row = db.execute(
            text("SELECT pg_database_size(current_database()) as db_size")
        ).first()
        if row:
            db_size_gb = row.db_size / (1024**3)
            # Assume 100GB max for alerting purposes
            usage_pct = (db_size_gb / 100) * 100
            if usage_pct > DB_DISK_USAGE_THRESHOLD:
                alerts.append(
                    {
                        "severity": "critical",
                        "type": "db_disk_usage",
                        "message": f"Database disk usage at {usage_pct:.1f}% ({db_size_gb:.2f} GB)",
                    }
                )
    except Exception as e:
        logger.warning("Could not check DB disk usage: %s", e)

    # AI cost budget
    try:
        ops = get_operational_metrics(db)
        if ops["ai_cost_24h"] > AI_DAILY_COST_BUDGET:
            alerts.append(
                {
                    "severity": "warning",
                    "type": "ai_cost_over_budget",
                    "message": f"AI cost in last 24h (${ops['ai_cost_24h']:.2f}) exceeds budget (${AI_DAILY_COST_BUDGET:.2f})",
                }
            )
    except Exception:
        pass

    # Error rate check (from performance metrics)
    try:
        from app.middleware.performance import get_performance_metrics

        perf = get_performance_metrics()
        total = perf.get("requests_total", 0)
        errors = perf.get("error_count", 0)
        if total > 0:
            error_rate = (errors / total) * 100
            if error_rate > ERROR_RATE_THRESHOLD:
                alerts.append(
                    {
                        "severity": "warning",
                        "type": "high_error_rate",
                        "message": f"Error rate at {error_rate:.1f}% ({errors}/{total} requests)",
                    }
                )
    except Exception:
        pass

    return alerts
