"""Scheduled tasks do real work, or say plainly that they did not.

P-08 (T-030).

Five scheduled tasks fired nightly and did nothing. They were not silent
about it - each returned a success-shaped dictionary:

    {"workspace_id": ws, "brief_generated": True, "dashboard_refreshed": True}
    {"index_name": idx, "doc_id": did, "status": "indexed"}
    {"workspace_id": ws, "recipients": 0, "status": "sent"}
    {"workspace_id": ws, "period": p, "total_revenue": 0, "status": "generated"}

so the platform reported automation it did not perform, every night, in a
form indistinguishable from having performed it.

The card sets the bar for this file: **no test may pass against a `pass`
body.** Each test below asserts a real database effect, a real service call,
or an explicit blocked result - never merely that a dictionary came back.
"""
from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta, timezone

import pytest

from app.jobs import schedules
from app.jobs._result import D4_BLOCKED, STATUS_BLOCKED, STATUS_DONE
from app.jobs.tasks import (
    ai_tasks,
    evidence_tasks,
    notification_tasks,
    report_tasks,
    search_tasks,
)
from app.models.ai_usage import AIUsageLog
from app.models.evidence import Evidence
from app.models.workspace import Workspace

WS = "ws-jobs-1"


class _NoCloseSession:
    """The test session, minus the ability to close itself.

    Every job opens a session and closes it in a `finally`. Handing them the
    test session directly means the first task closes it, and every
    assertion afterwards fails with "not persistent within this Session" -
    which looks like a task bug and is not one.
    """

    def __init__(self, session):
        self._session = session

    def __getattr__(self, name):
        return getattr(self._session, name)

    def close(self):
        return None


@pytest.fixture
def db(db_session, monkeypatch):
    """Point every job's SessionLocal at the test session."""
    proxy = _NoCloseSession(db_session)
    for module in (
        evidence_tasks,
        notification_tasks,
        report_tasks,
        search_tasks,
    ):
        monkeypatch.setattr(module, "SessionLocal", lambda: proxy, raising=False)
    monkeypatch.setattr("app.db.session.SessionLocal", lambda: proxy)
    return db_session


def _evidence(db, *, months_old: int = 1, credibility: float = 8.0) -> Evidence:
    row = Evidence(
        id=str(uuid.uuid4()),
        workspace_id=WS,
        source_url=f"https://example.test/{uuid.uuid4()}",
        source_type="article",
        publication_date=date.today() - timedelta(days=int(months_old * 30.44)),
        credibility_score=credibility,
        extracted_claims=[],
        contradiction_flags=[],
        recency_decay_score=credibility,
    )
    db.add(row)
    db.commit()
    return row


# ---------------------------------------------------------------------------
# 1. The Beat schedule points at tasks that exist
# ---------------------------------------------------------------------------


def test_beat_references_only_real_tasks():
    """A renamed task fails silently in production.

    Celery logs an unregistered-task error on the worker and Beat carries on
    scheduling it forever, so nothing surfaces except work not happening.
    """
    import importlib

    for name, entry in schedules.BEAT_SCHEDULE.items():
        dotted = entry["task"]
        module_path, _, func_name = dotted.rpartition(".")
        module = importlib.import_module(module_path)
        assert hasattr(module, func_name), f"{name} points at missing task {dotted}"


def test_no_schedule_passes_all_as_a_workspace_id():
    """The bug the stubs were hiding.

    Four entries passed the string "all" to tasks whose first parameter is
    `workspace_id`, so every scheduled run asked for the workspace literally
    named "all". With `pass` bodies that made no difference - the moment the
    tasks became real, each sweep would have processed nothing and reported
    a clean run.
    """
    for name, entry in schedules.BEAT_SCHEDULE.items():
        assert "all" not in tuple(entry.get("args", ())), (
            f"{name} passes 'all' as an argument; sweeps enumerate workspaces "
            "themselves"
        )


