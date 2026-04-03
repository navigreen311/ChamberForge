"""CompetitiveIntel — Market analysis and blue-ocean detection for premium services."""
from __future__ import annotations

from typing import Any

# ──────────────────────────────────────────────────────────────
# Reference data
# ──────────────────────────────────────────────────────────────
_MARKET_DATA: dict[str, dict[str, Any]] = {
    "Privacy": {
        "competitors": [
            {"name": "DeleteMe", "focus": "data-broker removal", "tier": "mass-market"},
            {"name": "BlackCloak", "focus": "digital executive protection", "tier": "HNW"},
            {"name": "Conceal", "focus": "identity obfuscation", "tier": "UHNW"},
        ],
        "market_gaps": [
            "Integrated physical + digital privacy for family offices",
            "Privacy-as-a-service with ongoing monitoring for dynastic families",
        ],
        "blue_ocean_zones": [
            {"area": "NextGen digital-footprint coaching", "opportunity_score": 8.2, "reasoning": "No one targets heirs specifically."},
            {"area": "Cross-border privacy orchestration", "opportunity_score": 7.5, "reasoning": "Multi-jurisdictional privacy is fragmented."},
        ],
        "saturation_level": "moderate",
    },
    "Security": {
        "competitors": [
            {"name": "Gavin de Becker & Associates", "focus": "threat assessment", "tier": "UHNW"},
            {"name": "Pinkerton", "focus": "corporate security", "tier": "Corporate"},
            {"name": "WorldAware", "focus": "travel security intelligence", "tier": "HNW"},
        ],
        "market_gaps": [
            "AI-driven threat-intelligence tailored to individual HNW profiles",
            "Integrated cyber + physical security for residential compounds",
        ],
        "blue_ocean_zones": [
            {"area": "Family-office cyber-resilience retainer", "opportunity_score": 8.0, "reasoning": "Most FOs lack dedicated cyber staff."},
        ],
        "saturation_level": "high",
    },
    "Lifestyle": {
        "competitors": [
            {"name": "Quintessentially", "focus": "luxury concierge", "tier": "HNW"},
            {"name": "John Paul Group", "focus": "loyalty concierge", "tier": "Affluent"},
            {"name": "Velocity Black", "focus": "AI-assisted luxury", "tier": "HNW"},
        ],
        "market_gaps": [
            "Curated micro-experiences for UHNW families with young children",
            "Sustainable luxury travel planning with verified impact",
        ],
        "blue_ocean_zones": [
            {"area": "Wellness sabbatical design for burnt-out founders", "opportunity_score": 7.8, "reasoning": "Growing demand, few premium providers."},
        ],
        "saturation_level": "high",
    },
    "Governance": {
        "competitors": [
            {"name": "GenSpring Family Offices", "focus": "family governance consulting", "tier": "UHNW"},
            {"name": "Mercer Family Wealth", "focus": "governance frameworks", "tier": "UHNW"},
        ],
        "market_gaps": [
            "Technology-enabled governance dashboards for family constitutions",
            "NextGen board-readiness programs",
        ],
        "blue_ocean_zones": [
            {"area": "AI-facilitated family-meeting preparation", "opportunity_score": 8.5, "reasoning": "No tools purpose-built for family governance."},
            {"area": "Governance compliance tracking across jurisdictions", "opportunity_score": 7.0, "reasoning": "Manual processes dominate."},
        ],
        "saturation_level": "low",
    },
    "LegacyPlanning": {
        "competitors": [
            {"name": "Bessemer Trust", "focus": "wealth management + legacy", "tier": "UHNW"},
            {"name": "Northern Trust", "focus": "multigenerational wealth", "tier": "HNW"},
        ],
        "market_gaps": [
            "Digital legacy vaults with biometric access for heirs",
            "Philanthropic impact measurement for family foundations",
        ],
        "blue_ocean_zones": [
            {"area": "Values-based legacy curriculum for heirs", "opportunity_score": 7.6, "reasoning": "Emotional need, few structured offerings."},
        ],
        "saturation_level": "low",
    },
    "Reputation": {
        "competitors": [
            {"name": "Teneo", "focus": "CEO advisory + reputation", "tier": "Corporate"},
            {"name": "Reputation Defenders", "focus": "online reputation", "tier": "mass-market"},
        ],
        "market_gaps": [
            "Proactive reputation monitoring with dark-web scanning for HNW families",
        ],
        "blue_ocean_zones": [
            {"area": "Social-media ghost management for public HNW figures", "opportunity_score": 7.3, "reasoning": "Demand rising, supply fragmented."},
        ],
        "saturation_level": "moderate",
    },
}

_DEFAULT_MARKET: dict[str, Any] = {
    "competitors": [],
    "market_gaps": ["Insufficient data for this pain category"],
    "blue_ocean_zones": [],
    "saturation_level": "unknown",
}


class CompetitiveIntel:
    """Market landscape analysis for premium-service niches."""

    @staticmethod
    def analyze_market(pain_category: str, geo: str | None = None) -> dict:
        data = _MARKET_DATA.get(pain_category, _DEFAULT_MARKET).copy()
        if geo:
            data["geo_filter"] = geo
            # Adjust saturation for less-served geographies
            low_saturation_geos = {"AE", "SG", "KY"}
            if geo.upper() in low_saturation_geos and data["saturation_level"] in ("moderate", "high"):
                data["saturation_level"] = "moderate" if data["saturation_level"] == "high" else "low"
        return data

    @staticmethod
    def detect_blue_ocean(problem_data: dict) -> dict:
        pain = problem_data.get("pain_category", "")
        market = _MARKET_DATA.get(pain, _DEFAULT_MARKET)
        zones = market.get("blue_ocean_zones", [])

        # If problem description hints at underserved niches, boost scores
        desc = (problem_data.get("description") or "").lower()
        boosted_zones = []
        for z in zones:
            zone = dict(z)
            if any(kw in desc for kw in ["family", "nextgen", "heir", "next generation"]):
                zone["opportunity_score"] = min(10.0, zone["opportunity_score"] + 0.5)
            boosted_zones.append(zone)

        return {"zones": boosted_zones}
