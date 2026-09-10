"""Command AI API endpoints — the brain's external interface."""
from fastapi import APIRouter

from app.core.cache import cache
from app.services.backbone.agent_orchestrator import AgentOrchestrator

router = APIRouter(prefix="/api/v1/command", tags=["Command AI"])

# Single orchestrator instance shared across requests.
_orchestrator = AgentOrchestrator()


@router.get("/next-action")
async def next_action():
    """Return the next best action for the current workspace."""
    result = await _orchestrator.run_agent(
        "command_ai",
        {"action": "next_best_action", "payload": {}},
    )
    return result


@router.get("/dashboard")
async def dashboard():
    """Return a synthesised dashboard view (cached 60s)."""
    key = cache.make_key("command:dashboard")
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
async def opportunities():
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
async def daily_brief():
    """Return the daily intelligence brief (cached 300s)."""
    key = cache.make_key("command:daily_brief")
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
async def agent_status():
    """Return status of all registered agents."""
    return _orchestrator.get_all_statuses()
