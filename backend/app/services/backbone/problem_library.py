"""Problem Library — CRUD + query layer over the Problem model."""
from __future__ import annotations

from typing import Any, Optional

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.problem import Problem


class ProblemLibrary:
    """Database operations for problems."""

    # ------------------------------------------------------------------
    @staticmethod
    def create_problem(
        db: Session, workspace_id: str, data: dict[str, Any]
    ) -> Problem:
        problem = Problem(workspace_id=workspace_id, **data)
        db.add(problem)
        db.commit()
        db.refresh(problem)
        return problem

    # ------------------------------------------------------------------
    @staticmethod
    def get_problem(db: Session, problem_id: str) -> Optional[Problem]:
        return db.query(Problem).filter(Problem.id == problem_id).first()

    # ------------------------------------------------------------------
    @staticmethod
    def list_problems(
        db: Session,
        workspace_id: str,
        filters: Optional[dict[str, Any]] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> list[Problem]:
        q = db.query(Problem).filter(Problem.workspace_id == workspace_id)

        if filters:
            if filters.get("wealth_tier"):
                q = q.filter(Problem.wealth_tier == filters["wealth_tier"])
            if filters.get("pain_category"):
                q = q.filter(Problem.pain_category == filters["pain_category"])
            if filters.get("lifecycle_stage"):
                q = q.filter(Problem.lifecycle_stage == filters["lifecycle_stage"])
            if filters.get("min_urgency") is not None:
                q = q.filter(Problem.urgency_score >= filters["min_urgency"])
            if filters.get("max_urgency") is not None:
                q = q.filter(Problem.urgency_score <= filters["max_urgency"])

        return q.offset(skip).limit(limit).all()

    # ------------------------------------------------------------------
    @staticmethod
    def update_problem(
        db: Session, problem_id: str, data: dict[str, Any]
    ) -> Optional[Problem]:
        problem = db.query(Problem).filter(Problem.id == problem_id).first()
        if not problem:
            return None
        for key, value in data.items():
            if hasattr(problem, key):
                setattr(problem, key, value)
        db.commit()
        db.refresh(problem)
        return problem

    # ------------------------------------------------------------------
    @staticmethod
    def delete_problem(db: Session, problem_id: str) -> bool:
        problem = db.query(Problem).filter(Problem.id == problem_id).first()
        if not problem:
            return False
        db.delete(problem)
        db.commit()
        return True

    # ------------------------------------------------------------------
    @staticmethod
    def get_trending(
        db: Session, workspace_id: str, limit: int = 10
    ) -> list[Problem]:
        return (
            db.query(Problem)
            .filter(Problem.workspace_id == workspace_id)
            .order_by(desc(Problem.urgency_score), desc(Problem.created_at))
            .limit(limit)
            .all()
        )
