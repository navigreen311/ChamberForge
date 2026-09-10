"""Tests for ClientHealth service."""
import pytest

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
    @pytest.mark.asyncio
    async def test_returns_correct_month_count(self):
        trend = await ClientHealth.get_health_trend(None, "client-123", months=6)
        assert len(trend) == 6
        assert all("month" in t and "score" in t for t in trend)

    @pytest.mark.asyncio
    async def test_scores_in_range(self):
        trend = await ClientHealth.get_health_trend(None, "any-id")
        for entry in trend:
            assert 0.0 <= entry["score"] <= 100.0
