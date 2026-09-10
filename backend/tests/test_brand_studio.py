"""Tests for BrandStudio service."""
from __future__ import annotations

import pytest

from app.services.integrations.visionaudio_brand import BrandStudio
from app.services.integrations.visionaudio_client import VisionAudioForgeClient


@pytest.fixture
def studio() -> BrandStudio:
    client = VisionAudioForgeClient(api_url="https://test.local", api_key="")
    return BrandStudio(client)


@pytest.mark.asyncio
async def test_generate_identity_returns_required_fields(studio: BrandStudio) -> None:
    result = await studio.generate_identity(
        brand_config={
            "name": "Apex Wealth",
            "industry": "financial_services",
            "primary_font": "Montserrat",
            "secondary_font": "Lora",
        },
    )
    # P-07: with no API key nothing is generated, and the result says so.
    # This used to assert primary_font == "Playfair Display" - a font the
    # mock client invented, asserted as though the partner had chosen it.
    assert result["assets_generated"] is False
    assert result["logo_concepts"] == []
    assert result["presentation_template_url"] is None

    # Typography falls back to the caller's own brand_config, which is an
    # echo rather than a recommendation - and legitimate for exactly that
    # reason.
    assert result["typography"]["primary_font"] == "Montserrat"
    assert result["typography"]["secondary_font"] == "Lora"


@pytest.mark.asyncio
async def test_generate_templates_returns_list(studio: BrandStudio) -> None:
    templates = await studio.generate_templates(
        brand_identity={"name": "Apex Wealth", "palette": "#001f3f"},
    )
    assert isinstance(templates, list)
    assert len(templates) >= 1
    for t in templates:
        assert "template_type" in t
        # render_id is None when nothing was queued: the template type is
        # the caller's own request echoed back, the render is the partner's
        # and did not happen.
        assert "render_id" in t
