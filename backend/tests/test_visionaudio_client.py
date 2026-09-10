"""Tests for VisionAudioForgeClient - a render happened, or it did not.

Rewritten by P-07. Every "mock" test here asserted that a client with **no
API key** returned a usable render: a render_id, a status of pending, an
estimated duration, a completed job with an output_url.

What sat behind those assertions was not placeholder data. A quarterly-report
render returned total AUM of $847.3M, a net return of +4.2%, alpha of 85bps,
a Sharpe ratio of 1.42 and four dated investment recommendations - and
`test_mock_render_status` asserted the job came back **complete** with a
download link, for a document that was never produced.

The contract now: no key means no render, and no fields describing one.
"""
from __future__ import annotations

import pytest

from app.services.integrations.visionaudio_client import VisionAudioForgeClient


@pytest.fixture
def unconfigured() -> VisionAudioForgeClient:
    """A deployment with no VISIONAUDIOFORGE_API_KEY."""
    return VisionAudioForgeClient(api_url="https://test.local", api_key="")


@pytest.mark.asyncio
async def test_no_presentation_is_rendered(unconfigured: VisionAudioForgeClient) -> None:
    result = await unconfigured.render_presentation({"title": "Q1 Report"})

    assert result["degraded"] is True
    assert result["degraded_reason"] == "partner_not_configured"
    assert "render_id" not in result
    assert "estimated_time_seconds" not in result


@pytest.mark.asyncio
async def test_no_quarterly_figures_are_invented(
    unconfigured: VisionAudioForgeClient,
) -> None:
    """The largest fabrication in the codebase, asserted gone by value."""
    result = await unconfigured.render_presentation({"type": "quarterly_report"})
    rendered = str(result)

    assert "sections" not in result
    for invented in ("847.3", "sharpe_ratio", "alpha_generated_bps", "127K"):
        assert invented not in rendered


@pytest.mark.asyncio
async def test_no_dashboard_is_rendered(unconfigured: VisionAudioForgeClient) -> None:
    result = await unconfigured.render_dashboard({"revenue": 1_000_000})

    assert result["degraded"] is True
    assert "render_id" not in result


@pytest.mark.asyncio
async def test_no_brand_assets_are_invented(
    unconfigured: VisionAudioForgeClient,
) -> None:
    result = await unconfigured.generate_brand_assets({"name": "Acme"})

    assert result["degraded"] is True
    assert "assets" not in result


@pytest.mark.asyncio
async def test_no_video_is_produced(unconfigured: VisionAudioForgeClient) -> None:
    result = await unconfigured.produce_video({"scenes": []})

    assert result["degraded"] is True
    assert "estimated_duration" not in result
    assert "before_after_metrics" not in result


@pytest.mark.asyncio
async def test_a_job_that_never_ran_is_not_complete(
    unconfigured: VisionAudioForgeClient,
) -> None:
    """This previously returned status "complete" with a download link.

    A UI polling for a render would have shown the client's document as
    ready, linking to a host that resolves nowhere.
    """
    result = await unconfigured.get_render_status("abc-123")

    assert result["degraded"] is True
    assert result.get("status") != "complete"
    assert result.get("output_url") is None
    assert "mock.visionaudioforge.io" not in str(result)


@pytest.mark.asyncio
async def test_auth_header_set_when_api_key_provided() -> None:
    client = VisionAudioForgeClient(api_url="https://test.local", api_key="sk-test-key")
    assert client._client.headers["authorization"] == "Bearer sk-test-key"
    await client.close()


@pytest.mark.asyncio
async def test_context_manager() -> None:
    async with VisionAudioForgeClient(
        api_url="https://test.local", api_key=""
    ) as client:
        result = await client.get_render_status("abc")
        assert result["degraded"] is True
