"""VoiceForge Voice Health Analysis — call sentiment and engagement tracking."""
from typing import Any

from app.services.integrations.voiceforge_client import VoiceForgeClient

"""VoiceForge Voice Health Analysis - call sentiment and engagement tracking.

P-07. This module carried the most serious fabrication in the codebase.

`_CALL_PROFILES` held eight hand-written call profiles, and
`_pick_profile` selected one by md5 of the call id - so every call id
deterministically produced the same profile, every time it was asked.
Those profiles supplied a sentiment score, a call quality rating, risk
indicators, engagement signals, and **verbatim client quotes**:

    "really pleased with the performance"
    "let's increase the allocation"
    "referred you to my business partner"

attributed to a specific call, on a specific client's record. An advisor
reading that record would see things a client never said, and the
determinism meant the same quotes came back on every visit - so nothing
about them looked generated.

Worse, the analysis acted on them. Risk indicators from the invented
profile drove `recommended_action` and `urgency`, up to
"immediate_outreach" at "critical" urgency, and `get_engagement_trends`
raised "Critical churn risk detected on call ..." from them. A firm could
have called a client about a churn risk that existed only in a hash.

The profiles are deleted. When the partner has not answered, this module
reports that it has no analysis - it does not supply one.
"""



def _degraded_analysis(source: dict[str, Any]) -> dict[str, Any]:
    """Pass the partner's degraded result through, shaped for this caller.

    Deliberately carries no sentiment, no score and no recommended
    action. A caller that ignores `degraded` and reads `urgency` gets
    `None`, which surfaces as an absent value rather than a calm one -
    "low" urgency would be a claim, and one nobody made.
    """
    return {
        "degraded": True,
        "degraded_reason": source.get("degraded_reason", "partner_unavailable"),
        "degraded_detail": source.get(
            "degraded_detail", "No sentiment analysis was returned by VoiceForge."
        ),
        "partner": source.get("partner", "voiceforge"),
    }


class VoiceHealthAnalysis:
    """Analyzes call sentiment and tracks client engagement trends."""

    def __init__(self, client: VoiceForgeClient) -> None:
        self.client = client

    async def analyze_call_sentiment(self, call_id: str) -> dict:
        """Analyze sentiment and engagement for a single call."""
        sentiment_data = await self.client.get_sentiment(call_id)
        if sentiment_data.get("degraded"):
            return _degraded_analysis(sentiment_data)

        # No defaults. A missing score used to fall back to an invented
        # profile; now its absence is the partner breaking its contract,
        # which the client has already turned into a degraded result.
        score = sentiment_data.get("score")
        raw_sentiment = sentiment_data.get("sentiment")
        if score is None or raw_sentiment is None:
            return _degraded_analysis(
                {
                    "degraded_reason": "partner_contract_changed",
                    "degraded_detail": (
                        "VoiceForge returned a sentiment response without a "
                        "score or sentiment."
                    ),
                }
            )

        risk_indicators: list[str] = []
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
            "degraded": False,
            "overall_sentiment": raw_sentiment,
            "sentiment_score": round(score, 2),
            "engagement_level": engagement_level,
            # Only what the partner actually reported. `call_quality`,
            # `key_phrases` and `engagement_signals` came from the
            # profile table and are gone with it - VoiceForge returns
            # key phrases when it has them, and nothing supplies them
            # when it does not.
            "key_phrases": sentiment_data.get("key_phrases", []),
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
            # "stable" over zero calls is a finding nobody made.
            return {
                "client_id": client_id,
                "degraded": True,
                "degraded_reason": "no_calls",
                "degraded_detail": "No calls were supplied to analyse.",
                "data_points": 0,
                "per_call_breakdown": [],
                "alerts": [],
            }

        scores: list[float] = []
        per_call: list[dict[str, Any]] = []
        alerts: list[str] = []

        skipped: list[str] = []
        for call_id in calls:
            sentiment = await self.client.get_sentiment(call_id)
            if sentiment.get("degraded"):
                skipped.append(call_id)
                continue
            score = sentiment.get("score")
            if score is None:
                skipped.append(call_id)
                continue
            scores.append(score)
            per_call.append({
                "call_id": call_id,
                "sentiment": sentiment.get("sentiment"),
                "score": round(score, 2),
            })

        # A trend computed from the calls that happened to come back is a
        # trend over an unstated sample. Say what was left out, and
        # refuse to compute one at all when nothing came back - an
        # average of zero calls used to render as "stable".
        if not scores:
            return {
                "client_id": client_id,
                "degraded": True,
                "degraded_reason": "partner_unavailable",
                "degraded_detail": (
                    f"No sentiment data was returned for any of the "
                    f"{len(calls)} call(s) requested."
                ),
                "data_points": 0,
                "per_call_breakdown": [],
                "alerts": [],
            }

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

        if skipped:
            alerts.append(
                f"{len(skipped)} of {len(calls)} calls returned no sentiment "
                "data; this trend is computed from the remainder."
            )

        return {
            "client_id": client_id,
            "degraded": False,
            "trend": trend,
            "avg_sentiment": round(avg, 2),
            "data_points": len(scores),
            "calls_without_data": len(skipped),
            "per_call_breakdown": per_call,
            "alerts": alerts,
        }
