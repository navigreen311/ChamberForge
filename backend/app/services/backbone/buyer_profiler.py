"""BuyerProfiler — Generates rich ICP profiles for HNW/UHNW segments."""
from __future__ import annotations

from typing import Any

# ──────────────────────────────────────────────────────────────
# Hardcoded reference data
# ──────────────────────────────────────────────────────────────
_TIER_DEMOGRAPHICS = {
    "Affluent": {
        "net_worth_range": "$1M-$5M",
        "income_range": "$250K-$750K",
        "typical_age": "35-55",
        "key_assets": ["primary residence", "investment portfolio", "small business equity"],
    },
    "HNW": {
        "net_worth_range": "$5M-$30M",
        "income_range": "$500K-$2M",
        "typical_age": "40-60",
        "key_assets": ["multiple properties", "diversified portfolio", "business interests", "art/collectibles"],
    },
    "UHNW": {
        "net_worth_range": "$30M-$100M",
        "income_range": "$2M-$10M",
        "typical_age": "45-70",
        "key_assets": ["global real-estate portfolio", "PE/VC investments", "family office", "philanthropic vehicles"],
    },
    "Ultra": {
        "net_worth_range": "$100M+",
        "income_range": "$10M+",
        "typical_age": "50-80",
        "key_assets": ["dynastic wealth structures", "multi-family office", "institutional holdings", "legacy foundations"],
    },
}

_STAGE_MOTIVATIONS = {
    "Accumulation": {
        "motivations": ["wealth growth", "competitive edge", "time optimization"],
        "buying_triggers": ["new liquidity event", "business exit on horizon", "peer influence"],
    },
    "Preservation": {
        "motivations": ["capital protection", "privacy", "risk mitigation"],
        "buying_triggers": ["market downturn fear", "lawsuit or threat", "regulatory change"],
    },
    "Transition": {
        "motivations": ["smooth succession", "family harmony", "tax efficiency"],
        "buying_triggers": ["health event", "retirement planning", "generational shift"],
    },
    "Legacy": {
        "motivations": ["philanthropic impact", "family name perpetuation", "values transfer"],
        "buying_triggers": ["milestone birthday", "grandchildren", "desire for legacy project"],
    },
    "NextGen": {
        "motivations": ["identity formation", "stewardship training", "modern asset management"],
        "buying_triggers": ["inheriting role", "family pressure", "desire for independence"],
    },
}

