"""Tests for OfferAI service."""
import json
from unittest.mock import patch, MagicMock

import pytest

from app.services.agents.offer_ai import OfferAI, SAMPLE_OFFER, SAMPLE_VALUE_STACK


class TestOfferAINoKey:
    """Test OfferAI when no API key is configured (sample fallback)."""

    @pytest.fixture
    def ai(self):
        with patch("app.services.agents.offer_ai.settings") as mock_settings:
            mock_settings.ANTHROPIC_API_KEY = ""
            mock_settings.AI_MODEL = "claude-sonnet-4-6"
            return OfferAI()

    @pytest.mark.asyncio
    async def test_generate_offer_returns_sample(self, ai):
        result = await ai.generate_offer({"description": "test problem"})
        assert result == SAMPLE_OFFER
        assert "name" in result
        assert "description" in result
        assert "value_stack" in result
        assert isinstance(result["value_stack"], list)
        assert len(result["value_stack"]) > 0
        for layer in result["value_stack"]:
            assert "name" in layer
            assert "description" in layer
            assert "delivery_method" in layer
            assert "estimated_hours" in layer
        assert "delivery_model" in result
        assert "guarantee_framework" in result
        assert "recommended_pricing" in result

    @pytest.mark.asyncio
    async def test_refine_offer_returns_modified(self, ai):
        offer_data = {"name": "Test", "description": "Original"}
        result = await ai.refine_offer(offer_data, "Make it better")
        assert "Refined" in result["description"]

    @pytest.mark.asyncio
    async def test_generate_value_stack_returns_sample(self, ai):
        result = await ai.generate_value_stack("coordination", "retainer")
        assert result == SAMPLE_VALUE_STACK
        assert len(result) >= 4


class TestOfferAIWithKey:
    """Test OfferAI when API key is configured (mock Anthropic)."""

    @pytest.fixture
    def ai(self):
        with patch("app.services.agents.offer_ai.settings") as mock_settings:
            mock_settings.ANTHROPIC_API_KEY = "test-key"
            mock_settings.AI_MODEL = "claude-sonnet-4-6"
            with patch("app.services.agents.offer_ai.anthropic") as mock_anthropic:
                mock_client = MagicMock()
                mock_anthropic.Anthropic.return_value = mock_client
                ai = OfferAI()
                ai._mock_client = mock_client
                yield ai

    @pytest.mark.asyncio
    async def test_generate_offer_calls_api(self, ai):
        response_json = json.dumps({
            "name": "AI Offer",
            "description": "AI generated",
            "value_stack": [{"name": "L1", "description": "d", "delivery_method": "retainer", "estimated_hours": 10}],
            "delivery_model": "retainer",
            "guarantee_framework": {"type": "performance", "terms": "SLA", "conditions": []},
            "recommended_pricing": {"monthly_min": 10000, "monthly_max": 20000, "setup_fee": 3000, "model": "retainer"},
        })
        mock_msg = MagicMock()
        mock_msg.content = [MagicMock(text=response_json)]
        ai._mock_client.messages.create.return_value = mock_msg

        result = await ai.generate_offer({"description": "test"})
        assert result["name"] == "AI Offer"
        assert len(result["value_stack"]) == 1
        ai._mock_client.messages.create.assert_called_once()
