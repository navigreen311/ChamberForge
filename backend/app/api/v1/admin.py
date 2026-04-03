"""Admin API — Management endpoints for platform primitives."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.backbone.ai_eval_lab import AIEvalLab
from app.services.backbone.entitlements import EntitlementEngine
from app.services.backbone.golden_test_runner import (
    load_test_cases as _load_golden,
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


class CreateSandboxRequest(BaseModel):
    workspace_id: str
    name: str


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
