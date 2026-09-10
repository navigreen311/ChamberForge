"""The AI spend ceiling actually refuses, and every call is metered.

P-04 (T-031). Three properties, each of which was false before this package:

  1. an agent invocation writes a usage row;
  2. a workspace at its ceiling gets a refusal rather than a call;
  3. the ceiling is the persisted one, not whatever the caller passed in.

The third is the one that made the other two pointless. `check_budget` took
`monthly_budget` as an argument, so the question "are you over budget" was
answered against a number supplied by whoever was asking.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

import pytest

from app.db.scope import OperatorScope, reset_scope, set_scope
from app.models.ai_usage import AIUsageLog
from app.models.workspace_budget import WorkspaceBudget
from app.services.agents.base_agent import (
    REASON_BUDGET_UNAVAILABLE,
    REASON_NO_API_KEY,
    REASON_OVER_BUDGET,
    call_claude,
)
from app.services.backbone.budget_guard import (
    DEFAULT_MONTHLY_BUDGET_USD,
    BudgetExceeded,
    BudgetGuard,
)

WS = "ws-budget-1"


class _Usage:
    def __init__(self, tin, tout):
        self.input_tokens = tin
        self.output_tokens = tout


class _Block:
    def __init__(self, text):
        self.text = text


class _Response:
    def __init__(self, text, tin=1000, tout=500):
        self.content = [_Block(text)]
        self.usage = _Usage(tin, tout)


class _Messages:
    def __init__(self, response, recorder):
        self._response = response
        self._recorder = recorder

    async def create(self, **kwargs):
        self._recorder.append(kwargs)
        if isinstance(self._response, Exception):
            raise self._response
        return self._response


class FakeClient:
    """Stands in for AsyncAnthropic and records what it was called with."""

    def __init__(self, text='{"ok": true}', **kw):
        self.calls: list[dict] = []
        self.messages = _Messages(_Response(text, **kw), self.calls)


class FailingClient:
    def __init__(self, exc: Exception):
        self.calls: list[dict] = []
        self.messages = _Messages(exc, self.calls)


@pytest.fixture()
def scoped():
    """Bind an operator scope, as the tenant middleware does per request."""
    token = set_scope(OperatorScope(workspace_id=WS, user_id="user-1"))
    yield WS
    reset_scope(token)


# -- 1. Nothing is unmetered -----------------------------------------------


def test_a_workspace_with_no_row_still_has_a_ceiling(db_session):
    """"Unconfigured" must not quietly mean "unlimited"."""
    state = BudgetGuard.status(db_session, WS)
    assert state.ceiling_usd == DEFAULT_MONTHLY_BUDGET_USD
    assert state.enforced is True


@pytest.mark.asyncio
async def test_every_invocation_writes_a_usage_row(db_session, scoped, monkeypatch):
    monkeypatch.setattr(
        "app.services.agents.base_agent.SessionLocal", lambda: db_session
    )
    client = FakeClient()

    result = await call_claude("test_agent", "sys", "user", client=client)

    assert result.ok, result.detail
    rows = db_session.query(AIUsageLog).filter(AIUsageLog.workspace_id == WS).all()
    assert len(rows) == 1, "an unmetered call is spend nobody can see"
    assert rows[0].agent_name == "test_agent"
    assert rows[0].tokens_in == 1000
    assert rows[0].cost_usd > 0


@pytest.mark.asyncio
async def test_the_meter_moves_with_the_call(db_session, scoped, monkeypatch):
    monkeypatch.setattr(
        "app.services.agents.base_agent.SessionLocal", lambda: db_session
    )
    before = BudgetGuard.status(db_session, WS).spent_usd
    await call_claude("test_agent", "sys", "user", client=FakeClient())
    db_session.expire_all()
    after = BudgetGuard.status(db_session, WS).spent_usd
    assert after > before


def test_concurrent_records_do_not_lose_an_increment(db_session):
    """Two calls finishing together must both count.

    A read-modify-write in Python would have each read the same starting
    value and write back its own total, silently dropping one.
    """
    for _ in range(5):
        BudgetGuard.record(db_session, WS, "a", 1_000_000, 0, 10, "m")
    db_session.expire_all()
    # 1M input tokens at $3/1M = $3.00 each.
    assert BudgetGuard.status(db_session, WS).spent_usd == pytest.approx(15.0)


# -- 2. The ceiling refuses -------------------------------------------------


def test_over_ceiling_raises_rather_than_reporting(db_session):
    BudgetGuard.get_or_create(db_session, WS)
    db_session.query(WorkspaceBudget).filter(
        WorkspaceBudget.workspace_id == WS
    ).update({"monthly_budget_usd": 10.0, "spent_usd": 10.0})
    db_session.commit()

    with pytest.raises(BudgetExceeded):
        BudgetGuard.assert_within_ceiling(db_session, WS)


def test_a_workspace_at_its_ceiling_does_not_reach_the_provider(
    db_session, scoped, monkeypatch
):
    """The refusal must happen instead of the call, not alongside it."""
    monkeypatch.setattr(
        "app.services.agents.base_agent.SessionLocal", lambda: db_session
    )
    BudgetGuard.get_or_create(db_session, WS)
    db_session.query(WorkspaceBudget).filter(
        WorkspaceBudget.workspace_id == WS
    ).update({"monthly_budget_usd": 1.0, "spent_usd": 5.0})
    db_session.commit()

    client = FakeClient()
    result = asyncio.run(call_claude("test_agent", "sys", "user", client=client))

    assert result.degraded
    assert result.reason == REASON_OVER_BUDGET
    assert client.calls == [], "the provider was called despite the refusal"


def test_enforcement_can_be_turned_off_per_workspace(db_session):
    BudgetGuard.get_or_create(db_session, WS)
    db_session.query(WorkspaceBudget).filter(
        WorkspaceBudget.workspace_id == WS
    ).update({"monthly_budget_usd": 1.0, "spent_usd": 99.0, "enforced": False})
    db_session.commit()

    state = BudgetGuard.assert_within_ceiling(db_session, WS)
    assert state.over is True, "still over - the report is unchanged"


def test_the_meter_resets_when_the_month_turns(db_session):
    row = BudgetGuard.get_or_create(db_session, WS)
    row.spent_usd = 200.0
    row.period_start = datetime.now(timezone.utc).replace(day=1) - timedelta(days=40)
    db_session.commit()

    state = BudgetGuard.status(db_session, WS)
    assert state.spent_usd == 0.0, (
        "carrying spend across the period boundary would refuse every call "
        "from the second month onward"
    )


# -- 3. The ceiling is ours, not the caller's -------------------------------


def test_a_caller_supplied_budget_is_ignored(db_session):
    """The defect this package exists to close.

    `check_budget` used to measure spend against a number in the request
    body, so any client could ask with a large budget and be told it was
    fine.
    """
    from app.services.backbone.ai_runtime import AIRuntime

    BudgetGuard.get_or_create(db_session, WS)
    db_session.query(WorkspaceBudget).filter(
        WorkspaceBudget.workspace_id == WS
    ).update({"monthly_budget_usd": 10.0, "spent_usd": 50.0})
    db_session.commit()

    report = AIRuntime.check_budget(db_session, WS, monthly_budget=1_000_000.0)

    assert report["budget"] == 10.0, "the persisted ceiling must govern"
    assert report["over_budget"] is True


def test_the_usage_log_cannot_move_the_meter(db_session):
    """The log is observability; the meter is enforcement.

    `POST /runtime/track` still lets a client add usage rows. If enforcement
    summed that log, a client could talk its own ceiling around.
    """
    from app.services.backbone.ai_runtime import AIRuntime

    BudgetGuard.get_or_create(db_session, WS)
    AIRuntime.track_usage(db_session, WS, "self_reported", 9_000_000, 9_000_000, 1, 999.0)
    db_session.expire_all()

    assert BudgetGuard.status(db_session, WS).spent_usd == 0.0


# -- 4. Degradation is typed, and streaming-safe ----------------------------


@pytest.mark.asyncio
async def test_no_api_key_yields_a_typed_degraded_signal(db_session, scoped, monkeypatch):
    monkeypatch.setattr(
        "app.services.agents.base_agent.SessionLocal", lambda: db_session
    )
    monkeypatch.setattr("app.services.agents.base_agent.settings.ANTHROPIC_API_KEY", "")

    result = await call_claude("test_agent", "sys", "user")

    assert result.degraded
    assert result.reason == REASON_NO_API_KEY
    assert result.text is None, "a degraded response must carry no content"


@pytest.mark.asyncio
async def test_a_provider_error_is_reported_not_disguised(db_session, scoped, monkeypatch):
    """The old code returned a hand-built JSON string on failure.

    Any quote in the exception message made it unparseable, and callers then
    fell through to their sample data - so a provider outage surfaced as
    confident, invented analysis.
    """
    monkeypatch.setattr(
        "app.services.agents.base_agent.SessionLocal", lambda: db_session
    )
    client = FailingClient(RuntimeError('bad "quoted" thing'))

    result = await call_claude("test_agent", "sys", "user", client=client)

    assert result.degraded
    assert 'bad "quoted" thing' in result.detail


def test_enforcement_is_two_phase_and_holds_no_transaction(
    db_session, scoped, monkeypatch
):
    """P-23 streams responses, so the guard must not wrap the call.

    The check has to complete before the first token goes out, and the
    metering has to happen after the last one - with no open transaction in
    between, or a stream would hold a row lock for its whole duration.
    """
    monkeypatch.setattr(
        "app.services.agents.base_agent.SessionLocal", lambda: db_session
    )
    order: list[str] = []

    real_assert = BudgetGuard.assert_within_ceiling
    real_record = BudgetGuard.record

    def spy_assert(*a, **kw):
        order.append("check")
        return real_assert(*a, **kw)

    def spy_record(*a, **kw):
        order.append("record")
        return real_record(*a, **kw)

    monkeypatch.setattr(BudgetGuard, "assert_within_ceiling", staticmethod(spy_assert))
    monkeypatch.setattr(BudgetGuard, "record", staticmethod(spy_record))

    class Recording(FakeClient):
        async def _noop(self):
            pass

    client = FakeClient()
    original_create = client.messages.create

    async def create(**kwargs):
        order.append("call")
        return await original_create(**kwargs)

    client.messages.create = create

    asyncio.run(call_claude("test_agent", "sys", "user", client=client))

    assert order == ["check", "call", "record"]


@pytest.mark.asyncio
async def test_a_call_with_no_workspace_is_not_refused(db_session, monkeypatch):
    """A missing scope is an auth bug, not a payment problem.

    Refusing here would report "over budget" for what is actually an
    unauthenticated path, and send whoever debugs it to the wrong place.
    """
    monkeypatch.setattr(
        "app.services.agents.base_agent.SessionLocal", lambda: db_session
    )
    result = await call_claude("test_agent", "sys", "user", client=FakeClient())
    assert result.ok


@pytest.mark.asyncio
async def test_an_unreadable_meter_refuses_rather_than_spending(scoped, monkeypatch):
    """The choice the card asked to be made explicit.

    A bug here either blocks all AI or removes the ceiling. Removing the
    ceiling is worse: it spends real money, with no record, for as long as
    the fault lasts - and it does so precisely when the thing that would
    have noticed is broken. So an unreachable meter is a refusal.
    """

    class Unreachable:
        def close(self):
            pass

        def query(self, *a, **kw):
            raise RuntimeError("database is gone")

    monkeypatch.setattr(
        "app.services.agents.base_agent.SessionLocal", lambda: Unreachable()
    )
    client = FakeClient()

    result = await call_claude("test_agent", "sys", "user", client=client)

    assert result.degraded
    assert result.reason == REASON_BUDGET_UNAVAILABLE
    assert client.calls == [], "spend must not proceed past a broken ceiling"