def test_a_blocked_task_is_not_scheduled():
    """A job that cannot do its work must not fire nightly and log that it did."""
    scheduled = {entry["task"] for entry in schedules.BEAT_SCHEDULE.values()}

    assert "app.jobs.tasks.ai_tasks.run_command_ai_synthesis" not in scheduled


def test_the_compliance_schedule_is_untouched():
    """Retention and backup were already real. P-08 must not disturb them."""
    assert (
        schedules.BEAT_SCHEDULE["retention_cleanup"]["task"]
        == "app.jobs.tasks.retention_tasks.run_retention_cleanup"
    )
    assert schedules.BEAT_SCHEDULE["weekly_backup_verify"]["args"] == (
        "backups/database/latest",
    )


# ---------------------------------------------------------------------------
# 2. Evidence tasks touch the database
# ---------------------------------------------------------------------------


def test_recency_refresh_writes_decayed_scores(db):
    """Asserts a changed row, not a returned dictionary.

    The old body returned `records_updated: 0` without opening a session, so
    a test that only checked the shape would have passed against it.
    """
    row = _evidence(db, months_old=36, credibility=8.0)
    assert row.recency_decay_score == 8.0

    result = evidence_tasks.refresh_recency_scores(WS)

    db.refresh(row)
    assert result["status"] == STATUS_DONE
    assert result["records_updated"] == 1
    assert row.recency_decay_score < 8.0, "three-year-old evidence must decay"


def test_recency_refresh_is_scoped_to_its_workspace(db):
    mine = _evidence(db, months_old=36)
    other = Evidence(
        id=str(uuid.uuid4()),
        workspace_id="ws-other",
        source_url="https://example.test/other",
        source_type="article",
        publication_date=date.today() - timedelta(days=1000),
        credibility_score=8.0,
        extracted_claims=[],
        contradiction_flags=[],
        recency_decay_score=8.0,
    )
    db.add(other)
    db.commit()

    evidence_tasks.refresh_recency_scores(WS)

    db.refresh(mine)
    db.refresh(other)
    assert mine.recency_decay_score < 8.0
    assert other.recency_decay_score == 8.0, "another workspace must be untouched"


def test_stale_sources_are_flagged(db):
    row = _evidence(db, months_old=30)

    result = evidence_tasks.flag_stale_sources(WS, threshold_months=18)

    db.refresh(row)
    assert result["records_flagged"] == 1
    assert "stale_over_18_months" in row.contradiction_flags


def test_recent_sources_are_not_flagged(db):
    row = _evidence(db, months_old=3)

    result = evidence_tasks.flag_stale_sources(WS, threshold_months=18)

    db.refresh(row)
    assert result["records_flagged"] == 0
    assert row.contradiction_flags == []


def test_flagging_is_idempotent(db):
    """This runs nightly.

    A record must not accumulate the same flag once per night for the rest
    of its life.
    """
    row = _evidence(db, months_old=30)

    evidence_tasks.flag_stale_sources(WS, threshold_months=18)
    second = evidence_tasks.flag_stale_sources(WS, threshold_months=18)

    db.refresh(row)
    assert second["records_flagged"] == 0
    assert row.contradiction_flags.count("stale_over_18_months") == 1


def test_ingestion_writes_no_evidence_when_the_ai_is_unavailable(db, monkeypatch):
    """A research record whose claims were fabricated is worse than a missing one."""
    monkeypatch.setattr("app.services.agents.base_agent.settings.ANTHROPIC_API_KEY", "")

    result = evidence_tasks.ingest_evidence(
        WS, "https://example.test/src", "some text", "article"
    )

    assert result["status"] == STATUS_BLOCKED
    assert db.query(Evidence).filter(Evidence.workspace_id == WS).count() == 0


