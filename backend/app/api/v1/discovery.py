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
from app.services.backbone.wealth_event_monitor import WealthEventMonitor

router = APIRouter(prefix="/api/v1/discovery", tags=["discovery"])
ai = ProblemAI()
library = ProblemLibrary()
radar = TrendRadar()
wealth_monitor = WealthEventMonitor()


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


# ── Wealth Event Monitor endpoints ──────────────────────────────────


class EventScanRequest(BaseModel):
    sources: list[str] = ["news", "filings", "social"]
    workspace_id: str = "default"


@router.get("/events")
def list_events(workspace_id: str = "default", db: Session = Depends(get_db)):
    """List all wealth events for a workspace."""
    from app.models.wealth_event import WealthEvent
    events = db.query(WealthEvent).filter(
        WealthEvent.workspace_id == workspace_id
    ).order_by(WealthEvent.detected_at.desc()).all()
    return [
        {
            "id": e.id,
            "event_type": e.event_type,
            "person_name": e.person_name,
            "company": e.company,
            "estimated_impact": e.estimated_impact,
            "relevance_score": e.relevance_score,
            "buying_window_status": e.buying_window_status,
            "detected_at": e.detected_at.isoformat() if e.detected_at else None,
            "expires_at": e.expires_at.isoformat() if e.expires_at else None,
        }
        for e in events
    ]


@router.post("/events/scan")
def scan_events(payload: EventScanRequest, db: Session = Depends(get_db)):
    """Scan for wealth events and persist them."""
    raw_events = wealth_monitor.scan_events(payload.sources)
    saved = []
    for ev_data in raw_events:
        ev = wealth_monitor.create_event(db, payload.workspace_id, ev_data)
        saved.append({
            "id": ev.id,
            "event_type": ev.event_type,
            "person_name": ev.person_name,
            "buying_window_status": ev.buying_window_status,
        })
    return saved


@router.get("/events/windows")
def active_windows(workspace_id: str = "default", db: Session = Depends(get_db)):
    """Get active buying windows sorted by urgency."""
    return wealth_monitor.get_active_windows(db, workspace_id)
