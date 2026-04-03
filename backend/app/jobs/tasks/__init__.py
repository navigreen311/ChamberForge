"""Task modules for Celery autodiscovery."""
from app.jobs.tasks import (  # noqa: F401
    ai_tasks,
    evidence_tasks,
    notification_tasks,
    report_tasks,
    search_tasks,
)
