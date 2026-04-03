"""Celery Beat schedule definitions for ChamberForge."""
from celery.schedules import crontab

BEAT_SCHEDULE = {
    "daily_brief": {
        "task": "app.jobs.tasks.ai_tasks.run_command_ai_synthesis",
        "schedule": crontab(hour=6, minute=0),
        "args": ("all",),
        "options": {"queue": "ai"},
    },
    "evidence_refresh": {
        "task": "app.jobs.tasks.evidence_tasks.refresh_recency_scores",
        "schedule": crontab(hour=2, minute=0, day_of_week="sunday"),
        "args": ("all",),
    },
    "weekly_digest": {
        "task": "app.jobs.tasks.notification_tasks.send_weekly_digest",
        "schedule": crontab(hour=8, minute=0, day_of_week="monday"),
        "args": ("all",),
        "options": {"queue": "notifications"},
    },
    "stale_source_check": {
        "task": "app.jobs.tasks.evidence_tasks.flag_stale_sources",
        "schedule": crontab(hour=0, minute=0),
        "args": ("all",),
    },
    "drip_processor": {
        "task": "app.jobs.tasks.drip_tasks.process_drip_sequences",
        "schedule": crontab(minute=0),  # every hour
        "options": {"queue": "notifications"},
    },
}
