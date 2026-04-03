"""VisionAudioForge API client — async HTTP wrapper with mock fallback."""
from __future__ import annotations

import uuid
from typing import Any

import httpx

from app.core.config import settings


class VisionAudioForgeClient:
    """Low-level async client for the VisionAudioForge rendering API."""

    def __init__(
        self,
        api_url: str | None = None,
        api_key: str | None = None,
    ) -> None:
        self.api_url = (api_url or settings.VISIONAUDIOFORGE_API_URL).rstrip("/")
        self.api_key = api_key or settings.VISIONAUDIOFORGE_API_KEY
        self._client = httpx.AsyncClient(
            base_url=self.api_url,
            timeout=httpx.Timeout(30.0),
            headers=self._build_headers(),
        )

    def _build_headers(self) -> dict[str, str]:
        headers: dict[str, str] = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    # -- transport ------------------------------------------------------------

    async def _request(
        self,
        method: str,
        path: str,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Send an authenticated request. Falls back to mock when no API key."""
        if not self.api_key:
            return self._mock_response(method, path, data)

        response = await self._client.request(method, path, json=data)
        response.raise_for_status()
        return response.json()

    # -- high-level helpers ---------------------------------------------------

    async def render_presentation(
        self,
        content: dict[str, Any],
        template: str = "premium",
    ) -> dict[str, Any]:
        """Queue a presentation render and return tracking info."""
        return await self._request(
            "POST",
            "/renders/presentation",
            {"content": content, "template": template},
        )

    async def render_dashboard(
        self,
        metrics: dict[str, Any],
        layout: str = "executive",
    ) -> dict[str, Any]:
        """Queue an interactive dashboard render."""
        return await self._request(
            "POST",
            "/renders/dashboard",
            {"metrics": metrics, "layout": layout},
        )

    async def generate_brand_assets(
        self,
        brand_config: dict[str, Any],
    ) -> dict[str, Any]:
        """Generate brand assets (logo, palette, typography)."""
        return await self._request(
            "POST",
            "/brand/assets",
            {"brand_config": brand_config},
        )

    async def produce_video(
        self,
        script: dict[str, Any],
        style: str = "professional",
    ) -> dict[str, Any]:
        """Queue a video production job."""
        return await self._request(
            "POST",
            "/renders/video",
            {"script": script, "style": style},
        )

    async def get_render_status(self, render_id: str) -> dict[str, Any]:
        """Poll the status of any render job."""
        return await self._request("GET", f"/renders/{render_id}/status")

    # -- mock layer -----------------------------------------------------------

    @staticmethod
    def _mock_response(
        method: str,
        path: str,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Return deterministic mock data when running without a real API key."""
        render_id = str(uuid.uuid4())

        if "/renders/" in path and path.endswith("/status"):
            # extract render_id from path
            parts = path.strip("/").split("/")
            rid = parts[1] if len(parts) >= 3 else render_id
            return {
                "render_id": rid,
                "status": "complete",
                "output_url": f"https://mock.visionaudioforge.io/output/{rid}.mp4",
            }

        if path.endswith("/presentation"):
            # Enrich with structured section data when content is a quarterly report
            content = (data or {}).get("content", {})
            sections = {}
            if content.get("type") == "quarterly_report":
                sections = {
                    "executive_summary": {
                        "title": "Executive Summary — Q1 2026",
                        "highlights": [
                            "Portfolio returned +4.2% net of fees, outperforming the blended benchmark by 85bps",
                            "Successfully rebalanced alternatives sleeve, reducing illiquidity from 18% to 14%",
                            "Tax-loss harvesting captured $127K in realizable losses year-to-date",
                            "Client Net Promoter Score improved from 72 to 78 quarter-over-quarter",
                        ],
                        "outlook": "Moderately constructive on equities with a tilt toward quality factors; maintaining duration underweight in fixed income pending Fed guidance.",
                    },
                    "kpi_dashboard": {
                        "total_aum": "$847.3M",
                        "net_return_qtd": "+4.2%",
                        "net_return_ytd": "+4.2%",
                        "benchmark_return_qtd": "+3.35%",
                        "alpha_generated_bps": 85,
                        "sharpe_ratio": 1.42,
                        "max_drawdown_qtd": "-2.1%",
                        "new_assets_qtd": "$23.5M",
                        "client_retention_rate": "98.4%",
                        "active_clients": 142,
                        "avg_fee_bps": 72,
                        "revenue_qtd": "$1.53M",
                    },
                    "trend_analysis": {
                        "equity_allocation_trend": [
                            {"month": "Jan", "weight": 0.58},
                            {"month": "Feb", "weight": 0.60},
                            {"month": "Mar", "weight": 0.62},
                        ],
                        "fixed_income_duration": [
                            {"month": "Jan", "years": 4.2},
                            {"month": "Feb", "years": 3.8},
                            {"month": "Mar", "years": 3.5},
                        ],
                        "client_sentiment_trend": [
                            {"month": "Jan", "nps": 72},
                            {"month": "Feb", "nps": 74},
                            {"month": "Mar", "nps": 78},
                        ],
                        "observations": [
                            "Equity allocation drifted higher with market appreciation; rebalancing scheduled for April",
                            "Duration reduction reflects tactical positioning ahead of anticipated rate hold",
                            "NPS improvement driven by new quarterly video briefing initiative",
                        ],
                    },
                    "recommendations": [
                        {
                            "priority": "high",
                            "action": "Increase allocation to investment-grade credit",
                            "rationale": "Spreads at 18-month wides offer attractive entry; target 5% portfolio weight",
                            "timeline": "Implement by April 15",
                        },
                        {
                            "priority": "medium",
                            "action": "Initiate direct indexing pilot for top-10 taxable accounts",
                            "rationale": "Estimated 40-60bps annual tax alpha; supports fee justification narrative",
                            "timeline": "Q2 2026 rollout",
                        },
                        {
                            "priority": "medium",
                            "action": "Schedule next-gen engagement workshops",
                            "rationale": "12 client families have identified successors; retention risk if not engaged",
                            "timeline": "May-June 2026",
                        },
                        {
                            "priority": "low",
                            "action": "Evaluate alternative custodian pricing",
                            "rationale": "Current custody costs 2bps above market; renegotiation could save $85K annually",
                            "timeline": "Review by end of Q2",
                        },
                    ],
                }

            return {
                "render_id": render_id,
                "status": "pending",
                "estimated_time_seconds": 45,
                "sections": sections,
                "output_url": f"https://mock.visionaudioforge.io/output/{render_id}.pptx",
            }

        if path.endswith("/dashboard"):
            return {"render_id": render_id, "status": "pending"}

        if path.endswith("/assets"):
            base = f"https://mock.visionaudioforge.io/assets/{render_id}"
            return {
                "assets": [
                    {
                        "type": "logo",
                        "variant": "primary",
                        "description": "Elegant monogram mark — interlocking initials with a subtle shield motif conveying trust and heritage",
                        "url": f"{base}/logo-primary.svg",
                        "format": "svg",
                    },
                    {
                        "type": "logo",
                        "variant": "wordmark",
                        "description": "Full wordmark in custom serif typeface with refined letterspacing for premium stationery and digital headers",
                        "url": f"{base}/logo-wordmark.svg",
                        "format": "svg",
                    },
                    {
                        "type": "logo",
                        "variant": "icon",
                        "description": "Simplified icon for favicons and app icons — single-color shield element at 64x64px minimum",
                        "url": f"{base}/logo-icon.svg",
                        "format": "svg",
                    },
                    {
                        "type": "color_palette",
                        "colors": [
                            {"name": "Navy Depth", "hex": "#0B1D3A", "role": "primary", "usage": "Headlines, primary buttons, navigation backgrounds"},
                            {"name": "Champagne Gold", "hex": "#C9A96E", "role": "accent", "usage": "Accent borders, icons, call-to-action highlights"},
                            {"name": "Ivory Mist", "hex": "#F7F4EF", "role": "background", "usage": "Page backgrounds, card surfaces, light sections"},
                            {"name": "Slate Charcoal", "hex": "#3D3D3D", "role": "text", "usage": "Body copy, secondary text, form labels"},
                            {"name": "Soft Silver", "hex": "#B8BFC6", "role": "muted", "usage": "Dividers, disabled states, subtle borders"},
                        ],
                        "url": f"{base}/palette.json",
                        "format": "json",
                    },
                    {
                        "type": "typography",
                        "recommendations": {
                            "primary_font": "Playfair Display",
                            "primary_usage": "Headlines, hero text, report titles — conveys authority and heritage",
                            "secondary_font": "Inter",
                            "secondary_usage": "Body copy, UI elements, data tables — optimized for screen readability",
                            "accent_font": "Cormorant Garamond",
                            "accent_usage": "Pull quotes, testimonials, elegant callouts",
                            "scale": {
                                "h1": "2.5rem / 700 weight",
                                "h2": "2rem / 600 weight",
                                "h3": "1.5rem / 600 weight",
                                "body": "1rem / 400 weight",
                                "caption": "0.875rem / 400 weight",
                            },
                        },
                    },
                    {
                        "type": "style_guide_notes",
                        "notes": [
                            "Maintain 60px minimum clear space around the primary logo mark",
                            "Never place the logo on backgrounds below 4.5:1 contrast ratio",
                            "Gold accent (#C9A96E) should be used sparingly — max 15% of any layout surface",
                            "Photography style: muted tones, natural lighting, candid moments over staged shots",
                            "Icon style: 1.5px stroke weight, rounded caps, consistent 24px grid",
                            "Minimum logo size: 32px height for digital, 12mm for print",
                        ],
                    },
                ]
            }

        if path.endswith("/video"):
            # Enrich with scorecard metrics when content is a before/after scorecard
            script = (data or {}).get("script", {})
            content_from_data = (data or {}).get("content", {})
            scorecard_metrics = {}
            if content_from_data.get("type") == "before_after_scorecard" or script.get("type") == "proof_walkthrough":
                scorecard_metrics = {
                    "before_after_metrics": {
                        "hours_saved_per_month": {"before": 82, "after": 14, "improvement": "83% reduction", "detail": "Manual reporting and data aggregation replaced by automated dashboards"},
                        "compliance_exposure_events": {"before": 12, "after": 1, "improvement": "92% reduction", "detail": "Automated compliance monitoring catches issues before they escalate"},
                        "avg_response_time_hours": {"before": 48.0, "after": 4.2, "improvement": "91% faster", "detail": "AI-prioritized alert routing ensures critical items reach advisors immediately"},
                        "client_onboarding_days": {"before": 21, "after": 5, "improvement": "76% faster", "detail": "Digital document collection and automated KYC verification"},
                        "reporting_error_rate_pct": {"before": 4.7, "after": 0.3, "improvement": "94% reduction", "detail": "Automated data validation eliminates manual transcription errors"},
                        "advisor_capacity_clients": {"before": 45, "after": 72, "improvement": "60% increase", "detail": "Workflow automation frees advisors to focus on relationship management"},
                        "client_satisfaction_nps": {"before": 62, "after": 81, "improvement": "+19 points", "detail": "Faster response times and proactive communication drive satisfaction"},
                        "annual_cost_savings_usd": {"before": 0, "after": 284000, "improvement": "$284K saved", "detail": "Reduced headcount needs, fewer compliance penalties, lower error remediation costs"},
                    },
                }

            return {
                "render_id": render_id,
                "status": "pending",
                "estimated_duration": 120,
                **scorecard_metrics,
            }

        # generic fallback
        return {"render_id": render_id, "status": "pending"}

    # -- lifecycle ------------------------------------------------------------

    async def close(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "VisionAudioForgeClient":
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self.close()
