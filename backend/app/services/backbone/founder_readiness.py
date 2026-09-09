"""FounderReadiness — Skill, credential, and network assessment for premium-service founders."""
from __future__ import annotations

# Weight allocation (must sum to 1.0)
_WEIGHTS = {
    "skills": 0.40,
    "credentials": 0.30,
    "network": 0.30,
}

_SKILL_DOMAINS = [
    "domain_expertise",
    "sales_ability",
    "operations",
    "client_management",
    "marketing",
    "financial_literacy",
    "leadership",
    "technology",
]

_CREDENTIAL_VALUES: dict[str, int] = {
    "verified": 100,
    "expired": 40,
    "missing": 0,
}


class FounderReadiness:
    """Assess whether a founder is ready to launch a premium-service business."""

    @staticmethod
    def assess(
        skills: dict[str, int],
        credentials: list[str],
        network_score: int,
    ) -> dict:
        # ── Skills scoring (0-100) ──────────────────────────────
        skill_scores: list[int] = []
        skill_gaps: list[str] = []
        for domain in _SKILL_DOMAINS:
            score = skills.get(domain, 0)
            skill_scores.append(min(score, 10))  # cap at 10
            if score < 5:
                skill_gaps.append(domain)

        avg_skill = (sum(skill_scores) / len(skill_scores)) * 10 if skill_scores else 0

        # ── Credential scoring ──────────────────────────────────
        credential_status: dict[str, str] = {}
        known_credentials = [
            "professional_certification",
            "industry_license",
            "advanced_degree",
            "nda_template",
            "insurance_coverage",
            "business_entity",
        ]
        credential_score_total = 0
        credential_count = 0
        for cred in known_credentials:
            if cred in credentials:
                credential_status[cred] = "verified"
                credential_score_total += _CREDENTIAL_VALUES["verified"]
            else:
                credential_status[cred] = "missing"
                credential_score_total += _CREDENTIAL_VALUES["missing"]
            credential_count += 1

        avg_credential = credential_score_total / credential_count if credential_count else 0

        # ── Network scoring ─────────────────────────────────────
        # network_score is 0-100
        clamped_network = max(0, min(100, network_score))
        if clamped_network >= 70:
            network_assessment = "Strong — extensive connections in target market."
        elif clamped_network >= 40:
            network_assessment = "Developing — has some relevant connections but gaps remain."
        else:
            network_assessment = "Weak — limited access to target HNW/UHNW networks."

        # ── Overall score ───────────────────────────────────────
        overall_score = round(
            avg_skill * _WEIGHTS["skills"]
            + avg_credential * _WEIGHTS["credentials"]
            + clamped_network * _WEIGHTS["network"],
            1,
        )

        # ── Readiness level ─────────────────────────────────────
        if overall_score >= 70:
            readiness_level = "ready"
        elif overall_score >= 40:
            readiness_level = "developing"
        else:
            readiness_level = "not_ready"

        # ── Recommendations ─────────────────────────────────────
        recommendations: list[str] = []
        if skill_gaps:
            recommendations.append(f"Develop skills in: {', '.join(skill_gaps)}.")
        missing_creds = [c for c, s in credential_status.items() if s == "missing"]
        if missing_creds:
            recommendations.append(f"Obtain: {', '.join(missing_creds)}.")
        if clamped_network < 40:
            recommendations.append("Invest in network-building: join HNW peer groups, attend industry events.")
        elif clamped_network < 70:
            recommendations.append("Expand network reach into adjacent verticals and geographies.")
        if not recommendations:
            recommendations.append("Strong profile — consider launching a pilot engagement.")

        return {
            "overall_score": overall_score,
            "skill_gaps": skill_gaps,
            "credential_status": credential_status,
            "network_assessment": network_assessment,
            "readiness_level": readiness_level,
            "recommendations": recommendations,
        }
