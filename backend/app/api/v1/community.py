"""Community API - Community Intel Network endpoints.

P-15 (T-008). Four anonymous routes, one of which wrote. See `share_insight`
for the attribution defect.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_workspace_id
from app.db.session import get_db
from app.services.backbone.community_intel import CommunityIntelNetwork

router = APIRouter(prefix="/api/v1/community", tags=["community"])
network = CommunityIntelNetwork()


class ShareRequest(BaseModel):
    # workspace_id removed: it attributed the insight, and an anonymous
    # caller could publish one in another firm's name.
    insight_type: str
    content: str
    anonymize: bool = True


class VoteRequest(BaseModel):
    insight_id: str
    vote: str  # upvote / downvote


@router.post("/share")
def share_insight(
    payload: ShareRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    """Share an anonymised insight with the community.

    The sharing workspace came from the request body, so an anonymous caller
    could publish an insight **attributed to another firm**. On a network
    whose whole value is that contributions are attributable-but-anonymised,
    that is the one field that must not be caller-supplied.
    """
    return network.share_insight(
        db,
        workspace_id=workspace_id,
        insight_type=payload.insight_type,
        content=payload.content,
        anonymize=payload.anonymize,
    )


@router.get("/feed")
def get_feed(
    category: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    """Get community insight feed."""
    return network.get_community_feed(db, category=category, limit=limit)


@router.get("/pulse")
def get_pulse(
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    """Get aggregated market pulse from community signals."""
    return network.get_market_pulse(db)


@router.post("/vote")
def vote(
    payload: VoteRequest,
    db: Session = Depends(get_db),
    workspace_id: str = Depends(get_workspace_id),
):
    """Vote on a community insight."""
    return network.vote_insight(db, payload.insight_id, payload.vote)
