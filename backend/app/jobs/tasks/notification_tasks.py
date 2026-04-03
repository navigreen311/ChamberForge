"""Notification dispatch background tasks."""
import logging
from datetime import datetime, timezone

from app.jobs.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="app.jobs.tasks.notification_tasks.dispatch_notification")
def dispatch_notification(
    self,
    user_id: str,
    type: str,
    title: str,
    body: str,
    action_url: str | None = None,
) -> dict:
    """Create an in-app notification record and push via realtime channel."""
    logger.info("Dispatching notification to user %s: %s", user_id, title)
    try:
        # TODO: persist to notifications table, push via Pusher
        notification = {
            "user_id": user_id,
            "type": type,
            "title": title,
            "body": body,
            "action_url": action_url,
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        return notification
    except Exception as exc:
        logger.exception("Notification dispatch failed for user %s", user_id)
        raise self.retry(exc=exc, countdown=10, max_retries=5)


@celery_app.task(bind=True, name="app.jobs.tasks.notification_tasks.send_email_notification")
def send_email_notification(
    self,
    to: str,
    template: str,
    variables: dict,
) -> dict:
    """Send a transactional email via Resend."""
    logger.info("Sending email to %s (template=%s)", to, template)
    try:
        # TODO: integrate with Resend API
        # import resend
        # resend.api_key = settings.RESEND_API_KEY
        # resend.Emails.send({...})
        result = {
            "to": to,
            "template": template,
            "status": "sent",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        return result
    except Exception as exc:
        logger.exception("Email send failed to %s", to)
        raise self.retry(exc=exc, countdown=30, max_retries=3)


@celery_app.task(bind=True, name="app.jobs.tasks.notification_tasks.send_weekly_digest")
def send_weekly_digest(self, workspace_id: str) -> dict:
    """Compile and send the weekly activity digest for a workspace."""
    logger.info("Generating weekly digest for workspace %s", workspace_id)
    try:
        # TODO: gather workspace activity, compile digest, email to members
        result = {
            "workspace_id": workspace_id,
            "recipients": 0,
            "status": "sent",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        return result
    except Exception as exc:
        logger.exception("Weekly digest failed for workspace %s", workspace_id)
        raise self.retry(exc=exc, countdown=120, max_retries=2)
