"""VisionAudioForge API router — all 8 integration touchpoints.

P-18 (T-008, final slice). All fifteen routes were anonymous, and every one
of them produces a **client-facing deliverable**: a quarterly performance
report, a before/after proof scorecard, a trust pack, a firm's brand
identity, a landing page, a video ad. Anyone who could reach the port could
render any of them, on any firm's partner quota.

They also returned 200 OK when VisionAudioForge did not answer. P-07's
client never raises — it returns a typed degraded envelope — so a caller
reading `output_url` got `None` from a response that looked successful. A
partner that did not answer is now a 503.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.dependencies import get_workspace_id
from app.services.integrations.visionaudio_authority import AuthorityContent
from app.services.integrations.visionaudio_brand import BrandStudio
from app.services.integrations.visionaudio_client import VisionAudioForgeClient
from app.services.integrations.visionaudio_delivery import DeliveryPortal
from app.services.integrations.visionaudio_gtm import GTMAssets
from app.services.integrations.visionaudio_proof import ProofVisuals
from app.services.integrations.visionaudio_trainer import VideoTrainer
from app.services.integrations.visionaudio_trust_pack import TrustPackVisuals

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


# Reasons that mean "the partner did not answer", as opposed to a degraded
# result that is itself a complete answer about the caller's own input.
_PARTNER_DOWN = {
    "partner_not_configured",
    "partner_unavailable",
    "partner_contract_changed",
}


def _unavailable(detail: str) -> HTTPException:
    return HTTPException(status_code=503, detail=detail)


def _gate(result: Any) -> Any:
    """Pass *result* through, or raise 503 if VisionAudioForge did not answer.

    Every route in this file renders something a client eventually sees. A
    200 carrying no `output_url` is indistinguishable from a successful
    render to anything that reads the status code - which is what a queue, a
    retry policy and a UI spinner all do.

    `generate_templates` is the one route returning a list, and its entries
    keep only `render_id` and `status`, so the degraded flag does not survive
    into them. It lives in `visionaudio_brand.py`, which P-07 owns and this
    package must not change, so the check here is on the one thing that is
    observable from outside: not a single template came back with a render
    id, meaning nothing was queued at all.
    """
    if isinstance(result, list):
        if result and all(item.get("render_id") is None for item in result):
            raise _unavailable(
                "VisionAudioForge queued none of the requested renders."
            )
        return result

    if result.get("degraded") and result.get("degraded_reason") in _PARTNER_DOWN:
        raise _unavailable(
            result.get("degraded_detail", "VisionAudioForge did not respond.")
        )
    return result


# ---------------------------------------------------------------------------
# Delivery
# ---------------------------------------------------------------------------


@router.post("/delivery/quarterly-report")
async def delivery_quarterly_report(
    body: QuarterlyReportRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        portal = DeliveryPortal(c)
        return _gate(await portal.render_quarterly_report(body.metrics, body.narrative))


@router.post("/delivery/kpi-dashboard")
async def delivery_kpi_dashboard(
    body: KPIDashboardRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        portal = DeliveryPortal(c)
        return _gate(await portal.render_kpi_dashboard(body.kpis))


# ---------------------------------------------------------------------------
# Proof
# ---------------------------------------------------------------------------


@router.post("/proof/scorecard")
async def proof_scorecard(
    body: ScorecardRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        proof = ProofVisuals(c)
        return _gate(await proof.create_before_after_scorecard(body.before_data, body.after_data))


@router.post("/proof/walkthrough")
async def proof_walkthrough(
    body: WalkthroughRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        proof = ProofVisuals(c)
        return _gate(await proof.create_proof_walkthrough(body.case_study_data))


# ---------------------------------------------------------------------------
# Trust Pack
# ---------------------------------------------------------------------------


@router.post("/trust-pack/render")
async def trust_pack_render(
    body: TrustPackRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        tp = TrustPackVisuals(c)
        return _gate(await tp.render_trust_package(body.trust_data))


@router.post("/trust-pack/credibility-deck")
async def trust_pack_credibility_deck(
    body: CredibilityDeckRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        tp = TrustPackVisuals(c)
        return _gate(await tp.render_credibility_deck(body.credentials))


# ---------------------------------------------------------------------------
# Brand
# ---------------------------------------------------------------------------


@router.post("/brand/identity")
async def brand_identity(
    body: BrandIdentityRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        studio = BrandStudio(c)
        return _gate(await studio.generate_identity(body.brand_config))


@router.post("/brand/templates")
async def brand_templates(
    body: BrandTemplatesRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> list[dict[str, Any]]:
    async with _client() as c:
        studio = BrandStudio(c)
        return _gate(await studio.generate_templates(body.brand_identity))


# ---------------------------------------------------------------------------
# GTM
# ---------------------------------------------------------------------------


@router.post("/gtm/video-ad")
async def gtm_video_ad(
    body: VideoAdRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        gtm = GTMAssets(c)
        return _gate(await gtm.create_video_ad(body.script, body.brand_identity))


@router.post("/gtm/landing")
async def gtm_landing(
    body: LandingVisualsRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        gtm = GTMAssets(c)
        return _gate(await gtm.create_landing_visuals(body.offer_data, body.brand_identity))


# ---------------------------------------------------------------------------
# Authority
# ---------------------------------------------------------------------------


@router.post("/authority/clip")
async def authority_clip(
    body: VideoClipRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        auth = AuthorityContent(c)
        return _gate(await auth.create_video_clip(body.topic, body.talking_points, body.style))


@router.post("/authority/data-story")
async def authority_data_story(
    body: DataStoryRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        auth = AuthorityContent(c)
        return _gate(await auth.create_data_story(body.data, body.narrative))


# ---------------------------------------------------------------------------
# Trainer
# ---------------------------------------------------------------------------


@router.post("/trainer/video")
async def trainer_video(
    body: TrainingVideoRequest,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        trainer = VideoTrainer(c)
        return _gate(await trainer.create_training_video(body.module_content, body.visual_demos))


@router.get("/trainer/progress/{trainee_id}")
async def trainer_progress(
    trainee_id: str,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        trainer = VideoTrainer(c)
        return _gate(await trainer.get_certification_progress(trainee_id))


# ---------------------------------------------------------------------------
# Render status (shared)
# ---------------------------------------------------------------------------


@router.get("/render/{render_id}/status")
async def render_status(
    render_id: str,
    workspace_id: str = Depends(get_workspace_id),
) -> dict[str, Any]:
    async with _client() as c:
        return _gate(await c.get_render_status(render_id))
