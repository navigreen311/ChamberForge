"""RelationshipAI — AI agent for mapping gatekeepers, referral paths, and trust scoring."""

from __future__ import annotations

import json

from app.core.config import settings
from app.services.agents.base_agent import call_claude, parse_json


class RelationshipAI:
    """Maps organizational relationships, referral networks, and trust channels."""

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.model = model or settings.AI_MODEL

    async def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        """Call the model through the governed path; "" when it could not run.

        This used to build its own client and swallow every exception,
        so the call was unmetered, unbudgeted, and silent on failure.
        Callers still get "" and fall back to their templates - which,
        in this agent, are composed from the caller's own offer fields
        rather than invented, so they stay.
        """
        response = await call_claude(
            "relationship_ai",
            system_prompt,
            user_prompt,
            client=getattr(self, "client", None),
            max_tokens=4096,
        )
        return response.text or ""

    async def map_gatekeepers(self, buyer_profile: dict) -> list[dict]:
        """Map organizational gatekeepers who influence the buying decision.

        Returns:
            list of dicts with role, influence_level, concerns, approach_strategy, introduction_script
        """
        company = buyer_profile.get("company", "Target Organization")
        industry = buyer_profile.get("industry", "business")
        deal_size = buyer_profile.get("deal_size", "high-value")
        decision_maker = buyer_profile.get("decision_maker", "CEO")
        org_size = buyer_profile.get("org_size", "mid-market")

        system_prompt = (
            "You are an enterprise sales strategist specializing in complex B2B deals. "
            "Map the typical gatekeepers in an organization. Return valid JSON array."
        )

        user_prompt = f"""Map the gatekeepers for this deal:
- Company: {company}
- Industry: {industry}
- Deal Size: {deal_size}
- Decision Maker: {decision_maker}
- Org Size: {org_size}

Return a JSON array of 4-6 gatekeepers:
[
  {{
    "role": "Title/Role",
    "influence_level": "high|medium|low",
    "concerns": "Their primary concerns",
    "approach_strategy": "How to win them over",
    "introduction_script": "Opening line when meeting them"
  }}
]"""

        raw = await self._call_llm(system_prompt, user_prompt)
        parsed = parse_json(raw)
        return parsed if isinstance(parsed, list) else []

    async def design_referral_paths(self, offer_data: dict) -> list[dict]:
        """Design referral paths with trust-scored channels.

        Returns:
            list of dicts with channel, trust_score (1-10), approach, script
        """
        offer_name = offer_data.get("name", "Premium Service")
        target_market = offer_data.get("target_market", "high-net-worth individuals")
        industry = offer_data.get("industry", "premium services")
        price = offer_data.get("price", "premium")

        system_prompt = (
            "You are a referral marketing strategist for premium B2B services. "
            "Design referral paths ranked by trust. Return valid JSON array."
        )

        user_prompt = f"""Design referral paths for:
- Offer: {offer_name} ({price})
- Target: {target_market}
- Industry: {industry}

Return JSON array of 5-7 referral channels:
[
  {{
    "channel": "Channel name",
    "trust_score": 8,
    "approach": "How to activate this channel",
    "script": "What to say when asking for referral"
  }}
]"""

        raw = await self._call_llm(system_prompt, user_prompt)
        parsed = parse_json(raw)
        return parsed if isinstance(parsed, list) else []

    async def score_trust_channels(self, channels: list[str]) -> list[dict]:
        """Score a list of trust/referral channels on effectiveness.

        Returns:
            list of dicts with channel, score (1-10), reasoning
        """
        if not channels:
            return []

        system_prompt = (
            "You are a trust and relationship expert in premium B2B services. "
            "Score channels by trust effectiveness. Return valid JSON array."
        )

        user_prompt = f"""Score these channels for trust effectiveness (1-10):
{json.dumps(channels)}

Return JSON array:
[
  {{"channel": "channel_name", "score": 8, "reasoning": "Why this score"}}
]"""

        raw = await self._call_llm(system_prompt, user_prompt)

        try:
            result = json.loads(raw)
            if isinstance(result, list):
                return result
        except (json.JSONDecodeError, ValueError):
            pass

        # Deterministic fallback scoring
        channel_scores = {
            "referral": 9,
            "partner": 8,
            "community": 7,
            "event": 6,
            "linkedin": 5,
            "cold email": 3,
            "cold call": 2,
            "advertising": 4,
            "content": 6,
            "webinar": 6,
            "podcast": 7,
        }

        result = []
        for ch in channels:
            ch_lower = ch.lower()
            score = 5  # default
            reasoning = "Moderate trust channel with standard effectiveness."
            for keyword, s in channel_scores.items():
                if keyword in ch_lower:
                    score = s
                    if s >= 8:
                        reasoning = "High-trust channel. Personal relationships drive premium buying decisions."
                    elif s >= 6:
                        reasoning = "Solid trust channel. Builds credibility through consistent engagement."
                    elif s >= 4:
                        reasoning = "Moderate trust. Works best when combined with warmer channels."
                    else:
                        reasoning = "Low trust. Interruption-based approach. Use sparingly for premium services."
                    break
            result.append({"channel": ch, "score": score, "reasoning": reasoning})

        return result
