"""Tests for the AI Explainability service."""
from datetime import datetime, timezone, timedelta

from app.services.backbone.ai_explainability import AIExplainability


class TestGenerateReport:
    def test_report_has_required_fields(self):
        report = AIExplainability.generate_report(
            agent_name="PricingAgent",
            input_data={"client_risk_profile": "aggressive", "market_conditions": "bullish"},
            output_data={"recommended_retainer": 50000},
            sources_used=[
                {
                    "name": "Market Report Q1",
                    "claim": "HNW retainers up 12% YoY",
                    "tier": "primary",
                    "date": (datetime.now(timezone.utc) - timedelta(days=15)).isoformat(),
                }
            ],
        )

        assert report["agent"] == "PricingAgent"
        assert "timestamp" in report
        assert isinstance(report["evidence_chain"], list)
        assert len(report["evidence_chain"]) == 1
        assert isinstance(report["confidence_score"], float)
        assert 0.0 <= report["confidence_score"] <= 1.0
        assert isinstance(report["assumptions"], list)
        assert isinstance(report["source_freshness"], list)
        assert isinstance(report["recommendation_basis"], str)

    def test_evidence_chain_structure(self):
        report = AIExplainability.generate_report(
            agent_name="TestAgent",
            input_data={},
            output_data={},
            sources_used=[
                {"name": "Source A", "claim": "Claim A", "tier": "primary", "date": datetime.now(timezone.utc).isoformat()},
                {"name": "Source B", "claim": "Claim B", "tier": "tertiary"},
            ],
        )

        for entry in report["evidence_chain"]:
            assert "source" in entry
            assert "claim" in entry
            assert "credibility" in entry
            assert "freshness" in entry

    def test_no_sources_yields_zero_confidence(self):
        report = AIExplainability.generate_report(
            agent_name="TestAgent",
            input_data={},
            output_data={},
            sources_used=[],
        )
        assert report["confidence_score"] == 0.0

    def test_missing_inputs_create_assumptions(self):
        report = AIExplainability.generate_report(
            agent_name="TestAgent",
            input_data={},  # Missing risk_profile and market_conditions
            output_data={},
            sources_used=[],
        )
        assumption_texts = [a["assumption"] for a in report["assumptions"]]
        assert any("risk profile" in a.lower() for a in assumption_texts)
        assert any("market conditions" in a.lower() for a in assumption_texts)

    def test_assumptions_have_impact(self):
        report = AIExplainability.generate_report(
            agent_name="TestAgent",
            input_data={},
            output_data={},
            sources_used=[],
        )
        for assumption in report["assumptions"]:
            assert "assumption" in assumption
            assert "impact_if_wrong" in assumption

    def test_source_freshness_structure(self):
        report = AIExplainability.generate_report(
            agent_name="TestAgent",
            input_data={},
            output_data={},
            sources_used=[
                {"name": "Recent", "claim": "X", "tier": "primary", "date": datetime.now(timezone.utc).isoformat()},
            ],
        )
        for sf in report["source_freshness"]:
            assert "source" in sf
            assert "age_days" in sf
            assert "decay_applied" in sf

    def test_high_credibility_fresh_source_yields_high_confidence(self):
        report = AIExplainability.generate_report(
            agent_name="TestAgent",
            input_data={"client_risk_profile": "mod", "market_conditions": "stable"},
            output_data={},
            sources_used=[
                {"name": "A", "claim": "X", "tier": "primary", "date": datetime.now(timezone.utc).isoformat()},
                {"name": "B", "claim": "Y", "tier": "primary", "date": datetime.now(timezone.utc).isoformat()},
            ],
        )
        assert report["confidence_score"] > 0.8
