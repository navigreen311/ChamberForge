"""Run a per-workspace task across every workspace.

P-08. The Beat schedule passed `args: ("all",)` to four tasks whose first
parameter is `workspace_id`:

    "evidence_refresh": {
        "task": "...evidence_tasks.refresh_recency_scores",
        "args": ("all",),
    }

So each scheduled run asked for the workspace *literally named* `"all"`. With
`pass`-bodied tasks that made no difference - nothing queried anything - but
the moment those tasks became real, every nightly sweep would have quietly
processed nothing and reported a successful run over zero records.

That is the subtle half of this package: the stubs hid a scheduling bug, and
implementing them without noticing would have produced jobs that ran
correctly, reported honestly, and still did nothing.

These fan-out tasks are what Beat now calls. Each enumerates workspaces and
dispatches the per-workspace task, so the schedule no longer needs to name
one.
"""
from __future__ import annotations

import logging
from typing import Any, Callable

from app.db.session import SessionLocal
from app.jobs._result import done
from app.models.workspace import Workspace

logger = logging.getLogger(__name__)


def all_workspace_ids() -> list[str]:
    """Every workspace id, or an empty list if none can be read.

    `workspaces` is FastAPI-owned, so a worker may read it directly.
    """
    db = SessionLocal()
    try:
        return [str(row[0]) for row in db.query(Workspace.id).all()]
    except Exception:
        logger.exception("could not enumerate workspaces for a scheduled sweep")
        return []
    finally:
        db.close()


def fan_out(name: str, task: Callable[..., Any], *args: Any, **kwargs: Any) -> dict:
    """Dispatch *task* once per workspace and summarise the dispatch.

    Reports how many workspaces were found as well as how many were
    dispatched. A sweep that finds no workspaces is a fact worth seeing: it
    is the exact symptom the `("all",)` bug would have produced, and a bare
    "0 dispatched" reads like a quiet night.
    """
    workspace_ids = all_workspace_ids()
    dispatched = 0

    for workspace_id in workspace_ids:
        try:
            task.delay(workspace_id, *args, **kwargs)
            dispatched += 1
        except Exception:
            logger.exception("could not dispatch %s for workspace %s", name, workspace_id)

    if not workspace_ids:
        logger.warning("%s swept zero workspaces - none were found", name)
    else:
        logger.info("%s dispatched for %d workspaces", name, dispatched)

    return done(
        sweep=name,
        workspaces_found=len(workspace_ids),
        workspaces_dispatched=dispatched,
    )
