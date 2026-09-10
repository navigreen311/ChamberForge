"""Tests for PricingAI service."""
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.agents.base_agent import is_degraded
from app.services.agents.pricing_ai import PricingAI


class TestSimulateMargins:
    """Test pure-math margin simulation."""

    @pytest.fixture
    def ai(self):
        with patch("app.services.agents.pricing_ai.settings") as mock_settings:
            mock_settings.ANTHROPIC_API_KEY = ""
            mock_settings.AI_MODEL = "claude-sonnet-4-6"
            return PricingAI()

    def test_basic_simulation(self, ai):
        result = ai.simulate_margins(
            monthly_price=25000,
            setup_fee=5000,
            costs={"staff": 10000, "tools": 3000, "overhead": 2000},
        )
        # Monthly revenue = 25000
        assert result["monthly_revenue"] == 25000
        # Monthly costs = 10000 + 3000 + 2000 = 15000
        assert result["monthly_costs"] == 15000
        # Gross margin = (25000 - 15000) / 25000 * 100 = 40%
        assert result["gross_margin_pct"] == 40.0
        # Net costs = 15000 * 1.15 = 17250
        # Net margin = (25000 - 17250) / 25000 * 100 = 31%
        assert result["net_margin_pct"] == 31.0
        # Annual revenue = 25000 * 12 + 5000 = 305000
        assert result["annual_revenue"] == 305000
        # Annual profit = (25000 - 17250) * 12 + 5000 = 98000
        assert result["annual_profit"] == 98000
        # Breakeven = 5000 / (25000 - 15000) = 0.5 months
        assert result["breakeven_months"] == 0.5

    def test_zero_revenue(self, ai):
        result = ai.simulate_margins(
            monthly_price=0, setup_fee=0, costs={"staff": 5000}
        )
        assert result["monthly_revenue"] == 0
        assert result["gross_margin_pct"] == 0.0
        assert result["net_margin_pct"] == 0.0

    def test_no_costs(self, ai):
        result = ai.simulate_margins(
            monthly_price=10000, setup_fee=0, costs={}
        )
        assert result["monthly_costs"] == 0
        assert result["gross_margin_pct"] == 100.0
        assert result["breakeven_months"] == 0.0


class TestMarketBenchmarks:
    """Test hardcoded market benchmarks."""

    @pytest.fixture
    def ai(self):
        with patch("app.services.agents.pricing_ai.settings") as mock_settings:
            mock_settings.ANTHROPIC_API_KEY = ""
            mock_settings.AI_MODEL = "claude-sonnet-4-6"
            return PricingAI()

    @pytest.mark.parametrize(
        "category",
        ["coordination", "security", "privacy", "governance", "medical", "travel"],
    )
    def test_each_category_returns_data(self, ai, category):
        result = ai.get_market_benchmarks(category)
        assert len(result) > 0
        for benchmark in result:
            assert "service" in benchmark
            assert "low" in benchmark
            assert "high" in benchmark
            assert "unit" in benchmark
            assert benchmark["low"] <= benchmark["high"]

    def test_unknown_category_returns_empty(self, ai):
        result = ai.get_market_benchmarks("nonexistent")
        assert result == []


class TestGeneratePricingUnconfigured:
    """P-04: no API key means no price, not a plausible one.

    This asserted that an unconfigured agent still returned a
    recommended monthly fee, a setup fee, anchors and a packaging
    ladder. They came from SAMPLE_PRICING - $15k / $25k / $40k tiers,
    the same for every offer, and nothing marked them as invented.
    """

    @pytest.fixture
    def ai(self, monkeypatch):
        monkeypatch.setattr(
            "app.services.agents.base_agent.settings.ANTHROPIC_API_KEY", ""
        )
        return PricingAI()

    @pytest.mark.asyncio
    async def test_no_price_is_invented(self, ai):
        result = await ai.generate_pricing({"name": "Test Offer"})

        assert is_degraded(result)
        assert result["degraded_reason"] == "no_api_key"

    @pytest.mark.asyncio
    async def test_no_packaging_ladder_is_invented(self, ai):
        result = await ai.generate_pricing({"name": "Test Offer"})

        for field in ("recommended_monthly", "setup_fee", "anchors", "packaging_options"):
            assert field not in result

    @pytest.mark.asyncio
    async def test_configured_returns_the_model_answer(self, ai):
        payload = {
            "recommended_monthly": 18000,
            "setup_fee": 4000,
            "pricing_model": "retainer",
            "anchors": [],
            "packaging_options": [],
        }
        message = MagicMock()
        message.content = [MagicMock(text=json.dumps(payload))]
        message.usage = MagicMock(input_tokens=10, output_tokens=5)
        ai.client = AsyncMock()
        ai.client.messages.create = AsyncMock(return_value=message)

        result = await ai.generate_pricing({"name": "Test Offer"})

        assert result["recommended_monthly"] == 18000
        assert not is_degraded(result)
