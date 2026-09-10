"""Problem Discovery AI Agent — uses Claude to discover and score premium problems."""
from __future__ import annotations

import json
from typing import Any

from app.core.config import settings
from app.services.agents.base_agent import as_dict, as_list, call_claude_sync

_SYSTEM = (
    "You are ProblemAI for ChamberForge, discovering and scoring pain "
    "points in the high- and ultra-high-net-worth market. Respond ONLY "
    "with what is asked for, no commentary and no code fence."
)


class ProblemAI:
    """AI-powered problem discovery and scoring for premium markets."""

    #: Injection point for tests; the governed call path builds the real one.
    client = None

    def __init__(self) -> None:
        self.api_key = settings.ANTHROPIC_API_KEY
        self.model = settings.AI_MODEL


    # ------------------------------------------------------------------
    def discover_problems(
        self, sources: list[str], workspace_id: str
    ) -> list[dict[str, Any]]:
        """Analyze sources and extract premium pain points via Claude.

        This returned SAMPLE_PROBLEMS with no key - a fixed set of invented
        pain points, each with an urgency score, presented as discovered
        from whatever sources the caller passed in.
        """
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

        response = call_claude_sync(
            "problem_ai",
            _SYSTEM,
            prompt,
            client=self.client,
            max_tokens=2048,
            workspace_id=workspace_id,
        )
        return as_list("problem_ai", response)

    # ------------------------------------------------------------------
    def score_problem(self, problem_data: dict[str, Any]) -> dict[str, Any]:
        """Ask Claude to score a problem for urgency and WTP confidence.

        With no key this returned a fixed urgency of 7 and a WTP
        confidence of 0.75 - the same scores for every problem, in the
        same shape as an analysed one.
        """
        prompt = (
            "You are a premium-market scoring analyst. "
            "Given the following problem, return a JSON object with two fields:\n"
            "  urgency_score (int 1-10) and wtp_confidence (float 0.0-1.0).\n\n"
            f"Problem: {json.dumps(problem_data)}\n\n"
            "Return ONLY the JSON object, no markdown fences."
        )
        response = call_claude_sync(
            "problem_ai", _SYSTEM, prompt, client=self.client, max_tokens=256
        )
        return as_dict("problem_ai", response)

    # ------------------------------------------------------------------
    def classify_lifecycle(self, problem_data: dict[str, Any]) -> str:
        """Classify a problem into a lifecycle stage via Claude.

        Returns "" when no classification could be made. It used to return
        "emerging" - a real stage, for every problem, whenever the AI was
        unavailable.
        """
        prompt = (
            "You are a market lifecycle analyst for premium services. "
            "Classify the following problem into exactly one lifecycle stage: "
            "Emerging, Accelerating, Proven, Saturated, or Declining.\n\n"
            f"Problem: {json.dumps(problem_data)}\n\n"
            "Return ONLY the single word (e.g. 'Emerging')."
        )
        response = call_claude_sync(
            "problem_ai", _SYSTEM, prompt, client=self.client, max_tokens=32
        )
        return (response.text or "").strip() if response.ok else ""
