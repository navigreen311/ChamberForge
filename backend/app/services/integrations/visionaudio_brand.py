"""Brand studio — identity generation and template creation."""
from __future__ import annotations

from typing import Any

from app.services.integrations.visionaudio_client import VisionAudioForgeClient


class BrandStudio:
    """AI-powered brand identity and template generation."""

    def __init__(self, client: VisionAudioForgeClient | None = None) -> None:
        self.client = client or VisionAudioForgeClient()

    async def generate_identity(
        self,
        brand_config: dict[str, Any],
    ) -> dict[str, Any]:
        """Generate a full brand identity package.

        Returns a rich identity object with logo concepts (descriptions, variants),
        a 5-color hex palette with usage guidance, typography recommendations,
        style guide notes, and a presentation template URL.
        """
        assets_result = await self.client.generate_brand_assets(brand_config)

        # Enrich the raw asset response with structured identity fields
        assets = assets_result.get("assets", [])
        logo_concepts = [a for a in assets if a.get("type") == "logo"]
        palette = next(
            (a for a in assets if a.get("type") == "color_palette"),
            None,
        )
        typography_asset = next(
            (a for a in assets if a.get("type") == "typography"),
            None,
        )
        style_guide = next(
            (a for a in assets if a.get("type") == "style_guide_notes"),
            None,
        )

        # Build typography — prefer asset data, fall back to brand_config
        if typography_asset and "recommendations" in typography_asset:
            typography = typography_asset["recommendations"]
        else:
            typography = {
                "primary_font": brand_config.get("primary_font", "Inter"),
                "secondary_font": brand_config.get("secondary_font", "Playfair Display"),
            }

        # Request a presentation template using the new brand
        template_content = {
            "type": "brand_template",
            "brand_config": brand_config,
        }
        template_result = await self.client.render_presentation(
            template_content,
            template="brand_master",
        )

        return {
            "logo_concepts": logo_concepts,
            "color_palette": palette,
            "typography": typography,
            "style_guide_notes": style_guide.get("notes", []) if style_guide else [],
            "presentation_template_url": template_result.get(
                "output_url",
                f"https://mock.visionaudioforge.io/templates/{template_result.get('render_id', 'default')}.pptx",
            ),
        }

    async def generate_templates(
        self,
        brand_identity: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """Generate a set of presentation templates from a brand identity."""
        template_types = [
            "pitch_deck",
            "proposal",
            "quarterly_report",
            "case_study",
            "one_pager",
        ]
        templates: list[dict[str, Any]] = []
        for ttype in template_types:
            content = {
                "type": "template_generation",
                "template_type": ttype,
                "brand_identity": brand_identity,
            }
            result = await self.client.render_presentation(content, template=ttype)
            templates.append({
                "template_type": ttype,
                "render_id": result.get("render_id"),
                "status": result.get("status"),
            })
        return templates
