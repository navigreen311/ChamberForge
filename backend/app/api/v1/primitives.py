"""Platform Primitives API — Public endpoints for all 7 backbone modules."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_workspace_id
from app.db.session import get_db
from app.services.backbone.ai_eval_lab import AIEvalLab
from app.services.backbone.ai_runtime import AIRuntime
from app.services.backbone.entitlements import EntitlementEngine
from app.services.backbone.records_governance import RecordsGovernance
from app.services.backbone.rules_engine import RulesEngine
from app.services.backbone.sandbox import SandboxService
from app.services.backbone.trust_center import TrustCenter

# P-02: every route here requires an authenticated operator. These endpoints
# read and mutate platform state - feature flags, prompt rollback history,
# legal holds, retention, sandboxes, AI spend - and all 19 accepted anonymous
# requests. The router-level dependency means a route added later is gated by
# default rather than by remembering.
router = APIRouter(
    prefix="/api/v1/primitives",
    tags=["Platform Primitives"],
    dependencies=[Depends(get_workspace_id)],
)


# ── Schemas ──────────────────────────────────────────────────────────────────


class CheckFeatureRequest(BaseModel):
    workspace_plan: str
    feature_name: str


class CheckFlagRequest(BaseModel):
    flag_name: str
    # P-02: workspace_id removed - it is resolved from the token. A caller
    # supplying it could read another operator's flags by typing an id.


class ProcessEventRequest(BaseModel):
    # P-02: workspace_id removed, resolved from the token.
    event_type: str
    event_data: dict


class TrackUsageRequest(BaseModel):
    # P-02: workspace_id removed, resolved from the token.
    agent_name: str
    tokens_in: int
    tokens_out: int
    latency_ms: int
    cost_usd: float


class BudgetCheckRequest(BaseModel):
    # P-02: workspace_id removed, resolved from the token.
    # NOTE for P-04: monthly_budget is still supplied by the caller, which is
    # why this endpoint reports rather than enforces. P-04 persists the
    # ceiling on workspace_budgets and makes the refusal real.
    monthly_budget: float


class RegressionRequest(BaseModel):
    agent_name: str
    test_cases: list[dict]


class CreateSandboxRequest(BaseModel):
    # P-02: workspace_id removed, resolved from the token.
    name: str = "Demo Sandbox"


# ── Entitlements ─────────────────────────────────────────────────────────────


@router.post("/entitlements/check-feature")
def check_feature(req: CheckFeatureRequest):
    return {
        "allowed": EntitlementEngine.check_feature(
            req.workspace_plan, req.feature_name
        )
    }


@router.get("/entitlements/plan/{plan}")
def get_plan_features(plan: str):
    return {"plan": plan, "features": EntitlementEngine.get_plan_features(plan)}


@router.post("/entitlements/check-flag")
def check_flag(
    req: CheckFlagRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    return {"enabled": EntitlementEngine.check_flag(db, req.flag_name, workspace_id)}


# ── AI Eval Lab ──────────────────────────────────────────────────────────────


@router.get("/eval-lab/{agent_name}/history")
def get_prompt_history(agent_name: str, db: Session = Depends(get_db)):
    history = AIEvalLab.get_prompt_history(db, agent_name)
    return [
        {
            "id": str(pv.id),
            "version": pv.version,
            "is_active": pv.is_active,
            "created_at": pv.created_at.isoformat() if pv.created_at else None,
        }
        for pv in history
    ]


@router.get("/eval-lab/{agent_name}/active")
def get_active_prompt(agent_name: str, db: Session = Depends(get_db)):
    pv = AIEvalLab.get_active_prompt(db, agent_name)
    if not pv:
        raise HTTPException(404, f"No active prompt for agent '{agent_name}'")
    return {
        "id": str(pv.id),
        "agent_name": pv.agent_name,
        "version": pv.version,
        "prompt_template": pv.prompt_template,
        "is_active": pv.is_active,
    }


@router.post("/eval-lab/{agent_name}/regression")
def run_regression(
    agent_name: str, req: RegressionRequest, db: Session = Depends(get_db)
):
    try:
        return AIEvalLab.run_regression(db, agent_name, req.test_cases)
    except ValueError as e:
        raise HTTPException(400, str(e))


# ── Rules Engine ─────────────────────────────────────────────────────────────


@router.post("/rules/process-event")
def process_event(
    req: ProcessEventRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    results = RulesEngine.process_event(
        db, workspace_id, req.event_type, req.event_data
    )
    return {"event_type": req.event_type, "rules_executed": len(results), "results": results}


# P-02: the workspace no longer comes from the path. It was spoofable -
# any id in the URL was served.
@router.get("/rules")
def get_rules(db: Session = Depends(get_db), workspace_id: str = Depends(get_workspace_id)):
    rules = RulesEngine.get_rules(db, workspace_id)
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "trigger_type": r.trigger_type,
            "action_type": r.action_type,
            "is_active": r.is_active,
            "execution_count": r.execution_count,
        }
        for r in rules
    ]


# ── Records Governance ───────────────────────────────────────────────────────


@router.get("/records/holds")
def get_legal_holds(db: Session = Depends(get_db), workspace_id: str = Depends(get_workspace_id)):
    return RecordsGovernance.get_legal_holds(db, workspace_id)


@router.get("/records/retention")
def check_retention(db: Session = Depends(get_db), workspace_id: str = Depends(get_workspace_id)):
    return RecordsGovernance.check_retention(db, workspace_id)


# ── Trust Center ─────────────────────────────────────────────────────────────


@router.get("/trust-center/overview")
def trust_center_overview():
    return TrustCenter.get_security_overview()


@router.get("/trust-center/uptime")
def trust_center_uptime(months: int = 12):
    return TrustCenter.get_uptime_history(months)


# ── Sandbox ──────────────────────────────────────────────────────────────────


@router.post("/sandbox")
def create_sandbox(
    req: CreateSandboxRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    sandbox = SandboxService.create_sandbox(db, workspace_id, req.name)
    return sandbox


@router.post("/sandbox/{sandbox_id}/reset")
def reset_sandbox(sandbox_id: str, db: Session = Depends(get_db)):
    try:
        return SandboxService.reset_sandbox(db, sandbox_id)
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/sandbox")
def list_sandboxes(db: Session = Depends(get_db), workspace_id: str = Depends(get_workspace_id)):
    return SandboxService.list_sandboxes(db, workspace_id)


# ── AI Runtime ───────────────────────────────────────────────────────────────


@router.post("/runtime/track")
def track_usage(
    req: TrackUsageRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    log = AIRuntime.track_usage(
        db,
        workspace_id,
        req.agent_name,
        req.tokens_in,
        req.tokens_out,
        req.latency_ms,
        req.cost_usd,
    )
    return {"id": str(log.id), "tracked": True}


@router.get("/runtime/dashboard")
def usage_dashboard(db: Session = Depends(get_db), workspace_id: str = Depends(get_workspace_id)):
    return AIRuntime.get_usage_dashboard(db, workspace_id)


@router.post("/runtime/budget-check")
def budget_check(
    req: BudgetCheckRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    return AIRuntime.check_budget(db, workspace_id, req.monthly_budget)


@router.get("/runtime/agent/{agent_name}")
def agent_performance(
    agent_name: str,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    return AIRuntime.get_agent_performance(db, workspace_id, agent_name)
