"""Every task module loads, and every task Beat names is registered.

Rewritten by P-08.

This file called itself "comprehensive tests for Celery task modules" and
was, in practice, the strongest guarantee that the tasks kept doing nothing.
Each execution test asserted only the shape of a returned dictionary:

    result = send_weekly_digest.apply(args=["ws-001"]).get()
    assert result["workspace_id"] == "ws-001"
    assert result["status"] == "sent"

Every one of those assertions is satisfied by a function that opens no
session, calls no service, and returns a literal — which is exactly what
those tasks were. The card's rule for P-08 is that **no test may pass
against a `pass` body**, and these all did.

The execution tests now live in `test_jobs.py`, where a database fixture
lets them assert a changed row, a called service, or an explicit blocked
result. What stays here is what this file was genuinely good at: catching an
import error or a circular dependency across the task modules, and catching
a Beat entry that points at a task nobody registered.
"""
import importlib

import pytest

from app.jobs import schedules
from app.jobs.celery_app import celery_app


@pytest.fixture(autouse=True)
def _celery_eager():
    """Enable Celery eager mode for this test module, restore after."""
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
    yield
    celery_app.conf.task_always_eager = False
    celery_app.conf.task_eager_propagates = False


class TestTaskImports:
    """Every task module loads without circular dependencies."""

    def test_import_ai_tasks(self):
        from app.jobs.tasks import ai_tasks  # noqa: F401

        assert hasattr(ai_tasks, "run_problem_discovery")
        assert hasattr(ai_tasks, "run_offer_generation")
        assert hasattr(ai_tasks, "run_command_ai_synthesis")

    def test_import_evidence_tasks(self):
        from app.jobs.tasks import evidence_tasks  # noqa: F401

        assert hasattr(evidence_tasks, "refresh_recency_scores")
        assert hasattr(evidence_tasks, "flag_stale_sources")
        # Moved here from ai_tasks: it writes `evidence`, which FastAPI owns,
        # so unlike its former neighbours it can actually complete.
        assert hasattr(evidence_tasks, "ingest_evidence")

    def test_import_notification_tasks(self):
        from app.jobs.tasks import notification_tasks  # noqa: F401

        assert hasattr(notification_tasks, "dispatch_notification")
        assert hasattr(notification_tasks, "send_email_notification")
        assert hasattr(notification_tasks, "send_weekly_digest")

    def test_import_report_tasks(self):
        from app.jobs.tasks import report_tasks  # noqa: F401

        assert hasattr(report_tasks, "generate_quarterly_scorecard")
        assert hasattr(report_tasks, "generate_revenue_report")

    def test_import_search_tasks(self):
        from app.jobs.tasks import search_tasks  # noqa: F401

        assert hasattr(search_tasks, "sync_entity_to_search")
        assert hasattr(search_tasks, "full_reindex")

    def test_import_sweep_tasks(self):
        from app.jobs.tasks import sweep_tasks  # noqa: F401

        assert hasattr(sweep_tasks, "sweep_recency_refresh")
        assert hasattr(sweep_tasks, "sweep_stale_sources")
        assert hasattr(sweep_tasks, "sweep_weekly_digest")


class TestTaskRegistry:
    """Beat can only run a task Celery has registered."""

    def test_every_scheduled_task_is_registered(self):
        """A renamed task fails silently in production.

        Celery logs an unregistered-task error on the worker and Beat carries
        on scheduling it forever, so the only symptom is work not happening.
        """
        # Import for the side effect of registering the tasks.
        importlib.import_module("app.jobs.tasks")

        registered = set(celery_app.tasks.keys())
        for name, entry in schedules.BEAT_SCHEDULE.items():
            assert entry["task"] in registered, (
                f"beat entry '{name}' points at unregistered task {entry['task']}"
            )
