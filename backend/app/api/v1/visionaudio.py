"""VisionAudioForge API router — all 8 integration touchpoints."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.integrations.visionaudio_client import VisionAudioForgeClient
from app.services.integrations.visionaudio_delivery import DeliveryPortal
from app.services.integrations.visionaudio_proof import ProofVisuals
from app.services.integrations.visionaudio_trust_pack import TrustPackVisuals
from app.services.integrations.visionaudio_brand import BrandStudio
from app.services.integrations.visionaudio_gtm import GTMAssets
from app.services.integrations.visionaudio_authority import AuthorityContent
from app.services.integrations.visionaudio_trainer import VideoTrainer

router = APIRouter(prefix="/api/v1/visionaudio", tags=["visionaudio"])

# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class QuarterlyReportRequest(BaseModel):
    metrics: dict[str, Any]
    narrative: str


class KPIDashboardRequest(BaseModel):
    kpis: dict[str, Any]


class ScorecardRequest(BaseModel):
    before_data: dict[str, Any]
    after_data: dict[str, Any]


class WalkthroughRequest(BaseModel):
    case_study_data: dict[str, Any]


class TrustPackRequest(BaseModel):
    trust_data: dict[str, Any]


class CredibilityDeckRequest(BaseModel):
    credentials: dict[str, Any]


class BrandIdentityRequest(BaseModel):
    brand_config: dict[str, Any]


class BrandTemplatesRequest(BaseModel):
    brand_identity: dict[str, Any]


class VideoAdRequest(BaseModel):
    script: dict[str, Any]
    brand_identity: dict[str, Any]


class LandingVisualsRequest(BaseModel):
    offer_data: dict[str, Any]
    brand_identity: dict[str, Any]


class VideoClipRequest(BaseModel):
    topic: str
    talking_points: list[str]
    style: str = "thought_leader"


class DataStoryRequest(BaseModel):
    data: dict[str, Any]
    narrative: str


class TrainingVideoRequest(BaseModel):
    module_content: dict[str, Any]
    visual_demos: list[dict[str, Any]] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Shared client factory
# ---------------------------------------------------------------------------


def _client() -> VisionAudioForgeClient:
    return VisionAudioForgeClient()


# ---------------------------------------------------------------------------
# Delivery
# ---------------------------------------------------------------------------


@router.post("/delivery/quarterly-report")
async def delivery_quarterly_report(body: QuarterlyReportRequest) -> dict[str, Any]:
    async with _client() as c:
        portal = DeliveryPortal(c)
        return await portal.render_quarterly_report(body.metrics, body.narrative)


@router.post("/delivery/kpi-dashboard")
async def delivery_kpi_dashboard(body: KPIDashboardRequest) -> dict[str, Any]:
    async with _client() as c:
        portal = DeliveryPortal(c)
        return await portal.render_kpi_dashboard(body.kpis)


# ---------------------------------------------------------------------------
# Proof
# ---------------------------------------------------------------------------


@router.post("/proof/scorecard")
async def proof_scorecard(body: ScorecardRequest) -> dict[str, Any]:
    async with _client() as c:
        proof = ProofVisuals(c)
        return await proof.create_before_after_scorecard(body.before_data, body.after_data)


@router.post("/proof/walkthrough")
async def proof_walkthrough(body: WalkthroughRequest) -> dict[str, Any]:
    async with _client() as c:
        proof = ProofVisuals(c)
        return await proof.create_proof_walkthrough(body.case_study_data)


# ---------------------------------------------------------------------------
# Trust Pack
# ---------------------------------------------------------------------------


@router.post("/trust-pack/render")
async def trust_pack_render(body: TrustPackRequest) -> dict[str, Any]:
    async with _client() as c:
        tp = TrustPackVisuals(c)
        return await tp.render_trust_package(body.trust_data)


@router.post("/trust-pack/credibility-deck")
async def trust_pack_credibility_deck(body: CredibilityDeckRequest) -> dict[str, Any]:
    async with _client() as c:
        tp = TrustPackVisuals(c)
        return await tp.render_credibility_deck(body.credentials)


# ---------------------------------------------------------------------------
# Brand
# ---------------------------------------------------------------------------


@router.post("/brand/identity")
async def brand_identity(body: BrandIdentityRequest) -> dict[str, Any]:
    async with _client() as c:
        studio = BrandStudio(c)
        return await studio.generate_identity(body.brand_config)


@router.post("/brand/templates")
async def brand_templates(body: BrandTemplatesRequest) -> list[dict[str, Any]]:
    async with _client() as c:
        studio = BrandStudio(c)
        return await studio.generate_templates(body.brand_identity)


# ---------------------------------------------------------------------------
# GTM
# ---------------------------------------------------------------------------


@router.post("/gtm/video-ad")
async def gtm_video_ad(body: VideoAdRequest) -> dict[str, Any]:
    async with _client() as c:
        gtm = GTMAssets(c)
        return await gtm.create_video_ad(body.script, body.brand_identity)


@router.post("/gtm/landing")
async def gtm_landing(body: LandingVisualsRequest) -> dict[str, Any]:
    async with _client() as c:
        gtm = GTMAssets(c)
        return await gtm.create_landing_visuals(body.offer_data, body.brand_identity)


# ---------------------------------------------------------------------------
# Authority
# ---------------------------------------------------------------------------


@router.post("/authority/clip")
async def authority_clip(body: VideoClipRequest) -> dict[str, Any]:
    async with _client() as c:
        auth = AuthorityContent(c)
        return await auth.create_video_clip(body.topic, body.talking_points, body.style)


@router.post("/authority/data-story")
async def authority_data_story(body: DataStoryRequest) -> dict[str, Any]:
    async with _client() as c:
        auth = AuthorityContent(c)
        return await auth.create_data_story(body.data, body.narrative)


# ---------------------------------------------------------------------------
# Trainer
# ---------------------------------------------------------------------------


@router.post("/trainer/video")
async def trainer_video(body: TrainingVideoRequest) -> dict[str, Any]:
    async with _client() as c:
        trainer = VideoTrainer(c)
        return await trainer.create_training_video(body.module_content, body.visual_demos)


@router.get("/trainer/progress/{trainee_id}")
async def trainer_progress(trainee_id: str) -> dict[str, Any]:
    async with _client() as c:
        trainer = VideoTrainer(c)
        return await trainer.get_certification_progress(trainee_id)


# ---------------------------------------------------------------------------
# Render status (shared)
# ---------------------------------------------------------------------------


@router.get("/render/{render_id}/status")
async def render_status(render_id: str) -> dict[str, Any]:
    async with _client() as c:
        return await c.get_render_status(render_id)
