"""Clients dashboard endpoints — KPIs, at-risk clients, wealth events."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db

router = APIRouter(prefix="/api/v1/clients-dashboard", tags=["clients-dashboard"])


@router.get("/kpis")
async def get_client_kpis(db: Session = Depends(get_db)):
    from app.models.client import Client

    active = db.query(Client).filter(Client.status == "active").all()
    prospects = db.query(Client).filter(Client.status == "prospect").all()
    health_scores = [c.health_score for c in active if c.health_score is not None]
    avg_health = sum(health_scores) / max(len(health_scores), 1)
    at_risk = sum(1 for h in health_scores if h < 60)
    return {
        "active_count": len(active),
        "active_delta": 1,
        "prospect_count": len(prospects),
        "mrr": 75000,
        "mrr_delta": 12,
        "avg_health": round(avg_health, 1),
        "at_risk_count": at_risk,
        "wealth_events_count": 3,
        "renewals_due": 1,
    }


@router.get("/at-risk")
async def get_at_risk_clients(db: Session = Depends(get_db)):
    from app.models.client import Client

    at_risk = (
        db.query(Client)
        .filter(Client.status == "active", Client.health_score < 60)
        .all()
    )
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "health_score": c.health_score,
            "reason": "Health below threshold",
        }
        for c in at_risk
    ]


@router.get("/wealth-events")
async def get_client_wealth_events():
    # TODO: Query from WealthEvent model when available
    return [
        {
            "client_name": "Marcus Reid",
            "type": "exit",
            "description": "Series C exit ($120M)",
            "detected_at": "2 hours ago",
        },
        {
            "client_name": "Elizabeth Thornton",
            "type": "inheritance",
            "description": "Estate transfer ($45M)",
            "detected_at": "5 hours ago",
        },
        {
            "client_name": "Diana Walsh",
            "type": "board",
            "description": "Appointed to Meridian Capital board",
            "detected_at": "2 days ago",
        },
    ]
