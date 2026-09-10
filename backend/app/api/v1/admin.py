"""Admin API — Management endpoints for platform primitives."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.backbone.ai_eval_lab import AIEvalLab
from app.services.backbone.entitlements import EntitlementEngine
from app.services.backbone.golden_test_runner import (
    load_test_cases as _load_golden,
)
from app.services.backbone.golden_test_runner import (
    run_suite as _run_golden_suite,
)
from app.services.backbone.records_governance import RecordsGovernance
from app.services.backbone.rules_engine import RulesEngine
from app.services.backbone.sandbox import SandboxService

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


# ── Schemas ──────────────────────────────────────────────────────────────────


class RegisterPromptRequest(BaseModel):
    agent_name: str
    prompt_template: str
    user_id: str | None = None


class RollbackPromptRequest(BaseModel):
    agent_name: str
    target_version: int


class SaveTestResultsRequest(BaseModel):
    prompt_version_id: str
    results: dict


class SetFlagRequest(BaseModel):
    flag_name: str
    enabled: bool
    rollout_pct: float = 100.0
    plan_requirements: list[str] | None = None


class CreateRuleRequest(BaseModel):
    workspace_id: str
    name: str
    trigger_type: str
    trigger_conditions: dict
    action_type: str
    action_config: dict


class SetRetentionRequest(BaseModel):
    workspace_id: str
    document_class: str
    retention_days: int
    auto_delete: bool = False


class CreateLegalHoldRequest(BaseModel):
    workspace_id: str
    resource_type: str
    resource_id: str
    reason: str
    created_by: str


class ReleaseLegalHoldRequest(BaseModel):
    hold_id: str
    released_by: str


class CreateRetentionPolicyRequest(BaseModel):
    workspace_id: str
    document_class: str
    retention_days: int
    auto_delete: bool = False


class CreateSandboxRequest(BaseModel):
    workspace_id: str
    name: str


class WhiteLabelUpdateRequest(BaseModel):
    brand_name: str | None = None
    logo_url: str | None = None
    primary_color: str | None = None
    secondary_color: str | None = None
    favicon_url: str | None = None
    custom_domain: str | None = None
    email_from_name: str | None = None
    email_from_address: str | None = None
    portal_footer_text: str | None = None
    is_active: bool | None = None


# ── Prompts (AI Eval Lab) ───────────────────────────────────────────────────


@router.post("/prompts/register")
def register_prompt(req: RegisterPromptRequest, db: Session = Depends(get_db)):
    pv = AIEvalLab.register_prompt(
        db, req.agent_name, req.prompt_template, req.user_id
    )
    return {
        "id": str(pv.id),
        "agent_name": pv.agent_name,
        "version": pv.version,
        "is_active": pv.is_active,
    }


@router.post("/prompts/rollback")
def rollback_prompt(req: RollbackPromptRequest, db: Session = Depends(get_db)):
    try:
        pv = AIEvalLab.rollback_prompt(db, req.agent_name, req.target_version)
        return {
            "id": str(pv.id),
            "agent_name": pv.agent_name,
            "version": pv.version,
            "is_active": pv.is_active,
        }
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/prompts/save-results")
def save_test_results(req: SaveTestResultsRequest, db: Session = Depends(get_db)):
    try:
        AIEvalLab.save_test_results(db, req.prompt_version_id, req.results)
        return {"saved": True}
    except ValueError as e:
        raise HTTPException(404, str(e))


# ── Golden Tests (AI Eval Lab) ───────────────────────────────────────────────


@router.post("/eval-lab/run/{agent_name}")
def run_golden_tests(agent_name: str, db: Session = Depends(get_db)):
    """Run the golden test suite for a specific agent."""
    try:
        result = _run_golden_suite(agent_name)
        return result
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))


@router.get("/eval-lab/golden-tests/{agent_name}")
def get_golden_tests(agent_name: str):
    """Return the golden test cases for a specific agent."""
    try:
        return _load_golden(agent_name)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))


# ── Feature Flags (Entitlements) ─────────────────────────────────────────────


@router.post("/flags/set")
def set_flag(req: SetFlagRequest, db: Session = Depends(get_db)):
    flag = EntitlementEngine.set_flag(
        db, req.flag_name, req.enabled, req.rollout_pct, req.plan_requirements
    )
    return {
        "id": str(flag.id),
        "name": flag.name,
        "enabled": flag.enabled,
        "rollout_percentage": flag.rollout_percentage,
    }


# ── Rules ────────────────────────────────────────────────────────────────────


@router.post("/rules/create")
def create_rule(req: CreateRuleRequest, db: Session = Depends(get_db)):
    try:
        rule = RulesEngine.create_rule(
            db,
            req.workspace_id,
            req.name,
            req.trigger_type,
            req.trigger_conditions,
            req.action_type,
            req.action_config,
        )
        return {
            "id": str(rule.id),
            "name": rule.name,
            "trigger_type": rule.trigger_type,
            "action_type": rule.action_type,
        }
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("/rules/{rule_id}/log")
def get_execution_log(rule_id: str, db: Session = Depends(get_db)):
    return RulesEngine.get_execution_log(db, rule_id)


# ── Records Governance ───────────────────────────────────────────────────────


@router.post("/records/retention")
def set_retention(req: SetRetentionRequest, db: Session = Depends(get_db)):
    policy = RecordsGovernance.set_retention_policy(
        db, req.workspace_id, req.document_class, req.retention_days, req.auto_delete
    )
    return policy


@router.post("/records/legal-hold")
def create_legal_hold(req: CreateLegalHoldRequest, db: Session = Depends(get_db)):
    hold = RecordsGovernance.create_legal_hold(
        db,
        req.workspace_id,
        req.resource_type,
        req.resource_id,
        req.reason,
        req.created_by,
    )
    return hold


@router.post("/records/legal-hold/release")
def release_legal_hold(req: ReleaseLegalHoldRequest, db: Session = Depends(get_db)):
    try:
        hold = RecordsGovernance.release_legal_hold(db, req.hold_id, req.released_by)
        return hold
    except ValueError as e:
        raise HTTPException(404, str(e))


# ── Records Retention Enforcement ───────────────────────────────────────


@router.post("/records/policies")
def create_retention_policy(
    req: CreateRetentionPolicyRequest, db: Session = Depends(get_db)
):
    """Create or update a retention policy for a document class."""
    from app.models.retention_policy import RetentionPolicy
    from app.services.backbone.records_governance import VALID_DOCUMENT_CLASSES

    if req.document_class not in VALID_DOCUMENT_CLASSES:
        raise HTTPException(
            400,
            f"Invalid document_class. Must be one of: {sorted(VALID_DOCUMENT_CLASSES)}",
        )

    # Upsert: replace existing policy for same workspace + class
    existing = (
        db.query(RetentionPolicy)
        .filter(
            RetentionPolicy.workspace_id == req.workspace_id,
            RetentionPolicy.document_class == req.document_class,
        )
        .first()
    )
    if existing:
        existing.retention_days = req.retention_days
        existing.auto_delete = req.auto_delete
        db.commit()
        db.refresh(existing)
        policy = existing
    else:
        policy = RetentionPolicy(
            workspace_id=req.workspace_id,
            document_class=req.document_class,
            retention_days=req.retention_days,
            auto_delete=req.auto_delete,
        )
        db.add(policy)
        db.commit()
        db.refresh(policy)

    return {
        "id": str(policy.id),
        "workspace_id": str(policy.workspace_id),
        "document_class": policy.document_class,
        "retention_days": policy.retention_days,
        "auto_delete": policy.auto_delete,
    }


@router.get("/records/policies")
def list_retention_policies(workspace_id: str, db: Session = Depends(get_db)):
    """List all retention policies for a workspace."""
    from app.models.retention_policy import RetentionPolicy

    policies = (
        db.query(RetentionPolicy)
        .filter(RetentionPolicy.workspace_id == workspace_id)
        .all()
    )
    return [
        {
            "id": str(p.id),
            "workspace_id": str(p.workspace_id),
            "document_class": p.document_class,
            "retention_days": p.retention_days,
            "auto_delete": p.auto_delete,
        }
        for p in policies
    ]


@router.get("/records/expired")
def preview_expired_records(workspace_id: str, db: Session = Depends(get_db)):
    """Preview expired records (dry run — no deletion)."""
    return RecordsGovernance.get_expired_records(db, workspace_id)


@router.post("/records/cleanup")
def manual_retention_cleanup(workspace_id: str, db: Session = Depends(get_db)):
    """Manually trigger retention cleanup for a workspace."""
    return RecordsGovernance.execute_retention(db, workspace_id)


@router.get("/records/report")
def retention_report(workspace_id: str, db: Session = Depends(get_db)):
    """Get a retention report for a workspace."""
    return RecordsGovernance.get_retention_report(db, workspace_id)


# ── Sandbox ──────────────────────────────────────────────────────────────────


@router.post("/sandbox/create")
def create_sandbox(req: CreateSandboxRequest, db: Session = Depends(get_db)):
    return SandboxService.create_sandbox(db, req.workspace_id, req.name)


@router.post("/sandbox/{sandbox_id}/reset")
def reset_sandbox(sandbox_id: str, db: Session = Depends(get_db)):
    try:
        return SandboxService.reset_sandbox(db, sandbox_id)
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.post("/sandbox/{sandbox_id}/load-data")
def load_synthetic_data(sandbox_id: str, db: Session = Depends(get_db)):
    try:
        return SandboxService.load_synthetic_data(db, sandbox_id)
    except ValueError as e:
        raise HTTPException(404, str(e))


# ── Database Backups ────────────────────────────────────────────────────────


@router.post("/backups/trigger")
def trigger_backup():
    """Manually trigger a database backup to S3 (admin only)."""
    from app.jobs.tasks.backup_tasks import automated_db_backup

    result = automated_db_backup.delay()
    return {"task_id": result.id, "status": "queued"}


@router.get("/backups")
def list_backups(limit: int = 30):
    """List recent database backups from S3."""
    from app.jobs.tasks.backup_tasks import list_backups as _list_backups

    try:
        backups = _list_backups(limit=limit)
        return {"backups": backups, "count": len(backups)}
    except Exception as e:
        raise HTTPException(500, f"Failed to list backups: {e}")


@router.post("/backups/verify/{s3_key:path}")
def verify_backup(s3_key: str):
    """Trigger integrity verification for a specific backup."""
    from app.jobs.tasks.backup_tasks import verify_backup_integrity

    result = verify_backup_integrity.delay(s3_key)
    return {"task_id": result.id, "s3_key": s3_key, "status": "queued"}
