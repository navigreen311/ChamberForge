"""ValidatorAI — Claude-powered problem validation for HNW/UHNW market."""
from __future__ import annotations

import json
import re

from app.core.config import settings


class ValidatorAI:
    """Validates premium problems across 4 dimensions using Claude."""

    def __init__(self) -> None:
        self.client = None
        self.model = settings.AI_MODEL
        if settings.ANTHROPIC_API_KEY:
            import anthropic
            self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    # ------------------------------------------------------------------
    async def validate_problem(self, problem_data: dict) -> dict:
        """Evaluate a problem on 4 dimensions: real, payable, deliverable, ethical."""
        if not self.client:
            return self._mock_validation(problem_data)

        prompt = (
            "Evaluate this premium problem for HNW/UHNW market on 4 dimensions. "
            "Return ONLY valid JSON (no markdown fences): "
            '{"is_real": bool, "real_score": 0-10, "real_reasoning": str, '
            '"is_payable": bool, "payable_score": 0-10, "payable_reasoning": str, '
            '"is_deliverable": bool, "deliverable_score": 0-10, "deliverable_reasoning": str, '
            '"is_ethical": bool, "ethical_score": 0-10, "ethical_reasoning": str, '
            '"overall_score": float}\n\n'
            f"Problem data:\n{json.dumps(problem_data, indent=2)}"
        )

        message = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )

        raw = message.content[0].text
        # Strip markdown code fences if present
        raw = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("`")
        return json.loads(raw)

    # ------------------------------------------------------------------
    async def score_wtp_confidence(self, problem_data: dict) -> float:
        """Return willingness-to-pay confidence 0.0-1.0."""
        if not self.client:
            return self._mock_wtp(problem_data)

        prompt = (
            "Given this premium-service problem for HNW/UHNW clients, "
            "estimate the willingness-to-pay confidence as a single float "
            "between 0.0 and 1.0. Return ONLY the number, nothing else.\n\n"
            f"Problem data:\n{json.dumps(problem_data, indent=2)}"
        )

        message = self.client.messages.create(
            model=self.model,
            max_tokens=64,
            messages=[{"role": "user", "content": prompt}],
        )

        raw = message.content[0].text.strip()
        score = float(raw)
        return max(0.0, min(1.0, score))

    # ------------------------------------------------------------------
    async def detect_false_positives(self, problem_data: dict) -> list[dict]:
        """Detect potential false-positive flags in the problem."""
        if not self.client:
            return self._mock_false_positives(problem_data)

        prompt = (
            "Analyze this premium problem for potential false-positive flags. "
            "A false positive means it looks like a valid premium pain but may not be. "
            "Return ONLY a JSON array of objects: "
            '[{"flag": str, "severity": "low"|"medium"|"high", "explanation": str}]. '
            "Return [] if none found.\n\n"
            f"Problem data:\n{json.dumps(problem_data, indent=2)}"
        )

        message = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )

        raw = message.content[0].text
        raw = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("`")
        return json.loads(raw)

    # ------------------------------------------------------------------
    # Mock responses (used when no API key is configured)
    # ------------------------------------------------------------------
    @staticmethod
    def _mock_validation(problem_data: dict) -> dict:
        title = problem_data.get("title", "")
        base = 7 if title else 5
        return {
            "is_real": True,
            "real_score": base + 1,
            "real_reasoning": "Problem addresses a recognized need in the premium market.",
            "is_payable": True,
            "payable_score": base,
            "payable_reasoning": "HNW/UHNW clients routinely pay for this category of service.",
            "is_deliverable": True,
            "deliverable_score": base,
            "deliverable_reasoning": "Delivery is feasible with standard premium-service operations.",
            "is_ethical": True,
            "ethical_score": base + 2,
            "ethical_reasoning": "No ethical concerns identified.",
            "overall_score": round((base + 1 + base + base + base + 2) / 4, 1),
        }

    @staticmethod
    def _mock_wtp(problem_data: dict) -> float:
        pain = problem_data.get("pain_category", "")
        high_wtp = {"Privacy", "Security", "Governance", "Medical"}
        return 0.82 if pain in high_wtp else 0.65

    @staticmethod
    def _mock_false_positives(problem_data: dict) -> list[dict]:
        flags: list[dict] = []
        desc = (problem_data.get("description") or "").lower()
        if "everyone" in desc or "mass market" in desc:
            flags.append({
                "flag": "mass_market_language",
                "severity": "medium",
                "explanation": "Description uses mass-market language, may not be a true premium pain.",
            })
        if not problem_data.get("pain_category"):
            flags.append({
                "flag": "missing_pain_category",
                "severity": "low",
                "explanation": "No pain category specified; harder to validate premium fit.",
            })
        return flags
