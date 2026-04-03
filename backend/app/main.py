"""ChamberForge API — Main Application Entry Point."""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core.sentry_config import init_sentry
from app.middleware.request_logging import RequestLoggingMiddleware
from app.middleware.performance import PerformanceMiddleware
from app.api.v1.health import router as health_router
from app.api.v1.metrics import router as metrics_router

# Structured logging
setup_logging()

# Sentry (only if DSN is set)
init_sentry(
    dsn=os.getenv("SENTRY_DSN"),
    environment=settings.APP_ENV,
)

app = FastAPI(
    title="ChamberForge API",
    description="Premium-service operating system for HNW/UHNW market",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Observability middleware (order matters: performance wraps request_logging)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(PerformanceMiddleware)

# Routers
app.include_router(health_router)
app.include_router(metrics_router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
