"""Service Design Studio — SOP generation, journey mapping, and touchpoint design."""
from __future__ import annotations

from typing import Any


class ServiceDesignStudio:
    """Backbone service for designing service operations."""

    @staticmethod
    def generate_sops(
        offer_name: str,
        delivery_model: str,
        value_stack: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Generate SOP templates based on the offer's value stack."""
        sops: list[dict[str, Any]] = []

        # Always include an onboarding SOP
        sops.append({
            "title": f"{offer_name} — Client Onboarding",
            "description": f"Standard onboarding procedure for new {offer_name} clients.",
            "steps": [
                "Schedule kickoff call with principal or delegate.",
                "Collect intake questionnaire and NDA signatures.",
                "Provision secure communication channels.",
                "Assign dedicated team and introduce key contacts.",
                "Complete first 30-day orientation checklist.",
            ],
            "owner_role": "Account Director",
            "frequency": "per-client",
            "quality_checks": [
                "Intake docs verified within 48 hours.",
                "Client confirms receipt of welcome package.",
            ],
        })

        # Generate one SOP per value layer
        for layer in value_stack:
            layer_name = layer.get("name", "Service Layer")
            sops.append({
                "title": f"{offer_name} — {layer_name} Delivery",
                "description": (
                    f"Operational procedure for delivering the {layer_name} "
                    f"component via {delivery_model} model."
                ),
                "steps": [
                    f"Review current {layer_name} status and open items.",
                    "Execute scheduled deliverables per service agreement.",
                    "Document outcomes and update client dashboard.",
                    "Escalate blockers within 4-hour SLA.",
                    "Submit completion report to Account Director.",
                ],
                "owner_role": "Service Lead",
                "frequency": _frequency_from_model(delivery_model),
                "quality_checks": [
                    "Deliverables match agreed specifications.",
                    "Client satisfaction confirmed within 24 hours.",
                    "Time log reconciled against estimated hours.",
                ],
            })

        # Escalation SOP
        sops.append({
            "title": f"{offer_name} — Escalation Protocol",
            "description": "Procedure for handling urgent or out-of-scope requests.",
            "steps": [
                "Classify urgency: Critical / High / Normal.",
                "Notify on-call lead within 15 minutes for Critical.",
                "Engage backup resources if primary team unavailable.",
                "Provide client status update every 30 minutes until resolved.",
                "Conduct post-incident review within 48 hours.",
            ],
            "owner_role": "Operations Manager",
            "frequency": "as-needed",
            "quality_checks": [
                "Response time logged and audited.",
                "Root-cause analysis completed for Critical incidents.",
            ],
        })

        return sops

    @staticmethod
    def map_client_journey(
        offer_name: str,
        value_stack: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Map the end-to-end client journey for the offer."""
        stages = [
            {
                "name": "Discovery & Qualification",
                "duration": "1-2 weeks",
                "touchpoints": [
                    "Introductory call",
                    "Needs assessment questionnaire",
                    "Proposal presentation",
                ],
                "deliverables": ["Needs assessment report", "Custom proposal"],
                "success_criteria": "Client confirms scope alignment and signs LOI.",
            },
            {
                "name": "Onboarding",
                "duration": "2-4 weeks",
                "touchpoints": [
                    "Kickoff meeting",
                    "Systems provisioning",
                    "Team introduction",
                ],
                "deliverables": [
                    "Signed service agreement",
                    "Access credentials",
                    "30-day plan",
                ],
                "success_criteria": "All systems live and client confirms readiness.",
            },
            {
                "name": "Active Service Delivery",
                "duration": "Ongoing",
                "touchpoints": [
                    f"{layer.get('name', 'Service')} check-in"
                    for layer in value_stack
                ] + ["Monthly performance review"],
                "deliverables": [
                    "Weekly status reports",
                    "Monthly analytics dashboard",
                ],
                "success_criteria": "SLA targets met consistently.",
            },
            {
                "name": "Quarterly Strategic Review",
                "duration": "Quarterly",
                "touchpoints": [
                    "Executive review meeting",
                    "Satisfaction survey",
                ],
                "deliverables": [
                    "Quarterly performance report",
                    "Optimization recommendations",
                ],
                "success_criteria": "Client NPS >= 9 and renewal intent confirmed.",
            },
            {
                "name": "Renewal & Expansion",
                "duration": "Annual",
                "touchpoints": [
                    "Renewal discussion",
                    "Expansion proposal",
                    "Contract signing",
                ],
                "deliverables": [
                    "Year-in-review report",
                    "Updated service agreement",
                ],
                "success_criteria": "Contract renewed or expanded.",
            },
        ]

        escalation_paths = [
            "Client contacts Account Director directly for service concerns.",
            "Operations Manager handles SLA breaches and staffing gaps.",
            "Executive sponsor engaged for contract or relationship issues.",
        ]

        return {
            "stages": stages,
            "total_duration": "12-month initial engagement cycle",
            "escalation_paths": escalation_paths,
        }

    @staticmethod
    def design_touchpoints(journey_map: dict[str, Any]) -> list[dict[str, Any]]:
        """Design detailed touchpoint templates from a journey map."""
        touchpoints: list[dict[str, Any]] = []

        for stage in journey_map.get("stages", []):
            stage_name = stage.get("name", "")
            for tp in stage.get("touchpoints", []):
                touchpoints.append({
                    "touchpoint_name": tp,
                    "channel": _infer_channel(tp),
                    "frequency": stage.get("duration", "as-needed"),
                    "owner": "Account Director",
                    "template": f"Template for '{tp}' in {stage_name} stage.",
                })

        return touchpoints


def _frequency_from_model(delivery_model: str) -> str:
    """Map delivery model to a default SOP frequency."""
    mapping = {
        "retainer": "weekly",
        "project": "per-milestone",
        "hybrid": "bi-weekly",
        "concierge": "on-demand",
        "membership": "monthly",
    }
    return mapping.get(delivery_model.lower(), "as-needed")


def _infer_channel(touchpoint_name: str) -> str:
    """Infer a communication channel from the touchpoint name."""
    name = touchpoint_name.lower()
    if any(word in name for word in ("call", "meeting", "review", "discussion")):
        return "video_call"
    if any(word in name for word in ("survey", "questionnaire")):
        return "email"
    if "signing" in name or "contract" in name:
        return "secure_portal"
    return "email"
