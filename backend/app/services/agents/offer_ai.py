"""AI-powered offer generation and refinement service."""
from __future__ import annotations

import json
import logging
from typing import Any

import anthropic

from app.core.config import settings

logger = logging.getLogger(__name__)

SAMPLE_OFFER: dict[str, Any] = {
    "name": "Elite Estate Coordination Suite",
    "description": (
        "End-to-end coordination service for UHNW principals managing "
        "multiple properties, staff, and complex schedules."
    ),
    "value_stack": [
        {
            "name": "24/7 Command Center",
            "description": "Dedicated operations desk monitoring all properties and staff.",
            "delivery_method": "retainer",
            "estimated_hours": 160,
        },
        {
            "name": "Vendor Orchestration",
            "description": "Single point of contact for all service providers across estates.",
            "delivery_method": "retainer",
            "estimated_hours": 40,
        },
        {
            "name": "Travel & Logistics Bridge",
            "description": "Seamless coordination between residences, aviation, and ground transport.",
            "delivery_method": "concierge",
            "estimated_hours": 30,
        },
        {
            "name": "Monthly Strategy Review",
            "description": "Performance reporting, optimization recommendations, and forward planning.",
            "delivery_method": "retainer",
            "estimated_hours": 8,
        },
    ],
    "delivery_model": "retainer",
    "guarantee_framework": {
        "type": "performance",
        "terms": "95% SLA on response time within 15 minutes for urgent requests.",
        "conditions": [
            "Client provides current vendor contact list within onboarding period.",
            "Minimum 6-month engagement term.",
        ],
    },
    "recommended_pricing": {
        "monthly_min": 15000,
        "monthly_max": 30000,
        "setup_fee": 5000,
        "model": "retainer",
    },
}

SAMPLE_VALUE_STACK: list[dict[str, Any]] = [
    {
        "name": "Core Service Layer",
        "description": "Primary service delivery for the identified pain category.",
        "delivery_method": "retainer",
        "estimated_hours": 80,
    },
    {
        "name": "Proactive Monitoring",
        "description": "Continuous oversight to catch issues before escalation.",
        "delivery_method": "retainer",
        "estimated_hours": 40,
    },
    {
        "name": "Quarterly Strategy Session",
        "description": "Deep-dive planning and optimization review with principal.",
        "delivery_method": "project",
        "estimated_hours": 8,
    },
    {
        "name": "Emergency Response Protocol",
        "description": "24/7 escalation path for time-critical situations.",
        "delivery_method": "concierge",
        "estimated_hours": 10,
    },
]


def _parse_json_response(text: str) -> dict | list:
    """Extract JSON from a Claude response that may contain markdown fences."""
    text = text.strip()
    if text.startswith("```"):
        # Strip ```json ... ``` wrapper
        lines = text.split("\n")
        lines = lines[1:]  # drop opening fence
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return json.loads(text)


class OfferAI:
    """AI agent for offer generation and refinement."""

    def __init__(self) -> None:
        self.api_key = settings.ANTHROPIC_API_KEY
        self.model = settings.AI_MODEL
        if self.api_key:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None

    async def generate_offer(
        self,
        problem_data: dict,
        buyer_profile: dict | None = None,
    ) -> dict:
        """Generate a premium offer for HNW/UHNW market using Claude."""
        if not self.client:
            logger.warning("No Anthropic API key configured — returning sample offer.")
            return SAMPLE_OFFER

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

        message = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )
        return _parse_json_response(message.content[0].text)

    async def refine_offer(self, offer_data: dict, feedback: str) -> dict:
        """Refine an existing offer based on user feedback."""
        if not self.client:
            refined = {**offer_data, "description": f"{offer_data.get('description', '')} [Refined]"}
            return refined

        prompt = (
            "Here is an existing premium offer:\n"
            f"{json.dumps(offer_data, indent=2)}\n\n"
            f"User feedback: {feedback}\n\n"
            "Return the refined offer as ONLY valid JSON with the same structure."
        )

        message = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )
        return _parse_json_response(message.content[0].text)

    async def generate_value_stack(
        self,
        pain_category: str,
        delivery_model: str,
    ) -> list[dict]:
        """Generate 4-6 value layers for a given pain category and delivery model."""
        if not self.client:
            logger.warning("No Anthropic API key — returning sample value stack.")
            return SAMPLE_VALUE_STACK

        prompt = (
            f"Generate 4-6 premium value layers for a {pain_category} service "
            f"delivered via a {delivery_model} model, targeting HNW/UHNW clients.\n\n"
            "Return ONLY a JSON array where each element has:\n"
            '{"name": "string", "description": "string", '
            '"delivery_method": "string", "estimated_hours": number}'
        )

        message = self.client.messages.create(
            model=self.model,
            max_tokens=1536,
            messages=[{"role": "user", "content": prompt}],
        )
        return _parse_json_response(message.content[0].text)
