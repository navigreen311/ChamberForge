"""VoiceForge API client - resilient transport with a typed degraded signal.

P-07 (T-032, T-033). Two defects, one of them serious.

**No resilience.** A single attempt, then `raise_for_status()` propagating a
raw `httpx` error into a route handler, so a partner's transient 503 became a
500 on ChamberForge.

**A mock fallback that answered as though it were the partner.** With no API
key configured, `_request` returned invented data in the real response shape:
a transcript ("Mock transcript: Hello, this is a test call."), a sentiment of
"positive" scoring 0.85, and - the one that matters -

    if path == "/identity/verify":
        return {"verified": True, "confidence": 0.95}

An identity check that returns **verified** when nothing was verified. On a
platform holding the affairs of high-net-worth families, an unconfigured
deployment answered "yes, that is them" to every caller, with a confidence
score attached, and no field anywhere marking the answer as invented.

Both are gone. Unconfigured now produces a typed degraded result carrying no
answer at all, and `/identity/verify` in particular has no fallback of any
kind - a verification that cannot be performed is not a verification that
failed, and neither is a pass.
"""
from __future__ import annotations

from typing import Any, Optional

import httpx

from app.services.integrations._resilience import (
    PartnerContractError,
    PartnerUnavailable,
    call_with_resilience,
)
from app.services.integrations._schemas import (
    VOICEFORGE_SCHEMAS,
    schema_for,
    validate_response,
)

PARTNER = "voiceforge"

REASON_NOT_CONFIGURED = "partner_not_configured"
REASON_UNAVAILABLE = "partner_unavailable"
REASON_CONTRACT = "partner_contract_changed"


def degraded(reason: str, detail: str) -> dict:
    """What a caller gets when the partner did not answer.

    Deliberately carries no partner fields. A caller that ignores the flag
    and reaches for `verified`, `transcript` or `sentiment` gets `None`, not
    a plausible value - so the failure mode of ignoring this is a missing
    value, never a fabricated one.

    `mock` is a deprecated alias kept only because `voiceforge_intel_brief.py`
    branches on it and is carved out to P-06. Remove it once P-06 has landed;
    `degraded` is the platform-wide key, matching P-04's agent contract.
    """
    return {
        "degraded": True,
        "degraded_reason": reason,
        "degraded_detail": detail,
        "partner": PARTNER,
        "mock": True,  # deprecated - see docstring
    }


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
        *,
        idempotent: Optional[bool] = None,
    ) -> dict:
        """Execute an authenticated request, retrying and validating.

        Never raises: every failure - unconfigured, unreachable, or a changed
        response shape - resolves to a degraded result, because these clients
        are called from route handlers that would otherwise return a 500 for
        somebody else's outage.
        """
        if not self.api_key:
            return degraded(
                REASON_NOT_CONFIGURED,
                "No VOICEFORGE_API_KEY is configured, so no call was made.",
            )

        async def attempt() -> dict:
            response = await self._client.request(method, path, json=data)
            response.raise_for_status()
            return response.json()

        try:
            payload = await call_with_resilience(
                PARTNER, method, attempt, idempotent=idempotent
            )
        except PartnerUnavailable as exc:
            return degraded(REASON_UNAVAILABLE, exc.detail)

        schema = schema_for(VOICEFORGE_SCHEMAS, path)
        if schema is None:
            return payload
        try:
            return validate_response(PARTNER, schema, payload)
        except PartnerContractError as exc:
            return degraded(REASON_CONTRACT, exc.detail)

    # ------------------------------------------------------------------
    # Public API methods
    # ------------------------------------------------------------------
    async def initiate_call(
        self,
        to_number: str,
        purpose: str,
        metadata: Optional[dict] = None,
    ) -> dict:
        """Place a call.

        Not retried. A read timeout here most likely means the request
        arrived and only the response was lost - so a retry rings a client a
        second time. `call_with_resilience` refuses to repeat a POST unless
        told it is safe, and this one is not.
        """
        payload: dict[str, Any] = {"to_number": to_number, "purpose": purpose}
        if metadata:
            payload["metadata"] = metadata
        return await self._request("POST", "/calls/initiate", payload)

    async def get_transcript(self, call_id: str) -> dict:
        return await self._request("GET", f"/calls/{call_id}/transcript")

    async def get_sentiment(self, call_id: str) -> dict:
        return await self._request("GET", f"/calls/{call_id}/sentiment")

    async def verify_identity(self, user_id: str, passphrase: str) -> dict:
        """Verify a caller's identity with the partner.

        A POST with no side effect at the partner, but **not** marked
        idempotent, and that is deliberate: repeatedly submitting a
        passphrase after a timeout is exactly the shape of a credential
        replay, and one attempt that fails closed is the safer default.

        There is no offline fallback. The previous implementation answered
        `verified: True, confidence: 0.95` whenever no key was configured;
        the degraded result carries no `verified` field at all, so a caller
        doing `result.get("verified")` gets `None` and fails closed.
        """
        return await self._request(
            "POST",
            "/identity/verify",
            {"user_id": user_id, "passphrase": passphrase},
        )

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------
    async def close(self) -> None:
        await self._client.aclose()
