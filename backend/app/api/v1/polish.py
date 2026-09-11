"""Polish layer API — Template Versioning, Crisis Console, Cross-Playbook Composer, Red-Team Auditor."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.dependencies import get_workspace_id
from app.db.session import get_db
from app.services.backbone.crisis_console import CrisisConsole
from app.services.backbone.cross_playbook import CrossPlaybookComposer
from app.services.backbone.red_team_auditor import RedTeamAuditor
from app.services.backbone.template_versioning import TemplateVersioning

router = APIRouter(prefix="/api/v1/polish", tags=["polish"])


# ─── Schemas ─────────────────────────────────────────────────────────────────


class CreateVersionRequest(BaseModel):
    workspace_id: UUID
    template_type: str = Field(..., pattern="^(offer|playbook|sop)$")
    template_id: UUID
    content: dict
    changes_summary: str
    user_id: UUID | None = None


class RollbackRequest(BaseModel):
    pass  # version comes from path


class DiffRequest(BaseModel):
    v1_content: dict
    v2_content: dict


class CreateIncidentRequest(BaseModel):
    workspace_id: UUID
    title: str
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    reported_by: UUID | None = None


class TimelineEventRequest(BaseModel):
    event_type: str
    description: str


class EscalationTreeRequest(BaseModel):
    tree: list[dict]


class LockdownRequest(BaseModel):
    actions: list[str]


class ResolveRequest(BaseModel):
    resolution_notes: str


class ComposeRequest(BaseModel):
    playbooks: list[dict]


class BundlePricingRequest(BaseModel):
    playbook_prices: list[tuple[float, float]]
    discount_pct: float = 10.0


class AuditRequest(BaseModel):
    offer_data: dict


# ─── Template Versioning ─────────────────────────────────────────────────────


@router.post("/versions")
def create_version(req: CreateVersionRequest, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    version = TemplateVersioning.create_version(
        db=db,
        workspace_id=req.workspace_id,
        template_type=req.template_type,
        template_id=req.template_id,
        content=req.content,
        changes_summary=req.changes_summary,
        user_id=req.user_id,
    )
    return {
        "id": str(version.id),
        "version_number": version.version_number,
        "is_active": version.is_active,
        "created_at": version.created_at.isoformat() if version.created_at else None,
    }


@router.get("/versions/{template_id}")
def get_version_history(template_id: UUID, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    history = TemplateVersioning.get_version_history(db, template_id)
    return [
        {
            "id": str(v.id),
            "version_number": v.version_number,
            "is_active": v.is_active,
            "changes_summary": v.changes_summary,
            "created_by": str(v.created_by) if v.created_by else None,
            "created_at": v.created_at.isoformat() if v.created_at else None,
        }
        for v in history
    ]


@router.post("/versions/{template_id}/rollback/{version}")
def rollback_version(
    template_id: UUID,
    version: int,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    try:
        result = TemplateVersioning.rollback(db, template_id, version)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {
        "id": str(result.id),
        "version_number": result.version_number,
        "is_active": result.is_active,
    }


@router.post("/versions/diff")
def diff_versions(
    req: DiffRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    return TemplateVersioning.diff_versions(req.v1_content, req.v2_content)


# ─── Crisis Console ──────────────────────────────────────────────────────────


@router.post("/crisis")
def create_incident(req: CreateIncidentRequest, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    try:
        incident = CrisisConsole.create_incident(
            db=db,
            workspace_id=req.workspace_id,
            title=req.title,
            severity=req.severity,
            reported_by=req.reported_by,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"id": str(incident.id), "status": incident.status, "severity": incident.severity}


@router.get("/crisis")
def get_active_incidents(workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    incidents = CrisisConsole.get_active_incidents(db, workspace_id)
    return [
        {
            "id": str(i.id),
            "title": i.title,
            "severity": i.severity,
            "status": i.status,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        }
        for i in incidents
    ]


@router.get("/crisis/{incident_id}")
def get_incident_detail(incident_id: UUID, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    incident = CrisisConsole.get_incident_detail(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {
        "id": str(incident.id),
        "title": incident.title,
        "severity": incident.severity,
        "status": incident.status,
        "timeline": incident.timeline,
        "escalation_tree": incident.escalation_tree,
        "lockdown_actions": incident.lockdown_actions,
        "resolved_at": incident.resolved_at.isoformat() if incident.resolved_at else None,
        "created_at": incident.created_at.isoformat() if incident.created_at else None,
    }


@router.post("/crisis/{incident_id}/timeline")
def add_timeline_event(
    incident_id: UUID,
    req: TimelineEventRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    try:
        incident = CrisisConsole.add_timeline_event(db, incident_id, req.event_type, req.description)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"id": str(incident.id), "timeline_count": len(incident.timeline)}


@router.post("/crisis/{incident_id}/escalation")
def set_escalation_tree(
    incident_id: UUID,
    req: EscalationTreeRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    try:
        incident = CrisisConsole.set_escalation_tree(db, incident_id, req.tree)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"id": str(incident.id), "escalation_levels": len(incident.escalation_tree)}


@router.post("/crisis/{incident_id}/lockdown")
def execute_lockdown(
    incident_id: UUID,
    req: LockdownRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    try:
        incident = CrisisConsole.execute_lockdown(db, incident_id, req.actions)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"id": str(incident.id), "status": incident.status, "lockdown_actions": incident.lockdown_actions}


@router.post("/crisis/{incident_id}/resolve")
def resolve_incident(
    incident_id: UUID,
    req: ResolveRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    try:
        incident = CrisisConsole.resolve_incident(db, incident_id, req.resolution_notes)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"id": str(incident.id), "status": incident.status, "resolved_at": incident.resolved_at.isoformat()}


# ─── Cross-Playbook Composer ─────────────────────────────────────────────────


@router.post("/compose")
def compose_playbooks(
    req: ComposeRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    try:
        result = CrossPlaybookComposer.compose(req.playbooks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


@router.post("/compose/pricing")
def estimate_bundle_pricing(
    req: BundlePricingRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    return CrossPlaybookComposer.estimate_bundle_pricing(req.playbook_prices, req.discount_pct)


# ─── Red-Team Auditor ────────────────────────────────────────────────────────


@router.post("/red-team")
def audit_offer(
    req: AuditRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    return RedTeamAuditor.audit_offer(req.offer_data)
