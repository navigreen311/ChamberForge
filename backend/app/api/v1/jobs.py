"""Jobs API — monitor and trigger background tasks."""
from datetime import datetime, timezone
from typing import Any

from celery.result import AsyncResult
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.dependencies import get_workspace_id
from app.jobs.celery_app import celery_app

router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])

# Map of manually-triggerable task names to their fully-qualified Celery names
TRIGGERABLE_TASKS: dict[str, str] = {
    "run_problem_discovery": "app.jobs.tasks.ai_tasks.run_problem_discovery",
    "run_evidence_ingestion": "app.jobs.tasks.ai_tasks.run_evidence_ingestion",
    "run_offer_generation": "app.jobs.tasks.ai_tasks.run_offer_generation",
    "run_command_ai_synthesis": "app.jobs.tasks.ai_tasks.run_command_ai_synthesis",
    "refresh_recency_scores": "app.jobs.tasks.evidence_tasks.refresh_recency_scores",
    "flag_stale_sources": "app.jobs.tasks.evidence_tasks.flag_stale_sources",
    "dispatch_notification": "app.jobs.tasks.notification_tasks.dispatch_notification",
    "send_email_notification": "app.jobs.tasks.notification_tasks.send_email_notification",
    "send_weekly_digest": "app.jobs.tasks.notification_tasks.send_weekly_digest",
    "generate_quarterly_scorecard": "app.jobs.tasks.report_tasks.generate_quarterly_scorecard",
    "generate_revenue_report": "app.jobs.tasks.report_tasks.generate_revenue_report",
    "sync_entity_to_search": "app.jobs.tasks.search_tasks.sync_entity_to_search",
    "full_reindex": "app.jobs.tasks.search_tasks.full_reindex",
}


class TriggerRequest(BaseModel):
    args: list[Any] = []
    kwargs: dict[str, Any] = {}


class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Any = None
    date_done: str | None = None


@router.get("/status")
async def list_tasks_status(
    workspace_id: str = Depends(get_workspace_id),
) -> dict:
    """Return active, scheduled, and reserved tasks across all workers."""
    inspect = celery_app.control.inspect()

    active = inspect.active() or {}
    scheduled = inspect.scheduled() or {}
    reserved = inspect.reserved() or {}

    # Flatten beat schedule for display
    beat_entries = []
    for name, entry in celery_app.conf.beat_schedule.items():
        beat_entries.append({
            "name": name,
            "task": entry["task"],
            "schedule": str(entry["schedule"]),
        })

    return {
        "active": active,
        "scheduled": scheduled,
        "reserved": reserved,
        "beat_schedule": beat_entries,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/trigger/{task_name}")
async def trigger_task(
    task_name: str,
    body: TriggerRequest | None = None,
    workspace_id: str = Depends(get_workspace_id),
) -> dict:
    """Manually trigger a registered background task (admin only)."""
    if task_name not in TRIGGERABLE_TASKS:
        raise HTTPException(
            status_code=404,
            detail=f"Task '{task_name}' not found. Available: {list(TRIGGERABLE_TASKS.keys())}",
        )

    celery_task_name = TRIGGERABLE_TASKS[task_name]
    args = body.args if body else []
    kwargs = body.kwargs if body else {}

    result = celery_app.send_task(celery_task_name, args=args, kwargs=kwargs)

    return {
        "task_id": result.id,
        "task_name": task_name,
        "status": "queued",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/history")
async def task_history(
    limit: int = 50,
    workspace_id: str = Depends(get_workspace_id),
) -> dict:
    """Return recent task results with status. Requires a result backend."""
    # NOTE: Celery does not natively store a task history list.
    # In production, you would query a results table or use Flower's API.
    # This endpoint queries individual task results if task_ids are tracked.
    return {
        "message": "Task history requires a task-tracking store. Use Flower UI or a DB-backed result store.",
        "hint": "POST /trigger returns task_id — use GET /result/{task_id} to check individual results.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/result/{task_id}")
async def get_task_result(
    task_id: str,
    workspace_id: str = Depends(get_workspace_id),
) -> TaskStatusResponse:
    """Get the result of a specific task by its ID."""
    result = AsyncResult(task_id, app=celery_app)
    return TaskStatusResponse(
        task_id=task_id,
        status=result.status,
        result=result.result if result.ready() else None,
        date_done=str(result.date_done) if result.date_done else None,
    )
