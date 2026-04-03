"""Tests for OfferFeasibility — margin calculation, complexity, liability."""
import pytest

from app.services.backbone.offer_feasibility import OfferFeasibility

feas = OfferFeasibility()


class TestSimulateMargins:
    def test_standard_calculation(self):
        """price=20000, costs={staff:8000, tools:2000, overhead:3000}, volume=10"""
        result = feas.simulate_margins(
            monthly_price=20000,
            costs={"staff": 8000, "tools": 2000, "overhead": 3000},
            volume=10,
        )

        # monthly_revenue = 20000 * 10 = 200000
        assert result["monthly_revenue"] == 200000.0

        # monthly_costs = (8000+2000+3000) * 10 = 130000
        assert result["monthly_costs"] == 130000.0

        # gross_margin = (200000-130000)/200000 = 35%
        assert result["gross_margin_pct"] == 35.0

        # net: overhead = 200000 * 0.15 = 30000; net_profit = 70000 - 30000 = 40000
        # net_margin = 40000/200000 = 20%
        assert result["net_margin_pct"] == 20.0

        # annual_profit = 40000 * 12 = 480000
        assert result["annual_profit"] == 480000.0

        # breakeven: margin_per_client = 20000 - 13000 = 7000; overhead=30000; ceil(30000/7000)=5
        assert result["breakeven_clients"] == 5

    def test_zero_volume(self):
        result = feas.simulate_margins(20000, {"staff": 5000}, 0)
        assert result["monthly_revenue"] == 0.0
        assert result["gross_margin_pct"] == 0.0

    def test_high_margin(self):
        result = feas.simulate_margins(50000, {"tools": 2000}, 5)
        assert result["gross_margin_pct"] > 80


class TestScoreComplexity:
    def test_solo_base(self):
        assert feas.score_complexity("Solo", 0) == 2.0

    def test_team_with_services(self):
        # Team base=4, + 0.5*4 = 6.0
        assert feas.score_complexity("Team", 4) == 6.0

    def test_orchestrated_high_services(self):
        # Orchestrated base=6, + 0.5*8 = 10.0
        assert feas.score_complexity("Orchestrated", 8) == 10.0

    def test_capped_at_10(self):
        # Orchestrated base=6, + 0.5*20 = 16 → capped at 10
        assert feas.score_complexity("Orchestrated", 20) == 10.0

    def test_tech_assisted(self):
        assert feas.score_complexity("TechAssisted", 2) == 4.0


class TestAssessLiability:
    def test_medical_high_risk(self):
        result = feas.assess_liability("Medical", "High")
        assert result["overall_risk"] == "high"
        assert result["insurance_recommended"] is True
        assert len(result["licensing_required"]) > 0

    def test_lifestyle_low_risk(self):
        result = feas.assess_liability("Lifestyle", "None")
        assert result["overall_risk"] == "low"

    def test_security_escalates_from_low(self):
        result = feas.assess_liability("Security", "Low")
        # Security is inherently risky, so "low" gets bumped to "medium"
        assert result["overall_risk"] == "medium"
