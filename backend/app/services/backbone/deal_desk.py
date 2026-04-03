"""DealDesk — proposal, SOW, and NDA generation for premium engagements."""
from __future__ import annotations

from datetime import datetime, timezone


class DealDesk:
    """Generates structured deal documents for the sales process."""

    @staticmethod
    def generate_proposal(offer_data: dict, client_data: dict) -> dict:
        """Generate a full proposal document structure."""
        offer_name = offer_data.get("name", "Premium Service Engagement")
        client_name = client_data.get("name", "Valued Client")
        company = client_data.get("company", "")
        pricing = offer_data.get("pricing_model", {})
        monthly_fee = pricing.get("monthly_fee", 0) if isinstance(pricing, dict) else 0
        delivery_model = offer_data.get("delivery_model", "done_for_you")

        value_stack = offer_data.get("value_stack", [])
        deliverables = [v.get("name", v) if isinstance(v, dict) else str(v) for v in value_stack] or [
            "Strategic assessment and gap analysis",
            "Custom implementation roadmap",
            "Ongoing management and optimization",
            "Quarterly business reviews",
        ]

        company_str = f" at {company}" if company else ""
        return {
            "title": f"Proposal: {offer_name} for {client_name}{company_str}",
            "executive_summary": (
                f"This proposal outlines the {offer_name} engagement designed for {client_name}{company_str}. "
                f"Delivered as a {delivery_model.replace('_', ' ')} model, this engagement will drive "
                f"measurable outcomes across the defined scope of work."
            ),
            "scope_of_work": [
                "Comprehensive intake and baseline assessment",
                "Strategy development aligned to client objectives",
                "Implementation of agreed-upon deliverables",
                "Ongoing monitoring, reporting, and optimization",
                "Executive-level quarterly reviews",
            ],
            "deliverables": deliverables,
            "timeline": "8-week initial engagement with ongoing retainer",
            "pricing_summary": {
                "monthly_fee": monthly_fee,
                "setup_fee": pricing.get("setup_fee", 0) if isinstance(pricing, dict) else 0,
                "payment_terms": "Net 15 from invoice date",
                "billing_cycle": "Monthly, auto-billed via Stripe",
            },
            "terms": (
                "This engagement is governed by the Master Services Agreement. "
                "Either party may terminate with 30 days written notice. "
                "All deliverables remain confidential per the executed NDA."
            ),
            "nda_required": True,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    @staticmethod
    def generate_sow(offer_data: dict) -> dict:
        """Generate a scope-of-work document structure."""
        offer_name = offer_data.get("name", "Premium Service")
        value_stack = offer_data.get("value_stack", [])

        phases = [
            {
                "phase": "Discovery & Assessment",
                "duration": "Week 1-2",
                "activities": [
                    "Stakeholder interviews and intake",
                    "Current-state audit and baseline measurement",
                    "Gap analysis and opportunity mapping",
                ],
                "deliverables": ["Assessment report", "Baseline KPI dashboard"],
            },
            {
                "phase": "Strategy & Planning",
                "duration": "Week 3-4",
                "activities": [
                    "Solution architecture design",
                    "Resource allocation planning",
                    "Risk mitigation strategy",
                ],
                "deliverables": ["Strategic plan document", "Resource plan"],
            },
            {
                "phase": "Implementation",
                "duration": "Week 5-7",
                "activities": [
                    "Execute against strategic plan",
                    "Weekly progress updates",
                    "Continuous QA reviews",
                ],
                "deliverables": ["Completed deliverables per plan", "Weekly status reports"],
            },
            {
                "phase": "Review & Transition",
                "duration": "Week 8",
                "activities": [
                    "Final deliverable review",
                    "ROI measurement and reporting",
                    "Transition to ongoing retainer",
                ],
                "deliverables": ["ROI report", "Engagement summary", "Renewal proposal"],
            },
        ]

        return {
            "title": f"Statement of Work: {offer_name}",
            "offer_name": offer_name,
            "delivery_model": offer_data.get("delivery_model", "done_for_you"),
            "phases": phases,
            "assumptions": [
                "Client provides timely access to required data and stakeholders",
                "Scope changes require written change-order approval",
                "All third-party tool costs are borne by the client",
            ],
            "exclusions": [
                "Legal or tax advisory services",
                "Direct management of client employees",
                "Services outside the defined scope without a change order",
            ],
            "acceptance_criteria": [
                "All deliverables reviewed and signed off by client sponsor",
                "KPI targets met or progress documented",
                "Final engagement review completed",
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    @staticmethod
    def generate_nda_template(parties: list[str]) -> dict:
        """Generate an NDA template structure."""
        if len(parties) < 2:
            parties = parties + ["[Second Party]"] * (2 - len(parties))

        return {
            "title": "Mutual Non-Disclosure Agreement",
            "parties": parties,
            "confidential_info_definition": (
                "Any and all non-public information disclosed by either party, "
                "including but not limited to business strategies, financial data, "
                "client lists, proprietary methodologies, technology, trade secrets, "
                "and any other information marked as confidential or that a reasonable "
                "person would understand to be confidential."
            ),
            "term_months": 24,
            "jurisdiction": "State of Delaware, United States",
            "obligations": [
                "Maintain strict confidentiality of all disclosed information",
                "Use confidential information solely for the stated business purpose",
                "Restrict access to employees and advisors with need-to-know",
                "Return or destroy all confidential materials upon termination",
                "Promptly notify the disclosing party of any unauthorized disclosure",
            ],
            "exceptions": [
                "Information already in the public domain",
                "Information independently developed without use of confidential information",
                "Information received from a third party without restriction",
                "Information required to be disclosed by law or regulation",
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
