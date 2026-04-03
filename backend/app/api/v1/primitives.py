"""Platform Primitives API — Public endpoints for all 7 backbone modules."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.backbone.ai_eval_lab import AIEvalLab
from app.services.backbone.ai_runtime import AIRuntime
from app.services.backbone.entitlements import EntitlementEngine
from app.services.backbone.records_governance import RecordsGovernance
from app.services.backbone.rules_engine import RulesEngine
from app.services.backbone.sandbox import SandboxService
from app.services.backbone.trust_center import TrustCenter

router = APIRouter(prefix="/api/v1/primitives", tags=["Platform Primitives"])


# ── Schemas ──────────────────────────────────────────────────────────────────


class CheckFeatureRequest(BaseModel):
    workspace_plan: str
    feature_name: str


class CheckFlagRequest(BaseModel):
    flag_name: str
    workspace_id: str | None = None


class ProcessEventRequest(BaseModel):
    workspace_id: str
    event_type: str
    event_data: dict


class TrackUsageRequest(BaseModel):
    workspace_id: str
    agent_name: str
    tokens_in: int
    tokens_out: int
    latency_ms: int
    cost_usd: float


class BudgetCheckRequest(BaseModel):
    workspace_id: str
    monthly_budget: float


class RegressionRequest(BaseModel):
    agent_name: str
    test_cases: list[dict]


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
def check_flag(req: CheckFlagRequest, db: Session = Depends(get_db)):
    return {
        "enabled": EntitlementEngine.check_flag(
            db, req.flag_name, req.workspace_id
        )
    }


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
def process_event(req: ProcessEventRequest, db: Session = Depends(get_db)):
    results = RulesEngine.process_event(
        db, req.workspace_id, req.event_type, req.event_data
    )
    return {"event_type": req.event_type, "rules_executed": len(results), "results": results}


@router.get("/rules/{workspace_id}")
def get_rules(workspace_id: str, db: Session = Depends(get_db)):
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


@router.get("/records/{workspace_id}/holds")
def get_legal_holds(workspace_id: str, db: Session = Depends(get_db)):
    return RecordsGovernance.get_legal_holds(db, workspace_id)


@router.get("/records/{workspace_id}/retention")
def check_retention(workspace_id: str, db: Session = Depends(get_db)):
    return RecordsGovernance.check_retention(db, workspace_id)


# ── Trust Center ─────────────────────────────────────────────────────────────


@router.get("/trust-center/overview")
def trust_center_overview():
    return TrustCenter.get_security_overview()


@router.get("/trust-center/uptime")
def trust_center_uptime(months: int = 12):
    return TrustCenter.get_uptime_history(months)


# ── Sandbox ──────────────────────────────────────────────────────────────────


@router.get("/sandbox/{workspace_id}")
def list_sandboxes(workspace_id: str, db: Session = Depends(get_db)):
    return SandboxService.list_sandboxes(db, workspace_id)


# ── AI Runtime ───────────────────────────────────────────────────────────────


@router.post("/runtime/track")
def track_usage(req: TrackUsageRequest, db: Session = Depends(get_db)):
    log = AIRuntime.track_usage(
        db,
        req.workspace_id,
        req.agent_name,
        req.tokens_in,
        req.tokens_out,
        req.latency_ms,
        req.cost_usd,
    )
    return {"id": str(log.id), "tracked": True}


@router.get("/runtime/{workspace_id}/dashboard")
def usage_dashboard(workspace_id: str, db: Session = Depends(get_db)):
    return AIRuntime.get_usage_dashboard(db, workspace_id)


@router.post("/runtime/budget-check")
def budget_check(req: BudgetCheckRequest, db: Session = Depends(get_db)):
    return AIRuntime.check_budget(db, req.workspace_id, req.monthly_budget)


@router.get("/runtime/{workspace_id}/agent/{agent_name}")
def agent_performance(
    workspace_id: str, agent_name: str, db: Session = Depends(get_db)
):
    return AIRuntime.get_agent_performance(db, workspace_id, agent_name)
