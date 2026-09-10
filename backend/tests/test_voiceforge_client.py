"""Tests for VoiceForgeClient — mock mode and auth headers."""
import pytest

from app.services.integrations.voiceforge_client import VoiceForgeClient


@pytest.fixture
def mock_client():
    """Client with no API key — triggers mock responses."""
    return VoiceForgeClient(api_url="https://voiceforge.test", api_key="")


@pytest.fixture
def auth_client():
    """Client with an API key — verifies auth headers are set."""
    return VoiceForgeClient(api_url="https://voiceforge.test", api_key="test-key-123")


# ---- Mock response tests ----


@pytest.mark.asyncio
async def test_initiate_call_mock(mock_client: VoiceForgeClient):
    result = await mock_client.initiate_call("+1234567890", "test_purpose")
    assert "call_id" in result
    assert result["status"] == "initiated"


@pytest.mark.asyncio
async def test_get_transcript_mock(mock_client: VoiceForgeClient):
    result = await mock_client.get_transcript("fake-call-id")
    assert "transcript" in result
    assert result["duration_seconds"] > 0


@pytest.mark.asyncio
async def test_get_sentiment_mock(mock_client: VoiceForgeClient):
    result = await mock_client.get_sentiment("fake-call-id")
    assert result["sentiment"] in ("positive", "neutral", "negative")
    assert 0.0 <= result["score"] <= 1.0
    assert isinstance(result["key_phrases"], list)


@pytest.mark.asyncio
async def test_verify_identity_mock(mock_client: VoiceForgeClient):
    result = await mock_client.verify_identity("user-1", "my-passphrase")
    assert result["verified"] is True
    assert 0.0 <= result["confidence"] <= 1.0


# ---- Auth header tests ----


def test_auth_header_present(auth_client: VoiceForgeClient):
    headers = auth_client._client.headers
    assert headers["authorization"] == "Bearer test-key-123"


def test_no_auth_header_when_no_key(mock_client: VoiceForgeClient):
    headers = mock_client._client.headers
    assert "authorization" not in headers
