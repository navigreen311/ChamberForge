"""Tests for ProofAI - the ROI numbers are real or absent, never invented.

Rewritten by P-04. The previous tests constructed the agent with no client
and then asserted it returned five or more KPIs, a populated
`value_delivered` list, and `roi_multiple > 0`.

Every one of those figures came from `_mock_roi_framework`, a constant. So
the suite's strongest assertion about this agent - that it produces a
positive ROI multiple - was true of an agent that had performed no analysis
at all, for any offer, including an empty one. That is the exact number an
advisor puts in front of a client.
"""
import json

import pytest

from app.services.agents.base_agent import AgentResponse, is_degraded
from app.services.agents.proof_ai import ProofAI

SAMPLE_OFFER = {
    "name": "Family Office CFO Services",
    "delivery_model": "done_for_you",
    "pricing_model": {"monthly_fee": 25000},
}


@pytest.fixture(autouse=True)
def _no_api_key(monkeypatch):
    monkeypatch.setattr("app.services.agents.base_agent.settings.ANTHROPIC_API_KEY", "")


@pytest.fixture
def ai():
    return ProofAI()


def _client(payload):
    """A stand-in provider client that returns *payload* as JSON."""

    class _Msgs:
        async def create(self, **kw):
            r = type("R", (), {})()
            r.content = [type("B", (), {"text": json.dumps(payload)})()]
            r.usage = type("U", (), {"input_tokens": 1, "output_tokens": 1})()
            return r

    return type("C", (), {"messages": _Msgs()})()


# -- Unconfigured: nothing is invented --------------------------------------


@pytest.mark.asyncio
async def test_kpi_stack_is_empty_rather_than_generated(ai):
    result = await ai.design_kpi_stack(SAMPLE_OFFER)
    assert result == [], "five invented KPIs read exactly like five measured ones"


@pytest.mark.asyncio
async def test_roi_framework_reports_no_figures(ai):
    result = await ai.generate_roi_framework(SAMPLE_OFFER)

    assert is_degraded(result)
    for field in ("value_delivered", "total_estimated_roi", "roi_multiple", "payback_period_months"):
        assert field not in result


@pytest.mark.asyncio
async def test_case_study_template_degrades(ai):
    result = await ai.build_case_study_template(SAMPLE_OFFER)

    assert is_degraded(result)
    assert result["degraded_reason"] == "no_api_key"


# -- Configured: the model's answer is returned unchanged -------------------


@pytest.mark.asyncio
async def test_kpi_stack_returns_what_the_model_produced(ai):
    kpis = [
        {
            "kpi_name": "Response time",
            "measurement_method": "ticket log",
            "target": "15 min",
            "frequency": "weekly",
            "data_source": "helpdesk",
        }
    ]
    ai._client = _client(kpis)

    result = await ai.design_kpi_stack(SAMPLE_OFFER)

    assert result == kpis


@pytest.mark.asyncio
async def test_roi_framework_returns_what_the_model_produced(ai):
    framework = {
        "value_delivered": [
            {
                "category": "time",
                "metric": "hours saved",
                "baseline": 10,
                "target": 40,
                "monetary_value": 120000,
            }
        ],
        "total_estimated_roi": 120000,
        "roi_multiple": 2.4,
        "payback_period_months": 5,
    }
    ai._client = _client(framework)

    result = await ai.generate_roi_framework(SAMPLE_OFFER)

    assert result["roi_multiple"] == 2.4
    assert not is_degraded(result)


@pytest.mark.asyncio
async def test_an_unparseable_answer_is_not_a_framework(ai):
    """A model that replies in prose must not become a numeric result."""

    class _Msgs:
        async def create(self, **kw):
            r = type("R", (), {})()
            r.content = [type("B", (), {"text": "I need more information."})()]
            r.usage = type("U", (), {"input_tokens": 1, "output_tokens": 1})()
            return r

    ai._client = type("C", (), {"messages": _Msgs()})()

    result = await ai.generate_roi_framework(SAMPLE_OFFER)

    assert is_degraded(result)
    assert result["degraded_reason"] == "unparseable_response"


def test_agent_response_ok_requires_content():
    assert not AgentResponse(degraded=True, reason="no_api_key").ok
