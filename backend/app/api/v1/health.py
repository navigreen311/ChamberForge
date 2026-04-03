"""Health check endpoints for ChamberForge."""
import logging

from fastapi import APIRouter

from app.core.config import settings

logger = logging.getLogger("chamberforge.health")

router = APIRouter(prefix="/api/v1/health", tags=["health"])


@router.get("/")
async def health() -> dict:
    """Basic health check."""
    return {"status": "healthy", "version": "0.1.0"}


@router.get("/ready")
async def readiness() -> dict:
    """Readiness probe — checks DB, Redis, Elasticsearch connectivity."""
    checks: dict[str, bool] = {
        "db": False,
        "redis": False,
        "elasticsearch": False,
    }

    # Database check
    try:
        from sqlalchemy import text
        from app.db.session import engine

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        checks["db"] = True
    except Exception as exc:
        logger.warning("DB readiness check failed: %s", exc)

    # Redis check
    try:
        import redis as redis_lib

        r = redis_lib.from_url(settings.REDIS_URL, socket_connect_timeout=2)
        r.ping()
        checks["redis"] = True
    except Exception as exc:
        logger.warning("Redis readiness check failed: %s", exc)

    # Elasticsearch check
    try:
        from elasticsearch import Elasticsearch

        es = Elasticsearch(settings.ELASTICSEARCH_URL, request_timeout=2)
        es.ping()
        checks["elasticsearch"] = True
    except Exception as exc:
        logger.warning("Elasticsearch readiness check failed: %s", exc)

    all_healthy = all(checks.values())
    status = "ready" if all_healthy else "degraded"

    return {"status": status, "checks": checks}


@router.get("/live")
async def liveness() -> dict:
    """Liveness probe — always returns alive (for k8s)."""
    return {"status": "alive"}
