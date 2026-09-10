"""Tests for FulfillmentAI - an operational plan is produced or it is not.

Rewritten by P-04. The four failing tests here asserted that an agent with
`_client = None` still returned a staffing plan with roles and weekly hours,
a service calendar, delivery risks with probabilities, and SOPs with steps
and owners.

All of it came from `_mock_sop_bundle`. A firm could have staffed an
engagement from a plan nothing had analysed, and neither the caller nor the
test suite could tell.
"""
import json
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.services.agents.base_agent import is_degraded
from app.services.agents.fulfillment_ai import FulfillmentAI

SAMPLE_OFFER = {
    "name": "Family Office CFO Services",
    "delivery_model": "done_for_you",
    "value_stack": [
        {"name": "Financial oversight"},
        {"name": "Tax optimization"},
        {"name": "Vendor management"},
    ],
    "pricing_model": {"monthly_fee": 25000},
}


@pytest.fixture(autouse=True)
def _no_api_key(monkeypatch):
    monkeypatch.setattr("app.services.agents.base_agent.settings.ANTHROPIC_API_KEY", "")


@pytest.fixture
def ai():
    return FulfillmentAI()


# -- Unconfigured -----------------------------------------------------------


@pytest.mark.asyncio
async def test_sop_bundle_is_marked_not_fabricated(ai):
    result = await ai.generate_sop_bundle(SAMPLE_OFFER)

    assert is_degraded(result)
    assert result["degraded_reason"] == "no_api_key"


@pytest.mark.asyncio
async def test_no_staffing_plan_is_invented(ai):
    """A plan with named roles and hours is something a firm would act on."""
    result = await ai.generate_sop_bundle(SAMPLE_OFFER)

    assert "staffing_plan" not in result
    assert "sops" not in result


@pytest.mark.asyncio
async def test_no_timeline_is_invented(ai):
    result = await ai.generate_execution_blueprint(SAMPLE_OFFER)

    assert is_degraded(result)
    assert "timeline_weeks" not in result
    assert "milestones" not in result


# -- Configured -------------------------------------------------------------


@pytest.mark.asyncio
async def test_sop_bundle_returns_the_model_answer(ai):
    bundle = {
        "staffing_plan": [
            {"role": "Lead", "responsibilities": "Everything", "hours_per_week": 40}
        ],
        "tooling_stack": ["Tool1"],
        "service_calendar": [{"week": 1, "deliverables": "Kickoff"}],
        "delivery_risks": [
            {
                "risk": "Delay",
                "probability": "low",
                "impact": "medium",
                "mitigation": "Plan ahead",
            }
        ],
        "sops": [
            {
                "title": "Onboarding",
                "steps": ["Step 1"],
                "owner": "Lead",
                "frequency": "once",
            }
        ],
    }
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text=json.dumps(bundle))]
    mock_response.usage = MagicMock(input_tokens=10, output_tokens=5)

    ai._client = AsyncMock()
    ai._client.messages.create = AsyncMock(return_value=mock_response)

    result = await ai.generate_sop_bundle(SAMPLE_OFFER)

    assert result["staffing_plan"][0]["role"] == "Lead"
    assert not is_degraded(result)
    assert ai._client.messages.create.called


@pytest.mark.asyncio
async def test_a_provider_failure_degrades_rather_than_substituting(ai):
    """This is the path that used to reach the mock with a key configured.

    `generate_sop_bundle` caught the exception, logged "returning mock", and
    handed back the constant plan - so a provider outage produced an
    operational plan indistinguishable from a real one.
    """
    ai._client = AsyncMock()
    ai._client.messages.create = AsyncMock(side_effect=RuntimeError("provider down"))

    result = await ai.generate_sop_bundle(SAMPLE_OFFER)

    assert is_degraded(result)
    assert result["degraded_reason"] == "provider_error"
    assert "provider down" in result["degraded_detail"]
