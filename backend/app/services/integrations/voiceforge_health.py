"""VoiceForge Voice Health Analysis — call sentiment and engagement tracking."""
from app.services.integrations.voiceforge_client import VoiceForgeClient


class VoiceHealthAnalysis:
    """Analyzes call sentiment and tracks client engagement trends."""

    def __init__(self, client: VoiceForgeClient) -> None:
        self.client = client

    async def analyze_call_sentiment(self, call_id: str) -> dict:
        """Analyze sentiment and engagement for a single call."""
        sentiment_data = await self.client.get_sentiment(call_id)

        score = sentiment_data.get("score", 0.5)
        risk_indicators: list[str] = []

        if score < 0.3:
            risk_indicators.append("low_satisfaction")
        if sentiment_data.get("sentiment") == "negative":
            risk_indicators.append("negative_sentiment_detected")
        if not sentiment_data.get("key_phrases"):
            risk_indicators.append("low_engagement_signal")

        return {
            "overall_sentiment": sentiment_data.get("sentiment", "neutral"),
            "engagement_level": round(min(score * 1.2, 1.0), 2),
            "risk_indicators": risk_indicators,
        }

    async def get_engagement_trends(self, client_id: str, calls: list) -> dict:
        """Compute engagement trends across a series of calls for a client.

        Args:
            client_id: The client whose calls to analyze.
            calls: List of call_id strings to aggregate.

        Returns:
            Trend direction, average sentiment score, and number of data points.
        """
        if not calls:
            return {
                "trend": "stable",
                "avg_sentiment": 0.0,
                "data_points": 0,
            }

        scores: list[float] = []
        for call_id in calls:
            sentiment = await self.client.get_sentiment(call_id)
            scores.append(sentiment.get("score", 0.5))

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

        return {
            "trend": trend,
            "avg_sentiment": round(avg, 2),
            "data_points": len(scores),
        }
