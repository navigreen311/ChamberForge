"""Tests for PricingAI service."""
from unittest.mock import patch

import pytest

from app.services.agents.pricing_ai import PricingAI, MARKET_BENCHMARKS


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


class TestGeneratePricingNoKey:
    """Test pricing generation fallback when no API key."""

    @pytest.fixture
    def ai(self):
        with patch("app.services.agents.pricing_ai.settings") as mock_settings:
            mock_settings.ANTHROPIC_API_KEY = ""
            mock_settings.AI_MODEL = "claude-sonnet-4-6"
            return PricingAI()

    @pytest.mark.asyncio
    async def test_returns_sample_pricing(self, ai):
        result = await ai.generate_pricing({"name": "Test Offer"})
        assert "recommended_monthly" in result
        assert "setup_fee" in result
        assert "pricing_model" in result
        assert "anchors" in result
        assert "packaging_options" in result
