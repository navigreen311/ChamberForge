"""Rules Engine — Event-driven automation for workspace workflows."""
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.automation_rule import AutomationRule

VALID_TRIGGER_TYPES = {
    "wealth_event_detected",
    "client_health_below",
    "regulatory_alert",
    "kpi_below_sla",
    "offer_status_changed",
}

VALID_ACTION_TYPES = {
    "create_task",
    "send_alert",
    "open_risk_review",
    "trigger_escalation",
    "send_email",
}


class RulesEngine:
    """Evaluates automation rules against events and executes actions."""

    @staticmethod
    def create_rule(
        db: Session,
        workspace_id: str,
        name: str,
        trigger_type: str,
        trigger_conditions: dict,
        action_type: str,
        action_config: dict,
    ) -> AutomationRule:
        """Create a new automation rule."""
        if trigger_type not in VALID_TRIGGER_TYPES:
            raise ValueError(
                f"Invalid trigger_type '{trigger_type}'. "
                f"Must be one of: {VALID_TRIGGER_TYPES}"
            )
        if action_type not in VALID_ACTION_TYPES:
            raise ValueError(
                f"Invalid action_type '{action_type}'. "
                f"Must be one of: {VALID_ACTION_TYPES}"
            )

        rule = AutomationRule(
            workspace_id=workspace_id,
            name=name,
            trigger_type=trigger_type,
            trigger_conditions=trigger_conditions,
            action_type=action_type,
            action_config=action_config,
        )
        db.add(rule)
        db.commit()
        db.refresh(rule)
        return rule

    @staticmethod
    def evaluate_trigger(rule: AutomationRule, event_data: dict) -> bool:
        """Check if trigger_conditions match event_data.

        Each key in trigger_conditions must be present in event_data
        with a matching value. Supports simple equality and threshold operators.
        """
        for key, expected in rule.trigger_conditions.items():
            actual = event_data.get(key)
            if actual is None:
                return False

            # Support threshold operators: {"field": {"$lt": 50}}
            if isinstance(expected, dict):
                for op, val in expected.items():
                    if op == "$lt" and not (actual < val):
                        return False
                    elif op == "$lte" and not (actual <= val):
                        return False
                    elif op == "$gt" and not (actual > val):
                        return False
                    elif op == "$gte" and not (actual >= val):
                        return False
                    elif op == "$eq" and not (actual == val):
                        return False
            else:
                if actual != expected:
                    return False

        return True

    @staticmethod
    def execute_action(rule: AutomationRule, context: dict) -> dict:
        """Execute the action defined by the rule.

        In production, each action_type dispatches to a real service.
        Here we return a structured result indicating what would happen.
        """
        now = datetime.now(timezone.utc)
        result = {
            "executed": True,
            "action_type": rule.action_type,
            "result": {
                "rule_id": str(rule.id),
                "rule_name": rule.name,
                "action_config": rule.action_config,
                "context": context,
                "executed_at": now.isoformat(),
            },
        }
        return result

    @staticmethod
    def process_event(
        db: Session, workspace_id: str, event_type: str, event_data: dict
    ) -> list[dict]:
        """Find matching rules for an event, evaluate, and execute."""
        rules = (
            db.query(AutomationRule)
            .filter(
                AutomationRule.workspace_id == workspace_id,
                AutomationRule.trigger_type == event_type,
                AutomationRule.is_active == True,  # noqa: E712
            )
            .all()
        )

        results = []
        for rule in rules:
            if RulesEngine.evaluate_trigger(rule, event_data):
                action_result = RulesEngine.execute_action(rule, event_data)
                rule.execution_count += 1
                rule.last_executed_at = datetime.now(timezone.utc)
                results.append(action_result)

        db.commit()
        return results

    @staticmethod
    def get_rules(db: Session, workspace_id: str) -> list[AutomationRule]:
        """Get all rules for a workspace."""
        return (
            db.query(AutomationRule)
            .filter(AutomationRule.workspace_id == workspace_id)
            .order_by(AutomationRule.created_at.desc())
            .all()
        )

    @staticmethod
    def get_execution_log(db: Session, rule_id: str) -> list[dict]:
        """Get execution history for a rule.

        In a full implementation this would query an execution_log table.
        Here we return the rule's execution summary.
        """
        rule = (
            db.query(AutomationRule)
            .filter(AutomationRule.id == rule_id)
            .first()
        )
        if not rule:
            return []

        return [
            {
                "rule_id": str(rule.id),
                "rule_name": rule.name,
                "execution_count": rule.execution_count,
                "last_executed_at": (
                    rule.last_executed_at.isoformat()
                    if rule.last_executed_at
                    else None
                ),
            }
        ]
