"""Video trainer — training video production and certification tracking."""
from __future__ import annotations

from typing import Any

from app.services.integrations.visionaudio_client import VisionAudioForgeClient


class VideoTrainer:
    """Training video production and learner progress tracking."""

    def __init__(self, client: VisionAudioForgeClient | None = None) -> None:
        self.client = client or VisionAudioForgeClient()

    async def create_training_video(
        self,
        module_content: dict[str, Any],
        visual_demos: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Produce a training module video with visual demonstrations."""
        script = {
            "type": "training_video",
            "module": module_content,
            "visual_demos": visual_demos,
            "features": [
                "chapter_markers",
                "quiz_overlays",
                "interactive_checkpoints",
            ],
        }
        result = await self.client.produce_video(script, style="educational")
        return {**result, "type": "training_video"}

    async def get_certification_progress(
        self,
        trainee_id: str,
    ) -> dict[str, Any]:
        """Retrieve certification progress for a trainee.

        No progress source is connected. This returned a fixed record for
        every trainee - 3 of 8 modules, 37.5% complete, currently studying
        "Advanced Client Engagement", finishing 2026-05-15 - which is a
        training compliance record, and it was the same one for everybody.

        Reporting an unknown rather than a plausible number is the whole
        point: a firm checking whether an adviser completed mandatory
        training must not be told 37.5% by a constant.
        """
        return {
            "trainee_id": trainee_id,
            "degraded": True,
            "degraded_reason": "no_progress_source",
            "degraded_detail": (
                "No VisionAudioForge LMS progress source is connected, so no "
                "certification progress is available for this trainee."
            ),
            "modules_completed": None,
            "modules_total": None,
            "completion_percentage": None,
            "current_module": None,
            "certifications": [],
        }
