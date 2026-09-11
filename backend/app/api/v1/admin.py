"""Admin API - management endpoints for platform primitives.

P-16 (T-008, T-009). **Every one of these twenty-two routes was reachable by
anyone.** Not merely unauthenticated - unauthorised too: there was no role
check anywhere in the file.

What that allowed, without credentials of any kind:

  - `POST /prompts/rollback` - change what every AI agent says to clients, by
    reverting to any earlier prompt version;
  - `POST /flags/set` - turn platform features on or off;
  - `POST /records/legal-hold/release` - **release a legal hold**;
  - `POST /records/cleanup` - run a retention sweep, which deletes;
  - `POST /backups/trigger`, `GET /backups` - enumerate and trigger backups.

The last three compose into the sharpest sequence in the audit: release the
hold, then run the cleanup, and data under legal preservation is destroyed
with no authenticated actor anywhere in the trail. That is spoliation, and
the platform would have recorded nobody doing it.

Every route now requires `require_role("admin")`. D2 does not soften this:
one tenant still means anonymous, and "the only operator" is not the same as
"anyone who can reach the port".

**Identity is no longer an input.** `released_by`, `user_id` and every
`workspace_id` on these routes came from the request. A caller could release
a hold and attribute the release to a colleague, or run a retention cleanup
against a workspace they named. Both now come from the session.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_workspace_id, require_role
from app.core.identity import ResolvedIdentity
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
from app.services.backbone.white_label import WhiteLabelService

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


# ── Schemas ──────────────────────────────────────────────────────────────────


class RegisterPromptRequest(BaseModel):
    agent_name: str
    prompt_template: str
    # user_id removed: it recorded who registered a prompt, and a caller
    # could name anyone. The session operator is the author.


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
    # workspace_id removed: these routes read and delete records, and a
    # caller naming the workspace could act on another firm's data.
    name: str
    trigger_type: str
    trigger_conditions: dict
    action_type: str
    action_config: dict


class SetRetentionRequest(BaseModel):
    # workspace_id removed: these routes read and delete records, and a
    # caller naming the workspace could act on another firm's data.
    document_class: str
    retention_days: int
    auto_delete: bool = False


class CreateLegalHoldRequest(BaseModel):
    # workspace_id removed: these routes read and delete records, and a
    # caller naming the workspace could act on another firm's data.
    resource_type: str
    resource_id: str
    reason: str
    # created_by removed: the operator placing the hold is the session,
    # not a name the caller supplies.


class ReleaseLegalHoldRequest(BaseModel):
    hold_id: str
    # released_by removed: it is the attribution on a legal-hold
    # release, which is precisely the field that must not be assertable.


class CreateRetentionPolicyRequest(BaseModel):
    # workspace_id removed: these routes read and delete records, and a
    # caller naming the workspace could act on another firm's data.
    document_class: str
    retention_days: int
    auto_delete: bool = False


class CreateSandboxRequest(BaseModel):
    # workspace_id removed: these routes read and delete records, and a
    # caller naming the workspace could act on another firm's data.
    name: str


class ValidateDomainRequest(BaseModel):
    domain: str


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
def register_prompt(
    req: RegisterPromptRequest,
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    pv = AIEvalLab.register_prompt(
        db, req.agent_name, req.prompt_template, admin.id
    )
    return {
        "id": str(pv.id),
        "agent_name": pv.agent_name,
        "version": pv.version,
        "is_active": pv.is_active,
    }


@router.post("/prompts/rollback")
def rollback_prompt(
    req: RollbackPromptRequest,
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
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
def save_test_results(
    req: SaveTestResultsRequest,
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    try:
        AIEvalLab.save_test_results(db, req.prompt_version_id, req.results)
        return {"saved": True}
    except ValueError as e:
        raise HTTPException(404, str(e))


# ── Golden Tests (AI Eval Lab) ───────────────────────────────────────────────


@router.post("/eval-lab/run/{agent_name}")
def run_golden_tests(
    agent_name: str,
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    """Run the golden test suite for a specific agent."""
    try:
        result = _run_golden_suite(agent_name)
        return result
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))


@router.get("/eval-lab/golden-tests/{agent_name}")
def get_golden_tests(
    agent_name: str,
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    """Return the golden test cases for a specific agent."""
    try:
        return _load_golden(agent_name)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))


# ── Feature Flags (Entitlements) ─────────────────────────────────────────────


@router.post("/flags/set")
def set_flag(
    req: SetFlagRequest,
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
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
def create_rule(
    req: CreateRuleRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    try:
        rule = RulesEngine.create_rule(
            db,
            workspace_id,
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
def get_execution_log(
    rule_id: str,
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    return RulesEngine.get_execution_log(db, rule_id)


# ── Records Governance ───────────────────────────────────────────────────────


@router.post("/records/retention")
def set_retention(
    req: SetRetentionRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    policy = RecordsGovernance.set_retention_policy(
        db, workspace_id, req.document_class, req.retention_days, req.auto_delete
    )
    return policy


@router.post("/records/legal-hold")
def create_legal_hold(
    req: CreateLegalHoldRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    hold = RecordsGovernance.create_legal_hold(
        db,
        workspace_id,
        req.resource_type,
        req.resource_id,
        req.reason,
        admin.id,
    )
    return hold


@router.post("/records/legal-hold/release")
def release_legal_hold(
    req: ReleaseLegalHoldRequest,
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    try:
        hold = RecordsGovernance.release_legal_hold(db, req.hold_id, admin.id)
        return hold
    except ValueError as e:
        raise HTTPException(404, str(e))


# ── Records Retention Enforcement ───────────────────────────────────────


@router.post("/records/policies")
def create_retention_policy(
    req: CreateRetentionPolicyRequest,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
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
            RetentionPolicy.workspace_id == workspace_id,
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
            workspace_id=workspace_id,
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
def list_retention_policies(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
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
def preview_expired_records(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    """Preview expired records (dry run — no deletion)."""
    return RecordsGovernance.get_expired_records(db, workspace_id)


@router.post("/records/cleanup")
def manual_retention_cleanup(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    """Manually trigger retention cleanup for a workspace."""
    return RecordsGovernance.execute_retention(db, workspace_id)


@router.get("/records/report")
def retention_report(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    """Get a retention report for a workspace."""
    return RecordsGovernance.get_retention_report(db, workspace_id)


# ── Sandbox ──────────────────────────────────────────────────────────────────


@router.post("/sandbox/create")
def create_sandbox(
    req: CreateSandboxRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    return SandboxService.create_sandbox(db, workspace_id, req.name)


@router.post("/sandbox/{sandbox_id}/reset")
def reset_sandbox(
    sandbox_id: str,
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    try:
        return SandboxService.reset_sandbox(db, sandbox_id)
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.post("/sandbox/{sandbox_id}/load-data")
def load_synthetic_data(
    sandbox_id: str,
    db: Session = Depends(get_db),
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    try:
        return SandboxService.load_synthetic_data(db, sandbox_id)
    except ValueError as e:
        raise HTTPException(404, str(e))


# ── Database Backups ────────────────────────────────────────────────────────


@router.post("/backups/trigger")
def trigger_backup(
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    """Manually trigger a database backup to S3 (admin only)."""
    from app.jobs.tasks.backup_tasks import automated_db_backup

    result = automated_db_backup.delay()
    return {"task_id": result.id, "status": "queued"}


@router.get("/backups")
def list_backups(
    limit: int = 30,
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    """List recent database backups from S3."""
    from app.jobs.tasks.backup_tasks import list_backups as _list_backups

    try:
        backups = _list_backups(limit=limit)
        return {"backups": backups, "count": len(backups)}
    except Exception as e:
        raise HTTPException(500, f"Failed to list backups: {e}")


@router.post("/backups/verify/{s3_key:path}")
def verify_backup(
    s3_key: str,
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    """Trigger integrity verification for a specific backup."""
    from app.jobs.tasks.backup_tasks import verify_backup_integrity

    result = verify_backup_integrity.delay(s3_key)
    return {"task_id": result.id, "s3_key": s3_key, "status": "queued"}


# ── Endpoints the admin UI calls and no BFF serves ───────────────────────────
#
# T-028 is closed under D4: the BFF goes direct to Postgres for the domain
# models and this package builds no new endpoints for them. The four groups
# below are the stated exception - admin surfaces with no BFF equivalent,
# which the UI already calls and which returned 404.
#
# Each is a read or a rollback over a service that already exists. Nothing
# here invents data: an unconfigured white-label returns its absence rather
# than a default brand.


@router.get("/flags")
def list_flags(
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Every feature flag and its rollout state.

    `POST /flags/set` existed with no way to read back what was set, so an
    operator could change a flag and had no means of confirming it.
    """
    from app.models.feature_flag import FeatureFlag

    flags = db.query(FeatureFlag).order_by(FeatureFlag.name).all()
    return {
        "flags": [
            {
                "name": f.name,
                "enabled": f.enabled,
                "rollout_percentage": f.rollout_percentage,
                "plan_requirements": f.plan_requirements or [],
            }
            for f in flags
        ],
        "count": len(flags),
    }


