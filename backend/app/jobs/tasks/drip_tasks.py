"""Celery tasks for email drip sequence processing."""
import logging
from datetime import datetime, timezone

from app.jobs.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="app.jobs.tasks.drip_tasks.process_drip_sequences")
def process_drip_sequences(self) -> dict:
    """Find all users with a pending drip email and advance their sequences.

    Runs hourly via Celery Beat. Queries DripStatus rows where
    next_send_at <= now and completed is False.
    """
    from app.db.session import SessionLocal
    from app.models.drip_status import DripStatus
    from app.services.backbone.email_drip import advance_drip

    db = SessionLocal()
    sent = 0
    errors = 0

    try:
        now = datetime.now(timezone.utc)
        pending = (
            db.query(DripStatus)
            .filter(
                DripStatus.next_send_at <= now,
                DripStatus.completed == False,  # noqa: E712
            )
            .all()
        )

        logger.info("Drip processor found %d pending sequences", len(pending))

        for status in pending:
            try:
                result = advance_drip(db, status.user_id, status.sequence_name)
                if result.get("action") == "sent":
                    sent += 1
                logger.info(
                    "Drip advanced user=%s seq=%s result=%s",
                    status.user_id,
                    status.sequence_name,
                    result.get("action"),
                )
            except Exception:
                errors += 1
                logger.exception(
                    "Drip advance failed user=%s seq=%s",
                    status.user_id,
                    status.sequence_name,
                )
    finally:
        db.close()

    return {"sent": sent, "errors": errors, "timestamp": datetime.now(timezone.utc).isoformat()}


@celery_app.task(bind=True, name="app.jobs.tasks.drip_tasks.enqueue_onboarding")
def enqueue_onboarding(self, user_id: str) -> dict:
    """Called after registration. Creates a DripStatus for the onboarding sequence
    and sends the welcome email immediately by advancing step 0.
    """
    from app.db.session import SessionLocal
    from app.models.drip_status import DripStatus
    from app.services.backbone.email_drip import advance_drip

    db = SessionLocal()
    try:
        # Check if already enrolled
        existing = (
            db.query(DripStatus)
            .filter(DripStatus.user_id == user_id, DripStatus.sequence_name == "onboarding")
            .first()
        )

        if existing:
            logger.warning("User %s already enrolled in onboarding drip", user_id)
            return {"action": "already_enrolled", "user_id": user_id}

        # Create the drip status row
        now = datetime.now(timezone.utc)
        status = DripStatus(
            user_id=user_id,
            sequence_name="onboarding",
            current_step=0,
            next_send_at=now,
            created_at=now,
        )
        db.add(status)
        db.commit()

        # Immediately advance (sends welcome email — step 0)
        result = advance_drip(db, user_id, "onboarding")

        logger.info("Onboarding drip started for user %s", user_id)
        return result
    except Exception as exc:
        logger.exception("Failed to enqueue onboarding for user %s", user_id)
        raise self.retry(exc=exc, countdown=30, max_retries=3)
    finally:
        db.close()
