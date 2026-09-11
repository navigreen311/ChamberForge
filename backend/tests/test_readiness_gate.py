"""Readiness is a gate on activation, not advice a founder can read past.

P-14 (T-019). `FounderReadiness.assess` computed a score and handed it back.
Nothing consulted it, nothing stored it, and `PlaybookEngine.activate_to_offer`
- the step that turns an internal playbook into a **client-facing offer** -
never asked. A founder could be told "not_ready" and activate anyway, in the
same session.

Two properties make it a gate rather than a report:

  1. **activation consults it**, in the engine rather than in one route, so a
     second caller cannot bypass what the first checks;
  2. **the gate reads a recorded assessment**, not one the caller supplies -
     otherwise clearing it is a matter of passing better inputs at activation
     time than at assessment time, which is the same defect P-13 removed from
     risk-review approvals.
"""
from __future__ import annotations

import uuid

import pytest

from app.core.exceptions import ConflictError
from app.db.scope import OperatorScope, reset_scope, set_scope
from app.services.backbone.founder_readiness import (
    READY_THRESHOLD,
    REASON_BELOW_THRESHOLD,
    REASON_NO_ASSESSMENT,
    FounderReadiness,
)
from app.services.backbone.playbook_engine import PlaybookEngine

#: A real UUID: `PlaybookActivation.workspace_id` is a GUID column, and a
#: non-UUID workspace fails the engine's ownership check before the gate is
#: ever reached - which would make the refusal tests pass for the wrong reason.
WS = "3f7a1c5e-9b2d-4e8a-1f6c-5d4b3a2e1f09"

#: The real domains from `_SKILL_DOMAINS`. Guessing them scored 67.5 - just
#: under the 70 threshold - which is a reminder that a fixture built from
#: assumed field names tests the assumption, not the code.
_DOMAINS = (
    "domain_expertise",
    "sales_ability",
    "operations",
    "client_management",
    "marketing",
    "financial_literacy",
    "leadership",
    "technology",
)

READY_INPUTS = {
    "skills": {d: 10 for d in _DOMAINS},
    "credentials": [
        "professional_certification",
        "industry_license",
        "advanced_degree",
        "nda_template",
        "insurance_coverage",
        "business_entity",
    ],
    "network_score": 95,
}

NOT_READY_INPUTS = {
    "skills": {"sales": 1},
    "credentials": [],
    "network_score": 5,
}


@pytest.fixture
def scoped():
    token = set_scope(OperatorScope(workspace_id=WS, user_id="u1"))
    yield WS
    reset_scope(token)


@pytest.fixture
def ready_activation(db_session):
    """A real activation in this workspace, so the gate is actually reached.

    The gate runs after the lookup, so a nonexistent id short-circuits to
    None and never exercises it. Testing the refusal needs a record that
    would otherwise convert.
    """
    from app.models.playbook import Playbook
    from app.models.playbook_activation import PlaybookActivation

    playbook = Playbook(
        id=uuid.uuid4(),
        slug=f"pb-{uuid.uuid4().hex[:8]}",
        name="Estate Coordination",
        target_buyer="uhnw",
        price_range_min=10000.0,
        price_range_max=30000.0,
        core_pain="coordination",
        icp={},
        pain_triggers=[],
    )
    db_session.add(playbook)
    db_session.flush()

    activation = PlaybookActivation(
        id=uuid.uuid4(),
        workspace_id=uuid.UUID(WS),
        playbook_id=playbook.id,
        customizations={},
        progress={},
        status="active",
    )
    db_session.add(activation)
    db_session.commit()
    return activation.id


# ---------------------------------------------------------------------------
# 1. The gate can say no
# ---------------------------------------------------------------------------


def test_no_assessment_on_record_is_a_refusal(db_session, scoped):
    """Not a pass.

    Activation produces a client-facing offer. A workspace that has never
    been assessed has not demonstrated readiness, and defaulting to allow
    would make the gate decorative.
    """
    decision = FounderReadiness.gate(db_session, WS)

    assert decision.allowed is False
    assert decision.reason == REASON_NO_ASSESSMENT
    assert "before activating" in decision.detail


def test_a_low_assessment_refuses_and_says_why(db_session, scoped):
    FounderReadiness.assess(**NOT_READY_INPUTS, db=db_session, workspace_id=WS)

    decision = FounderReadiness.gate(db_session, WS)

    assert decision.allowed is False
    assert decision.reason == REASON_BELOW_THRESHOLD
    assert decision.score is not None and decision.score < READY_THRESHOLD
    assert decision.recommendations, "a refusal must say what would fix it"