@router.get("/flags/{name}")
def get_flag(
    name: str,
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """One flag's configuration, and whether it resolves on for this workspace.

    The two differ: a flag can be enabled at 20% rollout and still be off
    here. Returning only the stored row would have an operator reading
    `enabled: true` while the feature stayed dark for them.
    """
    from app.models.feature_flag import FeatureFlag

    flag = db.query(FeatureFlag).filter(FeatureFlag.name == name).first()
    if flag is None:
        raise HTTPException(404, f"No feature flag named {name!r}")

    return {
        "name": flag.name,
        "enabled": flag.enabled,
        "rollout_percentage": flag.rollout_percentage,
        "plan_requirements": flag.plan_requirements or [],
        "active_for_this_workspace": EntitlementEngine.check_flag(
            db, name, workspace_id
        ),
    }


@router.get("/prompts/{agent_name}")
def get_prompt_history(
    agent_name: str,
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Version history for an agent's prompt, newest first.

    `POST /prompts/rollback` takes a target version, and there was no
    endpoint that listed the versions available - so the rollback surface
    required knowing a number the API would not tell you.
    """
    versions = AIEvalLab.get_prompt_history(db, agent_name)
    active = AIEvalLab.get_active_prompt(db, agent_name)

    return {
        "agent_name": agent_name,
        "active_version": active.version if active else None,
        "versions": [
            {
                "id": str(v.id),
                "version": v.version,
                "is_active": v.is_active,
                "created_by": str(v.created_by) if v.created_by else None,
                "created_at": v.created_at.isoformat() if v.created_at else None,
            }
            for v in versions
        ],
        "count": len(versions),
    }


@router.post("/prompts/{agent_name}/rollback/{version}")
def rollback_prompt_to_version(
    agent_name: str,
    version: int,
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Roll an agent's prompt back to *version*.

    The RESTful form of `POST /prompts/rollback`, which the UI calls. Both
    go through the same service, so there is one rollback path rather than
    two that can diverge.
    """
    try:
        pv = AIEvalLab.rollback_prompt(db, agent_name, version)
    except ValueError as exc:
        raise HTTPException(404, str(exc))

    return {
        "id": str(pv.id),
        "agent_name": pv.agent_name,
        "version": pv.version,
        "is_active": pv.is_active,
    }


@router.get("/white-label")
def get_white_label(
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """This workspace's white-label configuration, or its absence.

    Returns `configured: false` rather than a default brand. A UI shown
    placeholder branding cannot tell it apart from branding somebody chose.
    """
    config = WhiteLabelService.get_config(db, workspace_id)
    if config is None:
        return {"configured": False, "config": None}

    return {
        "configured": True,
        "config": {
            "brand_name": config.brand_name,
            "logo_url": config.logo_url,
            "primary_color": config.primary_color,
            "secondary_color": config.secondary_color,
            "favicon_url": config.favicon_url,
            "custom_domain": config.custom_domain,
            "email_from_name": config.email_from_name,
            "email_from_address": config.email_from_address,
            "portal_footer_text": config.portal_footer_text,
            "is_active": config.is_active,
        },
    }


@router.put("/white-label")
def update_white_label(
    req: WhiteLabelUpdateRequest,
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Update this workspace's white-label configuration."""
    data = {k: v for k, v in req.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(400, "No fields to update.")

    config = WhiteLabelService.update_config(db, workspace_id, data)
    return {"updated": True, "brand_name": config.brand_name}


@router.get("/white-label/portal-branding")
def get_portal_branding(
    workspace_id: str = Depends(get_workspace_id),
    admin: ResolvedIdentity = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Branding as the client portal renders it."""
    return WhiteLabelService.get_portal_branding(db, workspace_id)


@router.post("/white-label/validate-domain")
def validate_custom_domain(
    req: ValidateDomainRequest,
    admin: ResolvedIdentity = Depends(require_role("admin")),
):
    """Check a custom domain and return the DNS records it needs.

    Pure validation - it neither stores the domain nor claims it is live.
    """
    return WhiteLabelService.validate_custom_domain(req.domain)
