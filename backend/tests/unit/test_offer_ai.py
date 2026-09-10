"""Tests for OfferAI - a generated offer, or a marked absence of one.

Rewritten by P-04. The old `TestOfferAINoKey` asserted
`result == SAMPLE_OFFER`: a complete premium offer, with a value stack, a
guarantee framework and a recommended price band of $15,000-$30,000 a month,
returned for any problem whenever no API key was configured.

`test_refine_offer_returns_modified` was the same idea in miniature - it
asserted that "Refined" appeared in the description, which the code achieved
by appending the word. The offer was not refined. The test passed.
"""
import json
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.services.agents.base_agent import is_degraded
from app.services.agents.offer_ai import OfferAI


@pytest.fixture(autouse=True)
def _no_api_key(monkeypatch):
    monkeypatch.setattr("app.services.agents.base_agent.settings.ANTHROPIC_API_KEY", "")


def _client(payload):
    """An async provider client returning *payload* as JSON."""
    message = MagicMock()
    message.content = [MagicMock(text=json.dumps(payload))]
    message.usage = MagicMock(input_tokens=10, output_tokens=5)
    client = AsyncMock()
    client.messages.create = AsyncMock(return_value=message)
    return client


class TestOfferAIUnconfigured:
    @pytest.fixture
    def ai(self):
        return OfferAI()

    @pytest.mark.asyncio
    async def test_no_offer_is_invented(self, ai):
        result = await ai.generate_offer({"description": "test problem"})

        assert is_degraded(result)
        assert result["degraded_reason"] == "no_api_key"

    @pytest.mark.asyncio
    async def test_no_price_band_is_invented(self, ai):
        """SAMPLE_OFFER recommended $15,000-$30,000 a month for anything."""
        result = await ai.generate_offer({"description": "test problem"})

        assert "recommended_pricing" not in result
        assert "value_stack" not in result

    @pytest.mark.asyncio
    async def test_refine_reports_that_it_did_not_refine(self, ai):
        """It used to append " [Refined]" and return the offer unchanged."""
        result = await ai.refine_offer({"name": "Test", "description": "Original"}, "better")

        assert is_degraded(result)
        assert "Refined" not in json.dumps(result)

    @pytest.mark.asyncio
    async def test_value_stack_is_empty_not_sampled(self, ai):
        result = await ai.generate_value_stack("coordination", "retainer")
        assert result == []


class TestOfferAIConfigured:
    @pytest.mark.asyncio
    async def test_generate_offer_returns_the_model_answer(self):
        payload = {
            "name": "AI Offer",
            "description": "AI generated",
            "value_stack": [
                {
                    "name": "L1",
                    "description": "d",
                    "delivery_method": "retainer",
                    "estimated_hours": 10,
                }
            ],
            "delivery_model": "retainer",
            "guarantee_framework": {"type": "performance", "terms": "SLA", "conditions": []},
            "recommended_pricing": {
                "monthly_min": 10000,
                "monthly_max": 20000,
                "setup_fee": 3000,
                "model": "retainer",
            },
        }
        ai = OfferAI()
        ai.client = _client(payload)

        result = await ai.generate_offer({"description": "test"})

        assert result["name"] == "AI Offer"
        assert len(result["value_stack"]) == 1
        ai.client.messages.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_value_stack_returns_the_model_array(self):
        layers = [
            {
                "name": "Layer",
                "description": "d",
                "delivery_method": "retainer",
                "estimated_hours": 4,
            }
        ]
        ai = OfferAI()
        ai.client = _client(layers)

        result = await ai.generate_value_stack("privacy", "retainer")

        assert result == layers
