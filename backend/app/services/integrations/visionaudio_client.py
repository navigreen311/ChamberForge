"""VisionAudioForge API client - resilient transport with a typed degraded signal.

P-07 (T-032, T-033). The transport had the same two defects as the VoiceForge
client - one attempt with no backoff, and a mock fallback that answered in
the partner's own response shape - but the payloads made it considerably
worse.

With **no API key configured**, a quarterly-report render returned a
complete, populated client performance report:

    "total_aum": "$847.3M", "net_return_qtd": "+4.2%",
    "benchmark_return_qtd": "+3.35%", "alpha_generated_bps": 85,
    "sharpe_ratio": 1.42, "max_drawdown_qtd": "-2.1%",
    "revenue_qtd": "$1.53M", "client_retention_rate": "98.4%"

alongside "Tax-loss harvesting captured $127K in realizable losses
year-to-date" and four dated investment recommendations. The video path did
the same thing with proof metrics - "$284K saved", "92% reduction in
compliance exposure events", NPS 62 to 81.

These are investment performance figures and client outcomes for a
wealth-management deliverable. They were returned in the same shape as a real
render, with an `output_url` pointing at a `.pptx`, and the only signal that
none of it was real was the word "mock" in a hostname that resolves nowhere.
An advisor generating a quarterly report against an unconfigured deployment
would have received a complete and entirely invented performance report for a
client.

All of it is deleted. There is no offline render, no sample deck and no
placeholder figure: a render that did not happen produces a typed degraded
result and nothing else.
"""
from __future__ import annotations

from typing import Any, Optional

import httpx

from app.core.config import settings
from app.services.integrations._resilience import (
    PartnerContractError,
    PartnerUnavailable,
    call_with_resilience,
)
from app.services.integrations._schemas import (
    VISIONAUDIO_SCHEMAS,
    schema_for,
    validate_response,
)

PARTNER = "visionaudioforge"

REASON_NOT_CONFIGURED = "partner_not_configured"
REASON_UNAVAILABLE = "partner_unavailable"
REASON_CONTRACT = "partner_contract_changed"


def degraded(reason: str, detail: str) -> dict[str, Any]:
    """What a caller gets when no render happened.

    Carries no `render_id`, no `output_url` and no `status`. A caller that
    ignores the flag and reads one of those gets `None` rather than a link to
    a document that does not exist.
    """
    return {
        "degraded": True,
        "degraded_reason": reason,
        "degraded_detail": detail,
        "partner": PARTNER,
    }


def is_degraded(payload: Any) -> bool:
    """True when *payload* is a degraded result rather than a render."""
    return isinstance(payload, dict) and payload.get("degraded") is True


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
        *,
        idempotent: Optional[bool] = None,
    ) -> dict[str, Any]:
        """Send an authenticated request, retrying and validating the response.

        Never raises. Unconfigured, unreachable and contract-changed all
        resolve to a degraded result, so a partner outage does not become a
        500 from a ChamberForge route.
        """
        if not self.api_key:
            return degraded(
                REASON_NOT_CONFIGURED,
                "No VISIONAUDIOFORGE_API_KEY is configured, so nothing was rendered.",
            )

        async def attempt() -> dict[str, Any]:
            response = await self._client.request(method, path, json=data)
            response.raise_for_status()
            return response.json()

        try:
            payload = await call_with_resilience(
                PARTNER, method, attempt, idempotent=idempotent
            )
        except PartnerUnavailable as exc:
            return degraded(REASON_UNAVAILABLE, exc.detail)

        schema = schema_for(VISIONAUDIO_SCHEMAS, path)
        if schema is None:
            return payload
        try:
            return validate_response(PARTNER, schema, payload)
        except PartnerContractError as exc:
            return degraded(REASON_CONTRACT, exc.detail)

    # -- high-level helpers ---------------------------------------------------

    async def render_presentation(
        self,
        content: dict[str, Any],
        template: str = "premium",
    ) -> dict[str, Any]:
        """Queue a presentation render and return tracking info.

        Queuing a render is a side effect - it consumes partner quota and
        produces a document - so a timeout is not retried. A duplicate deck
        is cheaper than a duplicate phone call, but it is still a document
        somebody has to reconcile.
        """
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
        """Poll the status of any render job.

        A GET, so it is retried: polling is the one operation here that is
        safe to repeat, and it is also the one most likely to be hit during a
        partner wobble.
        """
        return await self._request("GET", f"/renders/{render_id}/status")

    # -- lifecycle ------------------------------------------------------------

    async def close(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "VisionAudioForgeClient":
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self.close()
