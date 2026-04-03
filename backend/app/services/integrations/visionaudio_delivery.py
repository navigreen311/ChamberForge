"""Delivery portal — quarterly reports & KPI dashboards via VisionAudioForge."""
from __future__ import annotations

from typing import Any

from app.services.integrations.visionaudio_client import VisionAudioForgeClient


class DeliveryPortal:
    """High-level service for client-facing delivery artefacts."""

    def __init__(self, client: VisionAudioForgeClient | None = None) -> None:
        self.client = client or VisionAudioForgeClient()

    async def render_quarterly_report(
        self,
        metrics: dict[str, Any],
        narrative: str,
    ) -> dict[str, Any]:
        """Render a branded quarterly report presentation.

        Returns render tracking info plus structured section data including
        executive summary, KPI dashboard, trend analysis, and recommendations.
        """
        content = {
            "type": "quarterly_report",
            "metrics": metrics,
            "narrative": narrative,
            "sections": [
                "executive_summary",
                "kpi_overview",
                "trend_analysis",
                "recommendations",
            ],
        }
        result = await self.client.render_presentation(content, template="quarterly")

        # Surface structured sections from the render result (populated in mock mode)
        sections = result.pop("sections", {})

        return {
            **result,
            "type": "quarterly_report",
            "report_sections": sections,
        }

    async def render_kpi_dashboard(
        self,
        kpis: dict[str, Any],
    ) -> dict[str, Any]:
        """Render an interactive KPI dashboard for client delivery."""
        result = await self.client.render_dashboard(
            metrics=kpis,
            layout="executive",
        )
        return {**result, "type": "kpi_dashboard"}
