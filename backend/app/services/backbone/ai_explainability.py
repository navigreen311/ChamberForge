"""AI Explainability — transparency reports for every AI-driven recommendation."""
from datetime import datetime, timezone


class AIExplainability:
    """
    Generates human-readable explainability reports for AI agent outputs.
    Every recommendation served to a client must be auditable: what sources
    were used, how confident the model is, and what assumptions were made.
    """

    # Source credibility tiers
    CREDIBILITY_TIERS = {
        "primary": 1.0,
        "secondary": 0.75,
        "tertiary": 0.5,
        "anecdotal": 0.25,
    }

    # Freshness decay: score penalty per 30-day bucket
    FRESHNESS_DECAY_RATE = 0.05  # 5% per 30 days

    @classmethod
    def _assess_credibility(cls, source: dict) -> float:
        """Rate source credibility on 0-1 scale."""
        tier = source.get("tier", "tertiary")
        return cls.CREDIBILITY_TIERS.get(tier, 0.5)

    @classmethod
    def _compute_freshness(cls, source: dict) -> dict:
        """Compute age in days and apply decay to the source score."""
        source_date = source.get("date")
        if source_date:
            if isinstance(source_date, str):
                source_date = datetime.fromisoformat(source_date)
            age_days = (datetime.now(timezone.utc) - source_date.replace(tzinfo=timezone.utc)).days
        else:
            age_days = 365  # assume stale if no date

        decay = min(1.0, cls.FRESHNESS_DECAY_RATE * (age_days / 30))
        return {
            "source": source.get("name", "unknown"),
            "age_days": age_days,
            "decay_applied": round(decay, 4),
        }

    @classmethod
    def _build_evidence_chain(cls, sources: list[dict]) -> list[dict]:
        """Build evidence chain from source list."""
        chain = []
        for src in sources:
            chain.append(
                {
                    "source": src.get("name", "unknown"),
                    "claim": src.get("claim", ""),
                    "credibility": cls._assess_credibility(src),
                    "freshness": cls._compute_freshness(src)["decay_applied"],
                }
            )
        return chain

    @classmethod
    def _compute_confidence(cls, evidence_chain: list[dict]) -> float:
        """
        Aggregate confidence from evidence credibility and freshness.
        Score = mean(credibility * (1 - freshness_decay)) across sources.
        """
        if not evidence_chain:
            return 0.0

        scores = []
        for e in evidence_chain:
            adjusted = e["credibility"] * (1.0 - e["freshness"])
            scores.append(adjusted)

        return round(sum(scores) / len(scores), 4)

    @classmethod
    def generate_report(
        cls,
        agent_name: str,
        input_data: dict,
        output_data: dict,
        sources_used: list[dict],
    ) -> dict:
        """
        Generate a full explainability report for an AI agent's output.

        Parameters
        ----------
        agent_name : str
            Name of the AI agent that produced the output.
        input_data : dict
            The data/context fed to the agent.
        output_data : dict
            The agent's recommendation / output.
        sources_used : list[dict]
            Each source: {name, claim, tier, date (ISO or datetime)}.

        Returns
        -------
        dict with agent, timestamp, evidence_chain, confidence_score,
        assumptions, source_freshness, recommendation_basis.
        """
        evidence_chain = cls._build_evidence_chain(sources_used)
        confidence_score = cls._compute_confidence(evidence_chain)
        source_freshness = [cls._compute_freshness(s) for s in sources_used]

        # Derive assumptions from input gaps
        assumptions = []
        if not input_data.get("client_risk_profile"):
            assumptions.append(
                {
                    "assumption": "Client risk profile not provided — defaulting to moderate",
                    "impact_if_wrong": "Recommendations may be too conservative or aggressive",
                }
            )
        if not input_data.get("market_conditions"):
            assumptions.append(
                {
                    "assumption": "Current market conditions assumed stable",
                    "impact_if_wrong": "Volatile markets could invalidate pricing suggestions",
                }
            )
        if not sources_used:
            assumptions.append(
                {
                    "assumption": "No external sources provided — output based on model priors",
                    "impact_if_wrong": "Recommendations lack empirical grounding",
                }
            )

        recommendation_basis = (
            f"Based on {len(sources_used)} source(s) with "
            f"{'high' if confidence_score > 0.7 else 'moderate' if confidence_score > 0.4 else 'low'} "
            f"aggregate confidence ({confidence_score:.0%}). "
            f"{len(assumptions)} assumption(s) flagged for review."
        )

        return {
            "agent": agent_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "input_summary": input_data,
            "output_summary": output_data,
            "evidence_chain": evidence_chain,
            "confidence_score": confidence_score,
            "assumptions": assumptions,
            "source_freshness": source_freshness,
            "recommendation_basis": recommendation_basis,
        }
