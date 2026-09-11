"""Qualify API - validation, profiling, guardrails, risk review, readiness.

P-13 (T-008). All twelve routes were anonymous, and two of them were
worse than that.

**`reviewer_id` came from the request body.** `/risk-queue/{id}/approve`
and `/reject` took the reviewer's identity as a field the caller
supplied, and wrote it straight onto the review record. So an
unauthenticated caller could approve a risk item **and attribute the
approval to somebody else** - a named colleague, or a compliance
officer who never saw it. The stored record would then show a review
that person did not perform.

The reviewer is now the session's operator and cannot be set from
outside. This is the same defect class P-11 removed from the audit
trail: identity that arrives with the request is not identity.

**`/risk-queue` took `workspace_id` as a query parameter**, so any
caller could list another firm's pending risk reviews by naming their
workspace. It now derives from the session.
"""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_workspace_id
from app.core.identity import ResolvedIdentity
from app.db.session import get_db
from app.services.agents.validator_ai import ValidatorAI
from app.services.backbone.buyer_profiler import BuyerProfiler
from app.services.backbone.competitive_intel import CompetitiveIntel
from app.services.backbone.founder_readiness import FounderReadiness
from app.services.backbone.geo_intelligence import GeoIntelligence
from app.services.backbone.guardrails_engine import GuardrailsEngine
from app.services.backbone.offer_feasibility import OfferFeasibility
from app.services.backbone.risk_review_queue import RiskReviewQueue

router = APIRouter(prefix="/api/v1/qualify", tags=["qualify"])


# ── Request / Response schemas ────────────────────────────────

class BuyerProfileRequest(BaseModel):
    wealth_tier: str
    life_stage: str
    pain_category: str


class CompetitiveIntelRequest(BaseModel):
    pain_category: str
    geo: str | None = None


class FeasibilityRequest(BaseModel):
    monthly_price: float
    costs: dict[str, float]
    volume: int
    delivery_model: str
    num_services: int
    pain_category: str
    compliance_risk: str


class GuardrailsCheckRequest(BaseModel):
    offer_data: dict[str, Any]


class GeoComplianceRequest(BaseModel):
    jurisdictions: list[str]


class RiskApproveRequest(BaseModel):
    # reviewer_id removed. It was written straight onto the review
    # record, so a caller could attribute an approval to anyone.
    notes: str = ""


class RiskRejectRequest(BaseModel):
    reason: str


class RiskEscalateRequest(BaseModel):
    note: str


class FounderReadinessRequest(BaseModel):
    skills: dict[str, int]
    credentials: list[str]
    network_score: int


# ── Singleton service instances ───────────────────────────────

_validator = ValidatorAI()
_profiler = BuyerProfiler()
_intel = CompetitiveIntel()
_feasibility = OfferFeasibility()
_guardrails = GuardrailsEngine()
_geo = GeoIntelligence()
_readiness = FounderReadiness()


def _reviewer_uuid(current_user: ResolvedIdentity) -> uuid.UUID:
    """The session operator's id, as the review record stores it.

    `RiskReviewQueue` types `reviewer_id` as a UUID and that service
    belongs to another package, so the conversion happens here. An
    identity that will not parse is refused rather than coerced: a review
    attributed to a placeholder is the problem this replaced.
    """
    try:
        return uuid.UUID(str(current_user.id))
    except (ValueError, AttributeError, TypeError) as exc:
        raise HTTPException(
            status_code=422,
            detail="The signed-in operator has no reviewer identity.",
        ) from exc


# ── Endpoints ─────────────────────────────────────────────────

@router.post("/validate/{problem_id}")
async def validate_problem(
    problem_id: uuid.UUID,
    workspace_id: str = Depends(get_workspace_id),
):
    """Run 4-point validation scorecard on a problem."""
    # In production this would load the problem from DB; for now accept inline data
    problem_data = {"id": str(problem_id), "title": "Premium problem", "pain_category": "Privacy"}
    result = await _validator.validate_problem(problem_data)
    return {"problem_id": str(problem_id), "validation": result}


