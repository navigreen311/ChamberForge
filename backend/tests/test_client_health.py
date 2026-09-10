"""Tests for ClientHealth service."""
import pytest

from app.db.scope import OperatorScope, reset_scope, set_scope
from app.services.backbone.client_health import ClientHealth


class TestCalculateHealthScore:
    def test_standard_calculation(self):
        score = ClientHealth.calculate_health_score(0.8, 0.9, 0.7, 1.0)
        assert score == 85.0

    def test_perfect_scores(self):
        score = ClientHealth.calculate_health_score(1.0, 1.0, 1.0, 1.0)
        assert score == 100.0

    def test_zero_scores(self):
        score = ClientHealth.calculate_health_score(0.0, 0.0, 0.0, 0.0)
        assert score == 0.0

    def test_capped_at_100(self):
        score = ClientHealth.calculate_health_score(1.5, 1.5, 1.5, 1.5)
        assert score == 100.0

    def test_floor_at_zero(self):
        score = ClientHealth.calculate_health_score(-0.5, -0.5, -0.5, -0.5)
        assert score == 0.0


class TestDetectChurnSignals:
    def test_declining_scores(self):
        history = [85.0, 78.0, 65.0, 55.0, 48.0]
        result = ClientHealth.detect_churn_signals(history)
        assert result["at_risk"] is True
        assert result["trend"] == "declining"
        assert len(result["signals"]) > 0
        assert len(result["recommended_actions"]) > 0

    def test_healthy_stable(self):
        history = [82.0, 83.0, 81.0, 82.5]
        result = ClientHealth.detect_churn_signals(history)
        assert result["at_risk"] is False
        assert result["trend"] == "stable"

    def test_improving_trend(self):
        history = [50.0, 55.0, 62.0, 70.0, 78.0]
        result = ClientHealth.detect_churn_signals(history)
        assert result["trend"] == "improving"

    def test_empty_history(self):
        result = ClientHealth.detect_churn_signals([])
        assert result["at_risk"] is False
        assert "Insufficient data" in result["signals"]

    def test_sharp_drop_detection(self):
        history = [90.0, 88.0, 85.0, 60.0]
        result = ClientHealth.detect_churn_signals(history)
        has_sharp_drop = any("Sharp score drop" in s for s in result["signals"])
        assert has_sharp_drop

    def test_consecutive_below_threshold(self):
        history = [55.0, 52.0, 48.0]
        result = ClientHealth.detect_churn_signals(history)
        assert result["at_risk"] is True
        has_consecutive = any("3+ consecutive" in s for s in result["signals"])
        assert has_consecutive


class TestGetHealthTrend:
    """P-09: the trend is recorded history, not a generated series.

    These asserted that six months of scores always came back, in range, for
    any client id at all - satisfied by:

        seed = int(hashlib.md5(client_id.encode()).hexdigest()[:8], 16)
        score = 60 + (seed % 30) + ((seed >> (i * 2)) % 11) - 5

    A stable, plausible health history for a named client, derived from a
    hash. An advisor reviewing whether a relationship was deteriorating was
    reading an md5 digest, and the suite guaranteed the series was always
    there.
    """

    @pytest.mark.asyncio
    async def test_a_client_with_no_recorded_scores_has_no_trend(self):
        trend = await ClientHealth.get_health_trend(None, "client-123", months=6)
        assert trend == []

    @pytest.mark.asyncio
    async def test_recorded_scores_are_returned_in_range(self, db_session):
        token = set_scope(OperatorScope(workspace_id="ws-trend", user_id="u1"))
        try:
            ClientHealth.calculate_health_score(
                0.8, 0.7, 0.6, 0.9, client_id="client-123", db=db_session
            )
            trend = await ClientHealth.get_health_trend(db_session, "client-123")
        finally:
            reset_scope(token)

        assert len(trend) == 1
        assert all("month" in t and "score" in t for t in trend)
        assert 0.0 <= trend[0]["score"] <= 100.0
