"""Sentry error tracking initialization."""
import logging

logger = logging.getLogger("chamberforge.sentry")


def init_sentry(dsn: str | None = None, environment: str = "development") -> None:
    """Initialize Sentry SDK if a DSN is provided."""
    if not dsn:
        logger.info("SENTRY_DSN not set — Sentry error tracking disabled")
        return

    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

        sentry_sdk.init(
            dsn=dsn,
            environment=environment,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ],
            traces_sample_rate=0.1,
            send_default_pii=False,
        )
        logger.info("Sentry initialized for environment=%s", environment)
    except ImportError:
        logger.warning("sentry-sdk not installed — skipping Sentry init")
