"""BaseAgent — Abstract base class for all ChamberForge AI agents."""
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Optional

from app.core.config import settings


class BaseAgent(ABC):
    """Abstract base providing shared Claude API calling, status tracking, and prompt building."""

    def __init__(self, agent_name: str, anthropic_client=None):
        self.agent_name = agent_name
        self._client = anthropic_client
        self._status: str = "idle"
        self._last_output: Optional[dict] = None
        self._last_run_at: Optional[str] = None

    # ------------------------------------------------------------------
    # Abstract
    # ------------------------------------------------------------------
    @abstractmethod
    async def invoke(self, input_data: dict) -> dict:
        """Execute the agent's primary capability. Subclasses must implement."""
        ...

    # ------------------------------------------------------------------
    # Status helpers
    # ------------------------------------------------------------------
    def get_status(self) -> str:
        """Return current agent status: idle | running | complete | error."""
        return self._status

    def get_last_output(self) -> Optional[dict]:
        """Return the last output produced by invoke(), or None."""
        return self._last_output

    # ------------------------------------------------------------------
    # Prompt building
    # ------------------------------------------------------------------
    @staticmethod
    def _build_prompt(system_prompt: str, user_prompt: str) -> list:
        """Build standard Anthropic message list from system + user strings."""
        return [
            {"role": "user", "content": user_prompt},
        ]

    # ------------------------------------------------------------------
    # Shared Claude API call
    # ------------------------------------------------------------------
    async def _call_claude(self, system_prompt: str, user_prompt: str) -> str:
        """Call Claude via Anthropic SDK with error handling and graceful fallback.

        Returns the text response, or a fallback string when no API key / client
        is available.
        """
        if not self._client and settings.ANTHROPIC_API_KEY:
            try:
                import anthropic
                self._client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            except Exception:
                pass

        if not self._client:
            return self._fallback_response()

        try:
            messages = self._build_prompt(system_prompt, user_prompt)
            response = await self._client.messages.create(
                model=settings.AI_MODEL,
                max_tokens=2048,
                system=system_prompt,
                messages=messages,
            )
            return response.content[0].text
        except Exception as exc:
            return f'{{"error": "{str(exc)}"}}'

    def _fallback_response(self) -> str:
        """Return a static JSON string when the API is unavailable."""
        return '{"fallback": true, "message": "No API key configured — returning sample data."}'

    # ------------------------------------------------------------------
    # Internal state management helpers
    # ------------------------------------------------------------------
    def _mark_running(self):
        self._status = "running"
        self._last_run_at = datetime.now(timezone.utc).isoformat()

    def _mark_complete(self, output: dict):
        self._status = "complete"
        self._last_output = output

    def _mark_error(self, err: str):
        self._status = "error"
        self._last_output = {"error": err}
