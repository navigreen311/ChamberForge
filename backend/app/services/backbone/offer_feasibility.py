"""OfferFeasibility — Margin simulation, complexity scoring, and liability assessment."""
from __future__ import annotations

import math
from typing import Any

_DELIVERY_BASE_SCORES: dict[str, float] = {
    "Solo": 2.0,
    "Team": 4.0,
    "Orchestrated": 6.0,
    "TechAssisted": 3.0,
}

_LIABILITY_PROFILES: dict[str, dict[str, Any]] = {
    "Privacy": {
        "factors": ["data-breach liability", "regulatory fines (GDPR/CCPA)", "contractual NDA enforcement"],
        "insurance_recommended": True,
        "licensing_required": [],
    },
    "Security": {
        "factors": ["bodily-harm liability", "weapons regulations", "private-investigation licensing"],
        "insurance_recommended": True,
        "licensing_required": ["private security license", "firearms permit (if armed)"],
    },
    "Lifestyle": {
        "factors": ["travel-provider liability", "event cancellation", "vendor failure"],
        "insurance_recommended": True,
        "licensing_required": [],
    },
    "Governance": {
        "factors": ["fiduciary duty", "conflict of interest", "regulatory compliance"],
        "insurance_recommended": True,
        "licensing_required": ["legal counsel (if advising)", "financial advisor registration"],
    },
    "LegacyPlanning": {
        "factors": ["estate-planning regulations", "tax-advice boundaries", "fiduciary responsibility"],
        "insurance_recommended": True,
        "licensing_required": ["estate-planning credential"],
    },
    "Reputation": {
        "factors": ["defamation risk", "media-law compliance", "platform ToS violations"],
        "insurance_recommended": True,
        "licensing_required": [],
    },
    "Medical": {
        "factors": ["malpractice liability", "HIPAA violations", "scope-of-practice boundaries"],
        "insurance_recommended": True,
        "licensing_required": ["medical license", "HIPAA compliance certification"],
    },
    "Travel": {
        "factors": ["travel-insurance gaps", "duty of care abroad", "visa/immigration liability"],
        "insurance_recommended": True,
        "licensing_required": [],
    },
    "Education": {
        "factors": ["outcome misrepresentation", "child-safety regulations", "credential verification"],
        "insurance_recommended": False,
        "licensing_required": [],
    },
    "Concierge": {
        "factors": ["vendor-selection liability", "service-level guarantees"],
        "insurance_recommended": False,
        "licensing_required": [],
    },
}

_RISK_BY_COMPLIANCE: dict[str, str] = {
    "None": "low",
    "Low": "low",
    "Moderate": "medium",
    "RegulatedDomain": "high",
    "High": "high",
}


class OfferFeasibility:
    """Financial feasibility, complexity, and liability analysis for premium offers."""

    @staticmethod
    def simulate_margins(
        monthly_price: float,
        costs: dict[str, float],
        volume: int,
    ) -> dict:
        monthly_revenue = monthly_price * volume
        total_costs = sum(costs.values())
        monthly_costs = total_costs * volume
        gross_profit = monthly_revenue - monthly_costs
        gross_margin_pct = round((gross_profit / monthly_revenue) * 100, 2) if monthly_revenue else 0.0

        # Assume 15% overhead on top of direct costs for net margin
        overhead_rate = 0.15
        overhead = monthly_revenue * overhead_rate
        net_profit = gross_profit - overhead
        net_margin_pct = round((net_profit / monthly_revenue) * 100, 2) if monthly_revenue else 0.0

        # Breakeven: how many clients to cover fixed monthly costs at given price
        cost_per_client = total_costs
        margin_per_client = monthly_price - cost_per_client
        breakeven_clients = math.ceil(overhead / margin_per_client) if margin_per_client > 0 else -1

        annual_profit = round(net_profit * 12, 2)

        return {
            "gross_margin_pct": gross_margin_pct,
            "net_margin_pct": net_margin_pct,
            "monthly_revenue": round(monthly_revenue, 2),
            "monthly_costs": round(monthly_costs, 2),
            "breakeven_clients": breakeven_clients,
            "annual_profit": annual_profit,
        }

    @staticmethod
    def score_complexity(delivery_model: str, num_services: int) -> float:
        base = _DELIVERY_BASE_SCORES.get(delivery_model, 4.0)
        score = base + (0.5 * num_services)
        return min(10.0, round(score, 1))

    @staticmethod
    def assess_liability(pain_category: str, compliance_risk: str) -> dict:
        profile = _LIABILITY_PROFILES.get(pain_category, {
            "factors": ["general liability"],
            "insurance_recommended": False,
            "licensing_required": [],
        })

        overall_risk = _RISK_BY_COMPLIANCE.get(compliance_risk, "medium")
        # Escalate risk if the pain category itself is inherently risky
        high_risk_pains = {"Medical", "Security", "Governance"}
        if pain_category in high_risk_pains and overall_risk == "low":
            overall_risk = "medium"

        return {
            "overall_risk": overall_risk,
            "factors": profile["factors"],
            "insurance_recommended": profile["insurance_recommended"],
            "licensing_required": profile["licensing_required"],
        }