_PAIN_PROFILES: dict[str, dict[str, Any]] = {
    "Privacy": {
        "primary_objections": ["Will my data stay private?", "Who has access?", "What if there is a breach?"],
        "trust_channels": ["personal referral", "NDA-first engagement", "private clubs"],
        "recommended_approach": "Lead with confidentiality guarantees and references from trusted networks.",
        "typical_decision_timeline": "2-4 weeks",
    },
    "Security": {
        "primary_objections": ["How experienced is your team?", "What are the certifications?", "Liability coverage?"],
        "trust_channels": ["former law-enforcement referral", "security industry networks", "family-office advisors"],
        "recommended_approach": "Demonstrate credentials, case studies (anonymized), and insurance coverage up front.",
        "typical_decision_timeline": "1-3 weeks",
    },
    "Lifestyle": {
        "primary_objections": ["Is this truly bespoke?", "Can you handle last-minute changes?", "References?"],
        "trust_channels": ["luxury concierge networks", "social circles", "exclusive events"],
        "recommended_approach": "Showcase curated experiences and flexibility; offer a trial engagement.",
        "typical_decision_timeline": "1-2 weeks",
    },
    "Governance": {
        "primary_objections": ["Are you licensed?", "Conflict of interest?", "Jurisdictional expertise?"],
        "trust_channels": ["legal counsel referral", "accounting firm referral", "family-office peer group"],
        "recommended_approach": "Present regulatory expertise and a clear scope-of-engagement letter.",
        "typical_decision_timeline": "4-8 weeks",
    },
    "LegacyPlanning": {
        "primary_objections": ["Will my wishes be honored?", "How do you handle family dynamics?", "Long-term continuity?"],
        "trust_channels": ["estate attorneys", "philanthropic advisors", "multi-generational family networks"],
        "recommended_approach": "Emphasize long-term relationship, discretion, and multi-generational experience.",
        "typical_decision_timeline": "4-12 weeks",
    },
    "Reputation": {
        "primary_objections": ["Confidentiality?", "Speed of response?", "Track record?"],
        "trust_channels": ["PR firms", "legal counsel", "peer CEOs"],
        "recommended_approach": "Offer rapid-response capability and show prior crisis-management outcomes.",
        "typical_decision_timeline": "24-72 hours (crisis) / 2-4 weeks (proactive)",
    },
    "Travel": {
        "primary_objections": ["Can you really do anything anywhere?", "Safety protocols?", "Cost transparency?"],
        "trust_channels": ["luxury travel advisors", "private aviation networks", "hotel loyalty programs"],
        "recommended_approach": "Provide a curated itinerary sample and 24/7 support commitment.",
        "typical_decision_timeline": "1-2 weeks",
    },
    "Medical": {
        "primary_objections": ["Qualifications?", "HIPAA compliance?", "Second-opinion access?"],
        "trust_channels": ["physician referral", "medical concierge networks", "family-office health advisors"],
        "recommended_approach": "Lead with credentialed medical team and strict compliance documentation.",
        "typical_decision_timeline": "1-4 weeks",
    },
    "Education": {
        "primary_objections": ["Outcomes data?", "Tutor qualifications?", "Personalization level?"],
        "trust_channels": ["school counselors", "other HNW parents", "educational consultants"],
        "recommended_approach": "Show placement stats, tutor bios, and customized curriculum samples.",
        "typical_decision_timeline": "2-6 weeks",
    },
    "Concierge": {
        "primary_objections": ["Availability?", "Scope of services?", "Single point of contact?"],
        "trust_channels": ["existing concierge users", "luxury brand referrals", "private-bank advisors"],
        "recommended_approach": "Demonstrate breadth of capability and assign a dedicated relationship manager.",
        "typical_decision_timeline": "1-2 weeks",
    },
}

_ICP_TEMPLATES: dict[str, dict[str, Any]] = {
    "privacy-shield": {
        "playbook": "privacy-shield",
        "target_tier": "UHNW",
        "target_stage": "Preservation",
        "pain": "Privacy",
        "description": "Digital-privacy and data-protection service for ultra-high-net-worth individuals.",
        "ideal_client": "UHNW individual or family office seeking comprehensive digital-footprint management.",
    },
    "family-governance": {
        "playbook": "family-governance",
        "target_tier": "UHNW",
        "target_stage": "Transition",
        "pain": "Governance",
        "description": "Family-governance structuring and succession facilitation.",
        "ideal_client": "Multi-generational family preparing for wealth transfer or governance overhaul.",
    },
    "reputation-armor": {
        "playbook": "reputation-armor",
        "target_tier": "HNW",
        "target_stage": "Preservation",
        "pain": "Reputation",
        "description": "Proactive and crisis reputation management.",
        "ideal_client": "Public-facing HNW individual or executive needing reputation monitoring and rapid response.",
    },
}


class BuyerProfiler:
    """Generates rich buyer profiles from tier / life-stage / pain combinations."""

    @staticmethod
    def generate_profile(wealth_tier: str, life_stage: str, pain_category: str) -> dict:
        demographics = _TIER_DEMOGRAPHICS.get(wealth_tier, _TIER_DEMOGRAPHICS["HNW"])
        stage = _STAGE_MOTIVATIONS.get(life_stage, _STAGE_MOTIVATIONS["Preservation"])
        pain = _PAIN_PROFILES.get(pain_category, _PAIN_PROFILES["Concierge"])

        return {
            "demographics": demographics,
            "motivations": stage["motivations"],
            "primary_objections": pain["primary_objections"],
            "trust_channels": pain["trust_channels"],
            "buying_triggers": stage["buying_triggers"],
            "recommended_approach": pain["recommended_approach"],
            "typical_decision_timeline": pain["typical_decision_timeline"],
        }

    @staticmethod
    def get_icp_template(playbook_slug: str) -> dict:
        return _ICP_TEMPLATES.get(playbook_slug, {})
