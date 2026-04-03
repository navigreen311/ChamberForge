"""Startup environment variable validation — warn but don't crash."""
import logging

from app.core.config import settings

logger = logging.getLogger("chamberforge.env_validator")


def validate_environment() -> dict:
    """Check required and optional env vars, log warnings for missing ones."""
    warnings: list[str] = []
    errors: list[str] = []

    # Critical (app won't work correctly without these)
    if settings.JWT_SECRET in ("changeme", ""):
        errors.append(
            "JWT_SECRET is not set or using default — CHANGE THIS IN PRODUCTION"
        )

    if "sqlite" in settings.DATABASE_URL:
        warnings.append("Using SQLite database — use PostgreSQL for production")

    # Important (features degraded without these)
    optional_checks = {
        "ANTHROPIC_API_KEY": "AI agents will use mock/fallback data",
        "STRIPE_SECRET_KEY": "Billing features will use mock mode",
        "RESEND_API_KEY": "Email sending will be logged but not delivered",
        "AWS_ACCESS_KEY_ID": "File storage will use in-memory mock",
        "ELASTICSEARCH_URL": "Search will fall back to database queries",
    }

    for var, msg in optional_checks.items():
        if not getattr(settings, var, ""):
            warnings.append(f"{var} not set — {msg}")

    # Log results
    if errors:
        for e in errors:
            logger.error("ENV ERROR: %s", e)
    if warnings:
        for w in warnings:
            logger.warning("ENV WARNING: %s", w)

    if not errors and not warnings:
        logger.info("All environment variables configured correctly")

    return {"errors": errors, "warnings": warnings}
