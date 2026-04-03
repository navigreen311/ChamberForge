"""ChamberForge API — Main Application Entry Point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.command import router as command_router
from app.core.config import settings
from app.api.v1.search import router as search_router

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

app.include_router(primitives_router)
app.include_router(admin_router)


app.include_router(command_router)


from app.api.v1.voiceforge import router as voiceforge_router

app.include_router(voiceforge_router)


from app.api.v1.visionaudio import router as visionaudio_router

app.include_router(visionaudio_router)


app.include_router(search_router)


from app.api.v1.notifications import router as notifications_router

app.include_router(notifications_router)


# ---- Routers ----
from app.api.v1.email import router as email_router  # noqa: E402

app.include_router(email_router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
