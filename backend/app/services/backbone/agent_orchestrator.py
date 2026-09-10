"""AgentOrchestrator — Central hub for lazy-initialising and running all agents."""
from __future__ import annotations

import asyncio

from app.services.agents.base_agent import BaseAgent
from app.services.agents.command_ai import CommandAI

# Registry of known agent names → factory callables.
# As new agents are built they get added here.
_AGENT_FACTORIES: dict[str, type] = {
    "command_ai": CommandAI,
    # Future agents — stubs so orchestrator knows all 10 names:
    "client_intel": None,
    "offer_architect": None,
    "deal_flow": None,
    "relationship_pulse": None,
    "risk_radar": None,
    "content_engine": None,
    "onboarding_concierge": None,
    "retention_strategist": None,
    "market_scanner": None,
}


class _StubAgent(BaseAgent):
    """Placeholder agent for not-yet-implemented capabilities."""

    async def invoke(self, input_data: dict) -> dict:
        return {"status": "stub", "message": f"{self.agent_name} is not yet implemented."}


class AgentOrchestrator:
    """Manages the lifecycle of all ChamberForge AI agents.

    Agents are created lazily on first call to avoid importing heavy
    dependencies at startup.
    """

    def __init__(self):
        self._agents: dict[str, BaseAgent] = {}

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------
    def _get_or_create(self, agent_name: str) -> BaseAgent:
        """Return an existing agent instance or create one on demand."""
        if agent_name not in self._agents:
            factory = _AGENT_FACTORIES.get(agent_name)
            if factory is not None:
                self._agents[agent_name] = factory()
            else:
                self._agents[agent_name] = _StubAgent(agent_name=agent_name)
        return self._agents[agent_name]

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    async def run_agent(self, agent_name: str, input_data: dict) -> dict:
        """Run a single agent by name and return its output dict."""
        agent = self._get_or_create(agent_name)
        return await agent.invoke(input_data)

    async def run_parallel(self, tasks: list[tuple[str, dict]]) -> list[dict]:
        """Run multiple agents concurrently with asyncio.gather.

        Args:
            tasks: list of (agent_name, input_data) tuples.

        Returns:
            List of result dicts in the same order as *tasks*.
        """
        coros = [self.run_agent(name, data) for name, data in tasks]
        return list(await asyncio.gather(*coros, return_exceptions=False))

    def get_all_statuses(self) -> dict[str, str]:
        """Return {agent_name: status} for every known agent.

        Agents that haven't been created yet are reported as 'idle'.
        """
        statuses: dict[str, str] = {}
        for name in _AGENT_FACTORIES:
            if name in self._agents:
                statuses[name] = self._agents[name].get_status()
            else:
                statuses[name] = "idle"
        return statuses
