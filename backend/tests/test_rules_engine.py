"""Tests for RulesEngine — trigger evaluation and event processing."""
import uuid

import pytest

from app.models.automation_rule import AutomationRule
from app.services.backbone.rules_engine import RulesEngine


@pytest.fixture()
def workspace_id():
    return str(uuid.uuid4())


class TestEvaluateTrigger:
    def test_simple_equality_match(self):
        rule = AutomationRule(
            id=uuid.uuid4(),
            workspace_id=uuid.uuid4(),
            name="Test Rule",
            trigger_type="wealth_event_detected",
            trigger_conditions={"event_category": "inheritance"},
            action_type="create_task",
            action_config={},
        )
        assert RulesEngine.evaluate_trigger(
            rule, {"event_category": "inheritance", "amount": 5_000_000}
        ) is True

    def test_equality_mismatch(self):
        rule = AutomationRule(
            id=uuid.uuid4(),
            workspace_id=uuid.uuid4(),
            name="Test Rule",
            trigger_type="wealth_event_detected",
            trigger_conditions={"event_category": "inheritance"},
            action_type="create_task",
            action_config={},
        )
        assert RulesEngine.evaluate_trigger(
            rule, {"event_category": "divorce"}
        ) is False

    def test_threshold_lt_operator(self):
        rule = AutomationRule(
            id=uuid.uuid4(),
            workspace_id=uuid.uuid4(),
            name="Low Health",
            trigger_type="client_health_below",
            trigger_conditions={"health_score": {"$lt": 50}},
            action_type="send_alert",
            action_config={},
        )
        assert RulesEngine.evaluate_trigger(rule, {"health_score": 30}) is True
        assert RulesEngine.evaluate_trigger(rule, {"health_score": 70}) is False

    def test_missing_key_returns_false(self):
        rule = AutomationRule(
            id=uuid.uuid4(),
            workspace_id=uuid.uuid4(),
            name="Test",
            trigger_type="regulatory_alert",
            trigger_conditions={"region": "EU"},
            action_type="open_risk_review",
            action_config={},
        )
        assert RulesEngine.evaluate_trigger(rule, {"other_field": "value"}) is False


class TestCreateRule:
    def test_create_valid_rule(self, db, workspace_id):
        rule = RulesEngine.create_rule(
            db,
            workspace_id,
            "Alert on low health",
            "client_health_below",
            {"health_score": {"$lt": 40}},
            "send_alert",
            {"channel": "email", "template": "low_health"},
        )
        assert rule.name == "Alert on low health"
        assert rule.trigger_type == "client_health_below"
        assert rule.is_active is True
        assert rule.execution_count == 0

    def test_invalid_trigger_type(self, db, workspace_id):
        with pytest.raises(ValueError, match="Invalid trigger_type"):
            RulesEngine.create_rule(
                db, workspace_id, "Bad", "invalid_type", {}, "send_alert", {}
            )

    def test_invalid_action_type(self, db, workspace_id):
        with pytest.raises(ValueError, match="Invalid action_type"):
            RulesEngine.create_rule(
                db, workspace_id, "Bad", "regulatory_alert", {}, "invalid_action", {}
            )


class TestProcessEvent:
    def test_matching_rule_executes(self, db, workspace_id):
        RulesEngine.create_rule(
            db,
            workspace_id,
            "Inheritance Alert",
            "wealth_event_detected",
            {"event_category": "inheritance"},
            "create_task",
            {"task_title": "Review inheritance", "assignee": "advisor"},
        )

        results = RulesEngine.process_event(
            db,
            workspace_id,
            "wealth_event_detected",
            {"event_category": "inheritance", "amount": 10_000_000},
        )

        assert len(results) == 1
        assert results[0]["executed"] is True
        assert results[0]["action_type"] == "create_task"

    def test_non_matching_event_skipped(self, db, workspace_id):
        RulesEngine.create_rule(
            db,
            workspace_id,
            "Inheritance Alert",
            "wealth_event_detected",
            {"event_category": "inheritance"},
            "create_task",
            {"task_title": "Review"},
        )

        results = RulesEngine.process_event(
            db,
            workspace_id,
            "wealth_event_detected",
            {"event_category": "divorce"},
        )

        assert len(results) == 0

    def test_execution_count_increments(self, db, workspace_id):
        rule = RulesEngine.create_rule(
            db,
            workspace_id,
            "KPI Alert",
            "kpi_below_sla",
            {"metric": "response_time"},
            "trigger_escalation",
            {"escalation_level": 1},
        )

        RulesEngine.process_event(
            db, workspace_id, "kpi_below_sla", {"metric": "response_time"}
        )

        db.refresh(rule)
        assert rule.execution_count == 1
        assert rule.last_executed_at is not None

    def test_get_rules(self, db, workspace_id):
        RulesEngine.create_rule(
            db, workspace_id, "R1", "regulatory_alert", {"region": "EU"},
            "open_risk_review", {},
        )
        RulesEngine.create_rule(
            db, workspace_id, "R2", "offer_status_changed", {"status": "accepted"},
            "send_email", {"template": "congrats"},
        )

        rules = RulesEngine.get_rules(db, workspace_id)
        assert len(rules) == 2
