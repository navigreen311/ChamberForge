"""REST endpoints for Problem CRUD — workspace-isolated."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_workspace_id
from app.core.exceptions import NotFoundError, ValidationError
from app.db.session import get_db
from app.models.enums import LifecycleStage, PainCategory, WealthTier
from app.models.user import User
from app.schemas.problem import ProblemCreate, ProblemList, ProblemRead, ProblemUpdate
from app.services.backbone.problem_library import ProblemLibrary
from app.services.backbone.search_indices import PROBLEM_INDEX
from app.core.cache import cache
from app.services.backbone.search_sync import remove_from_index, sync_problem

router = APIRouter(prefix="/api/v1/problems", tags=["problems"])
library = ProblemLibrary()


@router.get("/search")
def search_problems(
    q: str = Query("", description="Search query"),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Search problems by keyword."""
    if not q or not q.strip():
        raise ValidationError("Search query required", {"q": "Search query must not be empty"})
    items = library.list_problems(db, workspace_id, filters={"search": q.strip()}, skip=0, limit=50)
    return ProblemList(items=items, total=len(items), skip=0, limit=50)


@router.get("/trending", response_model=list[ProblemRead])
def trending_problems(
    limit: int = 10,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    key = cache.make_key("problems:trending", workspace_id=workspace_id, limit=limit)
    hit = cache.get(key)
    if hit is not None:
        return hit
    result = library.get_trending(db, workspace_id, limit=limit)
    cache.set(key, result, ttl_seconds=120)
    return result


@router.get("/", response_model=ProblemList)
def list_problems(
    wealth_tier: Optional[WealthTier] = None,
    pain_category: Optional[PainCategory] = None,
    lifecycle_stage: Optional[LifecycleStage] = None,
    min_urgency: Optional[int] = None,
    max_urgency: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    workspace_id: str = Depends(get_workspace_id),
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
    message = None
    if not items:
        message = "No problems found. Try adjusting your filters or run an AI scan to discover new problems."
    return ProblemList(items=items, total=len(items), skip=skip, limit=limit, message=message)


@router.post("/", response_model=ProblemRead, status_code=201)
def create_problem(
    payload: ProblemCreate,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    # Validate urgency_score boundary (Pydantic ge/le handles most cases,
    # but explicit check gives a clearer message for programmatic callers)
    if payload.urgency_score is not None and not (1 <= payload.urgency_score <= 10):
        raise ValidationError(
            "urgency_score must be between 1 and 10",
            {"urgency_score": f"Got {payload.urgency_score}, expected 1-10"},
        )
    data = payload.model_dump(exclude={"workspace_id"})
    problem = library.create_problem(db, workspace_id, data)
    return problem


@router.get("/{problem_id}", response_model=ProblemRead)
def get_problem(
    problem_id: str,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    problem = library.get_problem(db, problem_id)
    if not problem or problem.workspace_id != workspace_id:
        raise NotFoundError("Problem", problem_id)
    return problem


@router.put("/{problem_id}", response_model=ProblemRead)
def update_problem(
    problem_id: str,
    payload: ProblemUpdate,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    problem = library.get_problem(db, problem_id)
    if not problem or problem.workspace_id != workspace_id:
        raise NotFoundError("Problem", problem_id)
    data = payload.model_dump(exclude_unset=True)
    updated = library.update_problem(db, problem_id, data)
    return updated


@router.delete("/{problem_id}", status_code=204)
def delete_problem(
    problem_id: str,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    problem = library.get_problem(db, problem_id)
    if not problem or problem.workspace_id != workspace_id:
        raise NotFoundError("Problem", problem_id)
    library.delete_problem(db, problem_id)
    return None
