"""Retention enforcement background tasks."""
import logging
from datetime import datetime, timezone

from app.db.session import SessionLocal
from app.jobs.celery_app import celery_app
from app.models.retention_policy import RetentionPolicy

logger = logging.getLogger(__name__)


@celery_app.task(
    bind=True,
    name="app.jobs.tasks.retention_tasks.run_retention_cleanup",
)
def run_retention_cleanup(self) -> dict:
    """For each workspace with auto_delete policies, execute retention cleanup.

    Runs weekly via beat schedule. Respects legal holds.
    """
    logger.info("Starting retention cleanup sweep")
    db = SessionLocal()
    results: list[dict] = []

    try:
        # Find all distinct workspace IDs that have at least one auto_delete policy
        workspace_ids = (
            db.query(RetentionPolicy.workspace_id)
            .filter(RetentionPolicy.auto_delete.is_(True))
            .distinct()
            .all()
        )

        from app.services.backbone.records_governance import RecordsGovernance

        for (ws_id,) in workspace_ids:
            try:
                result = RecordsGovernance.execute_retention(db, str(ws_id))
                results.append(result)
                logger.info(
                    "Retention cleanup for workspace %s: deleted=%d, held=%d",
                    ws_id,
                    result["deleted_count"],
                    result["skipped_legal_hold"],
                )
            except Exception:
                logger.exception("Retention cleanup failed for workspace %s", ws_id)
                db.rollback()

        summary = {
            "workspaces_processed": len(workspace_ids),
            "results": results,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        logger.info("Retention cleanup sweep complete: %d workspaces", len(workspace_ids))
        return summary

    except Exception as exc:
        logger.exception("Retention cleanup sweep failed")
        raise self.retry(exc=exc, countdown=300, max_retries=2)
    finally:
        db.close()
