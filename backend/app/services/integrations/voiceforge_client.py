"""VoiceForge API client — async HTTP wrapper with mock fallback."""
import uuid
from typing import Any, Optional

import httpx


class VoiceForgeClient:
    """Low-level async client for the VoiceForge API."""

    def __init__(self, api_url: str, api_key: str) -> None:
        self.api_url = api_url.rstrip("/") if api_url else ""
        self.api_key = api_key
        self._client = httpx.AsyncClient(
            base_url=self.api_url,
            timeout=30.0,
            headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
        )

    # ------------------------------------------------------------------
    # Shared request helper
    # ------------------------------------------------------------------
    async def _request(
        self,
        method: str,
        path: str,
        data: Optional[dict[str, Any]] = None,
    ) -> dict:
        """Execute an authenticated request. Returns mock data when no API key is configured."""
        if not self.api_key:
            return self._mock_response(method, path, data)

        response = await self._client.request(method, path, json=data)
        response.raise_for_status()
        return response.json()

    # ------------------------------------------------------------------
    # Public API methods
    # ------------------------------------------------------------------
    async def initiate_call(
        self,
        to_number: str,
        purpose: str,
        metadata: Optional[dict] = None,
    ) -> dict:
        payload: dict[str, Any] = {"to_number": to_number, "purpose": purpose}
        if metadata:
            payload["metadata"] = metadata
        return await self._request("POST", "/calls/initiate", payload)

    async def get_transcript(self, call_id: str) -> dict:
        return await self._request("GET", f"/calls/{call_id}/transcript")

    async def get_sentiment(self, call_id: str) -> dict:
        return await self._request("GET", f"/calls/{call_id}/sentiment")

    async def verify_identity(self, user_id: str, passphrase: str) -> dict:
        return await self._request(
            "POST",
            "/identity/verify",
            {"user_id": user_id, "passphrase": passphrase},
        )

    # ------------------------------------------------------------------
    # Mock responses (used when VOICEFORGE_API_KEY is empty)
    # ------------------------------------------------------------------
    def _mock_response(
        self,
        method: str,
        path: str,
        data: Optional[dict[str, Any]] = None,
    ) -> dict:
        call_id = str(uuid.uuid4())

        if path == "/calls/initiate":
            return {"call_id": call_id, "status": "initiated"}

        if "/transcript" in path:
            return {
                "call_id": path.split("/")[2],
                "transcript": "Mock transcript: Hello, this is a test call.",
                "duration_seconds": 42.5,
            }

        if "/sentiment" in path:
            return {
                "call_id": path.split("/")[2],
                "sentiment": "positive",
                "score": 0.85,
                "key_phrases": ["great service", "satisfied"],
            }

        if path == "/identity/verify":
            return {"verified": True, "confidence": 0.95}

        return {"mock": True, "method": method, "path": path}

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------
    async def close(self) -> None:
        await self._client.aclose()
