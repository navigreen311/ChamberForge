"""Four scoring services keep a record, so a past decision can be explained.

P-09 (T-039). `red_team_auditor`, `client_health`, `decision_room` and
`guardrails_engine` each computed a verdict, returned it to the caller, and
kept nothing. *"Why was this offer approved in March"* had no answer.

Each now writes a `scoring_results` row carrying its **inputs** alongside the
score. That distinction is the point of the package: a stored verdict without
its inputs lets you recite a past decision but not explain it, and the offer
or client will have changed by the time anybody asks.

The last section covers `client_health.get_health_trend`, which was not a
missing record but an invented one - a six-month health history for a named
client, derived from an md5 of their id.
"""
from __future__ import annotations

import pytest

from app.db.scope import OperatorScope, reset_scope, set_scope
from app.models.scoring_result import ScoringResult
from app.services.backbone.client_health import ClientHealth
from app.services.backbone.decision_room import DecisionRoom
from app.services.backbone.guardrails_engine import GuardrailsEngine
from app.services.backbone.red_team_auditor import RedTeamAuditor
from app.services.backbone.scoring_store import (
    SCORER_CLIENT_HEALTH,
    SCORER_DECISION_ROOM,
    SCORER_GUARDRAILS,
    SCORER_RED_TEAM,
    get_scores,
    record_score,
)

WS_A = "ws-alpha"
WS_B = "ws-beta"

OFFER = {
    "id": "offer-1",
    "name": "Estate Coordination",
    "description": "Coordination for UHNW families",
    "services": ["coordination"],
    "pricing": {"monthly": 25000},
    "delivery_model": "retainer",
}


@pytest.fixture
def scoped():
    token = set_scope(OperatorScope(workspace_id=WS_A, user_id="u1"))
    yield WS_A
    reset_scope(token)


def _rows(db, scorer=None):
    return (
        db.query(ScoringResult)
        .filter(ScoringResult.workspace_id == WS_A)
        .filter(ScoringResult.scorer == scorer if scorer else True)
        .all()
    )


# -- 1. Each of the four writes a retrievable record ------------------------


def test_red_team_audit_is_recorded_with_its_inputs(db_session, scoped):
    result = RedTeamAuditor.audit_offer(OFFER, db=db_session)

    rows = _rows(db_session, SCORER_RED_TEAM)
    assert len(rows) == 1
    row = rows[0]
    assert row.subject_type == "offer"
    assert row.subject_id == "offer-1"
    assert row.score == result["score"]
    assert row.verdict == result["overall_status"]
    # The offer as audited, not as it stands today.
    assert row.inputs["name"] == "Estate Coordination"
    assert row.detail["dimensions"]


def test_guardrails_verdict_is_recorded(db_session, scoped):
    result = GuardrailsEngine.check_offer(OFFER, db=db_session)

    rows = _rows(db_session, SCORER_GUARDRAILS)
    assert len(rows) == 1
    assert rows[0].verdict == result["overall_status"]
    assert rows[0].detail["rules"]


def test_a_guardrails_block_is_recorded(db_session, scoped):
    """A BLOCK that was later overridden is exactly what needs a record."""
    blocked = {**OFFER, "positioning": "we act as your attorney"}

    result = GuardrailsEngine.check_offer(blocked, db=db_session)

    assert result["overall_status"] == "BLOCK"
    assert _rows(db_session, SCORER_GUARDRAILS)[0].verdict == "BLOCK"


def test_client_health_score_is_recorded_with_its_four_inputs(db_session, scoped):
    """A score of 41 is not actionable; which dimension moved is."""
    score = ClientHealth.calculate_health_score(
        engagement=0.4,
        satisfaction=0.3,
        usage=0.5,
        payment=0.6,
        client_id="client-1",
        db=db_session,
    )

    rows = _rows(db_session, SCORER_CLIENT_HEALTH)
    assert len(rows) == 1
    assert rows[0].score == score
    assert rows[0].inputs == {
        "engagement": 0.4,
        "satisfaction": 0.3,
        "usage": 0.5,
        "payment": 0.6,
    }


def test_a_health_score_without_a_client_is_not_recorded(db_session, scoped):
    """The function is also used as a pure calculator.

    Recording those would fill the table with rows that belong to nobody.
    """
    ClientHealth.calculate_health_score(0.4, 0.3, 0.5, 0.6, db=db_session)

    assert _rows(db_session, SCORER_CLIENT_HEALTH) == []


