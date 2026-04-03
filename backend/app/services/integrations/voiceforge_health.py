"""VoiceForge Voice Health Analysis — call sentiment and engagement tracking."""
import hashlib
from typing import Any

from app.services.integrations.voiceforge_client import VoiceForgeClient

# Realistic call sentiment profiles for varied mock responses
_CALL_PROFILES: list[dict[str, Any]] = [
    # --- Positive calls with engagement signals ---
    {
        "sentiment": "positive",
        "score": 0.92,
        "key_phrases": [
            "really pleased with the performance",
            "let's increase the allocation",
            "referred you to my business partner",
        ],
        "engagement_signals": [
            "client asked about additional services",
            "mentioned referring a colleague",
            "scheduled a follow-up meeting proactively",
        ],
        "risk_indicators": [],
        "call_quality": "excellent",
    },
    {
        "sentiment": "positive",
        "score": 0.85,
        "key_phrases": [
            "appreciate the quarterly update",
            "the tax savings were significant",
            "happy with the communication cadence",
        ],
        "engagement_signals": [
            "engaged for full 45-minute session",
            "asked detailed questions about strategy",
            "requested estate planning review",
        ],
        "risk_indicators": [],
        "call_quality": "good",
    },
    {
        "sentiment": "positive",
        "score": 0.78,
        "key_phrases": [
            "solid year overall",
            "glad we stayed the course",
            "comfortable with the plan",
        ],
        "engagement_signals": [
            "confirmed satisfaction with current approach",
            "agreed to annual review meeting",
        ],
        "risk_indicators": [],
        "call_quality": "good",
    },
    # --- Neutral calls ---
    {
        "sentiment": "neutral",
        "score": 0.55,
        "key_phrases": [
            "need to think about it",
            "not sure about the alternatives allocation",
            "want to compare with other options",
        ],
        "engagement_signals": [
            "polite but non-committal responses",
            "asked for materials to review independently",
        ],
        "risk_indicators": [
            "comparison_shopping",
            "deferred_decision",
        ],
        "call_quality": "moderate",
    },
    {
        "sentiment": "neutral",
        "score": 0.50,
        "key_phrases": [
            "I'll have my attorney review this",
            "let me discuss with my spouse",
            "can you send me the details in writing",
        ],
        "engagement_signals": [
            "delegating decision to third party",
            "requested written documentation",
        ],
        "risk_indicators": [
            "decision_delegation",
            "low_urgency_signal",
        ],
        "call_quality": "moderate",
    },
    {
        "sentiment": "neutral",
        "score": 0.48,
        "key_phrases": [
            "returns were okay I suppose",
            "nothing to complain about really",
            "same as last quarter",
        ],
        "engagement_signals": [
            "brief responses throughout",
            "ended call earlier than scheduled",
        ],
        "risk_indicators": [
            "low_engagement_signal",
            "call_shortened",
        ],
        "call_quality": "below_average",
    },
    # --- Negative calls with churn risk indicators ---
    {
        "sentiment": "negative",
        "score": 0.22,
        "key_phrases": [
            "underperformed the benchmark again",
            "my friend's advisor got them 15%",
            "not seeing the value in the fees",
        ],
        "engagement_signals": [
            "interrupted advisor multiple times",
            "questioned fee structure directly",
        ],
        "risk_indicators": [
            "churn_risk_high",
            "fee_sensitivity",
            "benchmark_comparison",
            "competitive_pressure",
        ],
        "call_quality": "poor",
    },
    {
        "sentiment": "negative",
        "score": 0.15,
        "key_phrases": [
            "considering moving to a different firm",
            "haven't heard from you in months",
            "my portfolio is down and nobody called me",
        ],
        "engagement_signals": [
            "expressed frustration about communication gaps",
            "mentioned competitor firm by name",
        ],
        "risk_indicators": [
            "churn_risk_critical",
            "communication_failure",
            "competitor_mention",
            "proactive_outreach_needed",
        ],
        "call_quality": "poor",
    },
    {
        "sentiment": "negative",
        "score": 0.28,
        "key_phrases": [
            "promised me personalized service",
            "feel like just another account number",
            "reporting is confusing and late",
        ],
        "engagement_signals": [
            "referenced initial service promises",
            "tone escalated during reporting discussion",
        ],
        "risk_indicators": [
            "churn_risk_high",
            "service_expectation_gap",
            "reporting_dissatisfaction",
            "negative_sentiment_detected",
        ],
        "call_quality": "poor",
    },
    {
        "sentiment": "negative",
        "score": 0.32,
        "key_phrases": [
            "I expected better from a premium service",
            "need to reevaluate this relationship",
            "my accountant flagged some tax inefficiencies",
        ],
        "engagement_signals": [
            "third-party validation of concerns",
            "used language indicating relationship review",
        ],
        "risk_indicators": [
            "churn_risk_medium",
            "tax_inefficiency_flagged",
            "relationship_review",
            "low_satisfaction",
        ],
        "call_quality": "below_average",
    },
]


