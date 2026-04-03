"""SunsetProtocol — Graceful offer retirement and transition planning."""
from __future__ import annotations

import math
from typing import Any


class SunsetProtocol:
    """Generates structured transition plans for retiring service offers."""

    @staticmethod
    def generate_transition_plan(
        offer_data: dict[str, Any],
        client_count: int,
    ) -> dict[str, Any]:
        """Generate a phased transition plan for sunsetting a service offer.

        Considers client count to size the effort and timeline.
        """
        offer_name = offer_data.get("name", "Unnamed Offer")
        replacement = offer_data.get("replacement_offer", None)

        # Scale timeline to client base
        if client_count <= 5:
            total_weeks = 4
        elif client_count <= 20:
            total_weeks = 8
        elif client_count <= 50:
            total_weeks = 12
        else:
            total_weeks = 16

        phase_weeks = math.ceil(total_weeks / 4)

        phases = [
            {
                "phase": "1 — Internal Preparation",
                "actions": [
                    "Audit all active contracts and deliverables",
                    "Document knowledge transfer materials",
                    "Brief team on transition plan",
                    "Prepare replacement offer (if applicable)",
                ],
                "timeline": f"Weeks 1-{phase_weeks}",
            },
            {
                "phase": "2 — Client Notification",
                "actions": [
                    "Personal outreach to top-tier clients",
                    "Send formal sunset announcement to all clients",
                    f"Present {'migration path to ' + replacement if replacement else 'alternative options'}",
                    "Open Q&A / office hours for concerned clients",
                ],
                "timeline": f"Weeks {phase_weeks + 1}-{phase_weeks * 2}",
            },
            {
                "phase": "3 — Migration & Delivery",
                "actions": [
                    "Complete all outstanding deliverables",
                    "Migrate willing clients to replacement offer",
                    "Provide transition support and documentation",
                    "Collect testimonials and case study permissions",
                ],
                "timeline": f"Weeks {phase_weeks * 2 + 1}-{phase_weeks * 3}",
            },
            {
                "phase": "4 — Wind-Down & Archive",
                "actions": [
                    "Final billing and account reconciliation",
                    "Archive offer materials and client records",
                    "Publish case studies and harvest reputation assets",
                    "Send thank-you packages to departing clients",
                ],
                "timeline": f"Weeks {phase_weeks * 3 + 1}-{total_weeks}",
            },
        ]

        testimonials_target = min(client_count, 10)
        case_studies_target = min(max(1, client_count // 5), 5)

        communication_template = (
            f"Dear [Client Name],\n\n"
            f"After careful consideration, we have decided to sunset our "
            f'"{offer_name}" service effective [Date]. '
            f"{'We are excited to introduce ' + replacement + ' as a natural evolution.' if replacement else 'We want to ensure a smooth transition for you.'}\n\n"
            f"Over the coming weeks, your dedicated team will work with you "
            f"to complete all outstanding work and ensure continuity.\n\n"
            f"Please don't hesitate to reach out with any questions.\n\n"
            f"Warm regards,\n[Your Name]"
        )

        return {
            "phases": phases,
            "communication_template": communication_template,
            "reputation_harvest": {
                "testimonials_to_collect": testimonials_target,
                "case_studies_to_write": case_studies_target,
            },
            "final_deliverables": [
                "All contracted deliverables completed",
                "Client transition documentation package",
                "Knowledge base archive",
                "Team debrief report",
                f"{testimonials_target} testimonials collected",
                f"{case_studies_target} case studies published",
            ],
        }
