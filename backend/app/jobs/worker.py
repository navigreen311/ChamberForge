"""Celery worker entry point.

Start worker:
    celery -A app.jobs.worker.celery worker --loglevel=info

Start beat:
    celery -A app.jobs.worker.celery beat --loglevel=info
"""
from app.jobs.celery_app import celery_app  # noqa: F401

celery = celery_app
