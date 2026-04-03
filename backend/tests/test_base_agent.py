"""Tests for BaseAgent ABC — prompt building, status tracking."""
import pytest

from app.services.agents.base_agent import BaseAgent


class ConcreteAgent(BaseAgent):
    """Minimal concrete subclass for testing the ABC."""

    async def invoke(self, input_data: dict) -> dict:
        self._mark_running()
        result = {"echo": input_data}
        self._mark_complete(result)
        return result


class TestBuildPrompt:
    def test_returns_list_with_user_message(self):
        messages = BaseAgent._build_prompt("sys prompt", "hello user")
        assert isinstance(messages, list)
        assert len(messages) == 1
        assert messages[0]["role"] == "user"
        assert messages[0]["content"] == "hello user"


class TestStatusTracking:
    @pytest.fixture
    def agent(self):
        return ConcreteAgent(agent_name="test_agent")

    def test_initial_status_is_idle(self, agent):
        assert agent.get_status() == "idle"

    def test_last_output_initially_none(self, agent):
        assert agent.get_last_output() is None

    @pytest.mark.asyncio
    async def test_invoke_sets_complete(self, agent):
        await agent.invoke({"key": "value"})
        assert agent.get_status() == "complete"
        assert agent.get_last_output() == {"echo": {"key": "value"}}

    def test_mark_error(self, agent):
        agent._mark_error("something broke")
        assert agent.get_status() == "error"
        assert agent.get_last_output() == {"error": "something broke"}

    def test_mark_running_sets_timestamp(self, agent):
        agent._mark_running()
        assert agent.get_status() == "running"
        assert agent._last_run_at is not None
