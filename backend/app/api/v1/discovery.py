"""REST endpoints for AI-powered Problem Discovery & Trend Radar."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.problem import ProblemRead
from app.services.agents.problem_ai import ProblemAI
from app.services.backbone.problem_library import ProblemLibrary
from app.services.backbone.trend_radar import TrendRadar

router = APIRouter(prefix="/api/v1/discovery", tags=["discovery"])
ai = ProblemAI()
library = ProblemLibrary()
radar = TrendRadar()


class ScanRequest(BaseModel):
    sources: list[str]
    workspace_id: str = "default"


@router.post("/scan", response_model=list[ProblemRead])
def scan_sources(payload: ScanRequest, db: Session = Depends(get_db)):
    """Run AI discovery over provided sources and persist results."""
    raw_problems = ai.discover_problems(payload.sources, payload.workspace_id)
    saved: list = []
    for p in raw_problems:
        problem = library.create_problem(db, payload.workspace_id, p)
        saved.append(problem)
    return saved


@router.get("/lifecycle-distribution")
def lifecycle_distribution(
    workspace_id: str = "default",
    db: Session = Depends(get_db),
):
    return radar.get_lifecycle_distribution(db, workspace_id)


@router.get("/opportunities", response_model=list[ProblemRead])
def opportunities(
    workspace_id: str = "default",
    geo: Optional[str] = None,
    tier: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return radar.get_opportunities(db, workspace_id, geo=geo, tier=tier)
