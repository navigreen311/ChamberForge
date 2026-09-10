"""Tests for CommandAI - a real answer when it can call, a marked one when it cannot.

Rewritten by P-04. What was here asserted the defect: every "without api"
test checked that an unconfigured agent still returned a full set of
strategy fields, and one docstring said so outright - "With no API key the
agent falls back to sample data containing all required fields."

Those tests passed because the agent invented an action title, a confidence
of 0.85 and an estimated impact of "$450K in pipeline recovery". They would
have failed the moment anyone stopped it doing that, which is the definition
of a test pinning a bug in place.

The contract now: a configured agent parses and returns the model's JSON; an
unconfigured one returns a marked degraded result and no analysis.
"""
import json

import pytest

from app.services.agents.base_agent import AgentResponse, is_degraded
from app.services.agents.command_ai import CommandAI


@pytest.fixture
def command_ai():
    return CommandAI()


@pytest.fixture(autouse=True)
def _no_api_key(monkeypatch):
    monkeypatch.setattr("app.services.agents.base_agent.settings.ANTHROPIC_API_KEY", "")


def _answers(payload):
    """A stand-in for the governed call path that returns *payload*."""

    async def _call(system, user, **kw):
        return AgentResponse(text=json.dumps(payload))

    return _call


class TestGetNextBestAction:
    @pytest.mark.asyncio
    async def test_unconfigured_returns_a_marked_result_not_a_recommendation(
        self, command_ai
    ):
        result = await command_ai.get_next_best_action({})

        assert is_degraded(result)
        assert result["degraded_reason"] == "no_api_key"
        assert "action_title" not in result, "an invented action is worse than none"
        assert command_ai.get_status() == "degraded"

    @pytest.mark.asyncio
    async def test_no_confidence_score_is_invented(self, command_ai):
        """0.85 was returned for every workspace, including an empty one."""
        result = await command_ai.get_next_best_action({})
        assert "confidence" not in result

    @pytest.mark.asyncio
    async def test_configured_returns_the_model_answer(self, command_ai):
        command_ai._call_claude = _answers(
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
        result = await command_ai.get_next_best_action({"clients": 10})

        assert result["action_title"] == "Test Action"
        assert result["confidence"] == 0.9
        assert not is_degraded(result)
        assert command_ai.get_status() == "complete"


class TestPrioritizeOpportunities:
    @pytest.mark.asyncio
    async def test_unconfigured_ranks_nothing(self, command_ai):
        result = await command_ai.prioritize_opportunities(problems=["a"], offers=["x"])

        assert result == [], "a ranking nobody computed is not a ranking"
        assert command_ai.get_status() == "degraded"

    @pytest.mark.asyncio
    async def test_configured_returns_the_ranking_it_was_given(self, command_ai):
        command_ai._call_claude = _answers(
            [
                {
                    "problem_name": "p1",
                    "offer_name": "o1",
                    "probability": 0.8,
                    "impact_score": 9.0,
                    "weighted_score": 7.2,
                    "recommended_action": "call",
                }
            ]
        )
        result = await command_ai.prioritize_opportunities(["p1"], ["o1"])

        assert len(result) == 1
        assert result[0]["weighted_score"] == 7.2


class TestSynthesizeDashboard:
    @pytest.mark.asyncio
    async def test_unconfigured_invents_no_revenue_snapshot(self, command_ai):
        """The old fallback reported mtd 125000 and 42 healthy clients."""
        result = await command_ai.synthesize_dashboard({})

        assert is_degraded(result)
        assert "revenue_snapshot" not in result
        assert "client_health_summary" not in result


class TestDailyBrief:
    @pytest.mark.asyncio
    async def test_unconfigured_returns_no_brief(self, command_ai):
        result = await command_ai.generate_daily_brief({})

        assert is_degraded(result)
        assert "recommended_actions" not in result

    @pytest.mark.asyncio
    async def test_configured_returns_the_brief(self, command_ai):
        command_ai._call_claude = _answers(
            {
                "date": "2026-09-10",
                "changes_since_yesterday": [],
                "alerts": [],
                "recommended_actions": [
                    {"action": "call", "priority": "high", "reason": "stale"}
                ],
                "metrics_snapshot": {},
            }
        )
        result = await command_ai.generate_daily_brief({})

        assert result["recommended_actions"][0]["action"] == "call"


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

    @pytest.mark.asyncio
    async def test_a_degraded_agent_is_visible_in_the_summary(self, command_ai):
        """The status surface is how an operator learns the AI is not running."""
        await command_ai.get_next_best_action({})

        summary = command_ai.get_agent_status_summary({"command_ai": command_ai})
        assert summary["command_ai"]["status"] == "degraded"
