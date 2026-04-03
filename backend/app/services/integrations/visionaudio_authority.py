"""Authority content — thought-leadership clips and data stories."""
from __future__ import annotations

from typing import Any

from app.services.integrations.visionaudio_client import VisionAudioForgeClient


class AuthorityContent:
    """Generate authority-building multimedia content."""

    def __init__(self, client: VisionAudioForgeClient | None = None) -> None:
        self.client = client or VisionAudioForgeClient()

    async def create_video_clip(
        self,
        topic: str,
        talking_points: list[str],
        style: str = "thought_leader",
    ) -> dict[str, Any]:
        """Produce a short thought-leadership video clip."""
        script = {
            "type": "authority_clip",
            "topic": topic,
            "talking_points": talking_points,
            "format": "short_form",
            "duration_target": 90,
        }
        result = await self.client.produce_video(script, style=style)
        return {**result, "type": "authority_clip"}

    async def create_data_story(
        self,
        data: dict[str, Any],
        narrative: str,
    ) -> dict[str, Any]:
        """Create a visual data-storytelling artefact (animated charts + narration)."""
        script = {
            "type": "data_story",
            "data": data,
            "narrative": narrative,
            "visualizations": [
                "animated_charts",
                "key_stat_callouts",
                "trend_annotations",
            ],
        }
        result = await self.client.produce_video(script, style="data_narrative")
        return {**result, "type": "data_story"}
