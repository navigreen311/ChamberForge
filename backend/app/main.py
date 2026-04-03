"""ChamberForge API — Main Application Entry Point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.playbooks import router as playbooks_router

# --- Application ---
app = FastAPI(
    title="ChamberForge API",
    description="Premium-service operating system for HNW/UHNW market",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# --- Logging & Monitoring ---
setup_logging()
init_sentry(dsn=settings.SENTRY_DSN, environment=settings.APP_ENV)

# --- Middleware (outermost first) ---
from app.middleware.security_headers import SecurityHeadersMiddleware  # noqa: E402
from app.middleware.rate_limiter import RateLimiterMiddleware  # noqa: E402
from app.middleware.request_logging import RequestLoggingMiddleware  # noqa: E402
from app.middleware.performance import PerformanceMiddleware  # noqa: E402

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimiterMiddleware, default_limit=100, window_seconds=60)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(PerformanceMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
app.include_router(playbooks_router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
