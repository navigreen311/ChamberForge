"""Export endpoints - watermarked PDF generation.

P-15 (T-008). All three routes were anonymous, and both halves of the
watermark came from the caller:

    user_id: str = Query(...),
    workspace_id: str = Query("default"),
    ...
    pdf_bytes = pdf_export_service.export_offer(offer_data, user_id)

The watermark is `CF-WM|user={user_id}|ws={workspace_id}|ts={timestamp}` -
a **traceability stamp**, the thing you consult to identify who leaked a
document. Taking the user id from a query string on an unauthenticated route
meant anyone could export a document watermarked with somebody else's
identity, and deliberately misattribute the leak.

A watermark naming a person the caller chose is worse than no watermark: it
produces confident, wrong evidence.

Both now come from the session and cannot be set from outside.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.core.dependencies import get_current_user, get_workspace_id
from app.core.identity import ResolvedIdentity
from app.services.backbone.pdf_export import pdf_export_service
from app.services.backbone.storage_service import storage_service

router = APIRouter(prefix="/api/v1/exports", tags=["exports"])


def _upload_pdf_to_s3(pdf_bytes: bytes, workspace_id: str, filename: str) -> str:
    """Upload generated PDF to S3 and return the presigned download URL."""
    result = storage_service.upload_file(
        workspace_id=workspace_id,
        file_bytes=pdf_bytes,
        file_name=filename,
        content_type="application/pdf",
    )
    return result["url"]


@router.post("/offer/{offer_id}")
async def export_offer(
    offer_id: str,
    current_user: ResolvedIdentity = Depends(get_current_user),
    workspace_id: str = Depends(get_workspace_id),
):
    """Export an offer as a watermarked PDF.

    In a full implementation this would fetch the offer from DB;
    here we build a representative PDF from the offer_id.
    """
    offer_data = {
        "id": offer_id,
        "title": f"Investment Offer — {offer_id}",
        "workspace_id": workspace_id,
        "summary": "This document contains the full terms and conditions of the investment offer.",
        "terms": "Standard HNW engagement terms apply. Minimum commitment period: 12 months.",
        "status": "Active",
        "conditions": [
            "Accredited investor verification required",
            "Minimum investment: $250,000",
            "Lock-up period: 12 months",
        ],
    }

    pdf_bytes = pdf_export_service.export_offer(offer_data, current_user.id)
    filename = f"offer-{offer_id}.pdf"
    download_url = _upload_pdf_to_s3(pdf_bytes, workspace_id, filename)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Download-URL": download_url,
        },
    )


@router.post("/trust-pack/{trust_pack_id}")
async def export_trust_pack(
    trust_pack_id: str,
    current_user: ResolvedIdentity = Depends(get_current_user),
    workspace_id: str = Depends(get_workspace_id),
):
    """Export a trust pack as a watermarked PDF."""
    trust_data = {
        "id": trust_pack_id,
        "title": f"Trust & Verification Pack — {trust_pack_id}",
        "workspace_id": workspace_id,
        "summary": "Comprehensive verification and trust documentation package.",
        "items": [
            "Identity verification completed",
            "Source of funds confirmed",
            "Background check passed",
            "Regulatory compliance verified",
        ],
    }

    pdf_bytes = pdf_export_service.export_trust_pack(trust_data, current_user.id)
    filename = f"trust-pack-{trust_pack_id}.pdf"
    download_url = _upload_pdf_to_s3(pdf_bytes, workspace_id, filename)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Download-URL": download_url,
        },
    )


@router.post("/intel-brief/{brief_id}")
async def export_intel_brief(
    brief_id: str,
    current_user: ResolvedIdentity = Depends(get_current_user),
    workspace_id: str = Depends(get_workspace_id),
):
    """Export an intelligence brief as a watermarked PDF."""
    brief_data = {
        "id": brief_id,
        "title": f"Intelligence Brief — {brief_id}",
        "workspace_id": workspace_id,
        "overview": "Market intelligence analysis for the current reporting period.",
        "findings": [
            "Market sentiment trending positive in target sectors",
            "Regulatory changes expected in Q3",
            "Key competitor activity detected in adjacent market",
        ],
        "analysis": (
            "Based on aggregated data from multiple sources, the current opportunity "
            "window remains favorable. Risk factors are contained within acceptable thresholds."
        ),
        "classification": "Confidential",
        "recommendations": [
            "Proceed with Phase 2 allocation",
            "Monitor regulatory developments weekly",
            "Engage advisory board for sector-specific guidance",
        ],
    }

    pdf_bytes = pdf_export_service.export_intel_brief(brief_data, current_user.id)
    filename = f"intel-brief-{brief_id}.pdf"
    download_url = _upload_pdf_to_s3(pdf_bytes, workspace_id, filename)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Download-URL": download_url,
        },
    )
