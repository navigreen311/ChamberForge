"""Evidence lifecycle background tasks."""
import logging
from datetime import datetime, timezone

from app.jobs.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="app.jobs.tasks.evidence_tasks.refresh_recency_scores")
def refresh_recency_scores(self, workspace_id: str) -> dict:
    """Recalculate temporal-decay recency scores for all evidence in a workspace."""
    logger.info("Refreshing recency scores for workspace %s", workspace_id)
    try:
        # TODO: query evidence records from DB, apply decay formula, bulk-update
        result = {
            "workspace_id": workspace_id,
            "records_updated": 0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        logger.info("Recency refresh done: %d records updated", result["records_updated"])
        return result
    except Exception as exc:
        logger.exception("Recency refresh failed for workspace %s", workspace_id)
        raise self.retry(exc=exc, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="app.jobs.tasks.evidence_tasks.flag_stale_sources")
def flag_stale_sources(self, workspace_id: str, threshold_months: int = 18) -> dict:
    """Flag evidence sources older than threshold_months as stale."""
    logger.info(
        "Flagging stale sources for workspace %s (threshold=%d months)",
        workspace_id,
        threshold_months,
    )
    try:
        # TODO: query evidence by created_at < now - threshold, mark as stale
        result = {
            "workspace_id": workspace_id,
            "threshold_months": threshold_months,
            "sources_flagged": 0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        return result
    except Exception as exc:
        logger.exception("Stale source flagging failed for workspace %s", workspace_id)
        raise self.retry(exc=exc, countdown=60, max_retries=3)
