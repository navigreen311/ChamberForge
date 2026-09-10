"""TrustPack — generates credibility and trust materials for HNW client acquisition."""
from __future__ import annotations

from datetime import datetime, timezone


class TrustPack:
    """Builds trust collateral packages for premium service firms."""

    @staticmethod
    def generate_trust_pack(workspace_data: dict, offer_data: dict) -> dict:
        """Generate a complete trust pack for client-facing use."""
        firm_name = workspace_data.get("name", "Our Firm")
        offer_name = offer_data.get("name", "Premium Service")
        value_stack = offer_data.get("value_stack", [])

        credentials = workspace_data.get("credentials", [])
        if not credentials:
            credentials = [
                "Certified in relevant professional standards",
                "10+ years serving HNW/UHNW clients",
                "SOC 2 Type II compliant operations",
            ]

        testimonials = workspace_data.get("testimonials", [])
        if not testimonials:
            testimonials = [
                {
                    "quote": "[Client testimonial placeholder — replace with real quote]",
                    "attribution": "[Client Name], [Title], [Company]",
                },
            ]

        deliverable_names = []
        for v in value_stack:
            if isinstance(v, dict):
                deliverable_names.append(v.get("name", str(v)))
            else:
                deliverable_names.append(str(v))

        return {
            "credibility_sheet": {
                "firm_name": firm_name,
                "experience": workspace_data.get(
                    "experience_summary",
                    f"{firm_name} has a proven track record delivering premium services "
                    f"to high-net-worth individuals and family offices."
                ),
                "credentials": credentials,
                "testimonials": testimonials,
                "client_count": workspace_data.get("client_count", "[XX]"),
                "years_in_business": workspace_data.get("years_in_business", "[X]"),
            },
            "privacy_statement": (
                f"{firm_name} takes client confidentiality seriously. All engagement data "
                f"is encrypted at rest and in transit. We maintain strict need-to-know access "
                f"controls and never share client information with third parties without "
                f"explicit written consent. Our operations are SOC 2 Type II compliant."
            ),
            "due_diligence_items": [
                "Certificate of Insurance (E&O, Cyber Liability)",
                "SOC 2 Type II audit report (latest)",
                "Client reference list (anonymized upon request)",
                "Data security and privacy policy documentation",
                "Business continuity and disaster recovery plan",
                "Team background check confirmation",
                "Sample engagement deliverables (redacted)",
            ],
            "briefing_deck_outline": [
                f"Slide 1: About {firm_name} — mission, history, team",
                f"Slide 2: The Problem — why HNW clients need {offer_name}",
                "Slide 3: Our Approach — methodology and delivery model",
                "Slide 4: What You Get — deliverables and outcomes",
                "Slide 5: Proof of Results — case studies and KPIs",
                "Slide 6: Security & Privacy — how we protect your data",
                "Slide 7: Engagement Model — timeline, pricing, next steps",
                "Slide 8: FAQ — common questions and answers",
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
