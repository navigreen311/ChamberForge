"""Problem Ontology Engine — canonical schema validation and AI classification."""
from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.enums import (
    BuyerType,
    ComplianceRisk,
    DeliveryModel,
    LifecycleStage,
    LifeStage,
    PainCategory,
    ProofMetric,
    TriggerEvent,
    TrustChannel,
    WealthTier,
    WTPProfile,
)
from app.models.problem import Problem

# Canonical ontology definition — single source of truth
_ONTOLOGY_FIELDS: dict[str, dict] = {
    "wealth_tier": {
        "description": "Net-worth segment of the target buyer",
        "allowed_values": [e.value for e in WealthTier],
        "model_column": "wealth_tier",
    },
    "buyer_type": {
        "description": "Archetype of the buyer persona",
        "allowed_values": [e.value for e in BuyerType],
        "model_column": "buyer_type",
    },
    "life_stage": {
        "description": "Current wealth lifecycle stage",
        "allowed_values": [e.value for e in LifeStage],
        "model_column": "life_stage",
    },
    "trigger_event": {
        "description": "Event that creates urgency or buying intent",
        "allowed_values": [e.value for e in TriggerEvent],
        "model_column": "trigger_event",
    },
    "pain_category": {
        "description": "Primary pain-point category",
        "allowed_values": [e.value for e in PainCategory],
        "model_column": "pain_category",
    },
    "wtp_profile": {
        "description": "Willingness-to-pay profile",
        "allowed_values": [e.value for e in WTPProfile],
        "model_column": "wtp_profile",
    },
    "trust_channel": {
        "description": "Primary channel for building trust",
        "allowed_values": [e.value for e in TrustChannel],
        "model_column": "trust_channel",
    },
    "compliance_risk": {
        "description": "Level of regulatory / compliance risk",
        "allowed_values": [e.value for e in ComplianceRisk],
        "model_column": "compliance_risk",
    },
    "delivery_model": {
        "description": "How the service is delivered",
        "allowed_values": [e.value for e in DeliveryModel],
        "model_column": "delivery_model",
    },
    "proof_metric": {
        "description": "Key metric for proving value",
        "allowed_values": [e.value for e in ProofMetric],
        "model_column": "proof_metric",
    },
    "lifecycle_stage": {
        "description": "Market lifecycle stage of the problem",
        "allowed_values": [e.value for e in LifecycleStage],
        "model_column": "lifecycle_stage",
    },
}

# Keyword-based heuristic classifier (production would use LLM)
_KEYWORD_MAP: dict[str, dict[str, list[str]]] = {
    "wealth_tier": {
        "hnw": ["high net worth", "hnw", "millionaire"],
        "uhnw": ["ultra high net worth", "uhnw", "billionaire", "ultra-wealthy"],
        "family_office": ["family office", "multi-family", "single-family office"],
    },
    "pain_category": {
        "Coordination": ["coordinate", "fragmented", "multiple advisors"],
        "Security": ["security", "cyber", "threat", "protection"],
        "Privacy": ["privacy", "confidential", "discreet"],
        "Governance": ["governance", "succession", "family constitution"],
        "wealth_preservation": ["preserve", "protect wealth", "asset protection"],
        "tax_optimization": ["tax", "optimization", "offshore", "structure"],
        "estate_planning": ["estate", "inheritance", "trust", "will"],
    },
    "trigger_event": {
        "Exit": ["exit", "sold company", "acquisition"],
        "IPO": ["ipo", "public offering", "going public"],
        "Inheritance": ["inherited", "inheritance", "estate settlement"],
        "Divorce": ["divorce", "separation", "marital"],
    },
    "buyer_type": {
        "Founder": ["founder", "entrepreneur", "started the company"],
        "Inheritor": ["inheritor", "inherited", "next generation", "next-gen"],
        "Executive": ["executive", "ceo", "cfo", "c-suite"],
    },
}

# Dynamic extensions (runtime-added values)
_extensions: dict[str, list[str]] = {}


class OntologyEngine:
    """Layer-1 service: canonical problem ontology validation and classification."""

    def get_ontology_schema(self) -> dict:
        """Return the full canonical data model definition."""
        schema: dict = {}
        for field, meta in _ONTOLOGY_FIELDS.items():
            allowed = list(meta["allowed_values"])
            if field in _extensions:
                allowed.extend(_extensions[field])
            schema[field] = {
                "description": meta["description"],
                "allowed_values": allowed,
            }
        return schema

    def validate_against_ontology(self, problem_data: dict) -> dict:
        """Validate problem data against the ontology schema."""
        errors: list[str] = []
        warnings: list[str] = []
        auto_corrections: dict[str, str] = {}

        schema = self.get_ontology_schema()

        for field, meta in schema.items():
            value = problem_data.get(field)
            if value is None:
                continue

            allowed = meta["allowed_values"]
            if value in allowed:
                continue

            # Try case-insensitive match for auto-correction
            lower_map = {v.lower(): v for v in allowed}
            if value.lower() in lower_map:
                corrected = lower_map[value.lower()]
                auto_corrections[field] = corrected
                warnings.append(
                    f"Field '{field}': '{value}' auto-corrected to '{corrected}'"
                )
            else:
                errors.append(
                    f"Field '{field}': '{value}' is not in allowed values"
                )

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "auto_corrections": auto_corrections,
        }

    def suggest_classifications(self, text: str) -> dict:
        """AI-powered suggestion of ontology fields from free text.

        Uses keyword matching heuristic; production would use LLM.
        """
        text_lower = text.lower()
        suggestions: dict[str, str | None] = {}

        for field, value_keywords in _KEYWORD_MAP.items():
            best_match: str | None = None
            best_score = 0
            for value, keywords in value_keywords.items():
                score = sum(1 for kw in keywords if kw in text_lower)
                if score > best_score:
                    best_score = score
                    best_match = value
            suggestions[field] = best_match

        return {
            "suggestions": suggestions,
            "confidence": "heuristic",
            "source_text_length": len(text),
        }

    def get_ontology_stats(self, db: Session, workspace_id: str) -> dict:
        """Distribution counts for each ontology dimension."""
        stats: dict = {}
        for field, meta in _ONTOLOGY_FIELDS.items():
            col = getattr(Problem, meta["model_column"], None)
            if col is None:
                continue
            rows = (
                db.query(col, func.count(Problem.id))
                .filter(Problem.workspace_id == workspace_id, col.isnot(None))
                .group_by(col)
                .all()
            )
            stats[field] = {str(val): cnt for val, cnt in rows}
        return stats

    def update_ontology_mappings(self, field: str, new_values: list[str]) -> dict:
        """Extend allowed values for a field (admin only)."""
        if field not in _ONTOLOGY_FIELDS:
            return {"success": False, "error": f"Unknown field: {field}"}

        if field not in _extensions:
            _extensions[field] = []

        added: list[str] = []
        existing = set(_ONTOLOGY_FIELDS[field]["allowed_values"]) | set(_extensions[field])
        for v in new_values:
            if v not in existing:
                _extensions[field].append(v)
                added.append(v)

        return {"success": True, "field": field, "added": added, "total": len(existing) + len(added)}