# ---------------------------------------------------------------------------
# 3. Blocked tasks are blocked, not quietly successful
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "call,table",
    [
        (lambda: ai_tasks.run_problem_discovery(WS, ["src"]), "Problem"),
        (lambda: ai_tasks.run_offer_generation(WS, "problem-1"), "Offer"),
        (lambda: ai_tasks.run_command_ai_synthesis(WS), "Notification"),
        (
            lambda: notification_tasks.dispatch_notification(
                "user-1", "info", "Title", "Body"
            ),
            "Notification",
        ),
        (lambda: report_tasks.generate_revenue_report(WS, "2026-03"), "Invoice"),
    ],
)
def test_a_d4_blocked_task_reports_blocked(call, table):
    result = call()

    assert result["status"] == STATUS_BLOCKED
    assert result["blocked_reason"] == D4_BLOCKED
    assert result["target_table"] == table


def test_a_blocked_result_carries_no_success_counters():
    """A zero would read as "nothing needed doing".

    `generate_revenue_report` returned `total_revenue: 0` with
    `"status": "generated"` - the most directly actionable false number in
    the job layer.
    """
    result = report_tasks.generate_revenue_report(WS, "2026-03")

    assert "total_revenue" not in result
    assert result.get("status") != STATUS_DONE


def test_the_daily_brief_no_longer_claims_it_ran():
    """It reported a generated brief every morning at 06:00."""
    result = ai_tasks.run_command_ai_synthesis(WS)

    assert "brief_generated" not in result
    assert "dashboard_refreshed" not in result


# ---------------------------------------------------------------------------
# 4. Reports are built from rows that exist
# ---------------------------------------------------------------------------


def test_the_scorecard_counts_real_activity(db):
    now = datetime.now(timezone.utc)
    db.add(
        AIUsageLog(
            id=str(uuid.uuid4()),
            workspace_id=WS,
            agent_name="command_ai",
            tokens_in=1000,
            tokens_out=500,
            latency_ms=100,
            cost_usd=0.5,
            model="m",
            created_at=now,
        )
    )
    _evidence(db, months_old=0)
    db.commit()

    quarter = f"{now.year}-Q{(now.month - 1) // 3 + 1}"
    result = report_tasks.generate_quarterly_scorecard(WS, quarter)

    assert result["status"] == STATUS_DONE
    assert result["ai_invocations"] == 1
    assert result["ai_spend_usd"] == pytest.approx(0.5)
    assert result["evidence_gathered"] == 1


def test_the_scorecard_states_what_it_cannot_cover(db):
    """Absent, not zero.

    A scorecard silently omitting clients, offers and revenue would be read
    as a complete picture of a quiet quarter.
    """
    result = report_tasks.generate_quarterly_scorecard(WS, "2026-Q1")

    assert "revenue" in result["excludes"]
    assert "clients" in result["excludes"]
    assert "total_revenue" not in result


def test_an_unparseable_quarter_is_refused(db):
    """A scorecard covering a different period than its title is worse than none."""
    result = report_tasks.generate_quarterly_scorecard(WS, "not-a-quarter")

    assert result["status"] == STATUS_BLOCKED
    assert "ai_invocations" not in result


# ---------------------------------------------------------------------------
# 5. Search reports what Elasticsearch actually accepted
# ---------------------------------------------------------------------------


def test_an_unavailable_index_is_not_reported_as_indexed(db, monkeypatch):
    """It returned `"status": "indexed"` without touching Elasticsearch."""

    class Unavailable:
        async def index_document(self, *a, **kw):
            return False

        async def close(self):
            return None

    monkeypatch.setattr(search_tasks, "_service", lambda: Unavailable())

    result = search_tasks.sync_entity_to_search("evidence", "doc-1", {"a": 1})

    assert result["status"] == STATUS_BLOCKED
    assert result["blocked_reason"] == search_tasks.REASON_UNAVAILABLE


