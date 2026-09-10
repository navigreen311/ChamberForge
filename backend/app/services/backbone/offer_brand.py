"""OfferBrand — AI-powered offer naming and brand positioning."""
from __future__ import annotations

import os
from typing import Any


class OfferBrand:
    """Generates brand names and positioning for premium service offers."""

    async def generate_name(self, offer_data: dict[str, Any]) -> dict[str, Any]:
        """Generate 5 name options for a service offer."""
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if api_key:
            return await self._names_with_ai(offer_data, api_key)
        return self._names_from_data(offer_data)

    async def generate_positioning(
        self, name: str, offer_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Generate positioning statement, brand voice, and visual identity."""
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if api_key:
            return await self._positioning_with_ai(name, offer_data, api_key)
        return self._positioning_from_data(name, offer_data)

    # ------------------------------------------------------------------
    # AI paths
    # ------------------------------------------------------------------
    async def _names_with_ai(
        self, offer_data: dict[str, Any], api_key: str
    ) -> dict[str, Any]:
        try:
            import json

            import anthropic

            client = anthropic.AsyncAnthropic(api_key=api_key)
            msg = await client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=512,
                messages=[
                    {
                        "role": "user",
                        "content": (
                            "Generate 5 premium brand name options for a service "
                            f"offer: {offer_data}. Return JSON: "
                            '{"names":[{"name":"...","reasoning":"..."}]}'
                        ),
                    }
                ],
            )
            text = msg.content[0].text
            start, end = text.find("{"), text.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
        except Exception:
            pass
        return self._names_from_data(offer_data)

    async def _positioning_with_ai(
        self, name: str, offer_data: dict[str, Any], api_key: str
    ) -> dict[str, Any]:
        try:
            import json

            import anthropic

            client = anthropic.AsyncAnthropic(api_key=api_key)
            msg = await client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=512,
                messages=[
                    {
                        "role": "user",
                        "content": (
                            f'Generate premium brand positioning for "{name}". '
                            f"Offer details: {offer_data}. Return JSON with: "
                            "positioning_statement, brand_voice, "
                            "visual_identity_suggestions (colors, typography, imagery_style)."
                        ),
                    }
                ],
            )
            text = msg.content[0].text
            start, end = text.find("{"), text.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
        except Exception:
            pass
        return self._positioning_from_data(name, offer_data)

    # ------------------------------------------------------------------
    # Data-driven fallbacks
    # ------------------------------------------------------------------
    def _names_from_data(self, offer_data: dict[str, Any]) -> dict[str, Any]:
        category = offer_data.get("category", "Advisory")
        target = offer_data.get("target_market", "UHNW Individuals")
        base = category.split()[0] if category else "Elite"
        prefixes = ["Apex", "Pinnacle", "Sovereign", "Vanguard", "Meridian"]
        return {
            "names": [
                {
                    "name": f"{p} {base}",
                    "reasoning": f"Conveys {p.lower()}-level {category.lower()} for {target}",
                }
                for p in prefixes
            ]
        }

    def _positioning_from_data(
        self, name: str, offer_data: dict[str, Any]
    ) -> dict[str, Any]:
        category = offer_data.get("category", "advisory services")
        target = offer_data.get("target_market", "discerning clients")
        return {
            "positioning_statement": (
                f"{name} delivers bespoke {category.lower()} exclusively "
                f"for {target}, setting the standard in precision and discretion."
            ),
            "brand_voice": "Authoritative yet approachable — confident expertise with personal warmth",
            "visual_identity_suggestions": {
                "colors": ["#1A1A2E", "#C9A962", "#F5F0E8"],
                "typography": "Serif headlines (EB Garamond), sans-serif body (Inter)",
                "imagery_style": "Refined, minimal — architectural details, clean textures",
            },
        }
