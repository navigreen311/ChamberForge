"""Command AI API endpoints — the brain's external interface."""
from fastapi import APIRouter, Query

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
    """Return a synthesised dashboard view."""
    result = await _orchestrator.run_agent(
        "command_ai",
        {"action": "dashboard", "payload": {}},
    )
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
    """Return the daily intelligence brief."""
    result = await _orchestrator.run_agent(
        "command_ai",
        {"action": "daily_brief", "payload": {}},
    )
    return result


@router.get("/agent-status")
async def agent_status():
    """Return status of all registered agents."""
    return _orchestrator.get_all_statuses()
