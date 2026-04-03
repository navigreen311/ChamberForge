"""REST endpoints for Problem CRUD."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import LifecycleStage, PainCategory, WealthTier
from app.schemas.problem import ProblemCreate, ProblemList, ProblemRead, ProblemUpdate
from app.services.backbone.problem_library import ProblemLibrary
from app.services.backbone.search_indices import PROBLEM_INDEX
from app.services.backbone.search_sync import remove_from_index, sync_problem

router = APIRouter(prefix="/api/v1/problems", tags=["problems"])
library = ProblemLibrary()


@router.get("/trending", response_model=list[ProblemRead])
def trending_problems(
    workspace_id: str = "default",
    limit: int = 10,
    db: Session = Depends(get_db),
):
    return library.get_trending(db, workspace_id, limit=limit)


@router.get("/", response_model=ProblemList)
def list_problems(
    workspace_id: str = "default",
    wealth_tier: Optional[WealthTier] = None,
    pain_category: Optional[PainCategory] = None,
    lifecycle_stage: Optional[LifecycleStage] = None,
    min_urgency: Optional[int] = None,
    max_urgency: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    filters: dict = {}
    if wealth_tier:
        filters["wealth_tier"] = wealth_tier
    if pain_category:
        filters["pain_category"] = pain_category
    if lifecycle_stage:
        filters["lifecycle_stage"] = lifecycle_stage
    if min_urgency is not None:
        filters["min_urgency"] = min_urgency
    if max_urgency is not None:
        filters["max_urgency"] = max_urgency

    items = library.list_problems(db, workspace_id, filters=filters, skip=skip, limit=limit)
    return ProblemList(items=items, total=len(items), skip=skip, limit=limit)


@router.post("/", response_model=ProblemRead, status_code=201)
def create_problem(
    payload: ProblemCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    data = payload.model_dump(exclude={"workspace_id"})
    problem = library.create_problem(db, payload.workspace_id, data)
    background_tasks.add_task(
        sync_problem,
        str(problem.id),
        {
            "title": problem.title,
            "description": problem.description,
            "pain_category": getattr(problem.pain_category, "value", None),
            "wealth_tier": getattr(problem.wealth_tier, "value", None),
            "lifecycle_stage": getattr(problem.lifecycle_stage, "value", None),
            "urgency_score": problem.urgency_score,
            "workspace_id": str(problem.workspace_id),
        },
    )
    return problem


@router.get("/{problem_id}", response_model=ProblemRead)
def get_problem(problem_id: str, db: Session = Depends(get_db)):
    problem = library.get_problem(db, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem


@router.put("/{problem_id}", response_model=ProblemRead)
def update_problem(
    problem_id: str,
    payload: ProblemUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True)
    problem = library.update_problem(db, problem_id, data)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    background_tasks.add_task(
        sync_problem,
        str(problem.id),
        {
            "title": problem.title,
            "description": problem.description,
            "pain_category": getattr(problem.pain_category, "value", None),
            "wealth_tier": getattr(problem.wealth_tier, "value", None),
            "lifecycle_stage": getattr(problem.lifecycle_stage, "value", None),
            "urgency_score": problem.urgency_score,
            "workspace_id": str(problem.workspace_id),
        },
    )
    return problem


@router.delete("/{problem_id}", status_code=204)
def delete_problem(
    problem_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    deleted = library.delete_problem(db, problem_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Problem not found")
    background_tasks.add_task(remove_from_index, PROBLEM_INDEX, problem_id)
    return None
