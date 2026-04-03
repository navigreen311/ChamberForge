"""RelationshipAI — AI agent for mapping gatekeepers, referral paths, and trust scoring."""

from __future__ import annotations

import json

from app.core.config import settings


class RelationshipAI:
    """Maps organizational relationships, referral networks, and trust channels."""

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.model = model or settings.AI_MODEL

    async def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        try:
            import anthropic

            client = anthropic.AsyncAnthropic(api_key=self.api_key)
            message = await client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
            return message.content[0].text
        except Exception:
            return ""

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

        try:
            result = json.loads(raw)
            if isinstance(result, list):
                return result
        except (json.JSONDecodeError, ValueError):
            pass

        return [
            {
                "role": "Executive Assistant",
                "influence_level": "high",
                "concerns": "Protecting the decision-maker's time and filtering irrelevant pitches",
                "approach_strategy": "Treat as a strategic ally. Provide clear, concise value props they can relay upward.",
                "introduction_script": f"Hi, I'm reaching out regarding a {deal_size} initiative that could impact {company}'s {industry} operations. I'd love to schedule 15 minutes with {decision_maker}.",
            },
            {
                "role": "CFO / Finance Lead",
                "influence_level": "high",
                "concerns": "ROI justification, budget allocation, risk mitigation",
                "approach_strategy": "Lead with financial models, case studies with hard numbers, and risk-adjusted ROI projections.",
                "introduction_script": f"I understand {company} is focused on operational efficiency. We've helped similar {org_size} firms achieve 3-5x ROI within 12 months.",
            },
            {
                "role": "Legal / Compliance",
                "influence_level": "medium",
                "concerns": "Contract terms, data security, regulatory compliance",
                "approach_strategy": "Proactively share compliance certifications, standard contracts, and security documentation.",
                "introduction_script": f"I've prepared our compliance documentation and standard terms for your review. We work with regulated {industry} firms regularly.",
            },
            {
                "role": "Operations / Implementation Lead",
                "influence_level": "medium",
                "concerns": "Implementation complexity, team disruption, timeline",
                "approach_strategy": "Show clear implementation roadmap with minimal disruption. Offer dedicated support.",
                "introduction_script": f"Our implementation approach is designed for {org_size} organizations. We handle 80% of the setup — your team's time commitment is about 2 hours/week.",
            },
            {
                "role": "End User / Champion",
                "influence_level": "medium",
                "concerns": "Ease of use, daily workflow impact, learning curve",
                "approach_strategy": "Provide hands-on demo, trial access, and peer references from similar roles.",
                "introduction_script": f"I'd love to show you how this works in a typical {industry} workflow. Most users see value within the first week.",
            },
        ]

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

        try:
            result = json.loads(raw)
            if isinstance(result, list):
                return result
        except (json.JSONDecodeError, ValueError):
            pass

        return [
            {
                "channel": "Existing Client Referrals",
                "trust_score": 9,
                "approach": "After delivering a win, ask for warm introductions to peers facing similar challenges.",
                "script": f"You've seen the results we've delivered. Do you know 2-3 {target_market} who face similar challenges? I'd value a warm introduction.",
            },
            {
                "channel": "Strategic Partners (Accountants, Lawyers, Advisors)",
                "trust_score": 8,
                "approach": "Build reciprocal referral relationships with complementary service providers.",
                "script": f"We serve the same {target_market} with complementary services. I'd love to explore a formal referral partnership where we both win.",
            },
            {
                "channel": "Industry Association Introductions",
                "trust_score": 7,
                "approach": "Become an active contributor to industry bodies. Volunteer for committees and speaking slots.",
                "script": f"I noticed you're active in [Association]. I'm exploring how {offer_name} can contribute to the {industry} community. Could we connect?",
            },
            {
                "channel": "Private Community / Mastermind Groups",
                "trust_score": 8,
                "approach": "Join or create exclusive peer groups where ideal clients gather.",
                "script": f"I run a private group for {target_market} focused on {industry} excellence. Would you be interested in joining as a founding member?",
            },
            {
                "channel": "Conference / Event Networking",
                "trust_score": 6,
                "approach": "Attend premium events where target clients gather. Host exclusive side events.",
                "script": f"I specialize in helping {target_market} with {industry} challenges. I'd love to share some insights over coffee.",
            },
            {
                "channel": "LinkedIn Warm Introductions",
                "trust_score": 5,
                "approach": "Identify mutual connections and request introductions through shared contacts.",
                "script": f"I see we're both connected to [Name]. They suggested we connect — I work with {target_market} on {industry} optimization.",
            },
        ]

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
