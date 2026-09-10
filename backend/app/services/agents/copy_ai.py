"""CopyAI — AI-powered copywriting agent for positioning, outreach, and authority content."""

from __future__ import annotations

import json

from app.core.config import settings


class CopyAI:
    """Generates marketing copy, outreach sequences, and authority content using Claude."""

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.model = model or settings.AI_MODEL

    async def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        """Call Claude API and return text response. Falls back to structured defaults."""
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

    async def generate_positioning(self, offer_data: dict) -> dict:
        """Generate brand positioning assets from offer data.

        Returns:
            dict with one_liner, elevator_pitch, pas_copy (problem/agitate/solution), tagline
        """
        offer_name = offer_data.get("name", "Premium Service")
        target_market = offer_data.get("target_market", "high-net-worth individuals")
        price = offer_data.get("price", "premium")
        pain_points = offer_data.get("pain_points", [])
        outcomes = offer_data.get("outcomes", [])
        differentiators = offer_data.get("differentiators", [])

        system_prompt = (
            "You are a world-class direct response copywriter specializing in premium/luxury markets. "
            "You write copy for HNW/UHNW audiences. Always return valid JSON."
        )

        user_prompt = f"""Create positioning copy for this offer:
- Name: {offer_name}
- Target Market: {target_market}
- Price Point: {price}
- Pain Points: {json.dumps(pain_points)}
- Outcomes: {json.dumps(outcomes)}
- Differentiators: {json.dumps(differentiators)}

Return JSON with exactly this structure:
{{
  "one_liner": "A single compelling sentence",
  "elevator_pitch": "A 30-second pitch paragraph",
  "pas_copy": {{
    "problem": "Describe the problem",
    "agitate": "Make the problem feel urgent",
    "solution": "Present the offer as the solution"
  }},
  "tagline": "A memorable tagline"
}}"""

        raw = await self._call_llm(system_prompt, user_prompt)

        try:
            result = json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            pain_str = pain_points[0] if pain_points else "inefficiency"
            outcome_str = outcomes[0] if outcomes else "exceptional results"
            diff_str = differentiators[0] if differentiators else "our proprietary approach"

            result = {
                "one_liner": f"{offer_name} helps {target_market} overcome {pain_str} to achieve {outcome_str}.",
                "elevator_pitch": (
                    f"For {target_market} who struggle with {pain_str}, "
                    f"{offer_name} provides a {price}-tier solution that delivers {outcome_str}. "
                    f"Unlike alternatives, we leverage {diff_str} to guarantee measurable impact."
                ),
                "pas_copy": {
                    "problem": f"{target_market} face {pain_str} that costs them time, money, and opportunity.",
                    "agitate": (
                        f"Every day without a solution, the gap widens. Competitors move ahead. "
                        f"The cost of inaction on {pain_str} compounds exponentially."
                    ),
                    "solution": (
                        f"{offer_name} eliminates {pain_str} through {diff_str}, "
                        f"delivering {outcome_str} within the first 90 days."
                    ),
                },
                "tagline": f"{offer_name} — Where {target_market} achieve {outcome_str}.",
            }

        # Validate structure
        for key in ("one_liner", "elevator_pitch", "pas_copy", "tagline"):
            if key not in result:
                result[key] = ""
        if not isinstance(result.get("pas_copy"), dict):
            result["pas_copy"] = {"problem": "", "agitate": "", "solution": ""}
        for sub in ("problem", "agitate", "solution"):
            if sub not in result["pas_copy"]:
                result["pas_copy"][sub] = ""

        return result

    async def generate_outreach(self, offer_data: dict, buyer_profile: dict) -> dict:
        """Generate outreach sequences for a specific buyer profile.

        Returns:
            dict with email_sequence (3), linkedin_messages (3), objection_handling (5)
        """
        offer_name = offer_data.get("name", "Premium Service")
        buyer_name = buyer_profile.get("name", "the prospect")
        buyer_role = buyer_profile.get("role", "decision-maker")
        buyer_industry = buyer_profile.get("industry", "business")
        buyer_pain = buyer_profile.get("pain_points", [])
        price = offer_data.get("price", "premium")

        system_prompt = (
            "You are an elite B2B outreach strategist for premium services. "
            "Write personalized, non-salesy copy that builds trust. Return valid JSON."
        )

        user_prompt = f"""Create an outreach campaign:
Offer: {offer_name} (price: {price})
Buyer: {buyer_name}, {buyer_role} in {buyer_industry}
Their pain points: {json.dumps(buyer_pain)}

Return JSON:
{{
  "email_sequence": [
    {{"subject": "...", "body": "...", "cta": "..."}},
    {{"subject": "...", "body": "...", "cta": "..."}},
    {{"subject": "...", "body": "...", "cta": "..."}}
  ],
  "linkedin_messages": ["msg1", "msg2", "msg3"],
  "objection_handling": [
    {{"objection": "...", "response": "..."}},
    {{"objection": "...", "response": "..."}},
    {{"objection": "...", "response": "..."}},
    {{"objection": "...", "response": "..."}},
    {{"objection": "...", "response": "..."}}
  ]
}}"""

        raw = await self._call_llm(system_prompt, user_prompt)

        try:
            result = json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            pain_desc = buyer_pain[0] if buyer_pain else "operational challenges"
            result = {
                "email_sequence": [
                    {
                        "subject": f"Quick question about {buyer_industry} {pain_desc}",
                        "body": (
                            f"Hi {buyer_name},\n\n"
                            f"I noticed {buyer_industry} leaders like you often face {pain_desc}. "
                            f"We recently helped a similar {buyer_role} reduce this by 40% in 90 days.\n\n"
                            f"Would a 15-minute conversation be worthwhile?"
                        ),
                        "cta": "Book a 15-minute call",
                    },
                    {
                        "subject": f"Case study: How a {buyer_role} solved {pain_desc}",
                        "body": (
                            f"Hi {buyer_name},\n\n"
                            f"Following up — I wanted to share a case study relevant to {buyer_industry}. "
                            f"A {buyer_role} used {offer_name} to transform their approach to {pain_desc}.\n\n"
                            f"The results: measurable ROI within the first quarter."
                        ),
                        "cta": "See the case study",
                    },
                    {
                        "subject": f"Last thought on {pain_desc}",
                        "body": (
                            f"Hi {buyer_name},\n\n"
                            f"I understand timing matters. If {pain_desc} becomes a priority, "
                            f"I'd love to show you how {offer_name} delivers for {buyer_industry} leaders.\n\n"
                            f"No pressure — just wanted to leave the door open."
                        ),
                        "cta": "Reply when ready",
                    },
                ],
                "linkedin_messages": [
                    f"Hi {buyer_name}, I work with {buyer_role}s in {buyer_industry} tackling {pain_desc}. Would love to connect.",
                    f"Thanks for connecting! I recently published insights on solving {pain_desc} in {buyer_industry}. Happy to share if useful.",
                    f"{buyer_name}, we helped a {buyer_industry} firm cut {pain_desc} impact by 40%. Worth a quick chat?",
                ],
                "objection_handling": [
                    {"objection": "It's too expensive", "response": f"I understand. Most {buyer_role}s find the ROI covers the investment within 90 days. Can I walk you through the math?"},
                    {"objection": "We already have a solution", "response": f"Great — how is it performing on {pain_desc}? We often complement existing approaches rather than replace them."},
                    {"objection": "Not the right time", "response": "Completely understand. When would be a better time to revisit? I'll set a reminder."},
                    {"objection": "I need to talk to my team", "response": "Of course. Would it help if I prepared a brief for your team covering ROI and implementation timeline?"},
                    {"objection": "Can you prove it works?", "response": f"Absolutely. We have case studies from {buyer_industry} showing measurable outcomes. I'll send three relevant ones."},
                ],
            }

        # Validate structure
        if not isinstance(result.get("email_sequence"), list) or len(result["email_sequence"]) < 3:
            result["email_sequence"] = result.get("email_sequence", [])
            while len(result["email_sequence"]) < 3:
                result["email_sequence"].append({"subject": "", "body": "", "cta": ""})
        result["email_sequence"] = result["email_sequence"][:3]

        if not isinstance(result.get("linkedin_messages"), list) or len(result["linkedin_messages"]) < 3:
            result["linkedin_messages"] = result.get("linkedin_messages", [])
            while len(result["linkedin_messages"]) < 3:
                result["linkedin_messages"].append("")
        result["linkedin_messages"] = result["linkedin_messages"][:3]

        if not isinstance(result.get("objection_handling"), list) or len(result["objection_handling"]) < 5:
            result["objection_handling"] = result.get("objection_handling", [])
            while len(result["objection_handling"]) < 5:
                result["objection_handling"].append({"objection": "", "response": ""})
        result["objection_handling"] = result["objection_handling"][:5]

        return result

    async def generate_authority_content(self, offer_data: dict) -> dict:
        """Generate thought leadership and authority content plan.

        Returns:
            dict with thought_leadership_topics, article_outlines, media_pitch
        """
        offer_name = offer_data.get("name", "Premium Service")
        target_market = offer_data.get("target_market", "high-net-worth individuals")
        expertise_areas = offer_data.get("expertise_areas", [])
        differentiators = offer_data.get("differentiators", [])
        industry = offer_data.get("industry", "premium services")

        system_prompt = (
            "You are a PR and thought leadership strategist for premium service providers. "
            "Create content strategies that position the client as the definitive authority. Return valid JSON."
        )

        user_prompt = f"""Create authority content plan:
- Offer: {offer_name}
- Market: {target_market}
- Expertise: {json.dumps(expertise_areas)}
- Differentiators: {json.dumps(differentiators)}
- Industry: {industry}

Return JSON:
{{
  "thought_leadership_topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "article_outlines": [
    {{"title": "...", "sections": ["section1", "section2", "section3"]}},
    {{"title": "...", "sections": ["section1", "section2", "section3"]}},
    {{"title": "...", "sections": ["section1", "section2", "section3"]}}
  ],
  "media_pitch": "A compelling pitch to editors/producers"
}}"""

        raw = await self._call_llm(system_prompt, user_prompt)

        try:
            result = json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            expertise_str = expertise_areas[0] if expertise_areas else "industry innovation"
            diff_str = differentiators[0] if differentiators else "proven methodology"

            result = {
                "thought_leadership_topics": [
                    f"The Future of {industry}: What {target_market} Need to Know",
                    f"Why {expertise_str} Is the New Competitive Advantage",
                    f"5 Myths About {industry} That Cost {target_market} Millions",
                    f"The {diff_str} Framework: A New Paradigm for {industry}",
                    f"How Top {target_market} Are Leveraging {expertise_str} in 2025",
                ],
                "article_outlines": [
                    {
                        "title": f"The Definitive Guide to {expertise_str} for {target_market}",
                        "sections": [
                            "The current landscape and why most approaches fail",
                            f"The {diff_str} framework explained",
                            "Implementation roadmap and expected outcomes",
                        ],
                    },
                    {
                        "title": f"Why {industry} Leaders Are Rethinking Their Approach",
                        "sections": [
                            "Market forces driving change",
                            "Case studies from early adopters",
                            "Action steps for forward-thinking leaders",
                        ],
                    },
                    {
                        "title": f"The ROI of {offer_name}: By the Numbers",
                        "sections": [
                            "Methodology and data sources",
                            "Key findings and benchmarks",
                            "What this means for your organization",
                        ],
                    },
                ],
                "media_pitch": (
                    f"PITCH: {offer_name} founder available for commentary on {expertise_str} trends. "
                    f"Our proprietary data from working with {target_market} reveals surprising insights "
                    f"about {industry}. We can provide exclusive data, case studies, and expert analysis. "
                    f"Relevant for business, finance, and {industry} publications."
                ),
            }

        # Validate
        if not isinstance(result.get("thought_leadership_topics"), list):
            result["thought_leadership_topics"] = []
        if not isinstance(result.get("article_outlines"), list):
            result["article_outlines"] = []
        if not isinstance(result.get("media_pitch"), str):
            result["media_pitch"] = ""

        return result
