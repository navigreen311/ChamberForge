"""Tests for AIRuntime — usage tracking and budget management."""
import uuid

from app.models.workspace_budget import WorkspaceBudget
from app.services.backbone.ai_runtime import AIRuntime
from app.services.backbone.budget_guard import BudgetGuard


class TestUsageTracking:
    def test_track_single_usage(self, db):
        ws = str(uuid.uuid4())
        log = AIRuntime.track_usage(
            db, ws, "discovery_agent", tokens_in=500, tokens_out=200,
            latency_ms=1200, cost_usd=0.0035,
        )
        assert log.agent_name == "discovery_agent"
        assert log.tokens_in == 500
        assert log.tokens_out == 200
        assert log.cost_usd == 0.0035

    def test_usage_dashboard(self, db):
        ws = str(uuid.uuid4())
        AIRuntime.track_usage(db, ws, "agent_a", 1000, 500, 800, 0.005)
        AIRuntime.track_usage(db, ws, "agent_a", 2000, 1000, 1200, 0.01)
        AIRuntime.track_usage(db, ws, "agent_b", 500, 200, 600, 0.003)

        dashboard = AIRuntime.get_usage_dashboard(db, ws)

        assert dashboard["total_cost"] == pytest.approx(0.018, abs=1e-6)
        assert dashboard["total_tokens"] == 5200
        assert dashboard["invocation_count"] == 3
        assert dashboard["top_agent_by_cost"] == "agent_a"
        assert "agent_a" in dashboard["cost_by_agent"]
        assert "agent_b" in dashboard["cost_by_agent"]

    def test_empty_dashboard(self, db):
        ws = str(uuid.uuid4())
        dashboard = AIRuntime.get_usage_dashboard(db, ws)
        assert dashboard["total_cost"] == 0.0
        assert dashboard["invocation_count"] == 0
        assert dashboard["top_agent_by_cost"] is None


class TestBudgetCheck:
    """P-04 moved the ceiling out of the request and into the database.

    These tests used to pass `monthly_budget=100.0` and assert the report
    came back measured against 100 - which was the defect, not the
    contract: the caller supplied the limit it was judged by.
    """

    def test_the_persisted_ceiling_governs_not_the_argument(self, db):
        ws = str(uuid.uuid4())
        BudgetGuard.get_or_create(db, ws)
        db.query(WorkspaceBudget).filter(
            WorkspaceBudget.workspace_id == ws
        ).update({"monthly_budget_usd": 100.0})
        db.commit()

        result = AIRuntime.check_budget(db, ws, monthly_budget=999_999.0)

        assert result["budget"] == 100.0
        assert result["over_budget"] is False

    def test_spend_recorded_through_the_call_path_is_reported(self, db):
        ws = str(uuid.uuid4())
        BudgetGuard.get_or_create(db, ws)
        db.query(WorkspaceBudget).filter(
            WorkspaceBudget.workspace_id == ws
        ).update({"monthly_budget_usd": 100.0})
        db.commit()
        # 1M input tokens at $3/1M.
        BudgetGuard.record(db, ws, "agent_a", 1_000_000, 0, 800, "m")
        db.expire_all()

        result = AIRuntime.check_budget(db, ws)

        assert result["current_spend"] == pytest.approx(3.0, abs=1e-6)
        assert result["pct_used"] == pytest.approx(3.0, abs=0.1)
        assert result["over_budget"] is False

    def test_over_budget(self, db):
        ws = str(uuid.uuid4())
        BudgetGuard.get_or_create(db, ws)
        db.query(WorkspaceBudget).filter(
            WorkspaceBudget.workspace_id == ws
        ).update({"monthly_budget_usd": 1.0})
        db.commit()
        BudgetGuard.record(db, ws, "agent_a", 1_000_000, 0, 800, "m")
        db.expire_all()

        result = AIRuntime.check_budget(db, ws)

        assert result["over_budget"] is True
        assert result["pct_used"] > 100.0

    def test_an_unconfigured_workspace_still_has_a_ceiling(self, db):
        """"Unconfigured" must not silently mean "unlimited"."""
        ws = str(uuid.uuid4())
        result = AIRuntime.check_budget(db, ws)
        assert result["budget"] > 0
        assert result["pct_used"] == 0.0


class TestAgentPerformance:
    def test_agent_performance(self, db):
        ws = str(uuid.uuid4())
        AIRuntime.track_usage(db, ws, "agent_x", 1000, 500, 800, 0.01)
        AIRuntime.track_usage(db, ws, "agent_x", 2000, 1000, 1200, 0.02)

        perf = AIRuntime.get_agent_performance(db, ws, "agent_x")
        assert perf["agent_name"] == "agent_x"
        assert perf["invocations"] == 2
        assert perf["avg_latency"] == 1000.0
        assert perf["total_cost"] == pytest.approx(0.03, abs=1e-6)


# Need pytest import for approx
import pytest  # noqa: E402
