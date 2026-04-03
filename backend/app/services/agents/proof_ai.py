"""ProofAI — generates KPI stacks, ROI frameworks, and case study templates."""
from __future__ import annotations

import json
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class ProofAI:
    """AI-powered proof-of-value generation for premium service offers."""

    def __init__(self):
        self._client = None
        if settings.ANTHROPIC_API_KEY:
            try:
                import anthropic
                self._client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            except Exception:
                logger.warning("Anthropic client init failed; using mock responses")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def design_kpi_stack(self, offer_data: dict) -> list[dict]:
        """Design 5-8 KPIs tailored to the offer."""
        if self._client:
            try:
                return await self._call_claude_kpis(offer_data)
            except Exception as exc:
                logger.warning("Claude call failed (%s), returning mock", exc)

        return self._mock_kpi_stack(offer_data)

    async def generate_roi_framework(self, offer_data: dict) -> dict:
        """Generate an ROI framework showing value delivered."""
        if self._client:
            try:
                return await self._call_claude_roi(offer_data)
            except Exception as exc:
                logger.warning("Claude call failed (%s), returning mock", exc)

        return self._mock_roi_framework(offer_data)

    async def build_case_study_template(self, offer_data: dict) -> dict:
        """Build a case study template for the offer."""
        if self._client:
            try:
                return await self._call_claude_case_study(offer_data)
            except Exception as exc:
                logger.warning("Claude call failed (%s), returning mock", exc)

        return self._mock_case_study_template(offer_data)

    # ------------------------------------------------------------------
    # Claude integration
    # ------------------------------------------------------------------

    async def _call_claude_kpis(self, offer_data: dict) -> list[dict]:
        prompt = (
            "You are a premium-service performance consultant. Design 5-8 KPIs "
            "for the following offer. Return ONLY a JSON array of objects with keys: "
            "kpi_name, measurement_method, target, frequency, data_source.\n\n"
            f"Offer: {json.dumps(offer_data)}"
        )
        resp = await self._client.messages.create(
            model=settings.AI_MODEL, max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        return json.loads(resp.content[0].text)

    async def _call_claude_roi(self, offer_data: dict) -> dict:
        prompt = (
            "You are a premium-service ROI analyst. Generate an ROI framework "
            "for the following offer. Return ONLY valid JSON with keys: "
            "value_delivered (array of {category, metric, baseline, target, monetary_value}), "
            "total_estimated_roi, roi_multiple, payback_period_months.\n\n"
            f"Offer: {json.dumps(offer_data)}"
        )
        resp = await self._client.messages.create(
            model=settings.AI_MODEL, max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        return json.loads(resp.content[0].text)

    async def _call_claude_case_study(self, offer_data: dict) -> dict:
        prompt = (
            "You are a premium-service marketing strategist. Build a case study template "
            "for the following offer. Return ONLY valid JSON with keys: "
            "title, sections (array of {heading, content_guide, data_points_needed}), "
            "recommended_length, visual_assets_needed (array of strings).\n\n"
            f"Offer: {json.dumps(offer_data)}"
        )
        resp = await self._client.messages.create(
            model=settings.AI_MODEL, max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        return json.loads(resp.content[0].text)

    # ------------------------------------------------------------------
    # Mock fallbacks
    # ------------------------------------------------------------------

    @staticmethod
    def _mock_kpi_stack(offer_data: dict) -> list[dict]:
        name = offer_data.get("name", "Service")
        return [
            {"kpi_name": "Client Satisfaction Score (CSAT)", "measurement_method": "Post-deliverable survey (1-10)", "target": "9.0+", "frequency": "monthly", "data_source": "Survey tool"},
            {"kpi_name": "Net Promoter Score (NPS)", "measurement_method": "Quarterly NPS survey", "target": "70+", "frequency": "quarterly", "data_source": "Survey tool"},
            {"kpi_name": "On-Time Delivery Rate", "measurement_method": "Deliverables completed by deadline / total", "target": "95%", "frequency": "weekly", "data_source": "Project tracker"},
            {"kpi_name": "Revenue Retained", "measurement_method": "Recurring revenue from renewals", "target": "90% retention", "frequency": "quarterly", "data_source": "Stripe"},
            {"kpi_name": "Time to First Value", "measurement_method": "Days from kickoff to first deliverable", "target": "<14 days", "frequency": "per_engagement", "data_source": "Project tracker"},
            {"kpi_name": f"{name} ROI Multiple", "measurement_method": "Client-reported value / fee paid", "target": "3x+", "frequency": "quarterly", "data_source": "Client review"},
            {"kpi_name": "Scope Change Frequency", "measurement_method": "Change orders per engagement", "target": "<2", "frequency": "per_engagement", "data_source": "SOW tracker"},
        ]

    @staticmethod
    def _mock_roi_framework(offer_data: dict) -> dict:
        pricing = offer_data.get("pricing_model", {})
        fee = pricing.get("monthly_fee", 10000) if isinstance(pricing, dict) else 10000
        annual_fee = fee * 12
        return {
            "value_delivered": [
                {"category": "Time Savings", "metric": "Hours saved per month", "baseline": "0", "target": "40 hours", "monetary_value": annual_fee * 0.5},
                {"category": "Risk Reduction", "metric": "Compliance gaps closed", "baseline": "12 gaps", "target": "0 gaps", "monetary_value": annual_fee * 0.8},
                {"category": "Revenue Uplift", "metric": "New revenue from optimizations", "baseline": "$0", "target": f"${annual_fee * 2:,.0f}", "monetary_value": annual_fee * 2},
                {"category": "Cost Avoidance", "metric": "Avoided penalties and inefficiencies", "baseline": "$0", "target": f"${annual_fee * 0.3:,.0f}", "monetary_value": annual_fee * 0.3},
            ],
            "total_estimated_roi": annual_fee * 3.6,
            "roi_multiple": 3.6,
            "payback_period_months": 3,
        }

    @staticmethod
    def _mock_case_study_template(offer_data: dict) -> dict:
        name = offer_data.get("name", "Premium Service")
        return {
            "title": f"Case Study: How [Client] Achieved [Outcome] with {name}",
            "sections": [
                {"heading": "Executive Summary", "content_guide": "2-3 sentence overview of client, challenge, and result", "data_points_needed": ["client profile", "headline metric"]},
                {"heading": "The Challenge", "content_guide": "Describe the pain point in the client's own words", "data_points_needed": ["client quote", "baseline metrics", "business impact"]},
                {"heading": "The Solution", "content_guide": "How the service was tailored and delivered", "data_points_needed": ["scope of work", "timeline", "team composition"]},
                {"heading": "The Results", "content_guide": "Quantified outcomes with before/after comparison", "data_points_needed": ["KPI improvements", "ROI figure", "time saved"]},
                {"heading": "Client Testimonial", "content_guide": "Direct quote from client stakeholder", "data_points_needed": ["client name and title", "testimonial quote"]},
            ],
            "recommended_length": "800-1200 words",
            "visual_assets_needed": [
                "Before/after metrics chart",
                "Timeline infographic",
                "Client headshot (with permission)",
                "Service delivery diagram",
            ],
        }
