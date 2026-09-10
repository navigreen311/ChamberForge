"""Notification dispatch background tasks.

P-08 (T-030). All three returned success-shaped dictionaries from bodies
with a `# TODO` where the work belonged. `send_email_notification` returned
`{"status": "sent"}` having sent nothing, and `weekly_digest` fires every
Monday at 08:00 and reported `recipients: 0, status: "sent"` - a digest
successfully sent to nobody.

`dispatch_notification` stays blocked: an in-app notification is a Prisma
`Notification` row under D4, and a worker writing the retired SQLAlchemy
duplicate would produce a row the operator console never reads. The other two
go through `EmailService`, which writes `email_logs` - FastAPI-owned, so a
worker may write it.
"""
import asyncio
import logging
from datetime import datetime, timedelta, timezone

from app.db.session import SessionLocal
from app.jobs._result import D4_BLOCKED, blocked, done
from app.jobs.celery_app import celery_app
from app.models.evidence import Evidence
from app.models.workspace import Workspace
from app.services.backbone.email_service import EmailService

logger = logging.getLogger(__name__)

REASON_NO_RECIPIENT = "no_recipient"
REASON_SEND_FAILED = "send_failed"


@celery_app.task(bind=True, name="app.jobs.tasks.notification_tasks.dispatch_notification")
def dispatch_notification(
    self,
    user_id: str,
    type: str,
    title: str,
    body: str,
    action_url: str | None = None,
) -> dict:
    """Create an in-app notification. **Blocked under D4.**

    This previously returned the notification dictionary it had been handed,
    with `read: False` and a timestamp, which reads exactly like a record
    that was created. Nothing was persisted and nothing was pushed.

    `Notification` is Prisma-owned. The same ruling that unblocks `ai_tasks`
    unblocks this.
    """
    logger.warning("notification dispatch is blocked for user %s: %s", user_id, D4_BLOCKED)
    return blocked(
        D4_BLOCKED,
        "In-app notifications are Prisma `Notification` rows, which a Celery "
        "worker cannot write. Writing the retired SQLAlchemy duplicate would "
        "create a row the operator console never reads.",
        user_id=user_id,
        notification_type=type,
        title=title,
        target_table="Notification",
    )


@celery_app.task(bind=True, name="app.jobs.tasks.notification_tasks.send_email_notification")
def send_email_notification(
    self,
    to: str,
    template: str,
    variables: dict,
    workspace_id: str | None = None,
) -> dict:
    """Send a transactional email and record the attempt.

    `EmailService` writes an `email_logs` row for every send, including
    failures, so an undelivered notification leaves a trace. It runs in mock
    mode without `RESEND_API_KEY` - the log records that too, rather than
    reporting a delivery that did not occur.
    """
    logger.info("Sending email to %s (template=%s)", to, template)

    if not to:
        return blocked(
            REASON_NO_RECIPIENT, "No recipient address was supplied.", template=template
        )

    async def _run() -> dict:
        db = SessionLocal()
        try:
            service = EmailService(db_session=db)
            return await service.send_template(
                to=to,
                template_name=template,
                variables=variables or {},
                workspace_id=workspace_id,
            )
        finally:
            db.close()

    try:
        outcome = asyncio.run(_run())
    except Exception as exc:
        logger.exception("Email send failed to %s", to)
        raise self.retry(exc=exc, countdown=30, max_retries=3)

    if outcome.get("status") != "sent":
        return blocked(
            REASON_SEND_FAILED,
            f"The provider did not accept the message: {outcome.get('status')}",
            to=to,
            template=template,
            provider_response=outcome,
        )

    return done(to=to, template=template, message_id=outcome.get("id"))


@celery_app.task(bind=True, name="app.jobs.tasks.notification_tasks.send_weekly_digest")
def send_weekly_digest(self, workspace_id: str) -> dict:
    """Compile and send a workspace's weekly activity digest.

    The digest covers **FastAPI-owned activity only** - evidence gathered and
    flagged in the last seven days. Client, offer and deliverable activity is
    Prisma-owned and is not reachable from a worker, so it is deliberately
    absent rather than reported as zero. The email says so; a digest that
    silently omits half the platform's activity would be read as a quiet week.

    Sending to nobody is not a success. Where the workspace has no resolvable
    owner address, this returns blocked rather than `recipients: 0, "sent"`.
    """
    logger.info("Generating weekly digest for workspace %s", workspace_id)
    db = SessionLocal()
    try:
        workspace = (
            db.query(Workspace).filter(Workspace.id == workspace_id).first()
        )
        if workspace is None:
            return blocked(
                REASON_NO_RECIPIENT,
                f"No workspace {workspace_id} exists.",
                workspace_id=workspace_id,
            )

        recipient = (workspace.settings or {}).get("digest_email")
        if not recipient:
            # The owner's address lives in the Prisma `User` table under D4,
            # which a worker cannot read. Until a digest recipient is
            # configured on the workspace, there is nobody to send to - and
            # saying so beats reporting a send.
            return blocked(
                REASON_NO_RECIPIENT,
                "No digest_email is configured on the workspace, and owner "
                "addresses live in the Prisma User table which a worker "
                "cannot read.",
                workspace_id=workspace_id,
            )

        since = datetime.now(timezone.utc) - timedelta(days=7)
        evidence_added = (
            db.query(Evidence)
            .filter(
                Evidence.workspace_id == workspace_id,
                Evidence.created_at >= since,
            )
            .count()
        )
        evidence_total = (
            db.query(Evidence).filter(Evidence.workspace_id == workspace_id).count()
        )

        html = _digest_html(workspace.name, evidence_added, evidence_total)

        async def _run() -> dict:
            service = EmailService(db_session=db)
            return await service.send(
                to=recipient,
                subject=f"{workspace.name} — weekly activity",
                html_body=html,
                workspace_id=workspace_id,
                template_name="weekly_digest",
            )

        outcome = asyncio.run(_run())

        if outcome.get("status") != "sent":
            return blocked(
                REASON_SEND_FAILED,
                f"The provider did not accept the digest: {outcome.get('status')}",
                workspace_id=workspace_id,
                provider_response=outcome,
            )

        logger.info(
            "Weekly digest sent for %s to %s (%d new evidence records)",
            workspace_id,
            recipient,
            evidence_added,
        )
        return done(
            workspace_id=workspace_id,
            recipients=1,
            evidence_added=evidence_added,
            evidence_total=evidence_total,
            message_id=outcome.get("id"),
        )
    except Exception as exc:
        logger.exception("Weekly digest failed for workspace %s", workspace_id)
        db.rollback()
        raise self.retry(exc=exc, countdown=120, max_retries=2)
    finally:
        db.close()


def _digest_html(workspace_name: str, added: int, total: int) -> str:
    """The digest body.

    States its own scope. A digest that quietly covers only part of the
    platform would be read as a complete picture of a quiet week.
    """
    return (
        f"<h2>{workspace_name} — weekly activity</h2>"
        f"<p><strong>{added}</strong> evidence records added in the last seven "
        f"days ({total} in total).</p>"
        "<p style=\"color:#666;font-size:13px\">This digest currently covers "
        "evidence activity only. Client, offer and deliverable activity is not "
        "yet included.</p>"
    )
