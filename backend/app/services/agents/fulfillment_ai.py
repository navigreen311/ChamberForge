"""FulfillmentAI — generates SOP bundles and execution blueprints for offers."""
from __future__ import annotations

import json
import logging

from app.services.agents.base_agent import as_dict, call_claude

_SYSTEM = (
    "You are a premium-service operations architect for ChamberForge. "
    "Respond ONLY with the JSON structure requested, no commentary."
)

logger = logging.getLogger(__name__)


class FulfillmentAI:
    """AI-powered fulfillment planning for premium service offers."""

    def __init__(self):
        #: Injection point for tests; the governed call path builds the real
        #: client, checks the budget, and meters the call.
        self._client = None

    async def generate_sop_bundle(self, offer_data: dict) -> dict:
        """Generate a full SOP bundle for delivering an offer.

        Returns a staffing plan, tooling stack, service calendar, delivery
        risks and SOPs - or a degraded result. It used to return
        `_mock_sop_bundle`: a complete operational plan, with named roles
        and weekly hours, for an offer nothing had analysed.
        """
        return await self._call_claude_sop(offer_data)

    async def generate_execution_blueprint(self, offer_data: dict) -> dict:
        """Generate an execution blueprint: role map, QA checklist, milestones.

        Degrades rather than returning `_mock_execution_blueprint`, which
        supplied a timeline in weeks and a milestone schedule that were
        fixed constants, not estimates.
        """
        return await self._call_claude_blueprint(offer_data)

    # ------------------------------------------------------------------
    # Claude integration
    # ------------------------------------------------------------------

    async def _call_claude_sop(self, offer_data: dict) -> dict:
        prompt = (
            "You are a premium-service operations architect. Given the following offer, "
            "produce a JSON SOP bundle.\n\n"
            f"Offer: {json.dumps(offer_data)}\n\n"
            "Return ONLY valid JSON with keys: staffing_plan (array of {role, responsibilities, hours_per_week}), "
            "tooling_stack (array of strings), service_calendar (array of {week, deliverables}), "
            "delivery_risks (array of {risk, probability, impact, mitigation}), "
            "sops (array of {title, steps (array of strings), owner, frequency})."
        )
        response = await call_claude(
            "fulfillment_ai", _SYSTEM, prompt, client=self._client, max_tokens=2048
        )
        return as_dict("fulfillment_ai", response)

    async def _call_claude_blueprint(self, offer_data: dict) -> dict:
        prompt = (
            "You are a premium-service operations architect. Given the following offer, "
            "produce a JSON execution blueprint.\n\n"
            f"Offer: {json.dumps(offer_data)}\n\n"
            "Return ONLY valid JSON with keys: role_map (object mapping role names to responsibilities), "
            "qa_checklist (array of strings), timeline_weeks (integer), "
            "milestones (array of {week, milestone})."
        )
        response = await call_claude(
            "fulfillment_ai", _SYSTEM, prompt, client=self._client, max_tokens=1024
        )
        return as_dict("fulfillment_ai", response)
