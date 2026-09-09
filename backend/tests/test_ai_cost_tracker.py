"""Tests for AI cost tracking service."""
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from app.services.backbone.ai_cost_tracker import AICostTracker


class TestCostCalculation:
    """Verify token-to-USD cost math."""

    def test_basic_cost_calculation(self):
        """1000 tokens in + 500 out = (1000/1M)*3 + (500/1M)*15 = $0.0105."""
        cost = AICostTracker.calculate_cost(tokens_in=1000, tokens_out=500)
        assert cost == pytest.approx(0.0105, abs=1e-6)

    def test_zero_tokens(self):
        cost = AICostTracker.calculate_cost(tokens_in=0, tokens_out=0)
        assert cost == 0.0

    def test_large_token_count(self):
        """1M input + 1M output = $3 + $15 = $18."""
        cost = AICostTracker.calculate_cost(tokens_in=1_000_000, tokens_out=1_000_000)
        assert cost == pytest.approx(18.0, abs=1e-4)

    def test_input_only(self):
        cost = AICostTracker.calculate_cost(tokens_in=1_000_000, tokens_out=0)
        assert cost == pytest.approx(3.0, abs=1e-4)

    def test_output_only(self):
        cost = AICostTracker.calculate_cost(tokens_in=0, tokens_out=1_000_000)
        assert cost == pytest.approx(15.0, abs=1e-4)


class TestTrackCall:
    """Verify track_call persists a record."""

    def test_track_call_creates_record(self):
        mock_db = MagicMock()
        workspace_id = uuid.uuid4()

        # Make refresh set the id and created_at
        def fake_refresh(obj):
            obj.id = uuid.uuid4()
            obj.created_at = datetime.now(timezone.utc)

        mock_db.refresh.side_effect = fake_refresh

        result = AICostTracker.track_call(
            db=mock_db,
            workspace_id=workspace_id,
            agent_name="concierge",
            tokens_in=1000,
            tokens_out=500,
            latency_ms=320,
            model="claude-sonnet-4-6",
        )

        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        assert result["agent_name"] == "concierge"
        assert result["cost_usd"] == pytest.approx(0.0105, abs=1e-6)
        assert result["tokens_in"] == 1000
        assert result["tokens_out"] == 500


class TestBudgetAlert:
    """Verify budget threshold alerting."""

    def test_alert_triggers_at_90_percent(self):
        """When spend is 90%+ of budget, alert should be True."""
        with patch.object(AICostTracker, "get_workspace_costs") as mock_costs:
            mock_costs.return_value = {
                "total_cost": 90.0,
                "cost_by_agent": {"concierge": 90.0},
                "total_calls": 100,
                "avg_latency_ms": 300.0,
            }

            result = AICostTracker.check_budget_alert(
                db=MagicMock(),
                workspace_id=uuid.uuid4(),
                monthly_budget=100.0,
            )

            assert result["alert"] is True
            assert result["pct_used"] == 90.0
            assert result["current_spend"] == 90.0
            assert result["budget"] == 100.0

    def test_no_alert_below_threshold(self):
        """When spend is below 90%, alert should be False."""
        with patch.object(AICostTracker, "get_workspace_costs") as mock_costs:
            mock_costs.return_value = {
                "total_cost": 50.0,
                "cost_by_agent": {"concierge": 50.0},
                "total_calls": 50,
                "avg_latency_ms": 250.0,
            }

            result = AICostTracker.check_budget_alert(
                db=MagicMock(),
                workspace_id=uuid.uuid4(),
                monthly_budget=100.0,
            )

            assert result["alert"] is False
            assert result["pct_used"] == 50.0

    def test_zero_budget_no_crash(self):
        """Zero budget should not cause division by zero."""
        with patch.object(AICostTracker, "get_workspace_costs") as mock_costs:
            mock_costs.return_value = {
                "total_cost": 10.0,
                "cost_by_agent": {},
                "total_calls": 5,
                "avg_latency_ms": 200.0,
            }

            result = AICostTracker.check_budget_alert(
                db=MagicMock(),
                workspace_id=uuid.uuid4(),
                monthly_budget=0.0,
            )

            assert result["pct_used"] == 0.0
            assert result["alert"] is False
