"""VoiceForge Persona Simulation — AI-driven roleplay for HNW client conversations."""
import uuid
from datetime import datetime, timezone
from typing import Any

from app.services.integrations.voiceforge_client import VoiceForgeClient

# Pre-configured persona archetypes for HNW market training
_PERSONA_TEMPLATES: dict[str, dict[str, Any]] = {
    "founder": {
        "name": "Alexander Harrington",
        "role": "Tech Founder & CEO",
        "background": "Built a SaaS company from zero to $200M ARR. Recently completed Series D.",
        "personality_traits": ["direct", "data-driven", "impatient with fluff", "values ROI"],
    },
    "cfo": {
        "name": "Margaret Chen",
        "role": "Chief Financial Officer",
        "background": "20 years in corporate finance, currently CFO of a Fortune 500 subsidiary.",
        "personality_traits": ["analytical", "risk-averse", "detail-oriented", "asks tough questions"],
    },
    "inheritor": {
        "name": "James Whitfield III",
        "role": "Next-Gen Wealth Inheritor",
        "background": "Recently inherited $50M trust. MBA from Wharton, limited real-world investment experience.",
        "personality_traits": ["eager to learn", "slightly insecure", "values transparency", "socially conscious"],
    },
    "family_office_principal": {
        "name": "Victoria Rothschild-Park",
        "role": "Family Office Principal",
        "background": "Manages a multi-generational family office with $500M AUM across global markets.",
        "personality_traits": ["sophisticated", "expects white-glove service", "privacy-focused", "long-term thinker"],
    },
}

