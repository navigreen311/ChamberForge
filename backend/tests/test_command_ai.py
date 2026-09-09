"""Tests for CommandAI agent — mocked Claude, field validation, sorting."""
import json
from unittest.mock import AsyncMock

import pytest

from app.services.agents.command_ai import CommandAI


@pytest.fixture
def command_ai():
    return CommandAI()


class TestGetNextBestAction:
    @pytest.mark.asyncio
    async def test_returns_required_fields_without_api(self, command_ai):
        """With no API key the agent falls back to sample data containing all required fields."""
        result = await command_ai.get_next_best_action({})
        required = {
            "action_title",
            "action_description",
            "why",
            "evidence_links",
            "confidence",
            "priority",
            "estimated_impact",
        }
        assert required.issubset(result.keys())

    @pytest.mark.asyncio
    async def test_confidence_is_float(self, command_ai):
        result = await command_ai.get_next_best_action({})
        assert isinstance(result["confidence"], float)
        assert 0 <= result["confidence"] <= 1

    @pytest.mark.asyncio
    async def test_priority_valid_value(self, command_ai):
        result = await command_ai.get_next_best_action({})
        assert result["priority"] in {"critical", "high", "medium", "low"}

    @pytest.mark.asyncio
    async def test_with_mocked_claude(self, command_ai):
        fake_response = json.dumps(
            {
                "action_title": "Test Action",
                "action_description": "Do the thing",
                "why": "Because tests",
                "evidence_links": ["/test"],
                "confidence": 0.9,
                "priority": "critical",
                "estimated_impact": "$1M",
            }
        )
        command_ai._call_claude = AsyncMock(return_value=fake_response)
        result = await command_ai.get_next_best_action({"clients": 10})
        assert result["action_title"] == "Test Action"
        assert result["confidence"] == 0.9


class TestPrioritizeOpportunities:
    @pytest.mark.asyncio
    async def test_sorted_by_weighted_score_desc(self, command_ai):
        """Even with fallback data the list must be sorted descending."""
        result = await command_ai.prioritize_opportunities(
            problems=["a", "b"], offers=["x"]
        )
        assert isinstance(result, list)
        scores = [item["weighted_score"] for item in result]
        assert scores == sorted(scores, reverse=True)

    @pytest.mark.asyncio
    async def test_each_entry_has_required_fields(self, command_ai):
        result = await command_ai.prioritize_opportunities([], [])
        required = {
            "problem_name",
            "offer_name",
            "probability",
            "impact_score",
            "weighted_score",
            "recommended_action",
        }
        for entry in result:
            assert required.issubset(entry.keys())


class TestSynthesizeDashboard:
    @pytest.mark.asyncio
    async def test_dashboard_keys(self, command_ai):
        result = await command_ai.synthesize_dashboard({})
        required = {
            "top_problems",
            "active_offers",
            "client_health_summary",
            "revenue_snapshot",
            "pending_risks",
            "urgent_actions",
        }
        assert required.issubset(result.keys())


class TestDailyBrief:
    @pytest.mark.asyncio
    async def test_daily_brief_keys(self, command_ai):
        result = await command_ai.generate_daily_brief({})
        required = {
            "date",
            "changes_since_yesterday",
            "alerts",
            "recommended_actions",
            "metrics_snapshot",
        }
        assert required.issubset(result.keys())

    @pytest.mark.asyncio
    async def test_recommended_actions_structure(self, command_ai):
        result = await command_ai.generate_daily_brief({})
        for action in result["recommended_actions"]:
            assert "action" in action
            assert "priority" in action
            assert "reason" in action


class TestAgentStatusSummary:
    def test_returns_per_agent_report(self, command_ai):
        from app.services.agents.base_agent import BaseAgent

        class FakeAgent(BaseAgent):
            async def invoke(self, input_data: dict) -> dict:
                return {}

        agents = {
            "agent_a": FakeAgent(agent_name="agent_a"),
            "agent_b": FakeAgent(agent_name="agent_b"),
        }
        summary = command_ai.get_agent_status_summary(agents)
        assert "agent_a" in summary
        assert summary["agent_a"]["status"] == "idle"
