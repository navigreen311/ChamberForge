"""ChamberForge API — Main Application Entry Point."""
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.error_handlers import (
    app_exception_handler,
    generic_exception_handler,
    validation_exception_handler,
)
from app.core.exceptions import AppException
from app.core.logging_config import setup_logging
from app.core.datadog_config import init_datadog
from app.core.sentry_config import init_sentry

app = FastAPI(
    title="ChamberForge API",
    description="Premium-service operating system for HNW/UHNW market",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

setup_logging()
init_sentry(dsn=settings.SENTRY_DSN, environment=settings.APP_ENV)
init_datadog()

# --- Exception Handlers ---
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# --- Middleware ---
from app.middleware.security_headers import SecurityHeadersMiddleware  # noqa: E402
from app.middleware.rate_limiter import RateLimiterMiddleware  # noqa: E402
from app.middleware.request_logging import RequestLoggingMiddleware  # noqa: E402
from app.middleware.performance import PerformanceMiddleware  # noqa: E402
from app.middleware.audit import AuditMiddleware  # noqa: E402
from app.middleware.tenant import TenantMiddleware  # noqa: E402
from app.middleware.datadog_metrics import DatadogMetricsMiddleware  # noqa: E402

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(DatadogMetricsMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    RateLimiterMiddleware,
    default_limit=settings.RATE_LIMIT_DEFAULT,
    window_seconds=60,
    workspace_limit=settings.RATE_LIMIT_WORKSPACE,
    endpoint_overrides={
        "/api/v1/discover/scan": (settings.RATE_LIMIT_AI, 60),
        "/api/v1/offers/generate": (settings.RATE_LIMIT_AI, 60),
        "/api/v1/qualify/validate": (settings.RATE_LIMIT_AI, 60),
        "/api/v1/exports": (settings.RATE_LIMIT_EXPORT, 60),
        "/api/v1/auth": (settings.RATE_LIMIT_AUTH, 60),
    },
    jwt_secret=settings.JWT_SECRET,
    jwt_algorithm=settings.JWT_ALGORITHM,
)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(PerformanceMiddleware)
app.add_middleware(AuditMiddleware)
app.add_middleware(TenantMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

# --- All 31 Routers ---
from app.api.v1.auth import router as auth_router  # noqa: E402
from app.api.v1.users import router as users_router  # noqa: E402
from app.api.v1.workspaces import router as workspaces_router  # noqa: E402
from app.api.v1.problems import router as problems_router  # noqa: E402
from app.api.v1.discovery import router as discovery_router  # noqa: E402
from app.api.v1.evidence import router as evidence_router  # noqa: E402
from app.api.v1.qualify import router as qualify_router  # noqa: E402
from app.api.v1.offers import router as offers_router  # noqa: E402
from app.api.v1.build import router as build_router  # noqa: E402
from app.api.v1.household import router as household_router  # noqa: E402
from app.api.v1.billing import router as billing_router  # noqa: E402
from app.api.v1.sell import router as sell_router  # noqa: E402
from app.api.v1.command import router as command_router  # noqa: E402
from app.api.v1.compliance import router as compliance_router  # noqa: E402
from app.api.v1.lifecycle import router as lifecycle_router  # noqa: E402
from app.api.v1.polish import router as polish_router  # noqa: E402
from app.api.v1.primitives import router as primitives_router  # noqa: E402
from app.api.v1.admin import router as admin_router  # noqa: E402
from app.api.v1.playbooks import router as playbooks_router  # noqa: E402
from app.api.v1.voiceforge import router as voiceforge_router  # noqa: E402
from app.api.v1.visionaudio import router as visionaudio_router  # noqa: E402
from app.api.v1.search import router as search_router  # noqa: E402
from app.api.v1.notifications import router as notifications_router  # noqa: E402
from app.api.v1.email import router as email_router  # noqa: E402
from app.api.v1.storage import router as storage_router  # noqa: E402
from app.api.v1.exports import router as exports_router  # noqa: E402
from app.api.v1.jobs import router as jobs_router  # noqa: E402
from app.api.v1.health import router as health_router  # noqa: E402
from app.api.v1.metrics import router as metrics_router  # noqa: E402
from app.api.v1.security import router as security_router  # noqa: E402
from app.api.v1.profile import router as profile_router  # noqa: E402
from app.api.v1.workspace_settings import router as workspace_settings_router  # noqa: E402
from app.api.v1.webhooks.stripe import router as stripe_webhook_router  # noqa: E402

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(workspaces_router)
app.include_router(problems_router)
app.include_router(discovery_router)
app.include_router(evidence_router)
app.include_router(qualify_router)
app.include_router(offers_router)
app.include_router(build_router)
app.include_router(household_router)
app.include_router(billing_router)
app.include_router(sell_router)
app.include_router(command_router)
app.include_router(compliance_router)
app.include_router(lifecycle_router)
app.include_router(polish_router)
app.include_router(primitives_router)
app.include_router(admin_router)
app.include_router(playbooks_router)
app.include_router(voiceforge_router)
app.include_router(visionaudio_router)
app.include_router(search_router)
app.include_router(notifications_router)
app.include_router(email_router)
app.include_router(storage_router)
app.include_router(exports_router)
app.include_router(jobs_router)
app.include_router(health_router)
app.include_router(metrics_router)
app.include_router(security_router)
app.include_router(profile_router)
app.include_router(workspace_settings_router)
app.include_router(stripe_webhook_router)


@app.on_event("startup")
async def startup():
    from app.core.search_init import init_search

    await init_search()


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
