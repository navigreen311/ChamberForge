"""VoiceForge Intel Brief Audio — converts intelligence briefs to audio."""
import uuid

from app.services.integrations.voiceforge_client import VoiceForgeClient


class IntelBriefAudio:
    """Converts text-based intelligence briefs into audio narrations."""

    def __init__(self, client: VoiceForgeClient) -> None:
        self.client = client

    async def convert_to_audio(
        self,
        brief_text: str,
        voice_style: str = "professional",
    ) -> dict:
        """Convert an intelligence brief to audio.

        Args:
            brief_text: The brief content to narrate.
            voice_style: Voice style — "professional", "conversational", or "executive".

        Returns:
            dict with audio_url and duration_seconds.
        """
        result = await self.client._request(
            "POST",
            "/tts/convert",
            {"text": brief_text, "voice_style": voice_style},
        )

        # If we got a mock response (no API key), build a realistic one
        if result.get("mock"):
            words = len(brief_text.split())
            duration = round(words / 2.5, 1)  # ~150 wpm
            return {
                "audio_url": f"https://voiceforge.mock/audio/{uuid.uuid4()}.mp3",
                "duration_seconds": duration,
            }

        return {
            "audio_url": result.get("audio_url", ""),
            "duration_seconds": result.get("duration_seconds", 0),
        }
