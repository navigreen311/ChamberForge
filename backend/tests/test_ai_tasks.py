"""Tests for AI background tasks using Celery eager mode."""
import pytest

from app.jobs.celery_app import celery_app


@pytest.fixture(autouse=True)
def celery_eager_mode():
    """Run all Celery tasks synchronously for testing."""
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
    yield
    celery_app.conf.task_always_eager = False
    celery_app.conf.task_eager_propagates = False


def test_run_problem_discovery():
    from app.jobs.tasks.ai_tasks import run_problem_discovery

    result = run_problem_discovery.apply(args=["ws-001", ["source1", "source2"]])
    assert result.successful()
    data = result.result
    assert data["workspace_id"] == "ws-001"
    assert data["sources_processed"] == 2
    assert "timestamp" in data


def test_run_evidence_ingestion():
    from app.jobs.tasks.ai_tasks import run_evidence_ingestion

    result = run_evidence_ingestion.apply(args=["ws-001", "Sample evidence text", "interview"])
    assert result.successful()
    data = result.result
    assert data["workspace_id"] == "ws-001"
    assert data["source_type"] == "interview"
    assert data["chars_processed"] == len("Sample evidence text")


def test_run_offer_generation():
    from app.jobs.tasks.ai_tasks import run_offer_generation

    result = run_offer_generation.apply(args=["ws-001", "prob-123"])
    assert result.successful()
    data = result.result
    assert data["workspace_id"] == "ws-001"
    assert data["problem_id"] == "prob-123"


def test_run_command_ai_synthesis():
    from app.jobs.tasks.ai_tasks import run_command_ai_synthesis

    result = run_command_ai_synthesis.apply(args=["ws-001"])
    assert result.successful()
    data = result.result
    assert data["brief_generated"] is True
    assert data["dashboard_refreshed"] is True


def test_tasks_are_registered():
    """All AI tasks should be discoverable in the Celery task registry."""
    # Force import so autodiscovery picks them up
    import app.jobs.tasks.ai_tasks  # noqa: F401

    registered = celery_app.tasks.keys()
    expected = [
        "app.jobs.tasks.ai_tasks.run_problem_discovery",
        "app.jobs.tasks.ai_tasks.run_evidence_ingestion",
        "app.jobs.tasks.ai_tasks.run_offer_generation",
        "app.jobs.tasks.ai_tasks.run_command_ai_synthesis",
    ]
    for task_name in expected:
        assert task_name in registered, f"Task not registered: {task_name}"
