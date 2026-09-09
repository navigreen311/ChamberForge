"""CommandAI — The orchestration brain of ChamberForge.

Synthesises workspace state into actionable intelligence: next-best-action
recommendations, dashboard synthesis, opportunity prioritisation, and daily
briefs.
"""
from __future__ import annotations

import json
from datetime import date

from app.services.agents.base_agent import BaseAgent


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
            raw = await self._call_claude(system, user)
            result = self._safe_parse(raw, self._sample_next_action())
            self._mark_complete(result)
            return result
        except Exception as exc:
            self._mark_error(str(exc))
            return self._sample_next_action()

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
            raw = await self._call_claude(system, user)
            result = self._safe_parse(raw, self._sample_dashboard())
            self._mark_complete(result)
            return result
        except Exception as exc:
            self._mark_error(str(exc))
            return self._sample_dashboard()

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
            raw = await self._call_claude(system, user)
            parsed = self._safe_parse_list(raw, self._sample_opportunities())
            # Guarantee sort order
            parsed.sort(key=lambda x: x.get("weighted_score", 0), reverse=True)
            self._mark_complete({"opportunities": parsed})
            return parsed
        except Exception as exc:
            self._mark_error(str(exc))
            return self._sample_opportunities()

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
            raw = await self._call_claude(system, user)
            result = self._safe_parse(raw, self._sample_daily_brief(today))
            self._mark_complete(result)
            return result
        except Exception as exc:
            self._mark_error(str(exc))
            return self._sample_daily_brief(date.today().isoformat())

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
    @staticmethod
    def _safe_parse(raw: str, fallback: dict) -> dict:
        """Attempt JSON parse; return fallback when the response is unusable."""
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict) and "fallback" not in parsed and "error" not in parsed:
                return parsed
        except (json.JSONDecodeError, TypeError):
            pass
        return fallback

    @staticmethod
    def _safe_parse_list(raw: str, fallback: list) -> list:
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return parsed
            # If Claude returned a dict with fallback/error, use fallback list
        except (json.JSONDecodeError, TypeError):
            pass
        return fallback

    # ------------------------------------------------------------------
    # Sample / fallback data
    # ------------------------------------------------------------------
    @staticmethod
    def _sample_next_action() -> dict:
        return {
            "action_title": "Follow up with top 3 prospects",
            "action_description": (
                "Three high-value prospects have gone 7+ days without contact. "
                "Send personalised check-ins referencing their last interaction."
            ),
            "why": "Prospect engagement drops sharply after 7 days of silence.",
            "evidence_links": ["/clients/c-101", "/clients/c-204", "/clients/c-319"],
            "confidence": 0.85,
            "priority": "high",
            "estimated_impact": "Potential $450K in pipeline recovery",
        }

    @staticmethod
    def _sample_dashboard() -> dict:
        return {
            "top_problems": ["3 stale prospects", "Renewal due in 5 days"],
            "active_offers": ["Premium Advisory Package", "Estate Planning Bundle"],
            "client_health_summary": {"healthy": 42, "at_risk": 5, "churned": 1},
            "revenue_snapshot": {
                "mtd": 125000,
                "projected": 310000,
                "yoy_change": 0.12,
            },
            "pending_risks": ["Client #204 unresponsive", "Compliance review overdue"],
            "urgent_actions": ["Call Client #101", "Submit Q2 report"],
        }

    @staticmethod
    def _sample_opportunities() -> list[dict]:
        return [
            {
                "problem_name": "Estate planning gap",
                "offer_name": "Estate Planning Bundle",
                "probability": 0.8,
                "impact_score": 9.0,
                "weighted_score": 7.2,
                "recommended_action": "Schedule estate review meeting",
            },
            {
                "problem_name": "Tax optimisation needed",
                "offer_name": "Tax Strategy Session",
                "probability": 0.6,
                "impact_score": 7.5,
                "weighted_score": 4.5,
                "recommended_action": "Prepare tax analysis report",
            },
        ]

    @staticmethod
    def _sample_daily_brief(today: str | None = None) -> dict:
        return {
            "date": today or date.today().isoformat(),
            "changes_since_yesterday": [
                "2 new leads added",
                "Client #101 moved to active",
                "Revenue target 40% achieved",
            ],
            "alerts": ["Compliance deadline in 3 days", "Renewal for Client #204 due"],
            "recommended_actions": [
                {
                    "action": "Review compliance checklist",
                    "priority": "critical",
                    "reason": "Deadline approaching",
                },
                {
                    "action": "Prepare renewal proposal for #204",
                    "priority": "high",
                    "reason": "At-risk client",
                },
            ],
            "metrics_snapshot": {
                "active_clients": 47,
                "pipeline_value": 1250000,
                "tasks_completed_today": 0,
            },
        }
