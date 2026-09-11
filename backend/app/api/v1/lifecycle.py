"""Lifecycle API — Endpoints for all 9 Client Lifecycle modules."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.core.dependencies import get_workspace_id
from app.services.backbone import (
    AlumniSystem,
    ClientHealth,
    IntelBrief,
    MoatTracker,
    MobileAccess,
    OfferBrand,
    ScenarioPlanner,
    SunsetProtocol,
    TeamTrainer,
)

router = APIRouter(prefix="/api/v1/lifecycle", tags=["lifecycle"])

# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class IntelBriefRequest(BaseModel):
    client_data: dict = Field(default_factory=dict)
    meeting_context: str = ""


class BrandNameRequest(BaseModel):
    offer_data: dict


class BrandPositioningRequest(BaseModel):
    name: str
    offer_data: dict


class TouchpointRequest(BaseModel):
    touchpoint_type: str
    scheduled_date: str


class PricingCheckRequest(BaseModel):
    current_price: float
    market_benchmarks: list[float]


class TransitionPlanRequest(BaseModel):
    offer_data: dict
    client_count: int


class ProgressRequest(BaseModel):
    trainee_id: str
    completed_modules: list[str]


class ScenarioRequest(BaseModel):
    base_price: float
    base_clients: int
    adjustments: dict = Field(default_factory=dict)


class HealthScoreRequest(BaseModel):
    engagement: float
    satisfaction: float
    usage: float
    payment: float


# ---------------------------------------------------------------------------
# Intel Brief
# ---------------------------------------------------------------------------

@router.post("/intel-brief/{client_id}")
async def create_intel_brief(client_id: str, body: IntelBriefRequest, workspace_id: str = Depends(get_workspace_id)):
    brief = IntelBrief()
    data = body.client_data
    data.setdefault("client_id", client_id)
    return await brief.generate_brief(data, body.meeting_context)


# ---------------------------------------------------------------------------
# Client Health
# ---------------------------------------------------------------------------

@router.post("/health/score")
async def compute_health_score(
    body: HealthScoreRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    score = ClientHealth.calculate_health_score(
        body.engagement, body.satisfaction, body.usage, body.payment
    )
    return {"score": score}


@router.get("/health/{client_id}")
async def get_client_health(client_id: str, workspace_id: str = Depends(get_workspace_id)):
    """Get current health + churn detection for a client."""
    trend = await ClientHealth.get_health_trend(None, client_id)
    scores = [t["score"] for t in trend]
    churn = ClientHealth.detect_churn_signals(scores)
    return {
        "client_id": client_id,
        "latest_score": scores[-1] if scores else None,
        "churn_analysis": churn,
    }


@router.get("/health/trend/{client_id}")
async def get_health_trend(
    client_id: str,
    months: int = Query(6,
    ge=1,
    le=24),
    workspace_id: str = Depends(get_workspace_id),
):
    trend = await ClientHealth.get_health_trend(None, client_id, months)
    return {"client_id": client_id, "trend": trend}


# ---------------------------------------------------------------------------
# Offer Brand
# ---------------------------------------------------------------------------

@router.post("/brand/name")
async def generate_brand_name(
    body: BrandNameRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    brand = OfferBrand()
    return await brand.generate_name(body.offer_data)


@router.post("/brand/positioning")
async def generate_brand_positioning(
    body: BrandPositioningRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    brand = OfferBrand()
    return await brand.generate_positioning(body.name, body.offer_data)


# ---------------------------------------------------------------------------
# Alumni
# ---------------------------------------------------------------------------

@router.get("/alumni")
async def list_alumni(workspace_id: str = Depends(get_workspace_id)):
    return await AlumniSystem.get_referral_candidates(None, workspace_id)


@router.post("/alumni/{client_id}")
async def create_alumni(
    client_id: str,
    final_deliverables: list[str] = [],
    workspace_id: str = Depends(get_workspace_id),
):
    return AlumniSystem.create_alumni_record(None, client_id, final_deliverables)


@router.post("/alumni/{client_id}/touchpoint")
async def schedule_alumni_touchpoint(
    client_id: str,
    body: TouchpointRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    return AlumniSystem.schedule_touchpoint(
        None, client_id, body.touchpoint_type, body.scheduled_date
    )


@router.get("/alumni/{client_id}/reentry")
async def get_reentry_path(
    client_id: str,
    workspace_id: str = Depends(get_workspace_id),
):
    return await AlumniSystem.get_reentry_path(None, client_id)


# ---------------------------------------------------------------------------
# Moat Tracker
# ---------------------------------------------------------------------------

@router.get("/moat/competitors/{pain_category}")
async def scan_competitors(
    pain_category: str,
    workspace_id: str = Depends(get_workspace_id),
):
    return MoatTracker.scan_competitors(pain_category)


@router.post("/moat/pricing-check")
async def check_pricing_compression(
    body: PricingCheckRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    return MoatTracker.detect_pricing_compression(
        body.current_price, body.market_benchmarks
    )


# ---------------------------------------------------------------------------
# Sunset Protocol
# ---------------------------------------------------------------------------

@router.post("/sunset/transition-plan")
async def create_transition_plan(
    body: TransitionPlanRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    return SunsetProtocol.generate_transition_plan(
        body.offer_data, body.client_count
    )


# ---------------------------------------------------------------------------
# Team Trainer
# ---------------------------------------------------------------------------

@router.get("/trainer/curriculum/{role}")
async def get_curriculum(
    role: str,
    workspace_id: str = Depends(get_workspace_id),
):
    return TeamTrainer.get_curriculum(role)


@router.post("/trainer/progress")
async def assess_trainer_progress(
    body: ProgressRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    return TeamTrainer.assess_progress(body.trainee_id, body.completed_modules)


# ---------------------------------------------------------------------------
# Scenario Planner
# ---------------------------------------------------------------------------

@router.post("/scenario")
async def run_scenario(
    body: ScenarioRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    return ScenarioPlanner.run_scenario(
        body.base_price, body.base_clients, body.adjustments
    )


# ---------------------------------------------------------------------------
# Mobile Access
# ---------------------------------------------------------------------------

@router.get("/mobile/brief/{client_id}")
async def get_mobile_brief(
    client_id: str,
    workspace_id: str = Depends(get_workspace_id),
):
    return await MobileAccess.get_mobile_brief(None, client_id)


@router.get("/mobile/approvals")
async def get_pending_approvals(user_id: str = Query("current-user"), workspace_id: str = Depends(get_workspace_id)):
    return await MobileAccess.get_pending_approvals(None, user_id)


@router.get("/mobile/alerts")
async def get_active_alerts(user_id: str = Query("current-user"), workspace_id: str = Depends(get_workspace_id)):
    return await MobileAccess.get_active_alerts(None, user_id)
