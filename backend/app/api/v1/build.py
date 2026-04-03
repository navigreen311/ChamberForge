"""Build layer API — Proof Builder, Fulfillment OS, Deal Desk, Trust Pack, Wedge Entry.

All endpoints require authentication and tag outputs with workspace_id.
"""
from fastapi import APIRouter, Body, Depends

from app.core.dependencies import get_workspace_id
from app.services.agents.fulfillment_ai import FulfillmentAI
from app.services.agents.proof_ai import ProofAI
from app.services.backbone.deal_desk import DealDesk
from app.services.backbone.trust_pack import TrustPack
from app.services.backbone.wedge_entry import WedgeEntry

router = APIRouter(prefix="/api/v1/build", tags=["build"])

fulfillment_ai = FulfillmentAI()
proof_ai = ProofAI()
deal_desk = DealDesk()
trust_pack = TrustPack()
wedge_entry = WedgeEntry()


# ── Fulfillment OS ──────────────────────────────────────────────────

@router.post("/fulfillment/sop-bundle")
async def generate_sop_bundle(
    offer_data: dict = Body(...),
    workspace_id: str = Depends(get_workspace_id),
):
    result = await fulfillment_ai.generate_sop_bundle(offer_data)
    result["workspace_id"] = workspace_id
    return result


@router.post("/fulfillment/blueprint")
async def generate_execution_blueprint(
    offer_data: dict = Body(...),
    workspace_id: str = Depends(get_workspace_id),
):
    result = await fulfillment_ai.generate_execution_blueprint(offer_data)
    result["workspace_id"] = workspace_id
    return result


# ── Proof Builder ───────────────────────────────────────────────────

@router.post("/proof/kpi-stack")
async def design_kpi_stack(
    offer_data: dict = Body(...),
    workspace_id: str = Depends(get_workspace_id),
):
    result = await proof_ai.design_kpi_stack(offer_data)
    result["workspace_id"] = workspace_id
    return result


@router.post("/proof/roi")
async def generate_roi_framework(
    offer_data: dict = Body(...),
    workspace_id: str = Depends(get_workspace_id),
):
    result = await proof_ai.generate_roi_framework(offer_data)
    result["workspace_id"] = workspace_id
    return result


@router.post("/proof/case-study")
async def build_case_study_template(
    offer_data: dict = Body(...),
    workspace_id: str = Depends(get_workspace_id),
):
    result = await proof_ai.build_case_study_template(offer_data)
    result["workspace_id"] = workspace_id
    return result


# ── Deal Desk ───────────────────────────────────────────────────────

@router.post("/deal-desk/proposal")
async def generate_proposal(
    offer_data: dict = Body(..., embed=True),
    client_data: dict = Body(..., embed=True),
    workspace_id: str = Depends(get_workspace_id),
):
    result = deal_desk.generate_proposal(offer_data, client_data)
    result["workspace_id"] = workspace_id
    return result


@router.post("/deal-desk/sow")
async def generate_sow(
    offer_data: dict = Body(...),
    workspace_id: str = Depends(get_workspace_id),
):
    result = deal_desk.generate_sow(offer_data)
    result["workspace_id"] = workspace_id
    return result


@router.post("/deal-desk/nda")
async def generate_nda(
    parties: list[str] = Body(...),
    workspace_id: str = Depends(get_workspace_id),
):
    result = deal_desk.generate_nda_template(parties)
    result["workspace_id"] = workspace_id
    return result


# ── Trust Pack ──────────────────────────────────────────────────────

@router.post("/trust-pack")
async def generate_trust_pack(
    workspace_data: dict = Body(..., embed=True),
    offer_data: dict = Body(..., embed=True),
    workspace_id: str = Depends(get_workspace_id),
):
    result = trust_pack.generate_trust_pack(workspace_data, offer_data)
    result["workspace_id"] = workspace_id
    return result


# ── Wedge Entry ─────────────────────────────────────────────────────

@router.post("/wedge-entry")
async def design_wedge(
    offer_data: dict = Body(...),
    workspace_id: str = Depends(get_workspace_id),
):
    result = wedge_entry.design_wedge(offer_data)
    result["workspace_id"] = workspace_id
    return result
