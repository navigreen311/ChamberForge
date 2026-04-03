"""Tests for AIEvalLab — prompt versioning, rollback, and regression."""
import pytest

from app.services.backbone.ai_eval_lab import AIEvalLab


class TestPromptVersioning:
    def test_register_first_prompt(self, db):
        pv = AIEvalLab.register_prompt(db, "discovery_agent", "You are a discovery assistant.")
        assert pv.agent_name == "discovery_agent"
        assert pv.version == 1
        assert pv.is_active is True

    def test_auto_increment_version(self, db):
        AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v1")
        pv2 = AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v2")
        pv3 = AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v3")

        assert pv2.version == 2
        assert pv3.version == 3

    def test_only_latest_is_active(self, db):
        AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v1")
        AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v2")
        AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v3")

        active = AIEvalLab.get_active_prompt(db, "discovery_agent")
        assert active.version == 3
        assert active.is_active is True

    def test_rollback_to_v1(self, db):
        AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v1")
        AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v2")
        AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v3")

        rolled_back = AIEvalLab.rollback_prompt(db, "discovery_agent", 1)
        assert rolled_back.version == 1
        assert rolled_back.is_active is True

        active = AIEvalLab.get_active_prompt(db, "discovery_agent")
        assert active.version == 1

    def test_rollback_nonexistent_version_raises(self, db):
        AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v1")
        with pytest.raises(ValueError, match="Version 99 not found"):
            AIEvalLab.rollback_prompt(db, "discovery_agent", 99)

    def test_prompt_history(self, db):
        AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v1")
        AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v2")
        AIEvalLab.register_prompt(db, "discovery_agent", "Prompt v3")

        history = AIEvalLab.get_prompt_history(db, "discovery_agent")
        assert len(history) == 3
        # Ordered by version descending
        assert history[0].version == 3
        assert history[2].version == 1

    def test_separate_agents_independent(self, db):
        AIEvalLab.register_prompt(db, "agent_a", "A prompt")
        AIEvalLab.register_prompt(db, "agent_b", "B prompt")

        active_a = AIEvalLab.get_active_prompt(db, "agent_a")
        active_b = AIEvalLab.get_active_prompt(db, "agent_b")

        assert active_a.agent_name == "agent_a"
        assert active_b.agent_name == "agent_b"
        assert active_a.version == 1
        assert active_b.version == 1


class TestRegression:
    def test_run_regression_all_pass(self, db):
        AIEvalLab.register_prompt(db, "test_agent", "Test prompt")

        test_cases = [
            {"test_id": "t1", "input": "hello", "expected": "world", "actual": "world"},
            {"test_id": "t2", "input": "foo", "expected": "bar", "actual": "bar"},
        ]
        result = AIEvalLab.run_regression(db, "test_agent", test_cases)

        assert result["agent"] == "test_agent"
        assert result["version"] == 1
        assert result["pass_rate"] == 1.0
        assert len(result["results"]) == 2
        assert all(r["passed"] for r in result["results"])

    def test_run_regression_with_failure(self, db):
        AIEvalLab.register_prompt(db, "test_agent", "Test prompt")

        test_cases = [
            {"test_id": "t1", "input": "hello", "expected": "world", "actual": "world"},
            {"test_id": "t2", "input": "foo", "expected": "bar", "actual": "wrong"},
        ]
        result = AIEvalLab.run_regression(db, "test_agent", test_cases)

        assert result["pass_rate"] == 0.5
        assert result["results"][0]["passed"] is True
        assert result["results"][1]["passed"] is False

    def test_save_test_results(self, db):
        pv = AIEvalLab.register_prompt(db, "test_agent", "Test prompt")
        results = {"pass_rate": 1.0, "tests_run": 5}
        AIEvalLab.save_test_results(db, str(pv.id), results)

        db.refresh(pv)
        assert pv.test_results == results
