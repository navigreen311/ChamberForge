"""Tests for ScenarioPlanner service."""
from app.services.backbone.scenario_planner import ScenarioPlanner


class TestRunScenario:
    def test_returns_required_structure(self):
        result = ScenarioPlanner.run_scenario(5000, 20)
        assert "scenarios" in result
        assert "comparison_chart_data" in result
        assert len(result["scenarios"]) == 5

    def test_scenario_fields(self):
        result = ScenarioPlanner.run_scenario(5000, 20)
        for s in result["scenarios"]:
            assert "name" in s
            assert "revenue" in s
            assert "costs" in s
            assert "profit" in s
            assert "margin_pct" in s
            assert "staff_needed" in s

    def test_revenue_math_current_state(self):
        result = ScenarioPlanner.run_scenario(5000, 20)
        current = result["scenarios"][0]
        assert current["name"] == "Current State"
        # Revenue = price * clients * 12
        assert current["revenue"] == 5000 * 20 * 12

    def test_profit_equals_revenue_minus_costs(self):
        result = ScenarioPlanner.run_scenario(5000, 20)
        for s in result["scenarios"]:
            assert abs(s["profit"] - (s["revenue"] - s["costs"])) < 0.01

    def test_custom_adjustments(self):
        result = ScenarioPlanner.run_scenario(
            10000, 10,
            adjustments={"margin": 0.6, "staffing_cost": 100000, "scale_factor": 2.0}
        )
        assert len(result["scenarios"]) == 5
        # Scale + White Label scenario should use scale_factor=2.0
        scale_scenario = result["scenarios"][4]
        assert scale_scenario["name"] == "Scale + White Label"

    def test_chart_data_matches_scenarios(self):
        result = ScenarioPlanner.run_scenario(5000, 10)
        assert len(result["comparison_chart_data"]) == len(result["scenarios"])
        for chart, scenario in zip(
            result["comparison_chart_data"], result["scenarios"]
        ):
            assert chart["name"] == scenario["name"]
            assert chart["revenue"] == scenario["revenue"]

    def test_staff_minimum_one(self):
        result = ScenarioPlanner.run_scenario(5000, 1)
        for s in result["scenarios"]:
            assert s["staff_needed"] >= 1
