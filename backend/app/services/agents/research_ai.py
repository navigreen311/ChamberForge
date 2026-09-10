"""ResearchAI agent — AI-powered evidence analysis using Claude."""
import json
from datetime import date, datetime
from typing import Optional

from app.core.config import settings
from app.services.agents.base_agent import as_dict, as_list, call_claude_sync

_SYSTEM = (
    "You are ResearchAI for ChamberForge. Extract only claims that are "
    "actually present in the source you are given; never supply a claim "
    "from general knowledge. Respond ONLY with the JSON asked for."
)


class ResearchAI:
    """Handles AI-powered claim extraction, contradiction detection, and recency scoring."""

    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.model = settings.AI_MODEL
        self._client = None
        if self.api_key:
            try:
                import anthropic
                self._client = anthropic.Anthropic(api_key=self.api_key)
            except Exception:
                self._client = None

    async def ingest_source(self, text: str, source_type: str) -> dict:
        """Extract factual claims from source text using Claude.

        Returns claims, estimated_credibility and key_findings - or a
        degraded result. It used to return `_sample_ingest_data`, which
        invented claims and a credibility score and attributed them to
        the source the caller supplied. For a research agent whose entire
        job is provenance, that is the worst possible failure mode.
        """

        prompt = (
            "Extract factual claims from this source. Return ONLY valid JSON with no "
            "markdown formatting:\n"
            '{"claims": [{"claim_text": "...", "confidence": 0.0-1.0, "category": "..."}], '
            '"estimated_credibility": 1-10, "key_findings": ["..."]}\n\n'
            f"Source type: {source_type}\n\nSource text:\n{text}"
        )

        response = call_claude_sync(
            "research_ai", _SYSTEM, prompt, client=self._client, max_tokens=2048
        )
        return as_dict("research_ai", response)

    def detect_contradictions(
        self, claims_a: list[dict], claims_b: list[dict]
    ) -> list[dict]:
        """Compare two sets of claims and find contradictions using Claude.

        Returns list of {claim_a, claim_b, explanation}.
        Falls back to empty list if no API key.
        """
        if not self._client:
            return []

        prompt = (
            "Compare these two sets of claims and identify any contradictions. "
            "Return ONLY valid JSON array with no markdown formatting:\n"
            '[{"claim_a": "...", "claim_b": "...", "explanation": "..."}]\n'
            "Return empty array [] if no contradictions found.\n\n"
            f"Claims Set A:\n{json.dumps(claims_a, indent=2)}\n\n"
            f"Claims Set B:\n{json.dumps(claims_b, indent=2)}"
        )

        response = call_claude_sync(
            "research_ai", _SYSTEM, prompt, client=self._client, max_tokens=2048
        )
        return as_list("research_ai", response)

    def compute_recency_decay(
        self,
        credibility_score: float,
        publication_date: date,
        reference_date: Optional[date] = None,
    ) -> float:
        """Calculate decayed credibility score based on age.

        Formula: score * (0.5 ^ (months_elapsed / 18))
        Pure function — no AI needed.
        """
        if reference_date is None:
            reference_date = date.today()

        if isinstance(publication_date, datetime):
            publication_date = publication_date.date()
        if isinstance(reference_date, datetime):
            reference_date = reference_date.date()

        # Calculate months elapsed using year/month difference
        months_elapsed = (
            (reference_date.year - publication_date.year) * 12
            + (reference_date.month - publication_date.month)
        )
        if months_elapsed < 0:
            months_elapsed = 0

        decay = 0.5 ** (months_elapsed / 18)
        return credibility_score * decay

    def identify_stale(
        self, evidences: list, threshold_months: int = 18
    ) -> list[str]:
        """Return IDs of evidence older than threshold_months."""
        stale_ids = []
        today = date.today()
        for ev in evidences:
            pub_date = ev.publication_date
            if isinstance(pub_date, datetime):
                pub_date = pub_date.date()
            months = (today.year - pub_date.year) * 12 + (today.month - pub_date.month)
            if months > threshold_months:
                stale_ids.append(str(ev.id))
        return stale_ids
