"""Command AI API endpoints - the brain's external interface.

P-15 (T-008). All five routes were anonymous, and two of them cached across
workspaces:

    key = cache.make_key("command:dashboard")

No workspace dimension. `/command/dashboard` and `/command/daily-brief`
synthesise a workspace's own data, so the first request populated a shared
key and **every other workspace was served that firm's dashboard for the next
sixty seconds**.

It is not exploitable today only because P-04 made CommandAI return a marked
degraded result without an API key, so the cached payload carries no data.
The moment a key is configured it becomes a live cross-tenant disclosure.
`problems.py` already keys its cache by workspace; this is the same fix.
"""
from fastapi import APIRouter, Depends

from app.core.cache import cache
from app.core.dependencies import get_workspace_id
from app.services.backbone.agent_orchestrator import AgentOrchestrator

router = APIRouter(prefix="/api/v1/command", tags=["Command AI"])

# Single orchestrator instance shared across requests.
_orchestrator = AgentOrchestrator()


@router.get("/next-action")
async def next_action(
    workspace_id: str = Depends(get_workspace_id),
):
    """Return the next best action for the current workspace."""
    result = await _orchestrator.run_agent(
        "command_ai",
        {"action": "next_best_action", "payload": {}},
    )
    return result


@router.get("/dashboard")
async def dashboard(
    workspace_id: str = Depends(get_workspace_id),
):
    """Return a synthesised dashboard view (cached 60s)."""
    key = cache.make_key("command:dashboard", workspace_id=workspace_id)
    hit = cache.get(key)
    if hit is not None:
        return hit
    result = await _orchestrator.run_agent(
        "command_ai",
        {"action": "dashboard", "payload": {}},
    )
    cache.set(key, result, ttl_seconds=60)
    return result


@router.get("/opportunities")
async def opportunities(
    workspace_id: str = Depends(get_workspace_id),
):
    """Return prioritised problem-offer opportunities."""
    result = await _orchestrator.run_agent(
        "command_ai",
        {
            "action": "prioritize",
            "payload": {
                "problems": [],
                "offers": [],
            },
        },
    )
    return result


@router.get("/daily-brief")
async def daily_brief(
    workspace_id: str = Depends(get_workspace_id),
):
    """Return the daily intelligence brief (cached 300s)."""
    key = cache.make_key("command:daily_brief", workspace_id=workspace_id)
    hit = cache.get(key)
    if hit is not None:
        return hit
    result = await _orchestrator.run_agent(
        "command_ai",
        {"action": "daily_brief", "payload": {}},
    )
    cache.set(key, result, ttl_seconds=300)
    return result


@router.get("/agent-status")
async def agent_status(
    workspace_id: str = Depends(get_workspace_id),
):
    """Return status of all registered agents."""
    return _orchestrator.get_all_statuses()
