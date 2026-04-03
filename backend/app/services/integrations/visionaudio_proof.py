"""Proof visuals — before/after scorecards and case-study walkthroughs."""
from __future__ import annotations

from typing import Any

from app.services.integrations.visionaudio_client import VisionAudioForgeClient


class ProofVisuals:
    """Generate visual proof-of-value artefacts."""

    def __init__(self, client: VisionAudioForgeClient | None = None) -> None:
        self.client = client or VisionAudioForgeClient()

    async def create_before_after_scorecard(
        self,
        before_data: dict[str, Any],
        after_data: dict[str, Any],
    ) -> dict[str, Any]:
        """Create a visual before/after comparison scorecard."""
        content = {
            "type": "before_after_scorecard",
            "before": before_data,
            "after": after_data,
            "layout": "split_comparison",
        }
        result = await self.client.render_presentation(content, template="scorecard")
        return {**result, "type": "before_after_scorecard"}

    async def create_proof_walkthrough(
        self,
        case_study_data: dict[str, Any],
    ) -> dict[str, Any]:
        """Create a narrated video walkthrough of a case study."""
        script = {
            "type": "proof_walkthrough",
            "case_study": case_study_data,
            "narration": True,
            "sections": [
                "challenge",
                "approach",
                "results",
                "testimonial",
            ],
        }
        result = await self.client.produce_video(script, style="case_study")
        return {**result, "type": "proof_walkthrough"}