def test_an_approval_decision_is_recorded(db_session, scoped):
    room = DecisionRoom()
    deal = room.create_deal("Acme mandate", required_approvals=1)
    room.add_stakeholder(deal["id"], "Jordan Ellis", "CFO")
    stakeholder_id = deal["stakeholders"][0]["id"]

    room.update_approval(
        deal["id"],
        stakeholder_id,
        "approved",
        notes="Fee structure acceptable",
        db=db_session,
    )

    rows = _rows(db_session, SCORER_DECISION_ROOM)
    assert len(rows) == 1
    assert rows[0].verdict == "approved"
    assert rows[0].inputs["stakeholder_name"] == "Jordan Ellis"
    assert rows[0].inputs["notes"] == "Fee structure acceptable"
    assert rows[0].detail["deal_status"] == "approved"


# -- 2. Records are scoped, and retrievable ---------------------------------


def test_scores_are_scoped_to_their_workspace(db_session):
    token = set_scope(OperatorScope(workspace_id=WS_A, user_id="u1"))
    try:
        RedTeamAuditor.audit_offer(OFFER, db=db_session)
    finally:
        reset_scope(token)

    token = set_scope(OperatorScope(workspace_id=WS_B, user_id="u2"))
    try:
        visible = get_scores(db_session, subject_type="offer", subject_id="offer-1")
    finally:
        reset_scope(token)

    assert visible == [], "another firm's scoring history must not be readable"


def test_a_past_decision_can_be_retrieved_by_subject(db_session, scoped):
    RedTeamAuditor.audit_offer(OFFER, db=db_session)
    GuardrailsEngine.check_offer(OFFER, db=db_session)

    found = get_scores(db_session, subject_type="offer", subject_id="offer-1")

    assert {row.scorer for row in found} == {SCORER_RED_TEAM, SCORER_GUARDRAILS}


def test_retrieval_can_filter_to_one_scorer(db_session, scoped):
    RedTeamAuditor.audit_offer(OFFER, db=db_session)
    GuardrailsEngine.check_offer(OFFER, db=db_session)

    found = get_scores(db_session, subject_id="offer-1", scorer=SCORER_GUARDRAILS)

    assert len(found) == 1
    assert found[0].scorer == SCORER_GUARDRAILS


def test_an_unscoped_score_is_not_written(db_session):
    """A row no workspace can read, and the scope filter cannot reach."""
    row = record_score(
        scorer=SCORER_RED_TEAM,
        subject_type="offer",
        subject_id="offer-1",
        inputs={},
        db=db_session,
    )

    assert row is None
    assert db_session.query(ScoringResult).count() == 0


def test_scoring_does_not_fail_when_recording_does(db_session, scoped, monkeypatch):
    """A record-keeping fault must not become an outage.

    Refusing to audit an offer because a write failed would take a
    compliance check offline to protect its own log.
    """

    class Broken:
        def add(self, *a, **kw):
            raise RuntimeError("database is gone")

        def commit(self):
            raise RuntimeError("database is gone")

        def rollback(self):
            pass

        def close(self):
            pass

    result = RedTeamAuditor.audit_offer(OFFER, db=Broken())

    assert "score" in result, "the audit still has to produce its verdict"


# -- 3. The health trend was invented, not merely unrecorded ----------------


@pytest.mark.asyncio
async def test_a_client_with_no_history_has_no_trend(db_session, scoped):
    """It returned six months of scores derived from md5(client_id).

    Stable, plausible, and in the range a real score occupies - so an
    advisor reviewing whether a relationship was deteriorating was reading a
    hash digest.
    """
    trend = await ClientHealth.get_health_trend(db_session, "client-unknown")

    assert trend == []


@pytest.mark.asyncio
async def test_the_trend_reports_recorded_scores(db_session, scoped):
    for engagement in (0.8, 0.5, 0.2):
        ClientHealth.calculate_health_score(
            engagement=engagement,
            satisfaction=0.5,
            usage=0.5,
            payment=0.5,
            client_id="client-1",
            db=db_session,
        )

    trend = await ClientHealth.get_health_trend(db_session, "client-1")

    assert len(trend) == 3
    # Oldest first, so a declining relationship reads as declining.
    assert trend[0]["score"] > trend[-1]["score"]


@pytest.mark.asyncio
async def test_the_trend_is_scoped(db_session):
    token = set_scope(OperatorScope(workspace_id=WS_A, user_id="u1"))
    try:
        ClientHealth.calculate_health_score(
            0.8, 0.8, 0.8, 0.8, client_id="client-1", db=db_session
        )
    finally:
        reset_scope(token)

    token = set_scope(OperatorScope(workspace_id=WS_B, user_id="u2"))
    try:
        trend = await ClientHealth.get_health_trend(db_session, "client-1")
    finally:
        reset_scope(token)

    assert trend == []