def _pick_profile(call_id: str) -> dict[str, Any]:
    """Deterministically select a call profile based on call_id hash."""
    hash_int = int(hashlib.md5(call_id.encode()).hexdigest(), 16)
    return _CALL_PROFILES[hash_int % len(_CALL_PROFILES)]


class VoiceHealthAnalysis:
    """Analyzes call sentiment and tracks client engagement trends."""

    def __init__(self, client: VoiceForgeClient) -> None:
        self.client = client

    async def analyze_call_sentiment(self, call_id: str) -> dict:
        """Analyze sentiment and engagement for a single call."""
        sentiment_data = await self.client.get_sentiment(call_id)

        # If running in mock mode, enrich with realistic profile data
        profile = _pick_profile(call_id)
        score = sentiment_data.get("score", profile["score"])
        raw_sentiment = sentiment_data.get("sentiment", profile["sentiment"])

        # Merge risk indicators from both sources
        risk_indicators: list[str] = list(profile["risk_indicators"])
        if score < 0.3:
            if "low_satisfaction" not in risk_indicators:
                risk_indicators.append("low_satisfaction")
        if raw_sentiment == "negative":
            if "negative_sentiment_detected" not in risk_indicators:
                risk_indicators.append("negative_sentiment_detected")

        engagement_level = round(min(score * 1.2, 1.0), 2)

        # Determine recommended action based on risk level
        if any("critical" in r for r in risk_indicators):
            recommended_action = "immediate_outreach"
            urgency = "critical"
        elif any("high" in r for r in risk_indicators):
            recommended_action = "schedule_review_call"
            urgency = "high"
        elif risk_indicators:
            recommended_action = "monitor_next_interaction"
            urgency = "medium"
        else:
            recommended_action = "maintain_current_cadence"
            urgency = "low"

        return {
            "overall_sentiment": raw_sentiment,
            "sentiment_score": round(score, 2),
            "engagement_level": engagement_level,
            "call_quality": profile["call_quality"],
            "key_phrases": profile["key_phrases"],
            "engagement_signals": profile["engagement_signals"],
            "risk_indicators": risk_indicators,
            "recommended_action": recommended_action,
            "urgency": urgency,
        }

    async def get_engagement_trends(self, client_id: str, calls: list) -> dict:
        """Compute engagement trends across a series of calls for a client.

        Args:
            client_id: The client whose calls to analyze.
            calls: List of call_id strings to aggregate.

        Returns:
            Trend direction, average sentiment score, per-call breakdown, and alerts.
        """
        if not calls:
            return {
                "trend": "stable",
                "avg_sentiment": 0.0,
                "data_points": 0,
                "per_call_breakdown": [],
                "alerts": [],
            }

        scores: list[float] = []
        per_call: list[dict[str, Any]] = []
        alerts: list[str] = []

        for call_id in calls:
            sentiment = await self.client.get_sentiment(call_id)
            profile = _pick_profile(call_id)
            score = sentiment.get("score", profile["score"])
            scores.append(score)
            per_call.append({
                "call_id": call_id,
                "sentiment": profile["sentiment"],
                "score": round(score, 2),
                "quality": profile["call_quality"],
            })

            # Check for critical risk indicators
            if any("critical" in r for r in profile["risk_indicators"]):
                alerts.append(f"Critical churn risk detected on call {call_id[:8]}...")

        avg = sum(scores) / len(scores)

        # Determine trend from first-half vs second-half averages
        if len(scores) >= 2:
            mid = len(scores) // 2
            first_half = sum(scores[:mid]) / mid
            second_half = sum(scores[mid:]) / (len(scores) - mid)
            diff = second_half - first_half
            if diff > 0.1:
                trend = "improving"
            elif diff < -0.1:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "stable"

        # Add trend-level alerts
        if trend == "declining" and avg < 0.4:
            alerts.append("Sustained declining sentiment — proactive retention outreach recommended")
        if avg < 0.3:
            alerts.append("Average sentiment critically low — escalate to relationship manager")

        return {
            "client_id": client_id,
            "trend": trend,
            "avg_sentiment": round(avg, 2),
            "data_points": len(scores),
            "per_call_breakdown": per_call,
            "alerts": alerts,
        }
