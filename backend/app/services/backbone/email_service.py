"""Email service — Resend integration with automatic mock fallback.

Uses the real Resend SDK when RESEND_API_KEY is configured,
otherwise falls back to a lightweight mock that logs sends.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any

from app.core.config import settings
from app.services.backbone.email_templates import render_template

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Mock Resend client (used when no API key is present)
# ---------------------------------------------------------------------------

class _MockResendEmails:
    """Drop-in replacement for resend.Emails that logs instead of sending."""

    def send(self, params: dict) -> dict:
        msg_id = str(uuid.uuid4())
        logger.info(
            "[MockResend] email to=%s subject=%s id=%s",
            params.get("to"),
            params.get("subject"),
            msg_id,
        )
        return {"id": msg_id}


class _MockResendClient:
    """Minimal mock mirroring the resend module interface."""

    class Emails:
        """Class-level accessor matching resend.Emails."""

        @staticmethod
        def send(params: dict) -> dict:
            return _MockResendEmails().send(params)

    def __init__(self) -> None:
        self.api_key = "mock_key"


# ---------------------------------------------------------------------------
# EmailService
# ---------------------------------------------------------------------------

class EmailService:
    """Send transactional emails via Resend (or mock)."""

    def __init__(self, db_session: Any | None = None) -> None:
        self.db = db_session
        self._use_mock = not settings.RESEND_API_KEY

        if self._use_mock:
            logger.warning("RESEND_API_KEY not set — using mock email client")
            self._client = _MockResendClient()
        else:
            import resend  # noqa: F811

            resend.api_key = settings.RESEND_API_KEY
            self._client = resend  # type: ignore[assignment]

    # ------------------------------------------------------------------
    # Core send
    # ------------------------------------------------------------------

    async def send(
        self,
        to: str,
        subject: str,
        html_body: str,
        from_email: str = "noreply@chamberforge.com",
        workspace_id: str | None = None,
        template_name: str | None = None,
        extra_metadata: dict | None = None,
    ) -> dict:
        """Send a single email and log the result.

        Returns ``{"id": "<msg-id>", "status": "sent" | "failed"}``.
        """
        params = {
            "from": f"ChamberForge <{from_email}>",
            "to": [to],
            "subject": subject,
            "html": html_body,
        }

        try:
            result = self._client.Emails.send(params)
            msg_id = result.get("id") if isinstance(result, dict) else getattr(result, "id", str(result))
            status = "sent"
        except Exception as exc:
            logger.error("Email send failed to=%s error=%s", to, exc)
            msg_id = None
            status = "failed"

        # Persist to DB when a session is available
        if self.db is not None:
            await self._log(
                workspace_id=workspace_id,
                to_email=to,
                subject=subject,
                template=template_name,
                status=status,
                metadata=extra_metadata or {},
            )

        return {"id": msg_id, "status": status}

    # ------------------------------------------------------------------
    # Template send
    # ------------------------------------------------------------------

    async def send_template(
        self,
        to: str,
        template_name: str,
        variables: dict,
        from_email: str = "noreply@chamberforge.com",
        workspace_id: str | None = None,
    ) -> dict:
        """Render *template_name* with *variables* and send."""
        rendered = render_template(template_name, variables)
        return await self.send(
            to=to,
            subject=rendered["subject"],
            html_body=rendered["html_body"],
            from_email=from_email,
            workspace_id=workspace_id,
            template_name=template_name,
            extra_metadata={"variables": variables},
        )

    # ------------------------------------------------------------------
    # Batch send
    # ------------------------------------------------------------------

    async def send_batch(
        self,
        recipients: list[dict],
        template_name: str,
        shared_vars: dict,
        from_email: str = "noreply@chamberforge.com",
        workspace_id: str | None = None,
    ) -> dict:
        """Send the same template to many recipients.

        Each item in *recipients* must have ``"to"`` and optionally
        per-recipient variables that override *shared_vars*.

        Returns ``{"sent": int, "failed": int, "results": [...]}``.
        """
        sent = 0
        failed = 0
        results: list[dict] = []

        for recipient in recipients:
            to = recipient["to"]
            merged_vars = {**shared_vars, **{k: v for k, v in recipient.items() if k != "to"}}
            result = await self.send_template(
                to=to,
                template_name=template_name,
                variables=merged_vars,
                from_email=from_email,
                workspace_id=workspace_id,
            )
            if result["status"] == "sent":
                sent += 1
            else:
                failed += 1
            results.append({"to": to, **result})

        return {"sent": sent, "failed": failed, "results": results}

    # ------------------------------------------------------------------
    # DB logging helper
    # ------------------------------------------------------------------

    async def _log(
        self,
        workspace_id: str | None,
        to_email: str,
        subject: str,
        template: str | None,
        status: str,
        metadata: dict,
    ) -> None:
        """Persist an EmailLog row."""
        from app.models.email_log import EmailLog

        log_entry = EmailLog(
            workspace_id=workspace_id or uuid.uuid4(),
            to_email=to_email,
            subject=subject,
            template=template,
            status=status,
            metadata_=metadata,
            sent_at=datetime.utcnow(),
        )
        self.db.add(log_entry)
        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            logger.exception("Failed to persist email log for %s", to_email)
