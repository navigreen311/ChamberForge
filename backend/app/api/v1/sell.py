"""Sell & Retain API — Router for all 13 sell/retain modules."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.agents.copy_ai import CopyAI
from app.services.agents.relationship_ai import RelationshipAI
from app.services.backbone.marketing_engine import MarketingEngine
from app.services.backbone.revenue_projector import RevenueProjector
from app.services.backbone.partner_builder import PartnerBuilder
from app.services.backbone.trust_network import TrustNetwork, GatekeeperType, ReferralStatus
from app.services.backbone.gtm_lab import GTMLab
from app.services.backbone.authority_positioning import AuthorityPositioning
from app.services.backbone.outcome_intelligence import OutcomeIntelligence
from app.services.backbone.client_onboarding import ClientOnboarding
from app.services.backbone.persona_simulator import PersonaSimulator
from app.services.backbone.client_retention import ClientRetention
from app.services.backbone.decision_room import DecisionRoom
from app.services.backbone.proof_reputation import ProofReputation
from app.services.backbone.expert_network import ExpertNetwork

router = APIRouter(prefix="/api/v1/sell", tags=["sell"])

# ── Service singletons (in-memory for now) ──────────────────────────
copy_ai = CopyAI()
relationship_ai = RelationshipAI()
marketing_engine = MarketingEngine()
trust_network = TrustNetwork()
gtm_lab = GTMLab()
authority_pos = AuthorityPositioning()
outcome_intel = OutcomeIntelligence()
onboarding = ClientOnboarding()
persona_sim = PersonaSimulator()
retention = ClientRetention()
decision_room = DecisionRoom()
proof_rep = ProofReputation()
expert_net = ExpertNetwork()


# ── Request/Response Models ──────────────────────────────────────────

class OfferData(BaseModel):
    name: str = "Premium Service"
    target_market: str = "high-net-worth individuals"
    industry: str = "premium services"
    price: float | str = "premium"
    pain_points: list[str] = []
    outcomes: list[str] = []
    differentiators: list[str] = []
    expertise_areas: list[str] = []


class BuyerProfile(BaseModel):
    name: str = "the prospect"
    role: str = "decision-maker"
    industry: str = "business"
    company: str = "Target Organization"
    pain_points: list[str] = []
    deal_size: str = "high-value"
    org_size: str = "mid-market"
    decision_maker: str = "CEO"


class OutreachRequest(BaseModel):
    offer_data: OfferData
    buyer_profile: BuyerProfile


class RevenueRequest(BaseModel):
    monthly_price: float
    clients_month_1: int
    growth_rate: float
    churn_rate: float
    months: int = 12


class HeadlineTestRequest(BaseModel):
    name: str
    variants: list[str]
    target_audience: str = ""


class PriceAnchorRequest(BaseModel):
    target_price: float
    num_tiers: int = 3


class ContentPlanRequest(BaseModel):
    brand_name: str
    expertise_areas: list[str]
    target_audience: str
    cadence_weeks: int = 12


class KPIRequest(BaseModel):
    name: str
    category: str
    target_value: float
    unit: str = ""
    frequency: str = "monthly"


class MeasurementRequest(BaseModel):
    kpi_id: str
    value: float
    period: str = ""
    notes: str = ""


class OnboardingRequest(BaseModel):
    client_name: str
    service_type: str
    start_date: str | None = None
    vip: bool = False


class PersonaSessionRequest(BaseModel):
    persona_name: str
    persona_role: str
    persona_traits: list[str]
    scenario: str
    difficulty: str = "medium"


class ChatMessageRequest(BaseModel):
    session_id: str
    message: str


class RetentionClientRequest(BaseModel):
    client_id: str
    client_name: str
    contract_start: str
    contract_months: int = 12
    monthly_value: float = 0.0


class MetricsUpdateRequest(BaseModel):
    engagement: float | None = None
    satisfaction: float | None = None
    usage: float | None = None
    payment_history: float | None = None


class DealRequest(BaseModel):
    deal_name: str
    description: str = ""
    required_approvals: int = 0


class StakeholderRequest(BaseModel):
    name: str
    role: str
    influence: str = "medium"
    stance: str = "neutral"
    must_approve: bool = False


class CaseStudyRequest(BaseModel):
    client_name: str
    industry: str
    challenge: str
    solution: str
    results: list[dict] = []
    quote: str = ""


class TestimonialRequest(BaseModel):
    client_name: str
    client_email: str
    service_type: str
    prompt_questions: list[str] | None = None


class ExpertRequest(BaseModel):
    name: str
    title: str
    specializations: list[str]
    credentials: list[dict] = []
    contact_email: str = ""
    bio: str = ""
    hourly_rate: float = 0.0


class TrustChannelsRequest(BaseModel):
    channels: list[str]


# ── CopyAI Endpoints ────────────────────────────────────────────────

@router.post("/copy/positioning")
async def generate_positioning(offer: OfferData):
    return await copy_ai.generate_positioning(offer.model_dump())


@router.post("/copy/outreach")
async def generate_outreach(req: OutreachRequest):
    return await copy_ai.generate_outreach(
        req.offer_data.model_dump(), req.buyer_profile.model_dump()
    )


@router.post("/copy/authority-content")
async def generate_authority_content(offer: OfferData):
    return await copy_ai.generate_authority_content(offer.model_dump())


# ── RelationshipAI Endpoints ────────────────────────────────────────

@router.post("/relationships/gatekeepers")
async def map_gatekeepers(buyer: BuyerProfile):
    return await relationship_ai.map_gatekeepers(buyer.model_dump())


@router.post("/relationships/referral-paths")
async def design_referral_paths(offer: OfferData):
    return await relationship_ai.design_referral_paths(offer.model_dump())


@router.post("/relationships/trust-scores")
async def score_trust_channels(req: TrustChannelsRequest):
    return await relationship_ai.score_trust_channels(req.channels)


# ── MarketingEngine Endpoints ───────────────────────────────────────

@router.post("/marketing/dream-100")
async def generate_dream_100(offer: OfferData):
    return marketing_engine.generate_dream_100(offer.model_dump())


# ── RevenueProjector Endpoints ──────────────────────────────────────

@router.post("/revenue/project")
async def project_revenue(req: RevenueRequest):
    return RevenueProjector.project_revenue(
        monthly_price=req.monthly_price,
        clients_month_1=req.clients_month_1,
        growth_rate=req.growth_rate,
        churn_rate=req.churn_rate,
        months=req.months,
    )


# ── PartnerBuilder Endpoints ────────────────────────────────────────

@router.get("/partners/ecosystem/{pain_category}")
async def map_ecosystem(pain_category: str):
    return PartnerBuilder.map_ecosystem(pain_category)


# ── TrustNetwork Endpoints ──────────────────────────────────────────

@router.get("/trust-network/{deal_id}")
async def get_trust_map(deal_id: str):
    return trust_network.get_trust_map_summary(deal_id)


# ── GTMLab Endpoints ────────────────────────────────────────────────

@router.post("/gtm/headline-test")
async def create_headline_test(req: HeadlineTestRequest):
    return gtm_lab.create_headline_test(req.name, req.variants, req.target_audience)


@router.post("/gtm/price-anchoring")
async def generate_price_anchoring(req: PriceAnchorRequest):
    return GTMLab.generate_price_anchoring(req.target_price, req.num_tiers)


# ── AuthorityPositioning Endpoints ──────────────────────────────────

@router.post("/authority/content-plan")
async def create_content_plan(req: ContentPlanRequest):
    return authority_pos.create_content_plan(
        req.brand_name, req.expertise_areas, req.target_audience, req.cadence_weeks
    )


# ── OutcomeIntelligence Endpoints ───────────────────────────────────

@router.post("/outcomes/kpi")
async def define_kpi(req: KPIRequest):
    return outcome_intel.define_kpi(req.name, req.category, req.target_value, req.unit, req.frequency)


@router.post("/outcomes/measurement")
async def record_measurement(req: MeasurementRequest):
    result = outcome_intel.record_measurement(req.kpi_id, req.value, req.period, req.notes)
    if not result:
        raise HTTPException(status_code=404, detail="KPI not found")
    return result


@router.get("/outcomes/scorecard")
async def get_scorecard(quarter: str = ""):
    return outcome_intel.generate_quarterly_scorecard(quarter)


# ── ClientOnboarding Endpoints ──────────────────────────────────────

@router.post("/onboarding/plan")
async def create_onboarding_plan(req: OnboardingRequest):
    plan = onboarding.create_90_day_plan(req.client_name, req.service_type, req.start_date)
    return plan


@router.post("/onboarding/welcome")
async def generate_welcome(req: OnboardingRequest):
    return onboarding.generate_welcome_protocol(req.client_name, req.service_type, req.vip)


# ── PersonaSimulator Endpoints ──────────────────────────────────────

@router.post("/persona/session")
async def create_persona_session(req: PersonaSessionRequest):
    return persona_sim.create_session(
        req.persona_name, req.persona_role, req.persona_traits, req.scenario, req.difficulty
    )


@router.post("/persona/chat")
async def persona_chat(req: ChatMessageRequest):
    result = await persona_sim.send_message(req.session_id, req.message)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found or ended")
    return result


@router.get("/persona/session/{session_id}")
async def get_persona_session(session_id: str):
    session = persona_sim.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/persona/score/{session_id}")
async def score_persona_session(session_id: str):
    result = await persona_sim.score_performance(session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")
    return result


# ── ClientRetention Endpoints ───────────────────────────────────────

@router.post("/retention/client")
async def register_retention_client(req: RetentionClientRequest):
    return retention.register_client(
        req.client_id, req.client_name, req.contract_start, req.contract_months, req.monthly_value
    )


@router.put("/retention/client/{client_id}/metrics")
async def update_client_metrics(client_id: str, req: MetricsUpdateRequest):
    result = retention.update_metrics(
        client_id, req.engagement, req.satisfaction, req.usage, req.payment_history
    )
    if not result:
        raise HTTPException(status_code=404, detail="Client not found")
    return result


@router.get("/retention/client/{client_id}/health")
async def get_client_health(client_id: str):
    result = retention.get_health_score(client_id)
    if not result:
        raise HTTPException(status_code=404, detail="Client not found")
    return result


@router.get("/retention/clients")
async def list_retention_clients():
    return retention.get_all_clients()


@router.get("/retention/client/{client_id}/renewal-cadence")
async def get_renewal_cadence(client_id: str):
    result = retention.generate_renewal_cadence(client_id)
    if not result:
        raise HTTPException(status_code=404, detail="Client not found")
    return result


# ── DecisionRoom Endpoints ──────────────────────────────────────────

@router.post("/decision-room/deal")
async def create_deal(req: DealRequest):
    return decision_room.create_deal(req.deal_name, req.description, req.required_approvals)


@router.post("/decision-room/deal/{deal_id}/stakeholder")
async def add_stakeholder(deal_id: str, req: StakeholderRequest):
    result = decision_room.add_stakeholder(
        deal_id, req.name, req.role, req.influence, req.stance, req.must_approve
    )
    if not result:
        raise HTTPException(status_code=404, detail="Deal not found")
    return result


@router.get("/decision-room/deal/{deal_id}/map")
async def get_stakeholder_map(deal_id: str):
    result = decision_room.get_stakeholder_map(deal_id)
    if not result:
        raise HTTPException(status_code=404, detail="Deal not found")
    return result


# ── ProofReputation Endpoints ───────────────────────────────────────

@router.post("/proof/case-study")
async def create_case_study(req: CaseStudyRequest):
    return proof_rep.create_case_study(
        req.client_name, req.industry, req.challenge, req.solution, req.results, req.quote
    )


@router.post("/proof/testimonial")
async def request_testimonial(req: TestimonialRequest):
    return proof_rep.request_testimonial(
        req.client_name, req.client_email, req.service_type, req.prompt_questions
    )


@router.get("/proof/summary")
async def get_proof_summary():
    return proof_rep.get_proof_summary()


# ── ExpertNetwork Endpoints ─────────────────────────────────────────

@router.post("/experts")
async def add_expert(req: ExpertRequest):
    return expert_net.add_expert(
        req.name, req.title, req.specializations, req.credentials,
        req.contact_email, req.bio, req.hourly_rate,
    )


@router.get("/experts")
async def list_experts(specialization: str | None = None, verified_only: bool = False):
    return expert_net.list_experts(specialization, verified_only)


@router.get("/experts/{expert_id}")
async def get_expert(expert_id: str):
    result = expert_net.get_expert(expert_id)
    if not result:
        raise HTTPException(status_code=404, detail="Expert not found")
    return result


@router.delete("/experts/{expert_id}")
async def remove_expert(expert_id: str):
    if not expert_net.remove_expert(expert_id):
        raise HTTPException(status_code=404, detail="Expert not found")
    return {"status": "removed"}


@router.get("/experts/verification/summary")
async def get_verification_summary():
    return expert_net.get_verification_summary()
