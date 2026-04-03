"""VoiceForge Persona Simulation — AI-driven roleplay for HNW client conversations."""
import uuid
from datetime import datetime, timezone
from typing import Any

from app.services.integrations.voiceforge_client import VoiceForgeClient

# Pre-configured persona archetypes for HNW market training
_PERSONA_TEMPLATES: dict[str, dict[str, Any]] = {
    "founder": {
        "name": "Alexander Harrington",
        "role": "Tech Founder & CEO",
        "background": "Built a SaaS company from zero to $200M ARR. Recently completed Series D.",
        "personality_traits": ["direct", "data-driven", "impatient with fluff", "values ROI"],
    },
    "cfo": {
        "name": "Margaret Chen",
        "role": "Chief Financial Officer",
        "background": "20 years in corporate finance, currently CFO of a Fortune 500 subsidiary.",
        "personality_traits": ["analytical", "risk-averse", "detail-oriented", "asks tough questions"],
    },
    "inheritor": {
        "name": "James Whitfield III",
        "role": "Next-Gen Wealth Inheritor",
        "background": "Recently inherited $50M trust. MBA from Wharton, limited real-world investment experience.",
        "personality_traits": ["eager to learn", "slightly insecure", "values transparency", "socially conscious"],
    },
    "family_office_principal": {
        "name": "Victoria Rothschild-Park",
        "role": "Family Office Principal",
        "background": "Manages a multi-generational family office with $500M AUM across global markets.",
        "personality_traits": ["sophisticated", "expects white-glove service", "privacy-focused", "long-term thinker"],
    },
}


class PersonaSimIntegration:
    """Manages AI persona simulation sessions for advisor training."""

    def __init__(self, client: VoiceForgeClient) -> None:
        self.client = client
        self._sessions: dict[str, dict[str, Any]] = {}

    async def start_session(self, persona_type: str, scenario: str) -> dict:
        """Start a new persona simulation session."""
        session_id = str(uuid.uuid4())
        persona = _PERSONA_TEMPLATES.get(persona_type)

        if not persona:
            raise ValueError(
                f"Unknown persona_type '{persona_type}'. "
                f"Choose from: {', '.join(_PERSONA_TEMPLATES)}"
            )

        opening_message = (
            f"Hello, I'm {persona['name']}. {persona['background']} "
            f"I understand we're going to discuss: {scenario}. Let's begin."
        )

        self._sessions[session_id] = {
            "persona_type": persona_type,
            "persona": persona,
            "scenario": scenario,
            "messages": [{"role": "persona", "content": opening_message, "ts": _now()}],
            "started_at": _now(),
        }

        return {
            "session_id": session_id,
            "persona": persona,
            "opening_message": opening_message,
        }

    async def send_message(self, session_id: str, user_message: str) -> dict:
        """Send a message in an active session and get the persona's response."""
        session = self._sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found or already ended.")

        session["messages"].append({"role": "user", "content": user_message, "ts": _now()})

        # In production this would call VoiceForge AI; here we provide a realistic mock
        persona = session["persona"]
        response_text = (
            f"As {persona['name']}, I appreciate your point. "
            f"Given my background as a {persona['role']}, I'd want to see "
            f"more concrete data before making a commitment. "
            f"Can you walk me through the risk-adjusted returns?"
        )
        sentiment = "neutral"
        coaching_tip = (
            "Good approach. Try using more specific numbers and "
            "reference points to build credibility with this persona type."
        )

        session["messages"].append({"role": "persona", "content": response_text, "ts": _now()})

        return {
            "response": response_text,
            "sentiment": sentiment,
            "coaching_tip": coaching_tip,
        }

    async def end_session(self, session_id: str) -> dict:
        """End a session and return performance analysis."""
        session = self._sessions.pop(session_id, None)
        if not session:
            raise ValueError(f"Session {session_id} not found or already ended.")

        user_messages = [m for m in session["messages"] if m["role"] == "user"]
        msg_count = len(user_messages)

        # Scoring heuristic (production would use VoiceForge AI analysis)
        base_score = min(60 + msg_count * 8, 100)

        return {
            "performance_score": base_score,
            "strengths": [
                "Maintained professional tone throughout",
                "Asked relevant follow-up questions",
            ],
            "improvements": [
                "Provide more specific data points when discussing returns",
                "Mirror the persona's communication style more closely",
            ],
            "transcript": session["messages"],
        }


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
