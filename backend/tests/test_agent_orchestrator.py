"""Tests for AgentOrchestrator — run_agent, get_all_statuses, parallel execution."""
import pytest

from app.services.backbone.agent_orchestrator import AgentOrchestrator


@pytest.fixture
def orchestrator():
    return AgentOrchestrator()


class TestRunAgent:
    @pytest.mark.asyncio
    async def test_run_command_ai_returns_result(self, orchestrator):
        result = await orchestrator.run_agent(
            "command_ai",
            {"action": "next_best_action", "payload": {}},
        )
        assert isinstance(result, dict)
        assert "action_title" in result

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
        assert statuses["command_ai"] == "complete"


class TestRunParallel:
    @pytest.mark.asyncio
    async def test_parallel_returns_ordered_results(self, orchestrator):
        tasks = [
            ("command_ai", {"action": "next_best_action", "payload": {}}),
            ("command_ai", {"action": "dashboard", "payload": {}}),
        ]
        results = await orchestrator.run_parallel(tasks)
        assert len(results) == 2
        # First should be next-action shape, second dashboard shape
        assert "action_title" in results[0]
        assert "top_problems" in results[1]
