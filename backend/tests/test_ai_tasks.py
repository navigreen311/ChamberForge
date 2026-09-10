"""AI background tasks report blocked rather than fabricating success.

Rewritten by P-08. What was here asserted the defect outright:

    def test_run_command_ai_synthesis():
        data = run_command_ai_synthesis.apply(args=["ws-001"]).result
        assert data["brief_generated"] is True
        assert data["dashboard_refreshed"] is True

That task's body opened no session and called no service. The test
guaranteed that a job which did nothing kept reporting a generated brief and
a refreshed dashboard — every morning at 06:00, because `daily_brief` was on
the Beat schedule.

Under D4 these three cannot be implemented: `Problem`, `Offer` and
`Notification` are Prisma-owned, and a Celery worker writing the retired
SQLAlchemy duplicates would produce rows nothing reads. So they now return a
blocked result naming the constraint, and `daily_brief` is off the schedule.
"""
import pytest

from app.jobs._result import D4_BLOCKED, STATUS_BLOCKED
from app.jobs.celery_app import celery_app


@pytest.fixture(autouse=True)
def celery_eager_mode():
    """Run all Celery tasks synchronously for testing."""
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
    yield
    celery_app.conf.task_always_eager = False
    celery_app.conf.task_eager_propagates = False


def test_problem_discovery_reports_that_it_cannot_persist():
    from app.jobs.tasks.ai_tasks import run_problem_discovery

    data = run_problem_discovery.apply(args=["ws-001", ["source1", "source2"]]).result

    assert data["status"] == STATUS_BLOCKED
    assert data["blocked_reason"] == D4_BLOCKED
    assert data["target_table"] == "Problem"
    assert data["sources_supplied"] == 2


def test_offer_generation_reports_that_it_cannot_persist():
    from app.jobs.tasks.ai_tasks import run_offer_generation

    data = run_offer_generation.apply(args=["ws-001", "prob-123"]).result

    assert data["status"] == STATUS_BLOCKED
    assert data["target_table"] == "Offer"


def test_the_daily_brief_no_longer_reports_a_brief():
    """The test that used to guarantee the lie.

    `brief_generated: True` came from a body that did nothing at all.
    """
    from app.jobs.tasks.ai_tasks import run_command_ai_synthesis

    data = run_command_ai_synthesis.apply(args=["ws-001"]).result

    assert data["status"] == STATUS_BLOCKED
    assert "brief_generated" not in data
    assert "dashboard_refreshed" not in data


def test_no_ai_budget_is_spent_on_work_that_cannot_be_stored(monkeypatch):
    """Blocked means the call is not made.

    Running discovery and discarding the result would spend real AI budget
    nightly to produce nothing.
    """
    from app.services.agents import base_agent

    calls: list[str] = []
    monkeypatch.setattr(
        base_agent, "call_claude_sync", lambda *a, **kw: calls.append(a) or None
    )

    from app.jobs.tasks.ai_tasks import run_problem_discovery

    run_problem_discovery.apply(args=["ws-001", ["source1"]])

    assert calls == []


def test_evidence_ingestion_moved_to_the_module_that_can_complete():
    """It writes `evidence`, which FastAPI owns, so it is not blocked.

    It lives in `evidence_tasks` now, next to the other tasks that can
    actually finish.
    """
    from app.jobs.tasks import ai_tasks, evidence_tasks

    assert hasattr(evidence_tasks, "ingest_evidence")
    assert not hasattr(ai_tasks, "run_evidence_ingestion")


def test_tasks_are_registered():
    """All AI tasks should be discoverable in the Celery task registry."""
    import app.jobs.tasks.ai_tasks  # noqa: F401

    registered = celery_app.tasks.keys()
    expected = [
        "app.jobs.tasks.ai_tasks.run_problem_discovery",
        "app.jobs.tasks.ai_tasks.run_offer_generation",
        "app.jobs.tasks.ai_tasks.run_command_ai_synthesis",
        "app.jobs.tasks.evidence_tasks.ingest_evidence",
    ]
    for task_name in expected:
        assert task_name in registered, f"Task not registered: {task_name}"
