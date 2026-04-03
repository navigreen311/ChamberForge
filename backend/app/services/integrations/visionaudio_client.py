"""VisionAudioForge API client — async HTTP wrapper with mock fallback."""
from __future__ import annotations

import uuid
from typing import Any

import httpx

from app.core.config import settings


class VisionAudioForgeClient:
    """Low-level async client for the VisionAudioForge rendering API."""

    def __init__(
        self,
        api_url: str | None = None,
        api_key: str | None = None,
    ) -> None:
        self.api_url = (api_url or settings.VISIONAUDIOFORGE_API_URL).rstrip("/")
        self.api_key = api_key or settings.VISIONAUDIOFORGE_API_KEY
        self._client = httpx.AsyncClient(
            base_url=self.api_url,
            timeout=httpx.Timeout(30.0),
            headers=self._build_headers(),
        )

    def _build_headers(self) -> dict[str, str]:
        headers: dict[str, str] = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    # -- transport ------------------------------------------------------------

    async def _request(
        self,
        method: str,
        path: str,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Send an authenticated request. Falls back to mock when no API key."""
        if not self.api_key:
            return self._mock_response(method, path, data)

        response = await self._client.request(method, path, json=data)
        response.raise_for_status()
        return response.json()

    # -- high-level helpers ---------------------------------------------------

    async def render_presentation(
        self,
        content: dict[str, Any],
        template: str = "premium",
    ) -> dict[str, Any]:
        """Queue a presentation render and return tracking info."""
        return await self._request(
            "POST",
            "/renders/presentation",
            {"content": content, "template": template},
        )

    async def render_dashboard(
        self,
        metrics: dict[str, Any],
        layout: str = "executive",
    ) -> dict[str, Any]:
        """Queue an interactive dashboard render."""
        return await self._request(
            "POST",
            "/renders/dashboard",
            {"metrics": metrics, "layout": layout},
        )

    async def generate_brand_assets(
        self,
        brand_config: dict[str, Any],
    ) -> dict[str, Any]:
        """Generate brand assets (logo, palette, typography)."""
        return await self._request(
            "POST",
            "/brand/assets",
            {"brand_config": brand_config},
        )

    async def produce_video(
        self,
        script: dict[str, Any],
        style: str = "professional",
    ) -> dict[str, Any]:
        """Queue a video production job."""
        return await self._request(
            "POST",
            "/renders/video",
            {"script": script, "style": style},
        )

    async def get_render_status(self, render_id: str) -> dict[str, Any]:
        """Poll the status of any render job."""
        return await self._request("GET", f"/renders/{render_id}/status")

    # -- mock layer -----------------------------------------------------------

    @staticmethod
    def _mock_response(
        method: str,
        path: str,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Return deterministic mock data when running without a real API key."""
        render_id = str(uuid.uuid4())

        if "/renders/" in path and path.endswith("/status"):
            # extract render_id from path
            parts = path.strip("/").split("/")
            rid = parts[1] if len(parts) >= 3 else render_id
            return {
                "render_id": rid,
                "status": "complete",
                "output_url": f"https://mock.visionaudioforge.io/output/{rid}.mp4",
            }

        if path.endswith("/presentation"):
            return {
                "render_id": render_id,
                "status": "pending",
                "estimated_time_seconds": 45,
            }

        if path.endswith("/dashboard"):
            return {"render_id": render_id, "status": "pending"}

        if path.endswith("/assets"):
            return {
                "assets": [
                    {
                        "type": "logo",
                        "url": f"https://mock.visionaudioforge.io/assets/{render_id}/logo.svg",
                        "format": "svg",
                    },
                    {
                        "type": "color_palette",
                        "url": f"https://mock.visionaudioforge.io/assets/{render_id}/palette.json",
                        "format": "json",
                    },
                ]
            }

        if path.endswith("/video"):
            return {
                "render_id": render_id,
                "status": "pending",
                "estimated_duration": 120,
            }

        # generic fallback
        return {"render_id": render_id, "status": "pending"}

    # -- lifecycle ------------------------------------------------------------

    async def close(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "VisionAudioForgeClient":
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self.close()
