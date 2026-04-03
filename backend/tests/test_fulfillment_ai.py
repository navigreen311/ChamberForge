"""Tests for FulfillmentAI service."""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

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


@pytest.fixture
def ai():
    with patch.object(FulfillmentAI, "__init__", lambda self: setattr(self, "_client", None)):
        return FulfillmentAI()


@pytest.mark.asyncio
async def test_generate_sop_bundle_returns_required_keys(ai):
    result = await ai.generate_sop_bundle(SAMPLE_OFFER)
    assert "staffing_plan" in result
    assert "tooling_stack" in result
    assert "service_calendar" in result
    assert "delivery_risks" in result
    assert "sops" in result


@pytest.mark.asyncio
async def test_sop_bundle_staffing_plan_structure(ai):
    result = await ai.generate_sop_bundle(SAMPLE_OFFER)
    for staff in result["staffing_plan"]:
        assert "role" in staff
        assert "responsibilities" in staff
        assert "hours_per_week" in staff


@pytest.mark.asyncio
async def test_sop_bundle_sops_have_steps(ai):
    result = await ai.generate_sop_bundle(SAMPLE_OFFER)
    assert len(result["sops"]) > 0
    for sop in result["sops"]:
        assert "title" in sop
        assert "steps" in sop
        assert isinstance(sop["steps"], list)
        assert len(sop["steps"]) > 0
        assert "owner" in sop
        assert "frequency" in sop


@pytest.mark.asyncio
async def test_generate_execution_blueprint_structure(ai):
    result = await ai.generate_execution_blueprint(SAMPLE_OFFER)
    assert "role_map" in result
    assert "qa_checklist" in result
    assert isinstance(result["qa_checklist"], list)
    assert "timeline_weeks" in result
    assert isinstance(result["timeline_weeks"], int)
    assert "milestones" in result
    for ms in result["milestones"]:
        assert "week" in ms
        assert "milestone" in ms


@pytest.mark.asyncio
async def test_sop_bundle_with_claude_mock(ai):
    """Test that Claude path works when client is available."""
    import json
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text=json.dumps({
        "staffing_plan": [{"role": "Lead", "responsibilities": "Everything", "hours_per_week": 40}],
        "tooling_stack": ["Tool1"],
        "service_calendar": [{"week": 1, "deliverables": "Kickoff"}],
        "delivery_risks": [{"risk": "Delay", "probability": "low", "impact": "medium", "mitigation": "Plan ahead"}],
        "sops": [{"title": "Onboarding", "steps": ["Step 1"], "owner": "Lead", "frequency": "once"}],
    }))]

    ai._client = AsyncMock()
    ai._client.messages.create = AsyncMock(return_value=mock_response)

    result = await ai.generate_sop_bundle(SAMPLE_OFFER)
    assert result["staffing_plan"][0]["role"] == "Lead"
    assert ai._client.messages.create.called
