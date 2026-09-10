"""Wealth Event Monitor — scans for liquidity events and classifies buying windows."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models.wealth_event import WealthEvent

# Canonical event types and their default urgency windows
_EVENT_WINDOWS = {
    "exit": {"window_type": "post_liquidity", "default_days": 90, "base_urgency": 9},
    "ipo": {"window_type": "post_ipo_lockup", "default_days": 180, "base_urgency": 7},
    "inheritance": {"window_type": "estate_settlement", "default_days": 120, "base_urgency": 8},
    "divorce": {"window_type": "asset_restructuring", "default_days": 60, "base_urgency": 9},
    "board_appointment": {"window_type": "profile_elevation", "default_days": 30, "base_urgency": 5},
    "prominence": {"window_type": "visibility_spike", "default_days": 14, "base_urgency": 4},
}

_DEMO_EVENTS = [
    {
        "event_type": "exit",
        "person_name": "Sarah Chen",
        "company": "Nebula AI",
        "estimated_wealth_impact": "$120M",
        "source": "TechCrunch",
        "relevance_score": 0.92,
    },
    {
        "event_type": "inheritance",
        "person_name": "James Rothwell III",
        "company": None,
        "estimated_wealth_impact": "$85M",
        "source": "Probate Records",
        "relevance_score": 0.87,
    },
    {
        "event_type": "divorce",
        "person_name": "Elena Vasquez",
        "company": "Vasquez Holdings",
        "estimated_wealth_impact": "$200M",
        "source": "Court Filings",
        "relevance_score": 0.95,
    },
    {
        "event_type": "ipo",
        "person_name": "David Park",
        "company": "Quantum Dynamics",
        "estimated_wealth_impact": "$350M",
        "source": "SEC Filing",
        "relevance_score": 0.88,
    },
]


class WealthEventMonitor:
    """Layer-1 service: monitors wealth events and classifies buying windows."""

    def scan_events(self, sources: Optional[list[str]] = None) -> list[dict]:
        """Monitor for exits, IPOs, inheritances, board appointments, divorces.

        Returns a list of event dicts with standard fields.
        In production this would call external APIs; returns demo data for now.
        """
        now = datetime.utcnow()
        events = []
        for raw in _DEMO_EVENTS:
            events.append({
                "event_type": raw["event_type"],
                "person_name": raw["person_name"],
                "company": raw.get("company"),
                "estimated_wealth_impact": raw["estimated_wealth_impact"],
                "date": now.isoformat(),
                "source": raw["source"],
                "relevance_score": raw["relevance_score"],
            })
        return events

    def classify_buying_window(self, event: dict) -> dict:
        """Classify the buying window for a given event."""
        event_type = event.get("event_type", "prominence")
        window_cfg = _EVENT_WINDOWS.get(event_type, _EVENT_WINDOWS["prominence"])

        relevance = event.get("relevance_score", 0.5)
        urgency = min(10, round(window_cfg["base_urgency"] * (0.5 + relevance * 0.5)))

        if urgency >= 8:
            recommended = "Immediate outreach — warm intro preferred"
        elif urgency >= 5:
            recommended = "Schedule discovery call within 2 weeks"
        else:
            recommended = "Add to nurture sequence"

        return {
            "window_type": window_cfg["window_type"],
            "urgency": urgency,
            "recommended_action": recommended,
            "timing_notes": f"Window open for ~{window_cfg['default_days']} days from event date",
        }

    def get_active_windows(self, db: Session, workspace_id: str) -> list[dict]:
        """Return current open buying windows sorted by urgency (desc)."""
        events = (
            db.query(WealthEvent)
            .filter(
                WealthEvent.workspace_id == workspace_id,
                WealthEvent.buying_window_status.in_(["open", "closing"]),
            )
            .all()
        )
        results = []
        for ev in events:
            window = self.classify_buying_window({
                "event_type": ev.event_type,
                "relevance_score": ev.relevance_score or 0.5,
            })
            results.append({
                "event_id": ev.id,
                "event_type": ev.event_type,
                "person_name": ev.person_name,
                "company": ev.company,
                "estimated_impact": ev.estimated_impact,
                "buying_window_status": ev.buying_window_status,
                "detected_at": ev.detected_at.isoformat() if ev.detected_at else None,
                "expires_at": ev.expires_at.isoformat() if ev.expires_at else None,
                **window,
            })
        results.sort(key=lambda x: x["urgency"], reverse=True)
        return results

    def link_to_problem(self, db: Session, event_id: str, problem_id: str) -> dict:
        """Link a wealth event to a problem."""
        ev = db.query(WealthEvent).filter(WealthEvent.id == event_id).first()
        if not ev:
            return {"success": False, "error": "Event not found"}
        ev.linked_problem_id = problem_id
        db.commit()
        db.refresh(ev)
        return {
            "success": True,
            "event_id": ev.id,
            "linked_problem_id": ev.linked_problem_id,
        }

    def create_event(self, db: Session, workspace_id: str, data: dict) -> WealthEvent:
        """Persist a scanned event to the database."""
        event_type = data.get("event_type", "prominence")
        window_cfg = _EVENT_WINDOWS.get(event_type, _EVENT_WINDOWS["prominence"])
        now = datetime.utcnow()

        ev = WealthEvent(
            id=str(uuid.uuid4()),
            workspace_id=workspace_id,
            event_type=event_type,
            person_name=data.get("person_name", "Unknown"),
            company=data.get("company"),
            estimated_impact=data.get("estimated_wealth_impact", "Unknown"),
            source_url=data.get("source"),
            relevance_score=data.get("relevance_score", 0.5),
            buying_window_status="open",
            detected_at=now,
            expires_at=now + timedelta(days=window_cfg["default_days"]),
        )
        db.add(ev)
        db.commit()
        db.refresh(ev)
        return ev
