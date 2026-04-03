"""ChamberForge API — Main Application Entry Point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.api.v1.security import router as security_router

app = FastAPI(
    title="ChamberForge API",
    description="Premium-service operating system for HNW/UHNW market",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# --- Middleware (outermost first) ---
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    RateLimiterMiddleware,
    default_limit=100,
    window_seconds=60,
    endpoint_overrides={
        "/api/v1/security/check-output": (20, 60),
    },
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(security_router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
