"""Delivery operations endpoints.

P-14. Two things were wrong here, and the router is not even reachable.

**Every route returned fabricated client operations data.** Not placeholders
- named clients and actionable figures:

    {"client": "Wellington Trust", "deliverable": "Incident Response Plan",
     "days_late": 2, "priority": "critical"}
    {"name": "Elizabeth Thornton", "adherence": 50, "status": "red"}

SLA adherence percentages, overdue counts, QA pass rates, open escalations,
and an "active onboarding" for a named individual. A delivery console showing
"Wellington Trust: Incident Response Plan 2 days overdue" is something an
operator acts on within the hour, and none of it existed.

**The router is registered nowhere.** `main.py` does not include it, and it
appears only in `app/api/v1/router.py` - the file P-00 was to delete, which
nothing imports. So these six routes have never been reachable, which is why
they never appeared in the open-route count despite having no auth.

That is also why they are not implemented here rather than merely emptied.
Deliverables, tasks and SLA state are Prisma-owned under D4, so this router
cannot read them; P-22 owns `/api/deliver/**` on the BFF and serves these
screens directly from Prisma. This router is legacy.

What it does now: requires a session like every other route in the slice, and
returns an explicit unavailable response instead of invented operations data.
If someone registers it, it discloses nothing and claims nothing.
"""
from fastapi import APIRouter, Depends

from app.core.dependencies import get_workspace_id

router = APIRouter(prefix="/api/v1/deliver", tags=["deliver"])

_UNAVAILABLE = {
    "available": False,
    "reason": (
        "Delivery data is Prisma-owned under D4 and is served by the BFF "
        "(P-22). This endpoint does not read it."
    ),
}


def _empty(**fields) -> dict:
    """An explicit absence, never a plausible figure.

    Deliberately carries no counts. A zero here would read as "nothing
    overdue" on a delivery console, which is a claim - and the wrong one.
    """
    return {**_UNAVAILABLE, **fields}


@router.get("/kpis")
async def get_deliver_kpis(workspace_id: str = Depends(get_workspace_id)):
    """Delivery KPIs. Previously fourteen deliverables and 88% SLA adherence."""
    return _empty(metrics={})


@router.get("/overdue")
async def get_overdue(workspace_id: str = Depends(get_workspace_id)):
    """Overdue deliverables. Previously two, against named clients."""
    return _empty(items=[])


@router.get("/sla-monitor")
async def get_sla_monitor(workspace_id: str = Depends(get_workspace_id)):
    """Per-client SLA adherence. Previously five named clients with scores."""
    return _empty(clients=[])


@router.get("/tasks")
async def get_tasks(workspace_id: str = Depends(get_workspace_id)):
    """Open tasks. Previously three, with due dates and priorities."""
    return _empty(items=[])


@router.get("/escalations")
async def get_escalations(workspace_id: str = Depends(get_workspace_id)):
    """Open escalations. Previously one auto-triggered SLA breach."""
    return _empty(items=[])


@router.get("/qa-status")
async def get_qa_status(workspace_id: str = Depends(get_workspace_id)):
    """QA posture. Previously a full scorecard, including portal usage."""
    return _empty(checks={})
