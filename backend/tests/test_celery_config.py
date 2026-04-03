"""Tests for Celery application configuration and beat schedule."""
import pytest


def test_celery_app_configured():
    """Celery app should be importable and correctly configured."""
    from app.jobs.celery_app import celery_app

    assert celery_app.main == "chamberforge"
    assert celery_app.conf.task_serializer == "json"
    assert celery_app.conf.result_serializer == "json"
    assert "json" in celery_app.conf.accept_content
    assert celery_app.conf.timezone == "UTC"
    assert celery_app.conf.enable_utc is True
    assert celery_app.conf.task_track_started is True
    assert celery_app.conf.task_acks_late is True
    assert celery_app.conf.worker_prefetch_multiplier == 1


def test_celery_task_routes():
    """Task routes should map AI and notification tasks to dedicated queues."""
    from app.jobs.celery_app import celery_app

    routes = celery_app.conf.task_routes
    assert "app.jobs.tasks.ai_tasks.*" in routes
    assert routes["app.jobs.tasks.ai_tasks.*"]["queue"] == "ai"
    assert "app.jobs.tasks.notification_tasks.*" in routes
    assert routes["app.jobs.tasks.notification_tasks.*"]["queue"] == "notifications"


def test_beat_schedule_has_all_entries():
    """Beat schedule should include all expected periodic tasks."""
    from app.jobs.celery_app import celery_app

    schedule = celery_app.conf.beat_schedule
    expected_keys = [
        "daily_brief",
        "evidence_refresh",
        "weekly_digest",
        "stale_source_check",
    ]
    for key in expected_keys:
        assert key in schedule, f"Missing beat schedule entry: {key}"
        assert "task" in schedule[key]
        assert "schedule" in schedule[key]


def test_beat_schedule_task_names():
    """Beat schedule entries should reference valid fully-qualified task names."""
    from app.jobs.celery_app import celery_app

    schedule = celery_app.conf.beat_schedule
    assert schedule["daily_brief"]["task"] == "app.jobs.tasks.ai_tasks.run_command_ai_synthesis"
    assert schedule["evidence_refresh"]["task"] == "app.jobs.tasks.evidence_tasks.refresh_recency_scores"
    assert schedule["weekly_digest"]["task"] == "app.jobs.tasks.notification_tasks.send_weekly_digest"
    assert schedule["stale_source_check"]["task"] == "app.jobs.tasks.evidence_tasks.flag_stale_sources"
