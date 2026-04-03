"""FulfillmentAI — generates SOP bundles and execution blueprints for offers."""
from __future__ import annotations

import json
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class FulfillmentAI:
    """AI-powered fulfillment planning for premium service offers."""

    def __init__(self):
        self._client = None
        if settings.ANTHROPIC_API_KEY:
            try:
                import anthropic
                self._client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            except Exception:
                logger.warning("Anthropic client init failed; using mock responses")

    async def generate_sop_bundle(self, offer_data: dict) -> dict:
        """Generate a full SOP bundle for delivering an offer.

        Returns staffing plan, tooling stack, service calendar,
        delivery risks, and standard operating procedures.
        """
        if self._client:
            try:
                return await self._call_claude_sop(offer_data)
            except Exception as exc:
                logger.warning("Claude call failed (%s), returning mock", exc)

        return self._mock_sop_bundle(offer_data)

    async def generate_execution_blueprint(self, offer_data: dict) -> dict:
        """Generate an execution blueprint with role map, QA checklist, and milestones."""
        if self._client:
            try:
                return await self._call_claude_blueprint(offer_data)
            except Exception as exc:
                logger.warning("Claude call failed (%s), returning mock", exc)

        return self._mock_execution_blueprint(offer_data)

    # ------------------------------------------------------------------
    # Claude integration
    # ------------------------------------------------------------------

    async def _call_claude_sop(self, offer_data: dict) -> dict:
        prompt = (
            "You are a premium-service operations architect. Given the following offer, "
            "produce a JSON SOP bundle.\n\n"
            f"Offer: {json.dumps(offer_data)}\n\n"
            "Return ONLY valid JSON with keys: staffing_plan (array of {role, responsibilities, hours_per_week}), "
            "tooling_stack (array of strings), service_calendar (array of {week, deliverables}), "
            "delivery_risks (array of {risk, probability, impact, mitigation}), "
            "sops (array of {title, steps (array of strings), owner, frequency})."
        )
        resp = await self._client.messages.create(
            model=settings.AI_MODEL,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )
        return json.loads(resp.content[0].text)

    async def _call_claude_blueprint(self, offer_data: dict) -> dict:
        prompt = (
            "You are a premium-service operations architect. Given the following offer, "
            "produce a JSON execution blueprint.\n\n"
            f"Offer: {json.dumps(offer_data)}\n\n"
            "Return ONLY valid JSON with keys: role_map (object mapping role names to responsibilities), "
            "qa_checklist (array of strings), timeline_weeks (integer), "
            "milestones (array of {week, milestone})."
        )
        resp = await self._client.messages.create(
            model=settings.AI_MODEL,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        return json.loads(resp.content[0].text)

    # ------------------------------------------------------------------
    # Mock fallbacks
    # ------------------------------------------------------------------

    @staticmethod
    def _mock_sop_bundle(offer_data: dict) -> dict:
        name = offer_data.get("name", "Premium Service")
        return {
            "staffing_plan": [
                {"role": "Engagement Lead", "responsibilities": f"Overall delivery of {name}", "hours_per_week": 20},
                {"role": "Operations Analyst", "responsibilities": "Data gathering, reporting, QA", "hours_per_week": 30},
                {"role": "Client Success Manager", "responsibilities": "Client communication and satisfaction", "hours_per_week": 10},
            ],
            "tooling_stack": [
                "ChamberForge Platform",
                "Slack (client channel)",
                "Google Workspace",
                "Notion (internal wiki)",
                "Stripe (billing)",
            ],
            "service_calendar": [
                {"week": 1, "deliverables": "Kickoff call, intake questionnaire, baseline audit"},
                {"week": 2, "deliverables": "Gap analysis report, initial recommendations"},
                {"week": 3, "deliverables": "Implementation plan, quick wins delivered"},
                {"week": 4, "deliverables": "First progress review, KPI dashboard setup"},
                {"week": 6, "deliverables": "Mid-engagement review, strategy adjustments"},
                {"week": 8, "deliverables": "Deliverable handoff, ROI report, renewal discussion"},
            ],
            "delivery_risks": [
                {"risk": "Client disengagement", "probability": "medium", "impact": "high", "mitigation": "Weekly touchpoints and escalation protocol"},
                {"risk": "Scope creep", "probability": "high", "impact": "medium", "mitigation": "Documented SOW with change-order process"},
                {"risk": "Data access delays", "probability": "medium", "impact": "medium", "mitigation": "Pre-engagement data checklist"},
            ],
            "sops": [
                {
                    "title": "Client Onboarding",
                    "steps": [
                        "Send welcome packet and intake form",
                        "Schedule kickoff call within 48 hours",
                        "Complete baseline audit within 5 business days",
                        "Set up client Slack channel and shared drive",
                        "Deliver onboarding summary memo",
                    ],
                    "owner": "Client Success Manager",
                    "frequency": "per_engagement",
                },
                {
                    "title": "Weekly Status Update",
                    "steps": [
                        "Compile deliverable progress from project tracker",
                        "Draft status email with KPI snapshot",
                        "Send to client by Friday 3 PM",
                        "Log any open issues in tracker",
                    ],
                    "owner": "Operations Analyst",
                    "frequency": "weekly",
                },
                {
                    "title": "Quality Assurance Review",
                    "steps": [
                        "Review all deliverables against SOW checklist",
                        "Run data accuracy spot-checks",
                        "Get Engagement Lead sign-off",
                        "Archive QA log",
                    ],
                    "owner": "Operations Analyst",
                    "frequency": "biweekly",
                },
            ],
        }

    @staticmethod
    def _mock_execution_blueprint(offer_data: dict) -> dict:
        name = offer_data.get("name", "Premium Service")
        return {
            "role_map": {
                "Engagement Lead": f"Owns end-to-end delivery of {name}; client relationship",
                "Operations Analyst": "Executes tasks, builds reports, maintains QA",
                "Client Success Manager": "Manages communication cadence and satisfaction",
            },
            "qa_checklist": [
                "All deliverables reviewed against SOW",
                "Client sign-off obtained for each milestone",
                "Data accuracy verified (spot-check minimum 10%)",
                "KPI dashboard reflects latest numbers",
                "Billing aligned with delivery milestones",
                "Post-engagement survey sent",
            ],
            "timeline_weeks": 8,
            "milestones": [
                {"week": 1, "milestone": "Engagement kickoff and baseline complete"},
                {"week": 2, "milestone": "Gap analysis delivered"},
                {"week": 4, "milestone": "First progress review and KPI dashboard live"},
                {"week": 6, "milestone": "Mid-engagement review and adjustments"},
                {"week": 8, "milestone": "Final deliverables, ROI report, renewal proposal"},
            ],
        }
