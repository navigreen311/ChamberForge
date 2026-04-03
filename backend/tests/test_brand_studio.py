"""Tests for BrandStudio service."""
from __future__ import annotations

import pytest

from app.services.integrations.visionaudio_client import VisionAudioForgeClient
from app.services.integrations.visionaudio_brand import BrandStudio


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
    assert "logo_concepts" in result
    assert "color_palette" in result
    assert "typography" in result
    assert "presentation_template_url" in result
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
        assert "render_id" in t
        assert "status" in t
