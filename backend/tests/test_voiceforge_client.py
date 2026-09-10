"""Tests for VoiceForgeClient - degraded when unconfigured, never fabricated.

Rewritten by P-07. Every test in the "mock response" block asserted that a
client with **no API key** returned usable partner data:

    result = await mock_client.verify_identity("user-1", "my-passphrase")
    assert result["verified"] is True

That test guaranteed an identity-verification bypass. It passed because the
client answered `{"verified": True, "confidence": 0.95}` whenever it was
unconfigured - so an unconfigured deployment confirmed every identity it was
asked about, and the suite made sure it kept doing so.

The others were the same shape with lower stakes: an invented transcript, an
invented sentiment score, an invented call id for a call nobody placed.
"""
import pytest

from app.services.integrations.voiceforge_client import VoiceForgeClient


@pytest.fixture
def unconfigured():
    """A deployment with no VOICEFORGE_API_KEY."""
    return VoiceForgeClient(api_url="https://voiceforge.test", api_key="")


@pytest.fixture
def auth_client():
    return VoiceForgeClient(api_url="https://voiceforge.test", api_key="test-key-123")


# ---- Unconfigured: typed degradation, no data ----


@pytest.mark.asyncio
async def test_no_call_is_reported_as_placed(unconfigured: VoiceForgeClient):
    result = await unconfigured.initiate_call("+1234567890", "test_purpose")

    assert result["degraded"] is True
    assert result["degraded_reason"] == "partner_not_configured"
    assert "call_id" not in result, "a call id implies a call was placed"


@pytest.mark.asyncio
async def test_no_transcript_is_invented(unconfigured: VoiceForgeClient):
    result = await unconfigured.get_transcript("fake-call-id")

    assert result["degraded"] is True
    assert "transcript" not in result
    assert "duration_seconds" not in result


@pytest.mark.asyncio
async def test_no_sentiment_is_invented(unconfigured: VoiceForgeClient):
    result = await unconfigured.get_sentiment("fake-call-id")

    assert result["degraded"] is True
    assert "sentiment" not in result
    assert "score" not in result


@pytest.mark.asyncio
async def test_an_unverified_identity_never_reads_as_verified(
    unconfigured: VoiceForgeClient,
):
    """The test this file previously got backwards.

    It asserted `result["verified"] is True` for an unconfigured client. The
    contract now is that no `verified` key exists at all, so the expression
    every caller uses - `result.get("verified")` - is falsy and the caller
    fails closed.
    """
    result = await unconfigured.verify_identity("user-1", "my-passphrase")

    assert result["degraded"] is True
    assert result.get("verified") is not True
    assert not result.get("verified")
    assert "confidence" not in result


@pytest.mark.asyncio
async def test_the_degraded_result_names_the_partner(unconfigured: VoiceForgeClient):
    """So an operator can tell which integration is unconfigured."""
    result = await unconfigured.get_transcript("c-1")

    assert result["partner"] == "voiceforge"
    assert "VOICEFORGE_API_KEY" in result["degraded_detail"]


# ---- Auth header tests (unchanged behaviour) ----


def test_auth_header_present(auth_client: VoiceForgeClient):
    headers = auth_client._client.headers
    assert headers["authorization"] == "Bearer test-key-123"


def test_no_auth_header_when_no_key(unconfigured: VoiceForgeClient):
    headers = unconfigured._client.headers
    assert "authorization" not in headers
