"""Comprehensive tests for Celery task modules.

All tasks run in eager mode so no broker is required.
"""
import pytest

from app.jobs.celery_app import celery_app

# Force eager mode for the entire test module
celery_app.conf.task_always_eager = True
celery_app.conf.task_eager_propagates = True


# ---------------------------------------------------------------------------
# Import tests -- verify every task module loads without circular deps
# ---------------------------------------------------------------------------

class TestTaskImports:
    def test_import_ai_tasks(self):
        from app.jobs.tasks import ai_tasks  # noqa: F401
        assert hasattr(ai_tasks, "run_problem_discovery")
        assert hasattr(ai_tasks, "run_evidence_ingestion")
        assert hasattr(ai_tasks, "run_offer_generation")
        assert hasattr(ai_tasks, "run_command_ai_synthesis")

    def test_import_evidence_tasks(self):
        from app.jobs.tasks import evidence_tasks  # noqa: F401
        assert hasattr(evidence_tasks, "refresh_recency_scores")
        assert hasattr(evidence_tasks, "flag_stale_sources")

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


# ---------------------------------------------------------------------------
# Execution tests -- verify tasks return expected results in eager mode
# ---------------------------------------------------------------------------

class TestAITasks:
    def test_run_problem_discovery(self):
        from app.jobs.tasks.ai_tasks import run_problem_discovery

        result = run_problem_discovery.apply(
            args=["ws-001", ["source_a", "source_b"]],
        ).get()

        assert result["workspace_id"] == "ws-001"
        assert result["sources_processed"] == 2
        assert "timestamp" in result

    def test_run_evidence_ingestion(self):
        from app.jobs.tasks.ai_tasks import run_evidence_ingestion

        result = run_evidence_ingestion.apply(
            args=["ws-001", "Some evidence text here", "interview"],
        ).get()

        assert result["workspace_id"] == "ws-001"
        assert result["source_type"] == "interview"
        assert result["chars_processed"] == len("Some evidence text here")
        assert result["status"] == "ingested"


class TestEvidenceTasks:
    def test_refresh_recency_scores(self):
        from app.jobs.tasks.evidence_tasks import refresh_recency_scores

        result = refresh_recency_scores.apply(args=["ws-001"]).get()

        assert result["workspace_id"] == "ws-001"
        assert "records_updated" in result
        assert "timestamp" in result

    def test_flag_stale_sources(self):
        from app.jobs.tasks.evidence_tasks import flag_stale_sources

        result = flag_stale_sources.apply(args=["ws-001"]).get()

        assert result["workspace_id"] == "ws-001"
        assert result["threshold_months"] == 18


class TestNotificationTasks:
    def test_dispatch_notification(self):
        from app.jobs.tasks.notification_tasks import dispatch_notification

        result = dispatch_notification.apply(
            args=["user-123", "alert", "Test Title", "Test body"],
        ).get()

        assert result["user_id"] == "user-123"
        assert result["type"] == "alert"
        assert result["title"] == "Test Title"
        assert result["read"] is False

    def test_send_weekly_digest(self):
        from app.jobs.tasks.notification_tasks import send_weekly_digest

        result = send_weekly_digest.apply(args=["ws-001"]).get()

        assert result["workspace_id"] == "ws-001"
        assert result["status"] == "sent"


class TestReportTasks:
    def test_generate_quarterly_scorecard(self):
        from app.jobs.tasks.report_tasks import generate_quarterly_scorecard

        result = generate_quarterly_scorecard.apply(
            args=["ws-001", "2026-Q1"],
        ).get()

        assert result["workspace_id"] == "ws-001"
        assert result["quarter"] == "2026-Q1"
        assert result["status"] == "generated"


class TestSearchTasks:
    def test_sync_entity_to_search(self):
        from app.jobs.tasks.search_tasks import sync_entity_to_search

        result = sync_entity_to_search.apply(
            args=["problems", "doc-001", {"title": "Test"}],
        ).get()

        assert result["index_name"] == "problems"
        assert result["doc_id"] == "doc-001"
        assert result["status"] == "indexed"
