"""VoiceForge API routes — persona sim, audio briefs, crisis, health, trainer.

P-18 (T-008, final slice). Ten routes, none of which required a session.
``POST /crisis/escalate`` takes a list of phone numbers and an incident
summary and **places calls to them**, so anyone who could reach the port
could make the platform dial arbitrary numbers on a firm's behalf. Every
route now requires a session.

Two things the gating exposed, both fixed here because both live in this
file:

**One session store for the whole process.** The stateful services were held
in module-level singletons, so ``self._sessions`` was shared by every
workspace. A persona-sim session id, a training session id or an escalation
id belonging to one firm resolved for any other — the ids are uuid4, but
they travel in URLs, logs and support tickets. The instances are now keyed
by workspace, so an id from another firm is simply not found.

**A trainee could be named by the caller.** ``trainer/start`` took
``trainee_id`` in the body, and that is what the certification result is
recorded against. Same defect P-16 fixed on ``released_by`` and
``requested_by``: a record naming whoever the caller typed reads as
authoritative ever afterwards. It is now the session user.
"""
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.dependencies import get_current_user, get_workspace_id
from app.core.identity import ResolvedIdentity
from app.services.integrations.voiceforge_client import VoiceForgeClient
from app.services.integrations.voiceforge_crisis import CrisisEscalation
from app.services.integrations.voiceforge_health import VoiceHealthAnalysis
from app.services.integrations.voiceforge_intel_brief import IntelBriefAudio
from app.services.integrations.voiceforge_persona_sim import PersonaSimIntegration
from app.services.integrations.voiceforge_trainer import VoiceTrainer

router = APIRouter(prefix="/api/v1/voiceforge", tags=["voiceforge"])

# ---------------------------------------------------------------------------
# Partner availability
# ---------------------------------------------------------------------------
# Reasons that mean "the partner did not answer". P-07's clients never raise —
# they return a typed degraded envelope — so without this a caller receives
# 200 OK carrying no deliverable, which is the shape a success has.
_PARTNER_DOWN = {
    "partner_not_configured",
    "partner_unavailable",
    "partner_contract_changed",
}


def _partner_gate(result: dict[str, Any]) -> dict[str, Any]:
    """Pass *result* through, or raise 503 if the partner did not answer.

    Only partner-side reasons become 503. A degraded result carrying, say,
    ``no_calls`` is a complete and correct answer about the caller's own
    input — there was nothing to analyse — and a 503 would tell them to
    retry something that will never change.
    """
    if result.get("degraded") and result.get("degraded_reason") in _PARTNER_DOWN:
        raise HTTPException(
            status_code=503,
            detail=result.get("degraded_detail", "VoiceForge did not respond."),
        )
    return result


# ---------------------------------------------------------------------------
# Shared service instances
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


# Stateful services live for the life of the process, but one instance per
# workspace rather than one per process. `PersonaSimIntegration`,
# `CrisisEscalation` and `VoiceTrainer` each hold a `_sessions` dict keyed
# only by session id, and a single shared instance made those ids resolve
# across firms.
_persona_instances: dict[str, PersonaSimIntegration] = {}
_crisis_instances: dict[str, CrisisEscalation] = {}
_trainer_instances: dict[str, VoiceTrainer] = {}


def _get_persona(workspace_id: str) -> PersonaSimIntegration:
    if workspace_id not in _persona_instances:
        _persona_instances[workspace_id] = PersonaSimIntegration(_get_client())
    return _persona_instances[workspace_id]


def _get_crisis(workspace_id: str) -> CrisisEscalation:
    if workspace_id not in _crisis_instances:
        _crisis_instances[workspace_id] = CrisisEscalation(_get_client())
    return _crisis_instances[workspace_id]


def _get_trainer(workspace_id: str) -> VoiceTrainer:
    if workspace_id not in _trainer_instances:
        _trainer_instances[workspace_id] = VoiceTrainer(_get_client())
    return _trainer_instances[workspace_id]


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
    """``trainee_id`` is deliberately absent — the trainee is the session user.

    It was a caller-supplied field, and it is what the certification result
    is recorded against.
    """

    module_id: str


class HealthTrendsQuery(BaseModel):
    calls: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Persona Simulation
# ---------------------------------------------------------------------------
@router.post("/persona-sim/start")
async def persona_sim_start(
    body: PersonaStartRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    try:
        return await _get_persona(workspace_id).start_session(
            body.persona_type, body.scenario
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/persona-sim/{session_id}/message")
async def persona_sim_message(
    session_id: str,
    body: PersonaMessageRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    try:
        return await _get_persona(workspace_id).send_message(
            session_id, body.user_message
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/persona-sim/{session_id}/end")
async def persona_sim_end(
    session_id: str,
    workspace_id: str = Depends(get_workspace_id),
):
    try:
        return await _get_persona(workspace_id).end_session(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ---------------------------------------------------------------------------
# Intel Brief Audio
# ---------------------------------------------------------------------------
@router.post("/intel-brief/audio")
async def intel_brief_audio(
    body: IntelBriefRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    # No `_partner_gate` here: `voiceforge_intel_brief.py` is carved out to
    # P-06 and still returns a fabricated narration on the degraded path
    # rather than a degraded envelope, so there is nothing here to gate on.
    # See PARALLEL_BUILD_ESCALATION.md.
    return await IntelBriefAudio(_get_client()).convert_to_audio(
        body.brief_text, body.voice_style
    )


# ---------------------------------------------------------------------------
# Crisis Escalation
# ---------------------------------------------------------------------------
@router.post("/crisis/escalate")
async def crisis_escalate(
    body: CrisisEscalateRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    contacts = [c.model_dump() for c in body.contacts]
    return await _get_crisis(workspace_id).initiate_escalation(
        contacts, body.incident_summary
    )


@router.get("/crisis/{escalation_id}/status")
async def crisis_status(
    escalation_id: str,
    workspace_id: str = Depends(get_workspace_id),
):
    try:
        return await _get_crisis(workspace_id).get_escalation_status(escalation_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ---------------------------------------------------------------------------
# Voice Health Analysis
# ---------------------------------------------------------------------------
@router.post("/health/analyze/{call_id}")
async def health_analyze(
    call_id: str,
    workspace_id: str = Depends(get_workspace_id),
):
    return _partner_gate(
        await VoiceHealthAnalysis(_get_client()).analyze_call_sentiment(call_id)
    )


@router.get("/health/trends/{client_id}")
async def health_trends(
    client_id: str,
    calls: str = "",
    workspace_id: str = Depends(get_workspace_id),
):
    """Get engagement trends. Pass call IDs as comma-separated query param."""
    call_list = [c.strip() for c in calls.split(",") if c.strip()]
    return _partner_gate(
        await VoiceHealthAnalysis(_get_client()).get_engagement_trends(
            client_id, call_list
        )
    )


# ---------------------------------------------------------------------------
# Voice Trainer
# ---------------------------------------------------------------------------
@router.post("/trainer/start")
async def trainer_start(
    body: TrainerStartRequest,
    workspace_id: str = Depends(get_workspace_id),
    current_user: ResolvedIdentity = Depends(get_current_user),
):
    try:
        return await _get_trainer(workspace_id).start_training_module(
            body.module_id, str(current_user.id)
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/trainer/{session_id}/assess")
async def trainer_assess(
    session_id: str,
    workspace_id: str = Depends(get_workspace_id),
):
    try:
        return await _get_trainer(workspace_id).assess_performance(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
