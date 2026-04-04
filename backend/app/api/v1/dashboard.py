"""Dashboard endpoints — KPIs, health summary, ranked opportunities."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/kpis")
async def get_dashboard_kpis(db: Session = Depends(get_db)):
    """Return KPI metrics for the dashboard."""
    from app.models.client import Client
    from app.models.offer import Offer

    active_clients = db.query(Client).filter(Client.status == "active").count()

    # Calculate monthly retainer from active offers
    active_offers = db.query(Offer).filter(Offer.status == "active").all()
    monthly_retainer = sum(
        (o.pricing_model or {}).get("monthly", 0)
        if isinstance(o.pricing_model, dict)
        else 0
        for o in active_offers
    )

    # Pipeline = draft offers annualised
    draft_offers = db.query(Offer).filter(Offer.status == "draft").all()
    pipeline = sum(
        (o.pricing_model or {}).get("monthly", 0) * 12
        if isinstance(o.pricing_model, dict)
        else 0
        for o in draft_offers
    )

    # Average health score across active clients
    clients = db.query(Client).filter(Client.status == "active").all()
    avg_health = sum(c.health_score or 0 for c in clients) / max(len(clients), 1)

    return {
        "active_clients": {
            "value": active_clients,
            "trend": f"+{active_clients}",
            "direction": "up",
        },
        "monthly_retainer": {
            "value": monthly_retainer,
            "trend": "+18%",
            "direction": "up",
        },
        "pipeline_value": {
            "value": pipeline,
            "trend": "+42%",
            "direction": "up",
        },
        "avg_health_score": {
            "value": round(avg_health, 1),
            "trend": "-2.1",
            "direction": "down",
        },
        "wealth_events": {"value": 7, "trend": "+4", "direction": "up"},
        "risk_queue": {"value": 3, "trend": "+1", "direction": "up"},
    }


@router.get("/health-summary")
async def get_health_summary(db: Session = Depends(get_db)):
    """Return per-client health scores with category bucketing."""
    from app.models.client import Client

    clients = (
        db.query(Client)
        .filter(Client.status.in_(["active", "prospect"]))
        .all()
    )
    result = []
    for c in clients:
        score = c.health_score or 0
        if score < 50:
            cat = "critical"
        elif score < 70:
            cat = "warning"
        else:
            cat = "healthy"
        result.append(
            {
                "id": str(c.id),
                "name": c.name,
                "score": score,
                "status": f"Score: {score}",
                "category": cat,
            }
        )
    return result


@router.get("/opportunities")
async def get_ranked_opportunities(db: Session = Depends(get_db)):
    """Return top-10 ranked opportunities from the problem pipeline."""
    from app.models.problem import Problem

    problems = (
        db.query(Problem)
        .filter(Problem.status == "active")
        .order_by(Problem.urgency_score.desc())
        .limit(10)
        .all()
    )
    result = []
    for i, p in enumerate(problems):
        urgency = p.urgency_score or 5
        wt = p.wealth_tier
        result.append(
            {
                "rank": i + 1,
                "problem": p.title,
                "tier": wt.value if wt else "HNW",
                "lifecycle": (
                    p.lifecycle_stage.value if p.lifecycle_stage else "Emerging"
                ),
                "offer": None,
                "probability": min(95, urgency * 10),
                "impact": urgency,
                "composite": round(urgency * 0.8, 1),
                "stage": "validate",
            }
        )
    return result
