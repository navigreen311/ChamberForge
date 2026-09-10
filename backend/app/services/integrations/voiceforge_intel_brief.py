"""VoiceForge Intel Brief Audio - converts intelligence briefs to audio."""

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

        # No API key: no audio exists, so none is described.
        #
        # This block used to assemble a convincing one. The duration was
        # padded with `random.uniform(6.0, 10.0)` for an intro jingle, the
        # file size was derived from that invented duration, and a bitrate,
        # sample rate and a hardcoded `generated_at` of 2026-04-03T12:00:00Z
        # described an mp3 that was never rendered. The only hint was
        # `.mock` in the hostname of a URL nothing resolves.
        #
        # The same defect as the Trust Center's seeded uptime, which is why
        # this one file crosses from P-07 into P-06: a plausible artefact
        # returned in the shape of a real one.
        if result.get("mock"):
            profile = _VOICE_PROFILES.get(voice_style, _VOICE_PROFILES["professional"])
            word_count = len(brief_text.split())
            wpm = float(profile["words_per_minute"])
            sentence_count = max(
                brief_text.count(".") + brief_text.count("!") + brief_text.count("?"), 1
            )
            # Kept because it is a calculation over the caller's own text
            # rather than a claim about a file: how long this brief would
            # take to read aloud. Named as an estimate and separate from
            # `duration_seconds`, which stays absent because nothing was
            # rendered and therefore nothing has a duration.
            narration_estimate = round((word_count / wpm) * 60 + sentence_count * 0.3, 1)

            return {
                "available": False,
                "reason": "voiceforge_not_configured",
                "detail": (
                    "No VoiceForge API key is configured, so no audio was "
                    "generated for this brief."
                ),
                "audio_url": None,
                "duration_seconds": None,
                "word_count": word_count,
                "voice_style": voice_style,
                "estimated_narration_seconds": narration_estimate,
                # Static reference data about the requested style - a
                # description of what would be produced, not of anything
                # that was.
                "voice_profile": {
                    "description": profile["description"],
                    "words_per_minute": int(wpm),
                    "pitch_range": profile["pitch_range"],
                    "accent": profile["accent"],
                },
                "metadata": {"sentence_count": sentence_count},
            }

        return {
            "available": True,
            "audio_url": result.get("audio_url", ""),
            "duration_seconds": result.get("duration_seconds", 0),
        }
