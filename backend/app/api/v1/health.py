"""Health check endpoints for ChamberForge."""
import logging
import sys
import time
from datetime import datetime, timezone

import fastapi
import sqlalchemy
from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings

logger = logging.getLogger("chamberforge.health")

router = APIRouter(prefix="/api/v1/health", tags=["health"])


@router.get("/")
async def health() -> dict:
    """Basic health check."""
    return {"status": "healthy", "version": "0.4.0"}


@router.get("/ready")
async def readiness() -> dict:
    """Readiness probe -- checks all service dependencies with detailed status."""
    checks: dict[str, dict] = {}

    # Database
    try:
        from app.db.session import engine

        start = time.monotonic()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        latency = round((time.monotonic() - start) * 1000, 2)
        checks["database"] = {"status": "up", "latency_ms": latency}
    except Exception as exc:
        logger.warning("DB readiness check failed: %s", exc)
        checks["database"] = {"status": "down", "error": str(exc)}

    # Redis
    try:
        import redis as redis_lib

        start = time.monotonic()
        r = redis_lib.from_url(settings.REDIS_URL, socket_connect_timeout=2)
        r.ping()
        latency = round((time.monotonic() - start) * 1000, 2)
        checks["redis"] = {"status": "up", "latency_ms": latency}
    except Exception as exc:
        logger.warning("Redis readiness check failed: %s", exc)
        checks["redis"] = {"status": "down", "error": str(exc)}

    # Elasticsearch
    try:
        from elasticsearch import Elasticsearch

        start = time.monotonic()
        es = Elasticsearch(settings.ELASTICSEARCH_URL, request_timeout=3)
        es.cluster.health(request_timeout=3)
        latency = round((time.monotonic() - start) * 1000, 2)
        checks["elasticsearch"] = {"status": "up", "latency_ms": latency}
    except Exception as exc:
        logger.warning("Elasticsearch readiness check failed: %s", exc)
        checks["elasticsearch"] = {"status": "down", "error": str(exc)}

    # Anthropic API
    checks["anthropic"] = {
        "status": "configured" if settings.ANTHROPIC_API_KEY else "not_configured",
    }

    # Stripe
    checks["stripe"] = {
        "status": "configured" if settings.STRIPE_SECRET_KEY else "not_configured",
    }

    # S3
    checks["s3"] = {
        "status": "configured" if settings.AWS_ACCESS_KEY_ID else "not_configured",
    }

    # Only database is critical for readiness
    all_critical_up = checks["database"]["status"] == "up"

    return {
        "status": "ready" if all_critical_up else "not_ready",
        "checks": checks,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/live")
async def liveness() -> dict:
    """Liveness probe -- always returns alive (for k8s)."""
    return {"status": "alive"}


@router.get("/dependencies")
async def dependency_info() -> dict:
    """Return version info for key dependencies."""
    return {
        "python": sys.version,
        "fastapi": fastapi.__version__,
        "sqlalchemy": sqlalchemy.__version__,
        "app_version": "0.4.0",
        "environment": settings.APP_ENV,
    }
