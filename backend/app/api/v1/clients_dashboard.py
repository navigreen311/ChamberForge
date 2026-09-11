"""Clients dashboard endpoints - KPIs, at-risk clients, wealth events.

P-15. A third router registered nowhere, after `problem_detail` (P-13) and
`deliver` (P-14). It appears only in `app/api/v1/router.py` - the file P-00
was to delete and which nothing imports - so its routes never showed in the
open-route count despite having no auth.

Gated and scoped anyway: unreachable today is not unreachable forever, and
`/at-risk` returns client names.

Under D4 `Client` is Prisma-owned and P-20 serves this screen from the BFF,
so this router is legacy. It is corrected rather than implemented.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_workspace_id
from app.db.session import get_db

router = APIRouter(prefix="/api/v1/clients-dashboard", tags=["clients-dashboard"])


@router.get("/kpis")
async def get_client_kpis(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Client KPIs for this workspace.

    Both queries had **no workspace filter**, so the counts and average
    health on any firm's dashboard were computed over every client in the
    database. Same defect as `/offers/kpis`, fixed in P-14.

    `mrr`, `mrr_delta`, `active_delta`, `wealth_events_count` and
    `renewals_due` were hardcoded to 75000, 12, 1, 3 and 1 and returned
    beside the computed values. They are named as unavailable rather than
    dropped: a field that vanishes reads as a bug, one listed as unavailable
    reads as a decision.
    """
    from app.models.client import Client

    active = (
        db.query(Client)
        .filter(Client.workspace_id == workspace_id, Client.status == "active")
        .all()
    )
    prospects = (
        db.query(Client)
        .filter(Client.workspace_id == workspace_id, Client.status == "prospect")
        .all()
    )
    health_scores = [c.health_score for c in active if c.health_score is not None]
    avg_health = sum(health_scores) / max(len(health_scores), 1)
    at_risk = sum(1 for h in health_scores if h < 60)
    return {
        "active_count": len(active),
        "prospect_count": len(prospects),
        "avg_health": round(avg_health, 1),
        "at_risk_count": at_risk,
        "unavailable": [
            "mrr",
            "mrr_delta",
            "active_delta",
            "wealth_events_count",
            "renewals_due",
        ],
        "unavailable_reason": (
            "Revenue is Prisma-owned (D4, P-29) and the deltas need a period "
            "comparison this endpoint does not compute. They were previously "
            "hardcoded."
        ),
    }


@router.get("/at-risk")
async def get_at_risk_clients(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """At-risk clients for this workspace.

    This returned **client names and health scores across every workspace**.
    Unregistered, so not reachable today - but it is the most direct PII
    disclosure in the slice and must not be open the moment anyone wires the
    router up.
    """
    from app.models.client import Client

    at_risk = (
        db.query(Client)
        .filter(
            Client.workspace_id == workspace_id,
            Client.status == "active",
            Client.health_score < 60,
        )
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
async def get_client_wealth_events(
    workspace_id: str = Depends(get_workspace_id),
):
    """Detected wealth events for this workspace's clients.

    This returned invented wealth events attributed to **named
    individuals** - "Marcus Reid, Series C exit ($120M)", "Elizabeth
    Thornton, inheritance, Estate transfer ($45M)" - under a
    `# TODO: Query from WealthEvent model when available`.

    Fabricated private financial intelligence about named people is the most
    sensitive invention in this codebase. An advisor acting on it would
    approach a client about an event that never happened.

    `WealthEvent` is Prisma-owned under D4 and P-19 serves this signal from
    the BFF, so this endpoint cannot read it. It reports that rather than
    inventing a feed.
    """
    return {
        "available": False,
        "events": [],
        "reason": (
            "Wealth events are Prisma-owned under D4 and are served by the "
            "BFF (P-19). This endpoint does not read them."
        ),
    }
