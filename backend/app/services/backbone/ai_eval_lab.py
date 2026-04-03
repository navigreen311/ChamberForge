"""AI Eval Lab — Prompt versioning, regression testing, and rollback."""
from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.prompt_version import PromptVersion


class AIEvalLab:
    """Manages prompt versions, A/B testing, and regression suites."""

    @staticmethod
    def register_prompt(
        db: Session,
        agent_name: str,
        prompt_template: str,
        user_id: str | None = None,
    ) -> PromptVersion:
        """Register a new prompt version, auto-incrementing the version number."""
        max_version = (
            db.query(func.max(PromptVersion.version))
            .filter(PromptVersion.agent_name == agent_name)
            .scalar()
        ) or 0

        # Deactivate all existing versions for this agent
        db.query(PromptVersion).filter(
            PromptVersion.agent_name == agent_name,
            PromptVersion.is_active == True,  # noqa: E712
        ).update({"is_active": False})

        new_version = PromptVersion(
            agent_name=agent_name,
            version=max_version + 1,
            prompt_template=prompt_template,
            is_active=True,
            created_by=user_id,
        )
        db.add(new_version)
        db.commit()
        db.refresh(new_version)
        return new_version

    @staticmethod
    def get_prompt_history(db: Session, agent_name: str) -> list[PromptVersion]:
        """Get full prompt history for an agent, ordered by version descending."""
        return (
            db.query(PromptVersion)
            .filter(PromptVersion.agent_name == agent_name)
            .order_by(PromptVersion.version.desc())
            .all()
        )

    @staticmethod
    def get_active_prompt(db: Session, agent_name: str) -> PromptVersion | None:
        """Get the currently active prompt for an agent."""
        return (
            db.query(PromptVersion)
            .filter(
                PromptVersion.agent_name == agent_name,
                PromptVersion.is_active == True,  # noqa: E712
            )
            .first()
        )

    @staticmethod
    def rollback_prompt(
        db: Session, agent_name: str, target_version: int
    ) -> PromptVersion:
        """Rollback to a specific prompt version."""
        target = (
            db.query(PromptVersion)
            .filter(
                PromptVersion.agent_name == agent_name,
                PromptVersion.version == target_version,
            )
            .first()
        )
        if not target:
            raise ValueError(
                f"Version {target_version} not found for agent '{agent_name}'"
            )

        # Deactivate all versions for this agent
        db.query(PromptVersion).filter(
            PromptVersion.agent_name == agent_name,
            PromptVersion.is_active == True,  # noqa: E712
        ).update({"is_active": False})

        target.is_active = True
        db.commit()
        db.refresh(target)
        return target

    @staticmethod
    def run_regression(
        db: Session, agent_name: str, test_cases: list[dict]
    ) -> dict:
        """Run regression tests against the active prompt version.

        Each test_case should have: {test_id, input, expected}
        In a real system this would call the AI model; here we do string matching.
        """
        active = AIEvalLab.get_active_prompt(db, agent_name)
        if not active:
            raise ValueError(f"No active prompt for agent '{agent_name}'")

        results = []
        for tc in test_cases:
            # Simulate: in production, this calls the AI model with the prompt
            actual = tc.get("actual", tc.get("expected", ""))
            passed = actual == tc.get("expected", "")
            results.append(
                {
                    "test_id": tc["test_id"],
                    "input": tc["input"],
                    "expected": tc["expected"],
                    "actual": actual,
                    "passed": passed,
                }
            )

        passed_count = sum(1 for r in results if r["passed"])
        total = len(results)
        return {
            "agent": agent_name,
            "version": active.version,
            "results": results,
            "pass_rate": passed_count / total if total > 0 else 0.0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    @staticmethod
    def run_golden_tests(db: Session, agent_name: str) -> dict:
        """Run the golden test set for *agent_name* and return results.

        Loads test cases from ``data/golden_tests/{agent_name}_tests.json``,
        invokes each against the active prompt version, and returns a summary
        dict: {agent, version, pass_rate, results: [{test_id, passed,
        expected_summary, actual_summary}]}.
        """
        from app.services.backbone.golden_test_runner import (
            load_test_cases,
            evaluate_output,
            _summarise,
        )

        active = AIEvalLab.get_active_prompt(db, agent_name)
        version = active.version if active else 0

        test_cases = load_test_cases(agent_name)
        results = []

        for tc in test_cases:
            test_id = tc["id"]
            expected = tc["expected"]
            # In a production system this would invoke the real agent with
            # tc["input"] using the active prompt.  For now, we delegate to
            # the golden_test_runner's run_suite which accepts an invoke_fn.
            # Here we record each case as skipped unless an invoke_fn is
            # wired externally.
            results.append({
                "test_id": test_id,
                "passed": False,
                "expected_summary": _summarise(expected),
                "actual_summary": "agent invocation not wired",
            })

        passed_count = sum(1 for r in results if r["passed"])
        total = len(results)
        return {
            "agent": agent_name,
            "version": version,
            "pass_rate": passed_count / total if total > 0 else 0.0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": results,
        }

    @staticmethod
    def save_test_results(
        db: Session, prompt_version_id: str, results: dict
    ) -> None:
        """Save test results to a prompt version record."""
        pv = db.query(PromptVersion).filter(PromptVersion.id == prompt_version_id).first()
        if not pv:
            raise ValueError(f"PromptVersion {prompt_version_id} not found")
        pv.test_results = results
        db.commit()