@router.post("/buyer-profile")
async def generate_buyer_profile(
    req: BuyerProfileRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    profile = _profiler.generate_profile(req.wealth_tier, req.life_stage, req.pain_category)
    return {"profile": profile}


@router.post("/competitive-intel")
async def analyze_competitive_intel(
    req: CompetitiveIntelRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    analysis = _intel.analyze_market(req.pain_category, req.geo)
    return {"analysis": analysis}


@router.post("/feasibility")
async def assess_feasibility(
    req: FeasibilityRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    margins = _feasibility.simulate_margins(req.monthly_price, req.costs, req.volume)
    complexity = _feasibility.score_complexity(req.delivery_model, req.num_services)
    liability = _feasibility.assess_liability(req.pain_category, req.compliance_risk)
    return {
        "margins": margins,
        "complexity_score": complexity,
        "liability": liability,
    }


@router.post("/guardrails-check")
async def check_guardrails(
    req: GuardrailsCheckRequest,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    # P-09 made this record its verdict; passing the session is what
    # makes the compliance decision durable rather than advisory.
    result = _guardrails.check_offer(
        req.offer_data, db=db, workspace_id=workspace_id
    )
    return result


@router.get("/geo-rules/{country_code}")
async def get_geo_rules(
    country_code: str,
    workspace_id: str = Depends(get_workspace_id),
):
    rules = _geo.get_jurisdiction_rules(country_code)
    return rules


@router.post("/geo-compliance")
async def check_geo_compliance(
    req: GeoComplianceRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    results = _geo.check_compliance(req.jurisdictions)
    return {"compliance": results}


@router.get("/risk-queue")
async def get_risk_queue(
    status: str = "pending",
    skip: int = 0,
    limit: int = 20,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Pending risk reviews for the caller's own workspace.

    `workspace_id` was a required query parameter, so any caller could
    list another firm's risk queue by naming their workspace.
    """
    items = RiskReviewQueue.get_queue(db, workspace_id, status, skip, limit)
    return {"items": [_serialize_review(r) for r in items]}


@router.post("/risk-queue/{item_id}/approve")
async def approve_risk_item(
    item_id: uuid.UUID,
    req: RiskApproveRequest,
    current_user: ResolvedIdentity = Depends(get_current_user),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Approve a risk item, attributed to the signed-in operator.

    The reviewer used to come from the request body. An approval is a
    compliance record naming who signed it off; taking that name from
    the caller made the record worthless.
    """
    reviewer_id = _reviewer_uuid(current_user)
    try:
        review = RiskReviewQueue.approve(db, item_id, reviewer_id, req.notes)
    except Exception:
        raise HTTPException(status_code=404, detail="Risk review item not found")
    return _serialize_review(review)


@router.post("/risk-queue/{item_id}/reject")
async def reject_risk_item(
    item_id: uuid.UUID,
    req: RiskRejectRequest,
    current_user: ResolvedIdentity = Depends(get_current_user),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Reject a risk item, attributed to the signed-in operator."""
    reviewer_id = _reviewer_uuid(current_user)
    try:
        review = RiskReviewQueue.reject(db, item_id, reviewer_id, req.reason)
    except Exception:
        raise HTTPException(status_code=404, detail="Risk review item not found")
    return _serialize_review(review)


@router.post("/risk-queue/{item_id}/escalate")
async def escalate_risk_item(
    item_id: uuid.UUID,
    req: RiskEscalateRequest,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    try:
        review = RiskReviewQueue.escalate(db, item_id, req.note)
    except Exception:
        raise HTTPException(status_code=404, detail="Risk review item not found")
    return _serialize_review(review)


@router.post("/founder-readiness")
async def assess_founder_readiness(
    req: FounderReadinessRequest,
    workspace_id: str = Depends(get_workspace_id),
):
    result = _readiness.assess(req.skills, req.credentials, req.network_score)
    return result


# ── Helpers ───────────────────────────────────────────────────

def _serialize_review(r) -> dict:
    return {
        "id": str(r.id),
        "workspace_id": str(r.workspace_id),
        "item_type": r.item_type,
        "item_id": str(r.item_id),
        "risk_level": r.risk_level,
        "reason": r.reason,
        "status": r.status,
        "reviewer_id": str(r.reviewer_id) if r.reviewer_id else None,
        "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
        "notes": r.notes,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }
