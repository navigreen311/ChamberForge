"""Community API — Community Intel Network endpoints."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.backbone.community_intel import CommunityIntelNetwork

router = APIRouter(prefix="/api/v1/community", tags=["community"])
network = CommunityIntelNetwork()


class ShareRequest(BaseModel):
    workspace_id: str
    insight_type: str
    content: str
    anonymize: bool = True


class VoteRequest(BaseModel):
    insight_id: str
    vote: str  # upvote / downvote


@router.post("/share")
def share_insight(payload: ShareRequest, db: Session = Depends(get_db)):
    """Share an anonymized insight with the community."""
    return network.share_insight(
        db,
        workspace_id=payload.workspace_id,
        insight_type=payload.insight_type,
        content=payload.content,
        anonymize=payload.anonymize,
    )


@router.get("/feed")
def get_feed(
    category: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """Get community insight feed."""
    return network.get_community_feed(db, category=category, limit=limit)


@router.get("/pulse")
def get_pulse(db: Session = Depends(get_db)):
    """Get aggregated market pulse from community signals."""
    return network.get_market_pulse(db)


@router.post("/vote")
def vote(payload: VoteRequest, db: Session = Depends(get_db)):
    """Vote on a community insight."""
    return network.vote_insight(db, payload.insight_id, payload.vote)
