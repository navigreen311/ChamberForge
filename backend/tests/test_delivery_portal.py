"""Tests for DeliveryPortal service."""
from __future__ import annotations

import pytest

from app.services.integrations.visionaudio_client import VisionAudioForgeClient
from app.services.integrations.visionaudio_delivery import DeliveryPortal


@pytest.fixture
def portal() -> DeliveryPortal:
    client = VisionAudioForgeClient(api_url="https://test.local", api_key="")
    return DeliveryPortal(client)


@pytest.mark.asyncio
async def test_quarterly_report_returns_render_id(portal: DeliveryPortal) -> None:
    result = await portal.render_quarterly_report(
        metrics={"revenue": 500_000, "churn": 2.1},
        narrative="Strong Q1 performance driven by new client acquisition.",
    )
    assert "render_id" in result
    assert result["type"] == "quarterly_report"
    assert result["status"] == "pending"


@pytest.mark.asyncio
async def test_kpi_dashboard_returns_render_id(portal: DeliveryPortal) -> None:
    result = await portal.render_kpi_dashboard(
        kpis={"mrr": 120_000, "nps": 72, "ltv": 45_000},
    )
    assert "render_id" in result
    assert result["type"] == "kpi_dashboard"
