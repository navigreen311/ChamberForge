"""ValidatorAI — Claude-powered problem validation for HNW/UHNW market."""
from __future__ import annotations

import json

from app.core.config import settings
from app.services.agents.base_agent import as_dict, as_list, call_claude

_SYSTEM = (
    "You are ValidatorAI for ChamberForge, judging whether a premium-market "
    "problem is real, payable, deliverable and ethical. Answer only from the "
    "evidence given. Respond ONLY with what is asked for, no code fence."
)


class ValidatorAI:
    """Validates premium problems across 4 dimensions using Claude."""

    def __init__(self) -> None:
        #: Injection point for tests; the governed call path builds the real
        #: client, checks the budget, and meters the call.
        self.client = None
        self.model = settings.AI_MODEL

    # ------------------------------------------------------------------
    async def validate_problem(self, problem_data: dict) -> dict:
        """Evaluate a problem on 4 dimensions: real, payable, deliverable, ethical.

        With no API key this used to return `_mock_validation`, which
        answered `is_real: True`, `is_ethical: True` and "No ethical
        concerns identified" for every problem it was handed. A gate that
        always passes is worse than no gate: it produces a recorded
        approval nobody made.
        """

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

        response = await call_claude(
            "validator_ai", _SYSTEM, prompt, client=self.client, max_tokens=1024
        )
        return as_dict("validator_ai", response)

    # ------------------------------------------------------------------
    async def score_wtp_confidence(self, problem_data: dict) -> float:
        """Return willingness-to-pay confidence 0.0-1.0, or -1.0 if unknown.

        The sentinel matters: this used to return 0.82 or 0.65 based on a
        keyword match, which is a plausible confidence score derived from
        no analysis. A negative value is outside the documented range, so
        a caller cannot mistake it for a real reading.
        """

        prompt = (
            "Given this premium-service problem for HNW/UHNW clients, "
            "estimate the willingness-to-pay confidence as a single float "
            "between 0.0 and 1.0. Return ONLY the number, nothing else.\n\n"
            f"Problem data:\n{json.dumps(problem_data, indent=2)}"
        )

        response = await call_claude(
            "validator_ai", _SYSTEM, prompt, client=self.client, max_tokens=64
        )
        if not response.ok:
            return -1.0
        try:
            score = float((response.text or "").strip())
        except ValueError:
            return -1.0
        return max(0.0, min(1.0, score))

    # ------------------------------------------------------------------
    async def detect_false_positives(self, problem_data: dict) -> list[dict]:
        """Detect potential false-positive flags in the problem.

        Returns [] when no analysis could be run. That is the same value
        as "analysed, nothing found", which is the weakness of a list
        return - but it invents nothing, and the agent log records why.
        """

        prompt = (
            "Analyze this premium problem for potential false-positive flags. "
            "A false positive means it looks like a valid premium pain but may not be. "
            "Return ONLY a JSON array of objects: "
            '[{"flag": str, "severity": "low"|"medium"|"high", "explanation": str}]. '
            "Return [] if none found.\n\n"
            f"Problem data:\n{json.dumps(problem_data, indent=2)}"
        )

        response = await call_claude(
            "validator_ai", _SYSTEM, prompt, client=self.client, max_tokens=1024
        )
        return as_list("validator_ai", response)
