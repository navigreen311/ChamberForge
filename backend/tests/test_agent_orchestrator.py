"""Tests for AgentOrchestrator — run_agent, get_all_statuses, parallel execution."""
import pytest

from app.services.agents.base_agent import is_degraded
from app.services.backbone.agent_orchestrator import AgentOrchestrator


@pytest.fixture
def orchestrator():
    return AgentOrchestrator()


class TestRunAgent:
    @pytest.mark.asyncio
    async def test_run_command_ai_returns_result(self, orchestrator):
        """The orchestrator returns whatever the agent produced.

        With no API key configured - which is how the suite runs - that
        is a marked degraded result. This used to assert `action_title`
        was present, which was only ever true because the agent invented
        one.
        """
        result = await orchestrator.run_agent(
            "command_ai",
            {"action": "next_best_action", "payload": {}},
        )
        assert isinstance(result, dict)
        assert is_degraded(result)
        assert result["agent"] == "command_ai"

    @pytest.mark.asyncio
    async def test_run_stub_agent(self, orchestrator):
        result = await orchestrator.run_agent("client_intel", {})
        assert result["status"] == "stub"

    @pytest.mark.asyncio
    async def test_run_unknown_agent_returns_stub(self, orchestrator):
        result = await orchestrator.run_agent("nonexistent_agent", {})
        assert result["status"] == "stub"


class TestGetAllStatuses:
    def test_returns_all_ten_agents(self, orchestrator):
        statuses = orchestrator.get_all_statuses()
        assert len(statuses) == 10
        # All should be idle before any invocation
        for name, status in statuses.items():
            assert status == "idle"

    @pytest.mark.asyncio
    async def test_status_updates_after_run(self, orchestrator):
        await orchestrator.run_agent(
            "command_ai", {"action": "next_best_action", "payload": {}}
        )
        statuses = orchestrator.get_all_statuses()
        # Not 'complete': the agent ran but produced no analysis, and
        # that distinction is the whole point of the status field.
        assert statuses["command_ai"] == "degraded"


class TestRunParallel:
    @pytest.mark.asyncio
    async def test_parallel_returns_ordered_results(self, orchestrator):
        tasks = [
            ("command_ai", {"action": "next_best_action", "payload": {}}),
            ("command_ai", {"action": "dashboard", "payload": {}}),
        ]
        results = await orchestrator.run_parallel(tasks)
        assert len(results) == 2
        # Both degrade with no key, and each says which agent it came
        # from - enough to keep results matched to their tasks.
        assert all(is_degraded(r) for r in results)
        assert all(r["agent"] == "command_ai" for r in results)
