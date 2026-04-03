"""WedgeEntry — designs minimum viable offers and upsell paths for client acquisition."""
from __future__ import annotations

from datetime import datetime, timezone


class WedgeEntry:
    """Designs wedge-entry strategies to land HNW clients with a low-friction first offer."""

    @staticmethod
    def design_wedge(offer_data: dict) -> dict:
        """Design a wedge entry strategy for the given offer."""
        offer_name = offer_data.get("name", "Premium Service")
        pricing = offer_data.get("pricing_model", {})
        full_price = pricing.get("monthly_fee", 10000) if isinstance(pricing, dict) else 10000
        wedge_price = round(full_price * 0.2)  # 20% of full price as entry point

        value_stack = offer_data.get("value_stack", [])
        first_service = "Strategic Assessment"
        if value_stack and isinstance(value_stack[0], dict):
            first_service = value_stack[0].get("name", first_service)
        elif value_stack:
            first_service = str(value_stack[0])

        return {
            "minimum_viable_offer": {
                "name": f"{offer_name} — Quick Start",
                "price": wedge_price,
                "included_services": [
                    f"90-minute {first_service.lower()} session",
                    "Written findings report with top-3 recommendations",
                    "30-day action plan with prioritized next steps",
                    "One follow-up call to review progress",
                ],
                "positioning": (
                    "A low-commitment way for prospective clients to experience "
                    "your expertise and see immediate value before committing to "
                    "a full engagement."
                ),
                "ideal_client_trigger": (
                    "Client expresses interest but hesitates on full engagement; "
                    "referral from existing client; event or webinar attendee."
                ),
            },
            "first_client_sequence": [
                {"step": "Outreach", "description": f"Personalized intro email referencing their specific challenge related to {offer_name.lower()}", "timeline": "Day 0"},
                {"step": "Discovery Call", "description": "15-minute call to understand their situation and qualify fit", "timeline": "Day 2-3"},
                {"step": "Wedge Proposal", "description": f"Send Quick Start proposal ({wedge_price:,} one-time fee)", "timeline": "Day 3-4"},
                {"step": "Deliver Wedge", "description": "Execute the Quick Start engagement", "timeline": "Day 7-14"},
                {"step": "Results Review", "description": "Present findings and recommendations with clear next steps", "timeline": "Day 15-17"},
                {"step": "Upsell Conversation", "description": f"Propose full {offer_name} engagement based on identified opportunities", "timeline": "Day 18-21"},
            ],
            "upsell_path": [
                {
                    "trigger": "Client implements Quick Start recommendations successfully",
                    "upsell_offer": f"{offer_name} — Full Engagement (monthly retainer)",
                    "timing": "Within 30 days of Quick Start completion",
                },
                {
                    "trigger": "Client asks about additional areas during Quick Start",
                    "upsell_offer": f"{offer_name} — Expanded Scope (add-on modules)",
                    "timing": "During or immediately after Quick Start delivery",
                },
                {
                    "trigger": "Client achieves ROI from initial engagement",
                    "upsell_offer": "Annual Strategic Partnership (discounted annual commitment)",
                    "timing": "At 90-day review or quarterly business review",
                },
                {
                    "trigger": "Client refers another family member or associate",
                    "upsell_offer": "Household / Family Office Package",
                    "timing": "Upon referral introduction",
                },
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
