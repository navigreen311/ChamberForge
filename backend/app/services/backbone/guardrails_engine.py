"""GuardrailsEngine — Rule-based compliance and ethical guardrails for premium offers."""
from __future__ import annotations

import re

from sqlalchemy.orm import Session

from app.services.backbone.scoring_store import SCORER_GUARDRAILS, record_score

_LICENSED_ROLES = {"lawyer", "doctor", "financial_advisor", "licensed_security",
                   "attorney", "physician", "cpa", "registered_investment_advisor"}

_MEDICAL_LEGAL_TAX_KEYWORDS = re.compile(
    r"\b(medical|legal|tax|diagnosis|prescri(?:be|ption)|litigation|audit|malpractice)\b",
    re.IGNORECASE,
)


class GuardrailsEngine:
    """Apply compliance guardrails to premium-service offers."""

    @staticmethod
    def check_offer(
        offer_data: dict,
        db: Session | None = None,
        workspace_id: str | None = None,
    ) -> dict:
        """Apply compliance guardrails, and record what was decided.

        P-09: a BLOCK is a compliance decision. It was returned to the
        caller and kept nowhere, so an offer that was blocked and then
        shipped anyway left no trace of the block - which is precisely
        the sequence anyone investigating would need to see.
        """
        rules: list[dict[str, str]] = []
        overall = "PASS"

        # ── Rule 1: no_licensed_professional ──────────────────────
        rule1_status = "PASS"
        rule1_reason = "Offer does not position user as a licensed professional."
        positioning = (offer_data.get("positioning") or "").lower()
        services = [s.lower() for s in (offer_data.get("services") or [])]
        title = (offer_data.get("title") or "").lower()
        combined_text = f"{positioning} {title} {' '.join(services)}"
        for role in _LICENSED_ROLES:
            if role.replace("_", " ") in combined_text or role in combined_text:
                rule1_status = "BLOCK"
                rule1_reason = f"Offer positions user as '{role}', which requires licensure."
                break
        rules.append({
            "rule_id": "R1",
            "rule_name": "no_licensed_professional",
            "status": rule1_status,
            "reason": rule1_reason,
        })

        # ── Rule 2: no_surveillance ───────────────────────────────
        rule2_status = "PASS"
        rule2_reason = "No surveillance concerns detected."
        description = (offer_data.get("description") or "").lower()
        full_text = f"{combined_text} {description}"
        surveillance_terms = ["surveillance", "monitoring without consent", "covert tracking",
                              "hidden camera", "spy", "wiretap"]
        for term in surveillance_terms:
            if term in full_text:
                rule2_status = "BLOCK"
                rule2_reason = f"Offer involves '{term}' without explicit consent mention."
                # Check for explicit consent language
                consent_terms = ["with consent", "explicit consent", "client-authorized", "consented"]
                if any(ct in full_text for ct in consent_terms):
                    rule2_status = "PASS"
                    rule2_reason = "Surveillance mentioned but explicit consent language found."
                break
        rules.append({
            "rule_id": "R2",
            "rule_name": "no_surveillance",
            "status": rule2_status,
            "reason": rule2_reason,
        })

        # ── Rule 3: medical_legal_tax_review ──────────────────────
        rule3_status = "PASS"
        rule3_reason = "No medical/legal/tax domain detected."
        pain_cat = (offer_data.get("pain_category") or "").lower()
        if pain_cat in ("medical", "governance"):
            rule3_status = "WARN"
            rule3_reason = "Requires human review — pain category is Medical or Governance."
        elif _MEDICAL_LEGAL_TAX_KEYWORDS.search(full_text):
            rule3_status = "WARN"
            rule3_reason = "Requires human review — description references medical/legal/tax terms."
        rules.append({
            "rule_id": "R3",
            "rule_name": "medical_legal_tax_review",
            "status": rule3_status,
            "reason": rule3_reason,
        })

        # ── Rule 4: cross_border_data ─────────────────────────────
        rule4_status = "PASS"
        rule4_reason = "Single jurisdiction or no jurisdiction specified."
        jurisdictions = offer_data.get("jurisdictions") or []
        if len(jurisdictions) > 1:
            rule4_status = "WARN"
            rule4_reason = f"Needs jurisdiction check — {len(jurisdictions)} jurisdictions involved: {', '.join(jurisdictions)}."
        rules.append({
            "rule_id": "R4",
            "rule_name": "cross_border_data",
            "status": rule4_status,
            "reason": rule4_reason,
        })

        # ── Rule 5: guarantee_language ────────────────────────────
        rule5_status = "PASS"
        rule5_reason = "No specific outcome guarantees detected."
        guarantee = offer_data.get("guarantee_framework") or {}
        guarantee_text = str(guarantee).lower()
        outcome_promises = ["guaranteed", "100%", "will achieve", "ensure outcome",
                            "promise results", "money back", "guaranteed results"]
        for phrase in outcome_promises:
            if phrase in guarantee_text:
                rule5_status = "WARN"
                rule5_reason = f"Review guarantee language — contains '{phrase}'."
                break
        rules.append({
            "rule_id": "R5",
            "rule_name": "guarantee_language",
            "status": rule5_status,
            "reason": rule5_reason,
        })

        # ── Rule 6: regulated_domain ──────────────────────────────
        rule6_status = "PASS"
        rule6_reason = "Compliance risk is not in regulated domain."
        compliance_risk = (offer_data.get("compliance_risk") or "").lower()
        if compliance_risk == "regulateddomain":
            rule6_status = "WARN"
            rule6_reason = "Compliance risk is RegulatedDomain — additional review required."
        rules.append({
            "rule_id": "R6",
            "rule_name": "regulated_domain",
            "status": rule6_status,
            "reason": rule6_reason,
        })

        # ── Derive overall status ─────────────────────────────────
        statuses = [r["status"] for r in rules]
        if "BLOCK" in statuses:
            overall = "BLOCK"
        elif "WARN" in statuses:
            overall = "WARN"

        record_score(
            scorer=SCORER_GUARDRAILS,
            subject_type="offer",
            subject_id=str(offer_data.get("id") or ""),
            verdict=overall,
            inputs=offer_data,
            detail={"rules": rules},
            db=db,
            workspace_id=workspace_id,
        )
        return {"overall_status": overall, "rules": rules}
