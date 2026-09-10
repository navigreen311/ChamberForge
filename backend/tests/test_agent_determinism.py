"""Agents behave the same way twice, and never invent analysis.

P-04 (T-018, T-034).

The sweep at the bottom is the important part of this file. Before P-04,
running any agent without an API key produced confident, specific business
analysis: an ROI multiple, a payback period, a willingness-to-pay confidence
of 0.82, five KPIs with targets, "No ethical concerns identified". All of it
constant, none of it derived from the input, and none of it marked.

For a platform used by advisors to high- and ultra-high-net-worth families,
that is not a degraded mode. It is fabricated advice in the same shape as
real advice, and the tests that existed asserted it was there - so the
defect would have survived any change that fixed it.
"""
from __future__ import annotations

import pytest

from app.services.agents.base_agent import (
    DEFAULT_TEMPERATURE,
    AgentResponse,
    as_dict,
    as_list,
    call_claude,
    is_degraded,
    parse_json,
)
from app.services.agents.command_ai import CommandAI
from app.services.agents.fulfillment_ai import FulfillmentAI
from app.services.agents.offer_ai import OfferAI
from app.services.agents.pricing_ai import PricingAI
from app.services.agents.problem_ai import ProblemAI
from app.services.agents.proof_ai import ProofAI
from app.services.agents.research_ai import ResearchAI
from app.services.agents.validator_ai import ValidatorAI

OFFER = {"name": "Estate Coordination", "target_market": "UHNW families"}
PROBLEM = {"title": "Vendor sprawl", "description": "Too many vendors", "pain_category": "Privacy"}


class _Block:
    def __init__(self, text):
        self.text = text


class _Usage:
    input_tokens = 10
    output_tokens = 5


class _Msgs:
    def __init__(self, text, calls):
        self._text = text
        self._calls = calls

    async def create(self, **kw):
        self._calls.append(kw)
        r = type("R", (), {})()
        r.content = [_Block(self._text)]
        r.usage = _Usage()
        return r


class FakeClient:
    def __init__(self, text='{"a": 1}'):
        self.calls: list[dict] = []
        self.messages = _Msgs(text, self.calls)


@pytest.fixture(autouse=True)
def _no_api_key(monkeypatch):
    """Every test here runs as an unconfigured deployment would."""
    monkeypatch.setattr("app.services.agents.base_agent.settings.ANTHROPIC_API_KEY", "")


# -- Determinism ------------------------------------------------------------


@pytest.mark.asyncio
async def test_sampling_is_pinned_not_left_to_the_provider():
    client = FakeClient()
    await call_claude("a", "sys", "user", client=client)
    assert client.calls[0]["temperature"] == DEFAULT_TEMPERATURE


@pytest.mark.asyncio
async def test_the_same_input_twice_produces_the_same_shape():
    client = FakeClient('{"score": 1, "items": []}')
    first = await call_claude("a", "sys", "user", client=client)
    second = await call_claude("a", "sys", "user", client=client)
    assert as_dict("a", first).keys() == as_dict("a", second).keys()
    assert client.calls[0] == client.calls[1], "the same input must be sent identically"


def test_a_fenced_response_is_read_not_discarded():
    """Models wrap JSON in a fence despite instructions.

    Only one agent in ten stripped fences; the rest treated a correct answer
    as a parse failure and fell through to their sample data - so the
    fabrication path was reachable even with a working API key.
    """
    fenced = "```json\n{\"ok\": true}\n```"
    assert parse_json(fenced) == {"ok": True}


def test_unparseable_output_degrades_rather_than_guessing():
    response = AgentResponse(text="I'm afraid I can't do that.")
    result = as_dict("a", response)
    assert is_degraded(result)
    assert as_list("a", response) == []


# -- The sweep: no agent fabricates when it cannot run ----------------------


