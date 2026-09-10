"""AI-powered offer generation and refinement service."""
from __future__ import annotations

import json
import logging

from app.core.config import settings
from app.services.agents.base_agent import as_dict, as_list, call_claude

logger = logging.getLogger(__name__)

_SYSTEM = (
    "You are OfferAI for ChamberForge, designing premium service offers for "
    "advisors to high- and ultra-high-net-worth families. Respond ONLY with "
    "the JSON structure requested, with no commentary and no code fence."
)

class OfferAI:
    """AI agent for offer generation and refinement."""

    #: Kept as an injection point for tests. Left as None so the governed
    #: call path builds the client - it is the only place that knows whether
    #: the transport must be async, and whether the workspace may spend.
    client = None

    def __init__(self) -> None:
        self.api_key = settings.ANTHROPIC_API_KEY
        self.model = settings.AI_MODEL


    async def generate_offer(
        self,
        problem_data: dict,
        buyer_profile: dict | None = None,
    ) -> dict:
        """Generate a premium offer for the HNW/UHNW market.

        Returned a hardcoded SAMPLE_OFFER - down to a $15,000-$30,000 monthly
        price band - whenever no API key was configured, in the same shape as
        a generated one. An advisor had no way to tell the difference.
        """
        buyer_str = json.dumps(buyer_profile) if buyer_profile else "Not specified"
        prompt = (
            "Design a premium offer for the HNW/UHNW market.\n\n"
            f"Problem: {json.dumps(problem_data)}\n"
            f"Buyer: {buyer_str}\n\n"
            "Return ONLY valid JSON with this structure:\n"
            "{\n"
            '  "name": "string",\n'
            '  "description": "string",\n'
            '  "value_stack": [{"name": "string", "description": "string", '
            '"delivery_method": "string", "estimated_hours": number}],\n'
            '  "delivery_model": "retainer|project|hybrid|concierge|membership",\n'
            '  "guarantee_framework": {"type": "string", "terms": "string", '
            '"conditions": ["string"]},\n'
            '  "recommended_pricing": {"monthly_min": number, "monthly_max": number, '
            '"setup_fee": number, "model": "string"}\n'
            "}"
        )

        response = await call_claude(
            "offer_ai", _SYSTEM, prompt, client=self.client, max_tokens=2048
        )
        return as_dict("offer_ai", response)

    async def refine_offer(self, offer_data: dict, feedback: str) -> dict:
        """Refine an existing offer based on user feedback.

        With no key this used to append " [Refined]" to the description and
        return the offer unchanged - reporting that a refinement had happened
        when none had.
        """
        prompt = (
            "Here is an existing premium offer:\n"
            f"{json.dumps(offer_data, indent=2)}\n\n"
            f"User feedback: {feedback}\n\n"
            "Return the refined offer as ONLY valid JSON with the same structure."
        )

        response = await call_claude(
            "offer_ai", _SYSTEM, prompt, client=self.client, max_tokens=2048
        )
        return as_dict("offer_ai", response)

    async def generate_value_stack(
        self,
        pain_category: str,
        delivery_model: str,
    ) -> list[dict]:
        """Generate 4-6 value layers for a pain category and delivery model."""
        prompt = (
            f"Generate 4-6 premium value layers for a {pain_category} service "
            f"delivered via a {delivery_model} model, targeting HNW/UHNW clients.\n\n"
            "Return ONLY a JSON array where each element has:\n"
            '{"name": "string", "description": "string", '
            '"delivery_method": "string", "estimated_hours": number}'
        )

        response = await call_claude(
            "offer_ai", _SYSTEM, prompt, client=self.client, max_tokens=1536
        )
        return as_list("offer_ai", response)