def test_a_strong_assessment_clears_the_gate(db_session, scoped):
    result = FounderReadiness.assess(**READY_INPUTS, db=db_session, workspace_id=WS)
    assert result["readiness_level"] == "ready"

    decision = FounderReadiness.gate(db_session, WS)

    assert decision.allowed is True
    assert decision.score >= READY_THRESHOLD


def test_the_gate_uses_the_same_threshold_as_the_report(db_session, scoped):
    """One boundary, not two.

    A gate with a quieter threshold than the score it reports would tell a
    founder they are ready and then refuse them, or the reverse.
    """
    result = FounderReadiness.assess(**READY_INPUTS, db=db_session, workspace_id=WS)

    assert (result["overall_score"] >= READY_THRESHOLD) == (
        result["readiness_level"] == "ready"
    )


# ---------------------------------------------------------------------------
# 2. The gate reads a record, not an argument
# ---------------------------------------------------------------------------


def test_an_assessment_is_recorded(db_session, scoped):
    """Without this the gate has nothing to read and refuses forever."""
    from app.services.backbone.scoring_store import get_scores

    FounderReadiness.assess(**READY_INPUTS, db=db_session, workspace_id=WS)

    rows = get_scores(db_session, subject_type="workspace", scorer="founder_readiness")
    assert len(rows) == 1
    assert rows[0].verdict == "ready"
    assert rows[0].inputs["network_score"] == 95


def test_the_gate_reads_the_most_recent_assessment(db_session, scoped):
    """A founder must not clear the gate with a stale strong score."""
    FounderReadiness.assess(**READY_INPUTS, db=db_session, workspace_id=WS)
    assert FounderReadiness.gate(db_session, WS).allowed is True

    FounderReadiness.assess(**NOT_READY_INPUTS, db=db_session, workspace_id=WS)

    assert FounderReadiness.gate(db_session, WS).allowed is False


def test_the_gate_is_scoped_to_its_workspace(db_session):
    """One firm's readiness must not unlock another's activation."""
    token = set_scope(OperatorScope(workspace_id=WS, user_id="u1"))
    try:
        FounderReadiness.assess(**READY_INPUTS, db=db_session, workspace_id=WS)
    finally:
        reset_scope(token)

    token = set_scope(OperatorScope(workspace_id="ws-other", user_id="u2"))
    try:
        decision = FounderReadiness.gate(db_session, "ws-other")
    finally:
        reset_scope(token)

    assert decision.allowed is False
    assert decision.reason == REASON_NO_ASSESSMENT


# ---------------------------------------------------------------------------
# 3. Activation cannot bypass it
# ---------------------------------------------------------------------------


def test_activation_refuses_when_the_gate_refuses(db_session, scoped, ready_activation):
    """409, and no offer.

    Returning None would be indistinguishable from "activation not found",
    and an operator told their activation does not exist goes looking in
    entirely the wrong place.
    """
    from app.models.offer import Offer

    before = db_session.query(Offer).count()

    with pytest.raises(ConflictError) as exc:
        PlaybookEngine.activate_to_offer(db_session, WS, ready_activation)

    assert exc.value.status_code == 409
    assert db_session.query(Offer).count() == before, (
        "a refused activation created an offer"
    )


def test_a_missing_activation_is_still_not_found(db_session, scoped):
    """The gate runs *after* the lookup, deliberately.

    Gating first would answer "you are not ready" for an activation that
    does not exist, sending an operator to fix the wrong problem. There is
    nothing to protect by the other ordering: the caller is already
    authenticated to this workspace, and readiness is a property of the
    workspace rather than of the activation.
    """
    assert PlaybookEngine.activate_to_offer(db_session, WS, uuid.uuid4()) is None


def test_a_ready_workspace_gets_past_the_gate(db_session, scoped, ready_activation):
    """The gate must let a ready founder through.

    Otherwise "it refuses everything" would pass every test above and still
    be a broken feature.
    """
    FounderReadiness.assess(**READY_INPUTS, db=db_session, workspace_id=WS)

    # No ConflictError: reaching the conversion at all proves the gate
    # allowed it.
    PlaybookEngine.activate_to_offer(db_session, WS, ready_activation)


def test_the_gate_lives_in_the_engine_not_the_route():
    """A check in one caller is bypassed by the next one.

    `playbooks.py` belongs to P-17. If the gate lived there, P-17 or any new
    caller could drop it without this package noticing - which is how
    readiness came to be advisory in the first place.
    """
    import inspect

    source = inspect.getsource(PlaybookEngine.activate_to_offer)

    assert "FounderReadiness.gate" in source