# Realistic rotating responses per persona type, indexed by message count
_PERSONA_RESPONSES: dict[str, list[dict[str, Any]]] = {
    "founder": [
        {
            "text": "Look, I've sat through a hundred pitches. Skip the pleasantries and show me the numbers. What's the three-year compounded return net of fees?",
            "sentiment": "skeptical",
            "coaching_tip": "Founders respond to directness. Lead with quantifiable outcomes — IRR, MOIC, or net-of-fee returns — before any narrative.",
        },
        {
            "text": "Interesting. But I've seen backtested returns that look phenomenal and then fall apart in live markets. What's your worst drawdown in the last five years?",
            "sentiment": "challenging",
            "coaching_tip": "Anticipate stress-test questions. Have max drawdown, recovery periods, and Sharpe ratios ready before the meeting.",
        },
        {
            "text": "I'm running a $200M business. My time is literally worth $5,000 an hour. Tell me why I shouldn't just park everything in an S&P index and focus on my company.",
            "sentiment": "impatient",
            "coaching_tip": "Acknowledge the opportunity cost of their time. Frame your value in terms of hours saved and decisions automated, not just alpha generated.",
        },
        {
            "text": "My CTO manages his own portfolio and he's outperformed the market three years running. Why do I need you?",
            "sentiment": "confrontational",
            "coaching_tip": "Don't compete with DIY success stories. Pivot to risk management, tax optimization, and estate planning — areas where self-managed portfolios typically underperform.",
        },
        {
            "text": "Okay, that's a fair point on diversification. But I'm about to do a secondary sale of $30M in stock. Walk me through how you'd handle the tax implications.",
            "sentiment": "engaged",
            "coaching_tip": "Great — the client is leaning in. Demonstrate deep expertise on concentrated stock positions, 10b5-1 plans, and qualified small business stock exclusions.",
        },
        {
            "text": "I need someone who can move fast. My last advisor took two weeks to return a call about a time-sensitive opportunity. What's your SLA?",
            "sentiment": "frustrated",
            "coaching_tip": "Service speed is a top concern for founders. Quantify your responsiveness: same-day callbacks, dedicated slack channels, or 24-hour execution windows.",
        },
        {
            "text": "Let's talk about my cap table situation. I've got ISOs, RSUs, and a bunch of angel investments. Can you actually handle that complexity?",
            "sentiment": "testing",
            "coaching_tip": "Demonstrate you understand startup equity structures. Reference specific strategies: ISO exercise timing, AMT optimization, QSBS eligibility.",
        },
        {
            "text": "I've been burned by advisors who over-promised and under-delivered. What happens when your strategy underperforms the benchmark?",
            "sentiment": "guarded",
            "coaching_tip": "Build trust by being transparent about underperformance protocols. Explain your rebalancing triggers, communication cadence during drawdowns, and benchmark selection rationale.",
        },
        {
            "text": "That's actually more honest than most people I've talked to. Alright, what does onboarding look like? I don't want a six-month ramp-up.",
            "sentiment": "warming",
            "coaching_tip": "The client is moving toward commitment. Provide a clear, time-bound onboarding roadmap — ideally 30 days or less with specific milestones.",
        },
        {
            "text": "One more thing — I'm thinking about a charitable foundation tied to my company. Is that something you can coordinate, or do I need another advisor for that?",
            "sentiment": "interested",
            "coaching_tip": "Cross-sell opportunity. Show breadth by connecting philanthropic planning to tax strategy. Mention DAFs, private foundations, and CRTs as options.",
        },
        {
            "text": "Send me a one-page proposal with fee structure, expected net returns, and your team's track record. If it's compelling, I'll schedule a follow-up with my attorney.",
            "sentiment": "positive",
            "coaching_tip": "Strong buying signal. Deliver the proposal within 24 hours. Keep it concise — founders respect brevity. Include a clear call-to-action and next steps.",
        },
    ],
    "cfo": [
        {
            "text": "Before we go any further, I need to understand your fee structure in detail. What's the all-in cost including fund expense ratios, trading costs, and your advisory fee?",
            "sentiment": "analytical",
            "coaching_tip": "CFOs think in total cost of ownership. Present a full fee waterfall: advisory fee, fund-level expenses, custody costs, and any performance fees.",
        },
        {
            "text": "How does your risk-adjusted return compare to a 60/40 benchmark over the last 10 years? I want to see the Sharpe ratio and Sortino ratio side by side.",
            "sentiment": "data-driven",
            "coaching_tip": "Come prepared with risk metrics, not just returns. CFOs value downside protection — lead with Sortino ratio, max drawdown, and recovery periods.",
        },
        {
            "text": "I manage a $2B balance sheet. I understand hedging, duration matching, and liability-driven investing. Don't oversimplify things for me.",
            "sentiment": "assertive",
            "coaching_tip": "Match their sophistication level. Use precise financial terminology. Oversimplifying will erode credibility with finance professionals.",
        },
        {
            "text": "What's your approach to tax-loss harvesting? I want to see the methodology, not just a marketing blurb about 'tax alpha.'",
            "sentiment": "probing",
            "coaching_tip": "Detail the mechanics: wash sale monitoring, lot-level tracking, short-term vs long-term gain optimization. Provide actual tax alpha figures from existing clients.",
        },
        {
            "text": "Our corporate treasury has $150M in short-term instruments. I'm looking for yield enhancement without extending duration beyond 18 months. What do you suggest?",
            "sentiment": "collaborative",
            "coaching_tip": "This is a concrete problem to solve. Present a laddered approach with specific instruments: T-bills, commercial paper, short-duration bond ETFs with exact yields.",
        },
        {
            "text": "I've reviewed three other proposals this quarter. Yours needs to differentiate on risk management, not just returns. Everyone claims they beat the market.",
            "sentiment": "skeptical",
            "coaching_tip": "Differentiate through process transparency. Show your risk management framework: VaR limits, stress testing methodology, rebalancing triggers, and governance structure.",
        },
        {
            "text": "Walk me through your worst quarter in the last decade. I'm less interested in your wins and more interested in how you handled losses.",
            "sentiment": "testing",
            "coaching_tip": "Vulnerability builds credibility with CFOs. Share a specific bad quarter, what happened, how you communicated with clients, and what process changes resulted.",
        },
        {
            "text": "I need quarterly attribution reports that break down performance by asset class, manager, and factor exposure. Can your reporting handle that?",
            "sentiment": "demanding",
            "coaching_tip": "Reporting capabilities are a major differentiator for CFOs. Show sample reports and emphasize automation, customization, and integration with their existing systems.",
        },
        {
            "text": "Let me push back on your alternatives allocation. A 15% allocation to illiquid private credit seems high given current spreads. Justify that.",
            "sentiment": "challenging",
            "coaching_tip": "Defend with data, not conviction. Reference current spread premiums over public credit, default rate differentials, and how the illiquidity premium compensates for lock-up periods.",
        },
        {
            "text": "Fair analysis. I'd want to see the impact modeled at 10%, 15%, and 20% allocations. Can you run those scenarios by end of week?",
            "sentiment": "engaged",
            "coaching_tip": "The client is moving toward collaboration. Deliver scenario analysis promptly with clear assumptions stated. Use sensitivity tables, not just point estimates.",
        },
        {
            "text": "One last thing — our audit committee reviews all external advisor relationships annually. What does your compliance and reporting framework look like?",
            "sentiment": "procedural",
            "coaching_tip": "Institutional-grade compliance is non-negotiable for CFOs. Emphasize your ADV, SOC 2 compliance, custodial independence, and audit-ready reporting capabilities.",
        },
    ],
    "inheritor": [
        {
            "text": "I'll be honest — this is all pretty new to me. My parents handled everything and now I'm supposed to manage $50 million. Where do I even start?",
            "sentiment": "vulnerable",
            "coaching_tip": "Lead with empathy, not products. Acknowledge the emotional weight of inheritance. Start with education and discovery before any investment recommendations.",
        },
        {
            "text": "My Wharton classmates are all talking about crypto and SPACs. Should I be in those? I don't want to miss out but I also don't want to be reckless.",
            "sentiment": "anxious",
            "coaching_tip": "Address FOMO directly without being dismissive. Frame speculative assets as a small, bounded allocation (5-10%) within a diversified core portfolio.",
        },
        {
            "text": "I really care about ESG investing. I don't want my money in fossil fuels or weapons manufacturers. Can you accommodate that without sacrificing returns?",
            "sentiment": "passionate",
            "coaching_tip": "Take their values seriously. Present ESG/impact options with actual performance data. Show that values-aligned investing doesn't require significant return sacrifice.",
        },
        {
            "text": "My dad's advisor has been managing the trust for 20 years. He seems nice but I don't really understand what he's doing. Should I be worried?",
            "sentiment": "uncertain",
            "coaching_tip": "Don't disparage the existing advisor. Instead, offer a complimentary portfolio review and frame it as an 'independent second opinion' — this respects the existing relationship while opening the door.",
        },
        {
            "text": "Can you explain what a trust structure actually means for me? Like, I know I have one, but I don't really get the difference between revocable and irrevocable.",
            "sentiment": "curious",
            "coaching_tip": "Excellent teaching moment. Use simple analogies and visual aids. Explain the practical implications: who controls distributions, tax treatment, and creditor protection.",
        },
        {
            "text": "I want to start a social impact fund. Nothing huge — maybe $2M to start. Is that realistic, or am I being naive?",
            "sentiment": "enthusiastic",
            "coaching_tip": "Encourage their passion while providing structure. $2M is viable for a small impact fund or DAF. Outline the steps: define impact thesis, structure options, and measurement framework.",
        },
        {
            "text": "My sister thinks I'm going to blow through the inheritance in five years. I want to prove her wrong. How do I make this money last for generations?",
            "sentiment": "determined",
            "coaching_tip": "Channel the motivation positively. Introduce the concept of a personal investment policy statement. Show them Monte Carlo simulations of long-term wealth preservation scenarios.",
        },
        {
            "text": "I've been reading about index funds versus active management. Everything I read says active managers underperform. Is that true?",
            "sentiment": "inquisitive",
            "coaching_tip": "Be honest about the data. Acknowledge that most active managers do underperform, then explain where active management can add value: tax management, alternatives, and specific market segments.",
        },
        {
            "text": "What about real estate? I'm interested in owning some properties, maybe in cities where I'd actually want to spend time. Is that smart or emotional?",
            "sentiment": "exploratory",
            "coaching_tip": "Validate the interest while introducing analytical frameworks. Discuss cap rates, property management realities, and how real estate fits within their total portfolio allocation.",
        },
        {
            "text": "Thank you for actually explaining things to me instead of just talking over my head. When can we meet again to go through the plan?",
            "sentiment": "grateful",
            "coaching_tip": "Strong relationship signal. Schedule the follow-up within a week while momentum is high. Prepare a simple, visual financial plan — avoid overwhelming with complexity.",
        },
        {
            "text": "I mentioned you to my cousin who also recently inherited. Would it be okay if she joined our next meeting? She has similar questions.",
            "sentiment": "positive",
            "coaching_tip": "Referral opportunity — a powerful sign of trust. Welcome the introduction warmly but clarify that you'd want to understand her situation individually as well.",
        },
    ],
    "family_office_principal": [
        {
            "text": "We've been managing family wealth for four generations. Our current structure works, but I'm concerned about succession planning for the fifth generation. What's your approach?",
            "sentiment": "thoughtful",
            "coaching_tip": "Demonstrate multi-generational thinking. Reference governance structures, family constitution frameworks, and next-gen education programs — not just investment strategy.",
        },
        {
            "text": "I need absolute discretion. Our family name cannot appear in any marketing materials, case studies, or references. Is that understood?",
            "sentiment": "firm",
            "coaching_tip": "Privacy is non-negotiable for family offices. Affirm your confidentiality protocols immediately. Reference NDAs, information barriers, and your firm's privacy policy by name.",
        },
        {
            "text": "We have direct investments in seven operating companies across three continents. I need an advisor who understands cross-border tax implications, not someone who just sells mutual funds.",
            "sentiment": "demanding",
            "coaching_tip": "Show global capability. Reference specific structures: holding companies in favorable jurisdictions, transfer pricing considerations, and treaty networks for withholding tax optimization.",
        },
        {
            "text": "Our family council meets quarterly. The younger generation wants more exposure to venture capital and digital assets. The older generation is conservative. How would you bridge that?",
            "sentiment": "diplomatic",
            "coaching_tip": "Family dynamics are central to family office work. Propose a structured allocation framework that gives next-gen a bounded 'innovation sleeve' while preserving core conservative mandates.",
        },
        {
            "text": "We terminated our last advisor because their reporting was inadequate. I need consolidated reporting across all entities — real estate, private equity, public markets, and art collection — in a single dashboard.",
            "sentiment": "frustrated",
            "coaching_tip": "Reporting is often why family offices switch advisors. Present your consolidated reporting capabilities, including alternative asset tracking, and offer a demo with their actual asset classes.",
        },
        {
            "text": "Tell me about your co-investment opportunities. We're looking for direct deal flow in growth-stage companies with $50M-$200M enterprise value. We don't want to pay 2-and-20 for access.",
            "sentiment": "strategic",
            "coaching_tip": "Co-investment is a top priority for sophisticated family offices. Detail your deal sourcing network, due diligence process, and fee structure for co-investment opportunities specifically.",
        },
        {
            "text": "My daughter is joining the family office next year after her stint at Goldman. I want her to have a structured transition. Can your team support that?",
            "sentiment": "personal",
            "coaching_tip": "Next-gen onboarding is a high-value service. Propose a structured program: mentorship pairing, governance training, investment committee observer seat, and gradual decision-making authority.",
        },
        {
            "text": "We're exploring setting up a single-family office versus continuing with a multi-family office arrangement. What are the break-even economics?",
            "sentiment": "analytical",
            "coaching_tip": "Know the numbers: a standalone SFO typically becomes cost-effective at $500M-$1B AUM. Present the build-vs-buy analysis including staffing, technology, compliance, and opportunity costs.",
        },
        {
            "text": "I want to see how you handled the 2020 COVID drawdown for your family office clients. Not the marketing version — the real version.",
            "sentiment": "testing",
            "coaching_tip": "Authenticity is paramount. Share specifics: what positions hurt, how you communicated, what changes were made in real-time, and what you learned. Curated perfection destroys trust.",
        },
        {
            "text": "Philanthropy is central to our family's identity. We give $10M annually through our foundation. I need integrated planning that treats philanthropy as a strategic pillar, not an afterthought.",
            "sentiment": "values-driven",
            "coaching_tip": "Elevate philanthropy to a first-class investment category. Discuss impact measurement, program-related investments, mission-aligned endowment management, and donor-advised fund strategies.",
        },
        {
            "text": "You've impressed me with your depth. Let's proceed with a pilot engagement — manage one sleeve of our portfolio for six months and we'll evaluate from there.",
            "sentiment": "positive",
            "coaching_tip": "Excellent outcome. Accept the pilot gracefully. Propose clear success metrics, reporting cadence, and a formal review date. Treat the pilot with the same intensity as a full mandate.",
        },
    ],
}