def _assert_no_analysis(value, what: str):
    """A result must be degraded, empty, or an out-of-range sentinel."""
    if isinstance(value, dict):
        assert is_degraded(value), f"{what} returned an unmarked dict: {value!r}"
    elif isinstance(value, list):
        assert value == [], f"{what} returned invented rows: {value!r}"
    elif isinstance(value, str):
        assert value == "", f"{what} returned an invented classification: {value!r}"
    elif isinstance(value, float):
        assert value < 0, f"{what} returned a plausible score from no analysis: {value}"
    else:
        raise AssertionError(f"{what} returned an unexpected type: {type(value)}")


@pytest.mark.parametrize(
    "what,call",
    [
        ("CommandAI.get_next_best_action", lambda: CommandAI().get_next_best_action({})),
        ("CommandAI.synthesize_dashboard", lambda: CommandAI().synthesize_dashboard({})),
        ("CommandAI.prioritize_opportunities", lambda: CommandAI().prioritize_opportunities([])),
        ("CommandAI.generate_daily_brief", lambda: CommandAI().generate_daily_brief({})),
        ("OfferAI.generate_offer", lambda: OfferAI().generate_offer(PROBLEM)),
        ("OfferAI.refine_offer", lambda: OfferAI().refine_offer(OFFER, "cheaper")),
        ("OfferAI.generate_value_stack", lambda: OfferAI().generate_value_stack("privacy", "retainer")),
        ("PricingAI.generate_pricing", lambda: PricingAI().generate_pricing(OFFER)),
        ("ValidatorAI.validate_problem", lambda: ValidatorAI().validate_problem(PROBLEM)),
        ("ValidatorAI.score_wtp_confidence", lambda: ValidatorAI().score_wtp_confidence(PROBLEM)),
        ("ValidatorAI.detect_false_positives", lambda: ValidatorAI().detect_false_positives(PROBLEM)),
        ("ProofAI.design_kpi_stack", lambda: ProofAI().design_kpi_stack(OFFER)),
        ("ProofAI.generate_roi_framework", lambda: ProofAI().generate_roi_framework(OFFER)),
        ("ProofAI.build_case_study_template", lambda: ProofAI().build_case_study_template(OFFER)),
        ("FulfillmentAI.generate_sop_bundle", lambda: FulfillmentAI().generate_sop_bundle(OFFER)),
        ("FulfillmentAI.generate_execution_blueprint", lambda: FulfillmentAI().generate_execution_blueprint(OFFER)),
        ("ResearchAI.ingest_source", lambda: ResearchAI().ingest_source("text", "article")),
    ],
)
@pytest.mark.asyncio
async def test_no_agent_invents_analysis_without_a_key(what, call):
    _assert_no_analysis(await call(), what)


@pytest.mark.parametrize(
    "what,call",
    [
        ("ProblemAI.discover_problems", lambda: ProblemAI().discover_problems(["src"], "ws-1")),
        ("ProblemAI.score_problem", lambda: ProblemAI().score_problem(PROBLEM)),
        ("ProblemAI.classify_lifecycle", lambda: ProblemAI().classify_lifecycle(PROBLEM)),
        ("ResearchAI.detect_contradictions", lambda: ResearchAI().detect_contradictions([], [])),
    ],
)
def test_no_sync_agent_invents_analysis_without_a_key(what, call):
    _assert_no_analysis(call(), what)


@pytest.mark.asyncio
async def test_the_degraded_result_says_why():
    """A caller has to be able to act on the reason, not just the fact."""
    result = await ProofAI().generate_roi_framework(OFFER)
    assert result["degraded_reason"] == "no_api_key"
    assert result["agent"] == "proof_ai"
    assert result["data"] is None


@pytest.mark.asyncio
async def test_a_degraded_result_carries_no_numbers():
    """The specific regression: an ROI framework with figures in it.

    `_mock_roi_framework` returned monetary_value, total_estimated_roi,
    roi_multiple and payback_period_months - the exact fields an advisor
    would put in front of a client.
    """
    result = await ProofAI().generate_roi_framework(OFFER)
    for field in ("roi_multiple", "total_estimated_roi", "payback_period_months"):
        assert field not in result
