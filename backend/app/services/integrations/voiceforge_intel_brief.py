"""VoiceForge Intel Brief Audio — converts intelligence briefs to audio."""
import random
import uuid

from app.services.integrations.voiceforge_client import VoiceForgeClient

# Realistic voice style profiles for mock responses
_VOICE_PROFILES: dict[str, dict[str, str | float]] = {
    "professional": {
        "description": "Clear, authoritative tone with measured pacing",
        "words_per_minute": 145,
        "pitch_range": "mid",
        "accent": "neutral American",
    },
    "conversational": {
        "description": "Warm, approachable delivery with natural pauses",
        "words_per_minute": 160,
        "pitch_range": "mid-high",
        "accent": "neutral American",
    },
    "executive": {
        "description": "Confident, concise delivery optimized for busy listeners",
        "words_per_minute": 135,
        "pitch_range": "low-mid",
        "accent": "neutral American",
    },
}


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
            dict with audio_url, duration_seconds, metadata, and voice_profile.
        """
        result = await self.client._request(
            "POST",
            "/tts/convert",
            {"text": brief_text, "voice_style": voice_style},
        )

        # If we got a mock response (no API key), build a realistic one
        if result.get("mock"):
            profile = _VOICE_PROFILES.get(voice_style, _VOICE_PROFILES["professional"])
            wpm = float(profile["words_per_minute"])
            word_count = len(brief_text.split())

            # Calculate duration: words / WPM * 60, plus intro/outro padding
            base_duration = (word_count / wpm) * 60
            # Add natural pauses (roughly 0.3s per sentence)
            sentence_count = max(brief_text.count(".") + brief_text.count("!") + brief_text.count("?"), 1)
            pause_time = sentence_count * 0.3
            # Add intro jingle and outro (3-5 seconds each)
            intro_outro = random.uniform(6.0, 10.0)
            raw_duration = base_duration + pause_time + intro_outro

            # Clamp to realistic range (45-90 seconds for a typical brief)
            duration = round(max(45.0, min(raw_duration, 90.0)), 1)

            audio_id = str(uuid.uuid4())
            return {
                "audio_url": f"https://voiceforge.mock/audio/{audio_id}.mp3",
                "duration_seconds": duration,
                "word_count": word_count,
                "voice_style": voice_style,
                "voice_profile": {
                    "description": profile["description"],
                    "words_per_minute": int(wpm),
                    "pitch_range": profile["pitch_range"],
                    "accent": profile["accent"],
                },
                "metadata": {
                    "format": "mp3",
                    "bitrate_kbps": 192,
                    "sample_rate_hz": 44100,
                    "channels": 1,
                    "sentence_count": sentence_count,
                    "estimated_file_size_kb": round(duration * 24),  # ~192kbps mono
                    "generated_at": "2026-04-03T12:00:00Z",
                },
            }

        return {
            "audio_url": result.get("audio_url", ""),
            "duration_seconds": result.get("duration_seconds", 0),
        }
