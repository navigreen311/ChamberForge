"""Celery application configuration for ChamberForge background jobs."""
from celery import Celery

from app.core.config import settings
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
    task_routes={
        "app.jobs.tasks.ai_tasks.*": {"queue": "ai"},
        "app.jobs.tasks.notification_tasks.*": {"queue": "notifications"},
        "default": {"queue": "default"},
    },
)

celery_app.conf.beat_schedule = BEAT_SCHEDULE

celery_app.autodiscover_tasks(["app.jobs.tasks"])
