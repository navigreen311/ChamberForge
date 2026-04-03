"""ResearchAI agent — AI-powered evidence analysis using Claude."""
import json
from datetime import date, datetime
from typing import Optional

from app.core.config import settings


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

        Returns dict with claims, estimated_credibility, and key_findings.
        Falls back to sample data if no API key is configured.
        """
        if not self._client:
            return self._sample_ingest_data(source_type)

        prompt = (
            "Extract factual claims from this source. Return ONLY valid JSON with no "
            "markdown formatting:\n"
            '{"claims": [{"claim_text": "...", "confidence": 0.0-1.0, "category": "..."}], '
            '"estimated_credibility": 1-10, "key_findings": ["..."]}\n\n'
            f"Source type: {source_type}\n\nSource text:\n{text}"
        )

        try:
            message = self._client.messages.create(
                model=self.model,
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = message.content[0].text.strip()
            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
                if raw.endswith("```"):
                    raw = raw[:-3]
                raw = raw.strip()
            return json.loads(raw)
        except Exception:
            return self._sample_ingest_data(source_type)

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

        try:
            message = self._client.messages.create(
                model=self.model,
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = message.content[0].text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
                if raw.endswith("```"):
                    raw = raw[:-3]
                raw = raw.strip()
            return json.loads(raw)
        except Exception:
            return []

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

    @staticmethod
    def _sample_ingest_data(source_type: str) -> dict:
        """Return sample data when no API key is available."""
        return {
            "claims": [
                {
                    "claim_text": "Regulatory compliance costs increased 23% year-over-year",
                    "confidence": 0.85,
                    "category": "financial",
                },
                {
                    "claim_text": "New enforcement framework requires quarterly reporting",
                    "confidence": 0.92,
                    "category": "regulatory",
                },
                {
                    "claim_text": "Industry adoption rate reached 67% among tier-1 firms",
                    "confidence": 0.78,
                    "category": "statistical",
                },
            ],
            "estimated_credibility": 7,
            "key_findings": [
                "Rising compliance costs across the sector",
                "Shift toward more frequent reporting requirements",
                "Strong industry adoption signals market maturity",
            ],
        }
