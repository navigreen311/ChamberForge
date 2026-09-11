"""FounderReadiness — Skill, credential, and network assessment for premium-service founders."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from sqlalchemy.orm import Session

from app.services.backbone.scoring_store import get_scores, record_score

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


SCORER = "founder_readiness"

#: An assessment at or above this score clears the gate.
#: 70 is the existing `readiness_level == "ready"` boundary; the gate
#: reuses it rather than inventing a second, quieter threshold.
READY_THRESHOLD = 70.0

REASON_NO_ASSESSMENT = "no_assessment_on_record"
REASON_BELOW_THRESHOLD = "readiness_below_threshold"


@dataclass(frozen=True)
class GateDecision:
    """Whether a workspace may turn a playbook into a live offer.

    T-019. `assess()` computed a score and handed it back to whoever
    asked; nothing consulted it and nothing stored it, so "readiness"
    was advice a founder could read and ignore on the way to activating
    a playbook into a client-facing offer.

    A gate has to be able to say no, and has to be consulted by the thing
    it gates. This is the first half; `PlaybookEngine.activate_to_offer`
    is the second.
    """

    allowed: bool
    reason: Optional[str] = None
    score: Optional[float] = None
    detail: str = ""
    recommendations: tuple[str, ...] = ()

    def as_dict(self) -> dict:
        return {
            "allowed": self.allowed,
            "reason": self.reason,
            "score": self.score,
            "detail": self.detail,
            "recommendations": list(self.recommendations),
        }


class FounderReadiness:
    """Assess readiness, and gate activation on the result."""

    @staticmethod
    def assess(
        skills: dict[str, int],
        credentials: list[str],
        network_score: int,
        db: Optional[Session] = None,
        workspace_id: Optional[str] = None,
    ) -> dict:
        """Score a founder's readiness, and record the result.

        The recording is what makes the gate possible: `gate()` reads the
        most recent assessment rather than asking the caller to supply
        one, so a founder cannot clear the gate by passing better inputs
        at activation time than they did at assessment time.

        Stored in `scoring_results` (P-09), which keeps the inputs beside
        the score - so a later question about why an activation was
        allowed has an answer.
        """
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

        result = {
            "overall_score": overall_score,
            "skill_gaps": skill_gaps,
            "credential_status": credential_status,
            "network_assessment": network_assessment,
            "readiness_level": readiness_level,
            "recommendations": recommendations,
        }

        record_score(
            scorer=SCORER,
            subject_type="workspace",
            subject_id=str(workspace_id or ""),
            score=overall_score,
            verdict=readiness_level,
            inputs={
                "skills": skills,
                "credentials": credentials,
                "network_score": network_score,
            },
            detail=result,
            db=db,
            workspace_id=workspace_id,
        )
        return result

    @staticmethod
    def gate(db: Session, workspace_id: str) -> GateDecision:
        """May this workspace turn a playbook into a live offer?

        **No assessment on record is a refusal, not a pass.** The gate
        exists because activation produces a client-facing offer; a
        workspace that has never been assessed has not demonstrated
        readiness, and defaulting to allow would make the gate decorative.

        Reads the most recent recorded assessment rather than taking one
        as an argument - a gate whose inputs come from the caller is the
        same defect P-13 removed from risk-review approvals.
        """
        rows = get_scores(
            db,
            subject_type="workspace",
            scorer=SCORER,
            workspace_id=workspace_id,
            limit=1,
        )
        if not rows:
            return GateDecision(
                allowed=False,
                reason=REASON_NO_ASSESSMENT,
                detail=(
                    "No founder readiness assessment is on record for this workspace. "
                    "Run one before activating a playbook into an offer."
                ),
            )

        latest = rows[0]
        score = float(latest.score or 0.0)
        recommendations = tuple((latest.detail or {}).get("recommendations", []))

        if score < READY_THRESHOLD:
            return GateDecision(
                allowed=False,
                reason=REASON_BELOW_THRESHOLD,
                score=score,
                detail=(
                    f"Readiness is {score:.1f}, below the "
                    f"{READY_THRESHOLD:.0f} required to activate a playbook "
                    "into a client-facing offer."
                ),
                recommendations=recommendations,
            )

        return GateDecision(allowed=True, score=score)
