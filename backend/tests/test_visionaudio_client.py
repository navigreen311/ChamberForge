"""Tests for VisionAudioForgeClient — mock responses, auth, render status."""
from __future__ import annotations

import pytest

from app.services.integrations.visionaudio_client import VisionAudioForgeClient


@pytest.fixture
def mock_client() -> VisionAudioForgeClient:
    """Client with no API key → always returns mock data."""
    return VisionAudioForgeClient(api_url="https://test.local", api_key="")


@pytest.mark.asyncio
async def test_mock_render_presentation(mock_client: VisionAudioForgeClient) -> None:
    result = await mock_client.render_presentation({"title": "Q1 Report"})
    assert "render_id" in result
    assert result["status"] == "pending"
    assert result["estimated_time_seconds"] == 45


@pytest.mark.asyncio
async def test_mock_render_dashboard(mock_client: VisionAudioForgeClient) -> None:
    result = await mock_client.render_dashboard({"revenue": 1_000_000})
    assert "render_id" in result
    assert result["status"] == "pending"


@pytest.mark.asyncio
async def test_mock_generate_brand_assets(mock_client: VisionAudioForgeClient) -> None:
    result = await mock_client.generate_brand_assets({"name": "Acme"})
    assert "assets" in result
    assert len(result["assets"]) >= 1
    assert result["assets"][0]["type"] == "logo"


@pytest.mark.asyncio
async def test_mock_produce_video(mock_client: VisionAudioForgeClient) -> None:
    result = await mock_client.produce_video({"scenes": []})
    assert "render_id" in result
    assert result["status"] == "pending"
    assert "estimated_duration" in result


@pytest.mark.asyncio
async def test_mock_render_status(mock_client: VisionAudioForgeClient) -> None:
    result = await mock_client.get_render_status("abc-123")
    assert result["render_id"] == "abc-123"
    assert result["status"] == "complete"
    assert "output_url" in result


@pytest.mark.asyncio
async def test_auth_header_set_when_api_key_provided() -> None:
    client = VisionAudioForgeClient(api_url="https://test.local", api_key="sk-test-key")
    assert client._client.headers["authorization"] == "Bearer sk-test-key"
    await client.close()


@pytest.mark.asyncio
async def test_auth_header_absent_when_no_api_key() -> None:
    client = VisionAudioForgeClient(api_url="https://test.local", api_key="")
    assert "authorization" not in {k.lower(): v for k, v in client._client.headers.items()}
    await client.close()


@pytest.mark.asyncio
async def test_render_status_polling_returns_complete(mock_client: VisionAudioForgeClient) -> None:
    """Simulate polling — mock always returns 'complete'."""
    rid = "poll-test-001"
    for _ in range(3):
        status = await mock_client.get_render_status(rid)
        assert status["status"] in ("pending", "rendering", "complete", "failed")
    assert status["status"] == "complete"


@pytest.mark.asyncio
async def test_context_manager() -> None:
    async with VisionAudioForgeClient(api_url="https://test.local", api_key="") as c:
        result = await c.render_presentation({"title": "test"})
        assert "render_id" in result
