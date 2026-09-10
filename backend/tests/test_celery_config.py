"""Tests for Celery application configuration and beat schedule."""


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
    """Beat schedule should include all expected periodic tasks.

    P-08 removed `daily_brief`. It pointed at `run_command_ai_synthesis`,
    which is blocked under D4 - the brief reaches an operator through a
    Prisma `Notification` that a worker cannot write. A job that cannot do
    its work should not fire at 06:00 every morning and log that it did.
    """
    from app.jobs.celery_app import celery_app

    schedule = celery_app.conf.beat_schedule
    expected_keys = [
        "evidence_refresh",
        "weekly_digest",
        "stale_source_check",
        "retention_cleanup",
        "daily_backup",
    ]
    for key in expected_keys:
        assert key in schedule, f"Missing beat schedule entry: {key}"
        assert "task" in schedule[key]
        assert "schedule" in schedule[key]

    assert "daily_brief" not in schedule, (
        "daily_brief is blocked under D4 and must not be scheduled"
    )


def test_beat_schedule_task_names():
    """Beat entries reference the sweep tasks, not per-workspace tasks.

    They used to point straight at tasks whose first parameter is
    `workspace_id` and pass `args: ("all",)`, so every scheduled run asked
    for the workspace literally named "all". The sweeps enumerate workspaces
    themselves.
    """
    from app.jobs.celery_app import celery_app

    schedule = celery_app.conf.beat_schedule
    assert (
        schedule["evidence_refresh"]["task"]
        == "app.jobs.tasks.sweep_tasks.sweep_recency_refresh"
    )
    assert (
        schedule["weekly_digest"]["task"]
        == "app.jobs.tasks.sweep_tasks.sweep_weekly_digest"
    )
    assert (
        schedule["stale_source_check"]["task"]
        == "app.jobs.tasks.sweep_tasks.sweep_stale_sources"
    )
