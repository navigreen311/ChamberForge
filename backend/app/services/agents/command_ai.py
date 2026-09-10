"""CommandAI — The orchestration brain of ChamberForge.

Synthesises workspace state into actionable intelligence: next-best-action
recommendations, dashboard synthesis, opportunity prioritisation, and daily
briefs.
"""
from __future__ import annotations

import json
from datetime import date

from app.services.agents.base_agent import (
    AgentResponse,
    BaseAgent,
    as_dict,
    as_list,
    degraded_payload,
    is_degraded,
)


class CommandAI(BaseAgent):
    """High-level orchestration agent that analyses workspace context and
    produces strategic recommendations."""

    def __init__(self, anthropic_client=None):
        super().__init__(agent_name="command_ai", anthropic_client=anthropic_client)

    # ------------------------------------------------------------------
    # Core abstract implementation
    # ------------------------------------------------------------------
    async def invoke(self, input_data: dict) -> dict:
        """Dispatch to the appropriate capability based on *action* key."""
        action = input_data.get("action", "next_best_action")
        dispatch = {
            "next_best_action": self.get_next_best_action,
            "dashboard": self.synthesize_dashboard,
            "prioritize": self.prioritize_opportunities,
            "daily_brief": self.generate_daily_brief,
        }
        handler = dispatch.get(action, self.get_next_best_action)
        return await handler(input_data.get("payload", {}))

    # ------------------------------------------------------------------
    # 1. Next-Best-Action
    # ------------------------------------------------------------------
    async def get_next_best_action(self, workspace_context: dict) -> dict:
        """Analyse workspace state and return the single highest-value action.

        Returns dict with keys: action_title, action_description, why,
        evidence_links, confidence, priority, estimated_impact.
        """
        self._mark_running()
        try:
            system = (
                "You are CommandAI, the strategic orchestration brain for ChamberForge, "
                "a premium-service operating system for HNW/UHNW advisors. Given the "
                "current workspace context, determine the single most valuable next "
                "action. Respond ONLY with valid JSON containing these keys: "
                "action_title (str), action_description (str), why (str), "
                "evidence_links (list[str]), confidence (float 0-1), "
                'priority ("critical"|"high"|"medium"|"low"), estimated_impact (str).'
            )
            user = f"Workspace context:\n{json.dumps(workspace_context, default=str)}"
            response = await self._call_claude(system, user)
            return self._as_dict(response)
        except Exception as exc:
            self._mark_error(str(exc))
            return degraded_payload(self.agent_name, "agent_error", str(exc))

    # ------------------------------------------------------------------
    # 2. Dashboard Synthesis
    # ------------------------------------------------------------------
    async def synthesize_dashboard(self, workspace_data: dict) -> dict:
        """Produce a synthesised dashboard view.

        Returns dict with keys: top_problems, active_offers, client_health_summary,
        revenue_snapshot, pending_risks, urgent_actions.
        """
        self._mark_running()
        try:
            system = (
                "You are CommandAI. Given workspace data, synthesise a dashboard. "
                "Respond ONLY with valid JSON: top_problems (list), active_offers (list), "
                "client_health_summary (dict), revenue_snapshot (dict), "
                "pending_risks (list), urgent_actions (list)."
            )
            user = f"Workspace data:\n{json.dumps(workspace_data, default=str)}"
            response = await self._call_claude(system, user)
            return self._as_dict(response)
        except Exception as exc:
            self._mark_error(str(exc))
            return degraded_payload(self.agent_name, "agent_error", str(exc))

    # ------------------------------------------------------------------
    # 3. Opportunity Prioritisation
    # ------------------------------------------------------------------
    async def prioritize_opportunities(
        self, problems: list, offers: list | None = None
    ) -> list[dict]:
        """Score and rank problem–offer pairings by weighted_score DESC.

        Each item: {problem_name, offer_name, probability, impact_score,
        weighted_score, recommended_action}.
        """
        self._mark_running()
        try:
            if offers is None:
                offers = []
            system = (
                "You are CommandAI. Given a list of problems and offers, produce a "
                "ranked list of opportunities. Each entry must be JSON with: "
                "problem_name (str), offer_name (str), probability (float 0-1), "
                "impact_score (float 0-10), weighted_score (float = probability * impact_score), "
                "recommended_action (str). Sort descending by weighted_score. "
                "Return a JSON array."
            )
            user = (
                f"Problems:\n{json.dumps(problems, default=str)}\n\n"
                f"Offers:\n{json.dumps(offers, default=str)}"
            )
            response = await self._call_claude(system, user)
            parsed = self._as_list(response)
            # Guarantee sort order
            parsed.sort(key=lambda x: x.get("weighted_score", 0), reverse=True)
            # Only a real ranking is "complete". Marking a degraded call
            # complete here would erase the one signal an operator has that
            # the AI never ran - the empty list looks like "no opportunities".
            if self._status != "degraded":
                self._mark_complete({"opportunities": parsed})
            return parsed
        except Exception as exc:
            self._mark_error(str(exc))
            return []

    # ------------------------------------------------------------------
    # 4. Daily Brief
    # ------------------------------------------------------------------
    async def generate_daily_brief(self, workspace_data: dict) -> dict:
        """Generate a daily intelligence brief.

        Returns dict with keys: date, changes_since_yesterday, alerts,
        recommended_actions (list of {action, priority, reason}), metrics_snapshot.
        """
        self._mark_running()
        try:
            today = date.today().isoformat()
            system = (
                "You are CommandAI. Produce a concise daily brief. "
                "Respond ONLY with valid JSON: date (str), "
                "changes_since_yesterday (list[str]), alerts (list[str]), "
                "recommended_actions (list of {action, priority, reason}), "
                "metrics_snapshot (dict)."
            )
            user = (
                f"Date: {today}\n"
                f"Workspace data:\n{json.dumps(workspace_data, default=str)}"
            )
            response = await self._call_claude(system, user)
            return self._as_dict(response)
        except Exception as exc:
            self._mark_error(str(exc))
            return degraded_payload(self.agent_name, "agent_error", str(exc))

    # ------------------------------------------------------------------
    # 5. Agent Status Summary
    # ------------------------------------------------------------------
    def get_agent_status_summary(self, agents: dict[str, BaseAgent]) -> dict:
        """Return a per-agent status report.

        Args:
            agents: mapping of agent_name -> BaseAgent instance.
        """
        return {
            name: {
                "status": agent.get_status(),
                "last_output_preview": (
                    str(agent.get_last_output())[:120]
                    if agent.get_last_output()
                    else None
                ),
            }
            for name, agent in agents.items()
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _as_dict(self, response: AgentResponse) -> dict:
        """The model's JSON object, or a degraded result saying why not.

        What this replaces: `_safe_parse(raw, self._sample_next_action())`,
        which substituted invented figures - "$450K in pipeline recovery", a
        revenue snapshot, named client ids - whenever the call failed or no
        key was configured, in the same shape as a real answer.
        """
        result = as_dict(self.agent_name, response)
        if is_degraded(result):
            self._status = "degraded"
            self._last_output = result
        else:
            self._mark_complete(result)
        return result

    def _as_list(self, response: AgentResponse) -> list:
        """The model's JSON array, or an empty list.

        Empty is less expressive than the degraded envelope, but it is
        honest: no opportunities were computed, and none are invented. The
        reason is recorded on the agent - `get_status()` reads "degraded".
        """
        result = as_list(self.agent_name, response)
        if not result and (response.degraded or not response.ok):
            self._mark_degraded(response)
        return result
