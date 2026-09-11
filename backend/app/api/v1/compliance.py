"""Trust & Compliance API — consent, explainability, quality, comms, benchmarks."""
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.dependencies import get_workspace_id
from app.db.session import get_db
from app.services.backbone.ai_explainability import AIExplainability
from app.services.backbone.benchmark_exchange import BenchmarkExchange
from app.services.backbone.consent_ledger import ConsentLedger
from app.services.backbone.secure_comms import SecureComms
from app.services.backbone.service_quality_qa import ServiceQualityQA

router = APIRouter(prefix="/api/v1/compliance", tags=["Trust & Compliance"])


# ── Request / Response Schemas ───────────────────────────────────────────────


class GrantConsentRequest(BaseModel):
    workspace_id: UUID | None = None
    client_id: UUID
    consent_type: str = Field(..., pattern="^(data_processing|nda|marketing|third_party_sharing)$")
    nda_url: str | None = None


class RevokeConsentRequest(BaseModel):
    reason: str | None = None


class ExplainabilityRequest(BaseModel):
    agent_name: str
    input_data: dict
    output_data: dict
    sources_used: list[dict] = []


class SendMessageRequest(BaseModel):
    workspace_id: UUID | None = None
    sender_id: UUID
    recipient_id: UUID
    content: str
    encrypted: bool = True


class ContributeMetricsRequest(BaseModel):
    workspace_id: UUID | None = None
    metrics: dict


# ── Consent Endpoints ────────────────────────────────────────────────────────


@router.post("/consent")
def grant_consent(
    req: GrantConsentRequest,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Grant a new consent record for a client."""
    try:
        record = ConsentLedger.grant_consent(
            db=db,
            workspace_id=workspace_id,
            client_id=req.client_id,
            consent_type=req.consent_type,
            nda_url=req.nda_url,
        )
        return record.to_dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/consent/{consent_id}/revoke")
def revoke_consent(
    consent_id: UUID,
    req: RevokeConsentRequest,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Revoke an existing consent record."""
    try:
        record = ConsentLedger.revoke_consent(db=db, consent_id=consent_id, reason=req.reason)
        return record.to_dict()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/consent/client/{client_id}")
def get_client_consents(
    client_id: UUID,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Get all consent records for a client."""
    records = ConsentLedger.get_client_consents(db=db, client_id=client_id)
    return [r.to_dict() for r in records]


@router.get("/consent/check/{client_id}/{consent_type}")
def check_consent(
    client_id: UUID,
    consent_type: str,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Check whether a client has an active consent of the given type."""
    has_consent = ConsentLedger.check_consent(db=db, client_id=client_id, consent_type=consent_type)
    return {"client_id": str(client_id), "consent_type": consent_type, "active": has_consent}


@router.get("/consent/deletion-candidates")
def get_deletion_candidates(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """List clients whose consents are all revoked (GDPR deletion candidates)."""
    return ConsentLedger.get_deletion_candidates(db=db, workspace_id=workspace_id)


# ── Explainability Endpoint ──────────────────────────────────────────────────


@router.post("/explainability")
def generate_explainability_report(
    req: ExplainabilityRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    """Generate an AI explainability report for an agent's output."""
    report = AIExplainability.generate_report(
        agent_name=req.agent_name,
        input_data=req.input_data,
        output_data=req.output_data,
        sources_used=req.sources_used,
    )
    return report


# ── Quality Endpoints ────────────────────────────────────────────────────────


@router.get("/quality/sla/{offer_id}")
def check_sla(
    offer_id: UUID,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Check SLA adherence for a specific offer/engagement."""
    return ServiceQualityQA.check_sla_adherence(db=db, workspace_id=workspace_id, offer_id=offer_id)


@router.get("/quality/onboarding/{client_id}")
def onboarding_quality(
    client_id: UUID,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Score onboarding quality for a client."""
    return ServiceQualityQA.score_onboarding_quality(db=db, client_id=client_id)


@router.get("/quality/retention-risks")
def retention_risks(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Detect clients at risk of churn."""
    return ServiceQualityQA.detect_retention_risks(db=db, workspace_id=workspace_id)


# ── Secure Comms Endpoints ───────────────────────────────────────────────────


@router.post("/comms/message")
def send_message(
    req: SendMessageRequest,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Send an encrypted message."""
    return SecureComms.create_message(
        db=db,
        workspace_id=workspace_id,
        sender_id=req.sender_id,
        recipient_id=req.recipient_id,
        content=req.content,
        encrypted=req.encrypted,
    )


@router.get("/comms/messages")
def get_messages(
    user_id: UUID = Query(...),
    conversation_with: UUID | None = Query(None),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Get messages for a user, optionally filtered to a conversation."""
    return SecureComms.get_messages(
        db=db,
        workspace_id=workspace_id,
        user_id=user_id,
        conversation_with=conversation_with,
    )


@router.get("/comms/audit-trail")
def audit_trail(
    user_id: UUID | None = Query(None),
    workspace_id: str = Depends(get_workspace_id),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    db: Session = Depends(get_db),
):
    """Get the communications audit trail for a workspace."""
    return SecureComms.get_audit_trail(
        db=db,
        workspace_id=workspace_id,
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
    )


# ── Benchmark Endpoints ─────────────────────────────────────────────────────


@router.get("/benchmarks/{pain_category}")
def get_benchmarks(
    pain_category: str,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    """Get anonymized benchmarks for a pain category."""
    return BenchmarkExchange.get_anonymized_benchmarks(db=db, pain_category=pain_category)


@router.post("/benchmarks")
def contribute_benchmarks(
    req: ContributeMetricsRequest,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Contribute anonymized metrics to the benchmark pool."""
    try:
        success = BenchmarkExchange.contribute_metrics(
            db=db, workspace_id=workspace_id, metrics=req.metrics
        )
        return {"success": success}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