class PersonaSimIntegration:
    """Manages AI persona simulation sessions for advisor training."""

    def __init__(self, client: VoiceForgeClient) -> None:
        self.client = client
        self._sessions: dict[str, dict[str, Any]] = {}

    async def start_session(self, persona_type: str, scenario: str) -> dict:
        """Start a new persona simulation session."""
        session_id = str(uuid.uuid4())
        persona = _PERSONA_TEMPLATES.get(persona_type)

        if not persona:
            raise ValueError(
                f"Unknown persona_type '{persona_type}'. "
                f"Choose from: {', '.join(_PERSONA_TEMPLATES)}"
            )

        opening_message = (
            f"Hello, I'm {persona['name']}. {persona['background']} "
            f"I understand we're going to discuss: {scenario}. Let's begin."
        )

        self._sessions[session_id] = {
            "persona_type": persona_type,
            "persona": persona,
            "scenario": scenario,
            "messages": [{"role": "persona", "content": opening_message, "ts": _now()}],
            "message_index": 0,
            "started_at": _now(),
        }

        return {
            "session_id": session_id,
            "persona": persona,
            "opening_message": opening_message,
        }

    async def send_message(self, session_id: str, user_message: str) -> dict:
        """Send a message in an active session and get the persona's response."""
        session = self._sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found or already ended.")

        session["messages"].append({"role": "user", "content": user_message, "ts": _now()})

        # Select a rotating response based on message count
        persona_type = session["persona_type"]
        responses = _PERSONA_RESPONSES.get(persona_type, [])
        idx = session["message_index"] % len(responses) if responses else 0
        session["message_index"] += 1

        if responses:
            entry = responses[idx]
            response_text = entry["text"]
            sentiment = entry["sentiment"]
            coaching_tip = entry["coaching_tip"]
        else:
            # Fallback for any unknown persona type
            persona = session["persona"]
            response_text = (
                f"As {persona['name']}, I appreciate your point. "
                f"Given my background as a {persona['role']}, I'd want to see "
                f"more concrete data before making a commitment. "
                f"Can you walk me through the risk-adjusted returns?"
            )
            sentiment = "neutral"
            coaching_tip = (
                "Good approach. Try using more specific numbers and "
                "reference points to build credibility with this persona type."
            )

        session["messages"].append({"role": "persona", "content": response_text, "ts": _now()})

        return {
            "response": response_text,
            "sentiment": sentiment,
            "coaching_tip": coaching_tip,
        }

    async def end_session(self, session_id: str) -> dict:
        """End a session and return performance analysis."""
        session = self._sessions.pop(session_id, None)
        if not session:
            raise ValueError(f"Session {session_id} not found or already ended.")

        user_messages = [m for m in session["messages"] if m["role"] == "user"]
        msg_count = len(user_messages)

        # Scoring heuristic (production would use VoiceForge AI analysis)
        base_score = min(60 + msg_count * 8, 100)

        # Generate persona-specific strengths and improvements
        persona_type = session["persona_type"]
        strengths, improvements = _session_feedback(persona_type, msg_count)

        return {
            "performance_score": base_score,
            "messages_exchanged": msg_count,
            "session_duration_estimate": f"{msg_count * 2} minutes",
            "strengths": strengths,
            "improvements": improvements,
            "transcript": session["messages"],
        }


