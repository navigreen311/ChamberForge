"""PartnerBuilder — Ecosystem mapping for partnership development."""

from __future__ import annotations


# Pre-defined ecosystem maps by pain category
_ECOSYSTEM_MAP: dict[str, list[dict]] = {
    "revenue_growth": [
        {"type": "Sales Consultancy", "role": "Pipeline optimization and sales training", "typical_rev_share": "10-15%"},
        {"type": "CRM Platform", "role": "Lead tracking and relationship management", "typical_rev_share": "5-10% referral"},
        {"type": "Marketing Agency", "role": "Demand generation and brand positioning", "typical_rev_share": "10-20%"},
        {"type": "Data Provider", "role": "Lead enrichment and market intelligence", "typical_rev_share": "5-8% referral"},
    ],
    "operational_efficiency": [
        {"type": "Process Consulting Firm", "role": "Workflow optimization and lean methodology", "typical_rev_share": "10-15%"},
        {"type": "Automation Platform", "role": "Task automation and integration", "typical_rev_share": "5-10% referral"},
        {"type": "IT Managed Services", "role": "Infrastructure management and support", "typical_rev_share": "8-12%"},
        {"type": "Training Provider", "role": "Staff upskilling and change management", "typical_rev_share": "10-15%"},
    ],
    "talent_retention": [
        {"type": "HR Consulting Firm", "role": "Compensation benchmarking and culture strategy", "typical_rev_share": "10-15%"},
        {"type": "Benefits Platform", "role": "Employee benefits administration", "typical_rev_share": "5-8% referral"},
        {"type": "Executive Coaching Firm", "role": "Leadership development and coaching", "typical_rev_share": "10-20%"},
        {"type": "Recruitment Agency", "role": "Talent acquisition for key roles", "typical_rev_share": "15-25% of placement"},
    ],
    "digital_transformation": [
        {"type": "Technology Consultancy", "role": "Digital strategy and architecture", "typical_rev_share": "10-15%"},
        {"type": "Cloud Platform Provider", "role": "Infrastructure and platform services", "typical_rev_share": "5-10% referral"},
        {"type": "UX/Design Agency", "role": "User experience and interface design", "typical_rev_share": "10-15%"},
        {"type": "Cybersecurity Firm", "role": "Security assessment and compliance", "typical_rev_share": "8-12%"},
        {"type": "Data Analytics Firm", "role": "Business intelligence and insights", "typical_rev_share": "10-15%"},
    ],
    "compliance_risk": [
        {"type": "Legal Firm", "role": "Regulatory compliance and contract review", "typical_rev_share": "10-15% referral"},
        {"type": "Audit Firm", "role": "Financial and operational audits", "typical_rev_share": "8-12% referral"},
        {"type": "Insurance Broker", "role": "Risk transfer and coverage optimization", "typical_rev_share": "5-10%"},
        {"type": "GRC Platform", "role": "Governance, risk, and compliance tooling", "typical_rev_share": "5-8% referral"},
    ],
}

_DEFAULT_PARTNERS = [
    {"type": "Strategy Consultancy", "role": "Strategic advisory and market positioning", "typical_rev_share": "10-15%"},
    {"type": "Technology Partner", "role": "Platform and tooling integration", "typical_rev_share": "5-10% referral"},
    {"type": "Professional Services Firm", "role": "Implementation and managed services", "typical_rev_share": "10-20%"},
]

_VET_CHECKLIST = [
    "Verify business registration and legal standing",
    "Check references from 3+ mutual clients",
    "Review their client satisfaction scores / NPS",
    "Confirm alignment on target market and values",
    "Evaluate their delivery capacity and scalability",
    "Review financial stability (D&B rating or equivalent)",
    "Pilot a small joint engagement before full partnership",
    "Agree on SLA terms, revenue share, and conflict resolution",
    "Validate data security and compliance certifications",
    "Establish quarterly partnership review cadence",
]


class PartnerBuilder:
    """Maps partnership ecosystems for different pain categories."""

    @staticmethod
    def map_ecosystem(pain_category: str) -> dict:
        """Map the required partner ecosystem for a given pain category.

        Args:
            pain_category: Category of pain (e.g., 'revenue_growth', 'operational_efficiency')

        Returns:
            dict with required_partners and vet_checklist
        """
        normalized = pain_category.lower().strip().replace(" ", "_").replace("-", "_")
        partners = _ECOSYSTEM_MAP.get(normalized, _DEFAULT_PARTNERS)

        return {
            "required_partners": partners,
            "vet_checklist": _VET_CHECKLIST,
        }
