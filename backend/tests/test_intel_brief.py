"""Tests for IntelBrief service."""
import pytest
from app.services.backbone.intel_brief import IntelBrief


class TestGenerateBrief:
    @pytest.mark.asyncio
    async def test_returns_required_fields(self):
        brief = IntelBrief()
        result = await brief.generate_brief({
            "name": "Acme Family Office",
            "wealth_tier": "UHNW",
            "entities": ["Trust A", "LLC B"],
            "jurisdictions": ["US", "UK"],
            "active_risks": ["Regulatory change"],
        })
        required_keys = {
            "client_name", "generated_at", "summary", "key_facts",
            "complexity_map", "talking_points", "proof_assets_to_bring",
            "recent_changes", "recommended_approach",
        }
        assert required_keys.issubset(set(result.keys()))

    @pytest.mark.asyncio
    async def test_complexity_map_structure(self):
        brief = IntelBrief()
        result = await brief.generate_brief({
            "name": "Test Client",
            "wealth_tier": "HNW",
            "entities": ["Corp A"],
            "jurisdictions": ["US"],
            "active_risks": [],
        })
        cm = result["complexity_map"]
        assert "wealth_tier" in cm
        assert "entities_count" in cm
        assert "jurisdictions" in cm
        assert "active_risks" in cm

    @pytest.mark.asyncio
    async def test_client_name_preserved(self):
        brief = IntelBrief()
        result = await brief.generate_brief({"name": "John Doe"})
        assert result["client_name"] == "John Doe"

    @pytest.mark.asyncio
    async def test_key_facts_is_list(self):
        brief = IntelBrief()
        result = await brief.generate_brief({"name": "Test"})
        assert isinstance(result["key_facts"], list)
        assert len(result["key_facts"]) > 0

    @pytest.mark.asyncio
    async def test_recommended_approach_based_on_health(self):
        brief = IntelBrief()
        # Low health client
        result = await brief.generate_brief({
            "name": "At Risk Client",
            "health_score": 40,
        })
        assert "recovery" in result["recommended_approach"].lower()

    @pytest.mark.asyncio
    async def test_meeting_context_in_talking_points(self):
        brief = IntelBrief()
        result = await brief.generate_brief(
            {"name": "Test"},
            meeting_context="Annual review"
        )
        has_context = any("Annual review" in tp for tp in result["talking_points"])
        assert has_context
