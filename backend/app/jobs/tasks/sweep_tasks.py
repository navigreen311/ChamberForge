"""The scheduled sweeps Beat actually calls.

P-08. Each of these enumerates workspaces and dispatches a per-workspace
task, replacing the `args: ("all",)` the Beat schedule used to pass as a
literal `workspace_id`.

Kept in their own module rather than added to the per-workspace modules
because they are a different kind of thing: a sweep decides *who* the work
runs for, and the task decides *what* it does. Mixing them is how
`("all",)` came to look reasonable in the first place.
"""
import logging

from app.jobs.celery_app import celery_app
from app.jobs.fanout import fan_out
from app.jobs.tasks import evidence_tasks, notification_tasks

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="app.jobs.tasks.sweep_tasks.sweep_recency_refresh")
def sweep_recency_refresh(self) -> dict:
    """Weekly: refresh evidence recency scores for every workspace."""
    return fan_out("recency_refresh", evidence_tasks.refresh_recency_scores)


@celery_app.task(bind=True, name="app.jobs.tasks.sweep_tasks.sweep_stale_sources")
def sweep_stale_sources(self) -> dict:
    """Nightly: flag evidence past the staleness threshold, everywhere."""
    return fan_out("stale_sources", evidence_tasks.flag_stale_sources)


@celery_app.task(bind=True, name="app.jobs.tasks.sweep_tasks.sweep_weekly_digest")
def sweep_weekly_digest(self) -> dict:
    """Weekly: send each workspace its activity digest."""
    return fan_out("weekly_digest", notification_tasks.send_weekly_digest)
