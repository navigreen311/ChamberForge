"""ProofAI — generates KPI stacks, ROI frameworks, and case study templates."""
from __future__ import annotations

import json
import logging

from app.services.agents.base_agent import as_dict, as_list, call_claude

_SYSTEM = (
    "You are a premium-service performance and ROI analyst for "
    "ChamberForge. Base every figure on the offer you are given; do not "
    "supply benchmark numbers from general knowledge. Respond ONLY with "
    "the JSON requested."
)

logger = logging.getLogger(__name__)


class ProofAI:
    """AI-powered proof-of-value generation for premium service offers."""

    def __init__(self):
        #: Injection point for tests; the governed call path builds the real
        #: client, checks the budget, and meters the call.
        self._client = None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def design_kpi_stack(self, offer_data: dict) -> list[dict]:
        """Design 5-8 KPIs tailored to the offer.

        Empty when no analysis could be run. It used to return
        `_mock_kpi_stack` - five KPIs with targets and measurement
        methods, generated from the offer name alone.
        """
        return await self._call_claude_kpis(offer_data)

    async def generate_roi_framework(self, offer_data: dict) -> dict:
        """Generate an ROI framework showing value delivered.

        This is the one that mattered most. `_mock_roi_framework`
        returned monetary values, a total estimated ROI, an ROI multiple
        and a payback period - the exact figures an advisor would put in
        front of a client - computed from nothing.
        """
        return await self._call_claude_roi(offer_data)

    async def build_case_study_template(self, offer_data: dict) -> dict:
        """Build a case study template for the offer."""
        return await self._call_claude_case_study(offer_data)

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
        response = await call_claude(
            "proof_ai", _SYSTEM, prompt, client=self._client, max_tokens=1024
        )
        return as_list("proof_ai", response)

    async def _call_claude_roi(self, offer_data: dict) -> dict:
        prompt = (
            "You are a premium-service ROI analyst. Generate an ROI framework "
            "for the following offer. Return ONLY valid JSON with keys: "
            "value_delivered (array of {category, metric, baseline, target, monetary_value}), "
            "total_estimated_roi, roi_multiple, payback_period_months.\n\n"
            f"Offer: {json.dumps(offer_data)}"
        )
        response = await call_claude(
            "proof_ai", _SYSTEM, prompt, client=self._client, max_tokens=1024
        )
        return as_dict("proof_ai", response)

    async def _call_claude_case_study(self, offer_data: dict) -> dict:
        prompt = (
            "You are a premium-service marketing strategist. Build a case study template "
            "for the following offer. Return ONLY valid JSON with keys: "
            "title, sections (array of {heading, content_guide, data_points_needed}), "
            "recommended_length, visual_assets_needed (array of strings).\n\n"
            f"Offer: {json.dumps(offer_data)}"
        )
        response = await call_claude(
            "proof_ai", _SYSTEM, prompt, client=self._client, max_tokens=1024
        )
        return as_dict("proof_ai", response)