def _session_feedback(
    persona_type: str, msg_count: int
) -> tuple[list[str], list[str]]:
    """Return persona-aware strengths and improvement areas."""
    feedback_map: dict[str, tuple[list[str], list[str]]] = {
        "founder": (
            [
                "Maintained a direct, no-nonsense communication style",
                "Addressed ROI and data points proactively",
                "Demonstrated respect for the client's time constraints",
            ],
            [
                "Quantify fee savings and tax alpha with specific dollar amounts",
                "Prepare a one-page executive summary — founders skim, not read",
                "Reference comparable founder clients (anonymized) to build credibility",
            ],
        ),
        "cfo": (
            [
                "Used precise financial terminology appropriate for the audience",
                "Provided risk-adjusted metrics alongside raw returns",
                "Addressed reporting and compliance requirements early",
            ],
            [
                "Prepare attribution analysis at the factor level, not just asset class",
                "Anticipate audit and governance questions before they arise",
                "Show scenario analysis with sensitivity tables, not single-point estimates",
            ],
        ),
        "inheritor": (
            [
                "Showed patience and empathy with educational questions",
                "Avoided jargon and explained concepts in accessible terms",
                "Validated the client's values and social impact interests",
            ],
            [
                "Use visual aids and simple charts to explain portfolio concepts",
                "Schedule shorter, more frequent check-ins to build confidence",
                "Introduce estate planning concepts gradually, not all at once",
            ],
        ),
        "family_office_principal": (
            [
                "Demonstrated multi-generational wealth management expertise",
                "Respected privacy requirements and confidentiality expectations",
                "Showed understanding of complex cross-border structures",
            ],
            [
                "Lead with governance and family dynamics, not just investment strategy",
                "Prepare consolidated reporting demos across all asset classes",
                "Address next-gen transition planning as a core service offering",
            ],
        ),
    }
    default = (
        ["Maintained professional tone throughout", "Asked relevant follow-up questions"],
        ["Provide more specific data points", "Mirror the persona's communication style"],
    )
    return feedback_map.get(persona_type, default)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
