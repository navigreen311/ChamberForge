"""Trust-pack visuals — multimedia trust packages and credibility decks."""
from __future__ import annotations

from typing import Any

from app.services.integrations.visionaudio_client import VisionAudioForgeClient


class TrustPackVisuals:
    """Generate trust-building visual artefacts."""

    def __init__(self, client: VisionAudioForgeClient | None = None) -> None:
        self.client = client or VisionAudioForgeClient()

    async def render_trust_package(
        self,
        trust_data: dict[str, Any],
    ) -> dict[str, Any]:
        """Render a multimedia trust package (video + deck + one-pager)."""
        content = {
            "type": "trust_package",
            "data": trust_data,
            "components": [
                "intro_video",
                "credentials_deck",
                "one_pager",
                "testimonials_reel",
            ],
        }
        result = await self.client.render_presentation(content, template="trust")
        return {**result, "type": "trust_package"}

    async def render_credibility_deck(
        self,
        credentials: dict[str, Any],
    ) -> dict[str, Any]:
        """Render a branded credibility/credentials presentation."""
        content = {
            "type": "credibility_deck",
            "credentials": credentials,
            "sections": [
                "about",
                "track_record",
                "certifications",
                "client_logos",
                "case_highlights",
            ],
        }
        result = await self.client.render_presentation(content, template="credibility")
        return {**result, "type": "credibility_deck"}