def test_a_successful_index_is_reported_as_done(db, monkeypatch):
    calls: list[tuple] = []

    class Working:
        async def index_document(self, index_name, doc_id, document):
            calls.append((index_name, doc_id))
            return True

        async def close(self):
            return None

    monkeypatch.setattr(search_tasks, "_service", lambda: Working())

    result = search_tasks.sync_entity_to_search("evidence", "doc-1", {"a": 1})

    assert result["status"] == STATUS_DONE
    assert calls == [("evidence", "doc-1")], "the service must actually be called"


def test_a_reindex_reports_what_was_accepted_not_what_was_read(db, monkeypatch):
    """bulk_index returns {indexed, errors}, not a boolean.

    A truthiness check would count a batch Elasticsearch rejected entirely as
    successful - the same false success this package removes elsewhere.
    """
    _evidence(db)
    _evidence(db)

    class Rejecting:
        async def bulk_index(self, index_name, documents):
            return {"indexed": 0, "errors": len(documents)}

        async def close(self):
            return None

    monkeypatch.setattr(search_tasks, "_service", lambda: Rejecting())

    result = search_tasks.full_reindex("evidence", workspace_id=WS)

    assert result["status"] == STATUS_BLOCKED
    assert result["documents_read"] == 2


def test_a_reindex_streams_real_rows(db, monkeypatch):
    _evidence(db)
    seen: list[int] = []

    class Working:
        async def bulk_index(self, index_name, documents):
            seen.append(len(documents))
            return {"indexed": len(documents), "errors": 0}

        async def close(self):
            return None

    monkeypatch.setattr(search_tasks, "_service", lambda: Working())

    result = search_tasks.full_reindex("evidence", workspace_id=WS)

    assert result["status"] == STATUS_DONE
    assert result["documents_indexed"] == 1
    assert seen == [1], "documents must come from the database, not an empty list"


# ---------------------------------------------------------------------------
# 6. The digest sends to somebody, or says it could not
# ---------------------------------------------------------------------------


def test_a_digest_with_no_recipient_is_not_reported_as_sent(db):
    """It returned `recipients: 0, "status": "sent"` - sent to nobody."""
    db.add(Workspace(id=WS, name="Test Firm", slug=f"test-{uuid.uuid4()}", settings={}))
    db.commit()

    result = notification_tasks.send_weekly_digest(WS)

    assert result["status"] == STATUS_BLOCKED
    assert result["blocked_reason"] == notification_tasks.REASON_NO_RECIPIENT


def test_a_missing_workspace_is_not_reported_as_sent(db):
    result = notification_tasks.send_weekly_digest("ws-does-not-exist")

    assert result["status"] == STATUS_BLOCKED


def test_a_digest_counts_real_evidence_activity(db, monkeypatch):
    db.add(
        Workspace(
            id=WS,
            name="Test Firm",
            slug=f"test-{uuid.uuid4()}",
            settings={"digest_email": "ops@example.test"},
        )
    )
    _evidence(db)
    db.commit()

    sent: list[dict] = []

    class FakeEmail:
        def __init__(self, db_session=None):
            pass

        async def send(self, **kwargs):
            sent.append(kwargs)
            return {"id": "msg-1", "status": "sent"}

    monkeypatch.setattr(notification_tasks, "EmailService", FakeEmail)

    result = notification_tasks.send_weekly_digest(WS)

    assert result["status"] == STATUS_DONE
    assert result["recipients"] == 1
    assert result["evidence_added"] == 1
    assert sent and sent[0]["to"] == "ops@example.test"


def test_the_digest_states_its_own_scope(db, monkeypatch):
    """It covers FastAPI-owned activity only.

    A digest quietly omitting client and offer activity would be read as a
    complete picture of a quiet week.
    """
    body = notification_tasks._digest_html("Test Firm", 3, 12)

    assert "evidence activity only" in body


def test_an_email_with_no_recipient_is_refused(db):
    result = notification_tasks.send_email_notification("", "welcome", {})

    assert result["status"] == STATUS_BLOCKED
    assert result["blocked_reason"] == notification_tasks.REASON_NO_RECIPIENT
