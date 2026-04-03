"""ChamberForge API — Main Application Entry Point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.evidence import router as evidence_router
from app.core.config import settings
from app.api.v1.offers import router as offers_router

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

# ── Routers ──────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(workspaces_router)
app.include_router(problems_router)
app.include_router(discovery_router)


app.include_router(evidence_router)


app.include_router(qualify_router)


app.include_router(offers_router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
