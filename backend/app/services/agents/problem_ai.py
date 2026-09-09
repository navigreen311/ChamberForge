"""Problem Discovery AI Agent — uses Claude to discover and score premium problems."""
from __future__ import annotations

import json
from typing import Any

import anthropic

from app.core.config import settings

SAMPLE_PROBLEMS: list[dict[str, Any]] = [
    {
        "title": "Cross-Border Estate Tax Complexity",
        "description": (
            "UHNW families with assets in multiple jurisdictions face mounting "
            "estate-tax exposure due to diverging regulations and lack of "
            "unified advisory solutions."
        ),
        "wealth_tier": "uhnw",
        "buyer_type": "family",
        "pain_category": "estate_planning",
        "urgency_score": 9,
        "lifecycle_stage": "accelerating",
        "trigger_event": "regulatory_change",
        "wtp_profile": "ultra_premium",
    },
    {
        "title": "Digital Privacy for Public-Profile Families",
        "description": (
            "HNW individuals with public profiles struggle to protect family "
            "digital footprints from sophisticated social-engineering attacks."
        ),
        "wealth_tier": "hnw",
        "buyer_type": "family",
        "pain_category": "privacy_security",
        "urgency_score": 8,
        "lifecycle_stage": "emerging",
        "trigger_event": "liquidity_event",
        "wtp_profile": "premium",
    },
    {
        "title": "Next-Gen Wealth Transfer Readiness",
        "description": (
            "Family offices report that fewer than 30% of next-generation "
            "members feel prepared to manage inherited wealth, creating demand "
            "for structured education and governance programs."
        ),
        "wealth_tier": "family_office",
        "buyer_type": "family_office",
        "pain_category": "family_governance",
        "urgency_score": 7,
        "lifecycle_stage": "proven",
        "trigger_event": "inheritance",
        "wtp_profile": "outcome_based",
    },
]


class ProblemAI:
    """AI-powered problem discovery and scoring for premium markets."""

    def __init__(self) -> None:
        self.api_key = settings.ANTHROPIC_API_KEY
        self.model = settings.AI_MODEL
        if self.api_key:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None

    # ------------------------------------------------------------------
    def discover_problems(
        self, sources: list[str], workspace_id: str
    ) -> list[dict[str, Any]]:
        """Analyze sources and extract premium pain points via Claude."""
        if not self.client:
            return SAMPLE_PROBLEMS

        sources_text = "\n".join(f"- {s}" for s in sources)
        prompt = (
            "You are a premium problem discovery agent. "
            "Analyze the following market sources and extract premium pain "
            "points relevant to HNW / UHNW individuals and families.\n\n"
            f"Sources:\n{sources_text}\n\n"
            "Return a JSON array where each element has these fields:\n"
            "  title (str), description (str), wealth_tier (affluent|hnw|uhnw|family_office), "
            "buyer_type (individual|couple|family|family_office|institution), "
            "pain_category (wealth_preservation|tax_optimization|estate_planning|"
            "lifestyle_management|privacy_security|family_governance|philanthropy|"
            "concierge|compliance|investment), "
            "urgency_score (int 1-10), "
            "lifecycle_stage (emerging|accelerating|proven|saturated|declining), "
            "trigger_event (liquidity_event|inheritance|divorce|retirement|relocation|"
            "health_crisis|business_exit|market_downturn|regulatory_change|family_growth), "
            "wtp_profile (premium|ultra_premium|value_conscious|outcome_based).\n\n"
            "Return ONLY the JSON array, no markdown fences."
        )

        message = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1]
            raw = raw.rsplit("```", 1)[0]
        problems: list[dict[str, Any]] = json.loads(raw)
        return problems

    # ------------------------------------------------------------------
    def score_problem(self, problem_data: dict[str, Any]) -> dict[str, Any]:
        """Ask Claude to score a problem for urgency and WTP confidence."""
        if not self.client:
            return {"urgency_score": 7, "wtp_confidence": 0.75}

        prompt = (
            "You are a premium-market scoring analyst. "
            "Given the following problem, return a JSON object with two fields:\n"
            "  urgency_score (int 1-10) and wtp_confidence (float 0.0-1.0).\n\n"
            f"Problem: {json.dumps(problem_data)}\n\n"
            "Return ONLY the JSON object, no markdown fences."
        )
        message = self.client.messages.create(
            model=self.model,
            max_tokens=256,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1]
            raw = raw.rsplit("```", 1)[0]
        return json.loads(raw)

    # ------------------------------------------------------------------
    def classify_lifecycle(self, problem_data: dict[str, Any]) -> str:
        """Classify a problem into a lifecycle stage via Claude."""
        if not self.client:
            return "emerging"

        prompt = (
            "You are a market lifecycle analyst for premium services. "
            "Classify the following problem into exactly one lifecycle stage: "
            "Emerging, Accelerating, Proven, Saturated, or Declining.\n\n"
            f"Problem: {json.dumps(problem_data)}\n\n"
            "Return ONLY the single word (e.g. 'Emerging')."
        )
        message = self.client.messages.create(
            model=self.model,
            max_tokens=32,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()
