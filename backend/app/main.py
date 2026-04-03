"""ChamberForge API — Main Application Entry Point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging_config import setup_logging
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

# --- Middleware ---
from app.middleware.security_headers import SecurityHeadersMiddleware  # noqa: E402
from app.middleware.rate_limiter import RateLimiterMiddleware  # noqa: E402
from app.middleware.request_logging import RequestLoggingMiddleware  # noqa: E402
from app.middleware.performance import PerformanceMiddleware  # noqa: E402
from app.middleware.audit import AuditMiddleware  # noqa: E402
from app.middleware.tenant import TenantMiddleware  # noqa: E402
from app.middleware.compression import GZipMiddleware  # noqa: E402

app.add_middleware(GZipMiddleware, minimum_size=1000)
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

# --- Consolidated v1 Router ---
from app.api.v1.router import router as v1_router  # noqa: E402

app.include_router(v1_router)


@app.on_event("startup")
async def startup():
    from app.core.search_init import init_search

    await init_search()


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
