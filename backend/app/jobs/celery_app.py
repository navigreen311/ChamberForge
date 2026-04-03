"""Celery application configuration for ChamberForge background jobs."""
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    from celery import Celery
    from app.jobs.schedules import BEAT_SCHEDULE

    celery_app = Celery(
        "chamberforge",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL,
    )

    celery_app.conf.update(
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
        task_track_started=True,
        task_acks_late=True,
        worker_prefetch_multiplier=1,
        broker_connection_retry_on_startup=False,
        broker_connection_retry=False,
        broker_connection_timeout=3,
        task_routes={
            "app.jobs.tasks.ai_tasks.*": {"queue": "ai"},
            "app.jobs.tasks.notification_tasks.*": {"queue": "notifications"},
            "default": {"queue": "default"},
        },
    )

    celery_app.conf.beat_schedule = BEAT_SCHEDULE

    # Enable eager mode for testing so tasks execute synchronously without a broker
    if settings.APP_ENV == "testing":
        celery_app.conf.task_always_eager = True
        celery_app.conf.task_eager_propagates = True
        logger.info("Celery running in eager mode (APP_ENV=testing)")

    celery_app.autodiscover_tasks(["app.jobs.tasks"])

except Exception as e:
    logger.warning(f"Celery initialization failed (non-fatal): {e}")
    celery_app = None  # type: ignore[assignment]
