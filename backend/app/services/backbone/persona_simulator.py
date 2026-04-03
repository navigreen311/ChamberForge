"""PersonaSimulator — AI roleplay conversation manager for sales practice."""

from __future__ import annotations

import json
from typing import Any
from uuid import uuid4

from app.core.config import settings


class PersonaSimulator:
    """Manages AI-powered roleplay conversations for sales training.

    Stores conversation history, evaluates performance, and provides coaching.
    """

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.model = model or settings.AI_MODEL
        self._sessions: dict[str, dict] = {}

    async def _call_llm(self, system_prompt: str, messages: list[dict]) -> str:
        try:
            import anthropic

            client = anthropic.AsyncAnthropic(api_key=self.api_key)
            msg = await client.messages.create(
                model=self.model,
                max_tokens=2048,
                system=system_prompt,
                messages=messages,
            )
            return msg.content[0].text
        except Exception:
            return ""

    def create_session(
        self,
        persona_name: str,
        persona_role: str,
        persona_traits: list[str],
        scenario: str,
        difficulty: str = "medium",
    ) -> dict:
        """Create a new roleplay session.

        Args:
            persona_name: Name of the simulated buyer persona
            persona_role: Their role (e.g., 'CFO at Fortune 500')
            persona_traits: Personality traits (e.g., ['skeptical', 'data-driven'])
            scenario: The scenario description
            difficulty: 'easy', 'medium', 'hard'

        Returns:
            Session dict with id and initial state
        """
        session_id = str(uuid4())

        objection_intensity = {"easy": "mild", "medium": "moderate", "hard": "aggressive"}
        intensity = objection_intensity.get(difficulty, "moderate")

        system_prompt = (
            f"You are {persona_name}, a {persona_role}. "
            f"Your personality traits: {', '.join(persona_traits)}. "
            f"Scenario: {scenario}. "
            f"You push back with {intensity} objections. "
            f"Stay in character. Be realistic. "
            f"Do NOT break character or give coaching advice. "
            f"Respond as this person would in a real meeting."
        )

        session = {
            "id": session_id,
            "persona_name": persona_name,
            "persona_role": persona_role,
            "persona_traits": persona_traits,
            "scenario": scenario,
            "difficulty": difficulty,
            "system_prompt": system_prompt,
            "history": [],
            "turn_count": 0,
            "status": "active",
            "scores": [],
        }
        self._sessions[session_id] = session
        return {
            "session_id": session_id,
            "persona_name": persona_name,
            "persona_role": persona_role,
            "scenario": scenario,
            "difficulty": difficulty,
            "status": "active",
        }

    async def send_message(self, session_id: str, user_message: str) -> dict | None:
        """Send a message in a roleplay session and get the persona's response.

        Args:
            session_id: Session ID
            user_message: The user's message (the salesperson's pitch/response)

        Returns:
            dict with persona_response, turn_number, or None if session not found
        """
        session = self._sessions.get(session_id)
        if not session or session["status"] != "active":
            return None

        session["history"].append({"role": "user", "content": user_message})
        session["turn_count"] += 1

        persona_response = await self._call_llm(
            session["system_prompt"],
            session["history"],
        )

        if not persona_response:
            # Fallback response based on difficulty
            fallback_responses = {
                "easy": f"That's interesting. Tell me more about how this would work for my team.",
                "medium": f"I appreciate that, but I'm not convinced yet. What makes this different from what we already have?",
                "hard": f"I've heard similar pitches before. Our current vendor does fine. Why should I risk switching?",
            }
            persona_response = fallback_responses.get(session["difficulty"], "Tell me more.")

        session["history"].append({"role": "assistant", "content": persona_response})

        return {
            "persona_response": persona_response,
            "turn_number": session["turn_count"],
            "session_id": session_id,
        }

    def get_session(self, session_id: str) -> dict | None:
        """Get full session data."""
        session = self._sessions.get(session_id)
        if not session:
            return None
        return {
            "session_id": session["id"],
            "persona_name": session["persona_name"],
            "persona_role": session["persona_role"],
            "scenario": session["scenario"],
            "difficulty": session["difficulty"],
            "turn_count": session["turn_count"],
            "status": session["status"],
            "history": [
                {"role": h["role"], "content": h["content"]}
                for h in session["history"]
            ],
        }

    def get_history(self, session_id: str) -> list[dict]:
        """Get conversation history for a session."""
        session = self._sessions.get(session_id)
        if not session:
            return []
        return [
            {"role": h["role"], "content": h["content"]}
            for h in session["history"]
        ]

    async def score_performance(self, session_id: str) -> dict | None:
        """Score the user's performance in a roleplay session.

        Returns:
            dict with scores across multiple dimensions and coaching feedback
        """
        session = self._sessions.get(session_id)
        if not session:
            return None

        user_messages = [h["content"] for h in session["history"] if h["role"] == "user"]
        if not user_messages:
            return {
                "session_id": session_id,
                "overall_score": 0,
                "dimensions": {},
                "feedback": "No messages sent yet.",
                "coaching_tips": [],
            }

        system_prompt = (
            "You are a sales coaching expert. Score this sales conversation. "
            "Return valid JSON with this structure: "
            '{"rapport": 1-10, "discovery": 1-10, "value_proposition": 1-10, '
            '"objection_handling": 1-10, "closing": 1-10, '
            '"feedback": "overall feedback", "coaching_tips": ["tip1", "tip2", "tip3"]}'
        )

        convo_text = "\n".join(
            f"{'Salesperson' if h['role'] == 'user' else session['persona_name']}: {h['content']}"
            for h in session["history"]
        )

        raw = await self._call_llm(system_prompt, [{"role": "user", "content": convo_text}])

        try:
            scores = json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            # Heuristic scoring based on conversation length and patterns
            msg_count = len(user_messages)
            avg_len = sum(len(m) for m in user_messages) / msg_count if msg_count else 0

            rapport = min(7, 3 + msg_count)
            discovery = 5 if any("?" in m for m in user_messages) else 3
            value_prop = 6 if avg_len > 100 else 4
            objection = 5 if msg_count >= 4 else 3
            closing = 5 if msg_count >= 6 else 3

            scores = {
                "rapport": rapport,
                "discovery": discovery,
                "value_proposition": value_prop,
                "objection_handling": objection,
                "closing": closing,
                "feedback": "Good conversation flow. Focus on asking more discovery questions and tailoring your value proposition.",
                "coaching_tips": [
                    "Ask open-ended questions to uncover deeper pain points",
                    "Use specific numbers and case studies when presenting value",
                    "Address objections by acknowledging, then reframing",
                ],
            }

        dimensions = {
            "rapport": scores.get("rapport", 5),
            "discovery": scores.get("discovery", 5),
            "value_proposition": scores.get("value_proposition", 5),
            "objection_handling": scores.get("objection_handling", 5),
            "closing": scores.get("closing", 5),
        }
        overall = round(sum(dimensions.values()) / len(dimensions), 1)

        result = {
            "session_id": session_id,
            "overall_score": overall,
            "dimensions": dimensions,
            "feedback": scores.get("feedback", ""),
            "coaching_tips": scores.get("coaching_tips", []),
        }

        session["scores"].append(result)
        return result

    def end_session(self, session_id: str) -> dict | None:
        """End a roleplay session."""
        session = self._sessions.get(session_id)
        if not session:
            return None
        session["status"] = "completed"
        return {
            "session_id": session_id,
            "status": "completed",
            "total_turns": session["turn_count"],
        }
