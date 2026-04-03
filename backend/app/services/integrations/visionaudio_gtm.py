"""GTM assets — video ads and landing page visuals."""
from __future__ import annotations

from typing import Any

from app.services.integrations.visionaudio_client import VisionAudioForgeClient


class GTMAssets:
    """Go-to-market visual asset generation."""

    def __init__(self, client: VisionAudioForgeClient | None = None) -> None:
        self.client = client or VisionAudioForgeClient()

    async def create_video_ad(
        self,
        script: dict[str, Any],
        brand_identity: dict[str, Any],
    ) -> dict[str, Any]:
        """Produce a branded video advertisement."""
        full_script = {
            "type": "video_ad",
            "script": script,
            "brand_identity": brand_identity,
            "format": "16:9",
            "duration_target": script.get("duration_seconds", 30),
        }
        result = await self.client.produce_video(full_script, style="advertisement")
        return {**result, "type": "video_ad"}

    async def create_landing_visuals(
        self,
        offer_data: dict[str, Any],
        brand_identity: dict[str, Any],
    ) -> dict[str, Any]:
        """Generate hero images, section graphics, and social cards for a landing page."""
        content = {
            "type": "landing_visuals",
            "offer": offer_data,
            "brand_identity": brand_identity,
            "deliverables": [
                "hero_image",
                "section_graphics",
                "social_card",
                "favicon",
            ],
        }
        result = await self.client.render_presentation(content, template="landing")
        return {**result, "type": "landing_visuals"}
