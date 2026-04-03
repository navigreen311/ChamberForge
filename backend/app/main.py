"""ChamberForge API — Main Application Entry Point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

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


# ---- Routers ----
from app.api.v1.email import router as email_router  # noqa: E402

app.include_router(email_router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
