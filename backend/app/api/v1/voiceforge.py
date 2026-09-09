"""VoiceForge API routes — persona sim, audio briefs, crisis, health, trainer."""
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.config import settings
from app.services.integrations.voiceforge_client import VoiceForgeClient
from app.services.integrations.voiceforge_crisis import CrisisEscalation
from app.services.integrations.voiceforge_health import VoiceHealthAnalysis
from app.services.integrations.voiceforge_intel_brief import IntelBriefAudio
from app.services.integrations.voiceforge_persona_sim import PersonaSimIntegration
from app.services.integrations.voiceforge_trainer import VoiceTrainer

router = APIRouter(prefix="/api/v1/voiceforge", tags=["voiceforge"])

# ---------------------------------------------------------------------------
# Shared service instances (lazy-initialized)
# ---------------------------------------------------------------------------
_client: Optional[VoiceForgeClient] = None


def _get_client() -> VoiceForgeClient:
    global _client
    if _client is None:
        _client = VoiceForgeClient(
            api_url=settings.VOICEFORGE_API_URL,
            api_key=settings.VOICEFORGE_API_KEY,
        )
    return _client


def _persona_sim() -> PersonaSimIntegration:
    return PersonaSimIntegration(_get_client())


def _intel_brief() -> IntelBriefAudio:
    return IntelBriefAudio(_get_client())


def _crisis() -> CrisisEscalation:
    return CrisisEscalation(_get_client())


def _health() -> VoiceHealthAnalysis:
    return VoiceHealthAnalysis(_get_client())


def _trainer() -> VoiceTrainer:
    return VoiceTrainer(_get_client())


# Keep stateful services alive across requests
_persona_instance: Optional[PersonaSimIntegration] = None
_crisis_instance: Optional[CrisisEscalation] = None
_trainer_instance: Optional[VoiceTrainer] = None


def _get_persona() -> PersonaSimIntegration:
    global _persona_instance
    if _persona_instance is None:
        _persona_instance = PersonaSimIntegration(_get_client())
    return _persona_instance


def _get_crisis() -> CrisisEscalation:
    global _crisis_instance
    if _crisis_instance is None:
        _crisis_instance = CrisisEscalation(_get_client())
    return _crisis_instance


def _get_trainer() -> VoiceTrainer:
    global _trainer_instance
    if _trainer_instance is None:
        _trainer_instance = VoiceTrainer(_get_client())
    return _trainer_instance


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class PersonaStartRequest(BaseModel):
    persona_type: str = Field(..., description="founder | cfo | inheritor | family_office_principal")
    scenario: str = Field(..., description="Description of the roleplay scenario")


class PersonaMessageRequest(BaseModel):
    user_message: str


class IntelBriefRequest(BaseModel):
    brief_text: str
    voice_style: str = "professional"


class ContactSchema(BaseModel):
    name: str
    phone: str


class CrisisEscalateRequest(BaseModel):
    contacts: list[ContactSchema]
    incident_summary: str


class TrainerStartRequest(BaseModel):
    module_id: str
    trainee_id: str


class HealthTrendsQuery(BaseModel):
    calls: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Persona Simulation
# ---------------------------------------------------------------------------
@router.post("/persona-sim/start")
async def persona_sim_start(body: PersonaStartRequest):
    try:
        return await _get_persona().start_session(body.persona_type, body.scenario)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/persona-sim/{session_id}/message")
async def persona_sim_message(session_id: str, body: PersonaMessageRequest):
    try:
        return await _get_persona().send_message(session_id, body.user_message)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/persona-sim/{session_id}/end")
async def persona_sim_end(session_id: str):
    try:
        return await _get_persona().end_session(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ---------------------------------------------------------------------------
# Intel Brief Audio
# ---------------------------------------------------------------------------
@router.post("/intel-brief/audio")
async def intel_brief_audio(body: IntelBriefRequest):
    return await IntelBriefAudio(_get_client()).convert_to_audio(
        body.brief_text, body.voice_style
    )


# ---------------------------------------------------------------------------
# Crisis Escalation
# ---------------------------------------------------------------------------
@router.post("/crisis/escalate")
async def crisis_escalate(body: CrisisEscalateRequest):
    contacts = [c.model_dump() for c in body.contacts]
    return await _get_crisis().initiate_escalation(contacts, body.incident_summary)


@router.get("/crisis/{escalation_id}/status")
async def crisis_status(escalation_id: str):
    try:
        return await _get_crisis().get_escalation_status(escalation_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ---------------------------------------------------------------------------
# Voice Health Analysis
# ---------------------------------------------------------------------------
@router.post("/health/analyze/{call_id}")
async def health_analyze(call_id: str):
    return await VoiceHealthAnalysis(_get_client()).analyze_call_sentiment(call_id)


@router.get("/health/trends/{client_id}")
async def health_trends(client_id: str, calls: str = ""):
    """Get engagement trends. Pass call IDs as comma-separated query param."""
    call_list = [c.strip() for c in calls.split(",") if c.strip()]
    return await VoiceHealthAnalysis(_get_client()).get_engagement_trends(client_id, call_list)


# ---------------------------------------------------------------------------
# Voice Trainer
# ---------------------------------------------------------------------------
@router.post("/trainer/start")
async def trainer_start(body: TrainerStartRequest):
    try:
        return await _get_trainer().start_training_module(body.module_id, body.trainee_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/trainer/{session_id}/assess")
async def trainer_assess(session_id: str):
    try:
        return await _get_trainer().assess_performance(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
