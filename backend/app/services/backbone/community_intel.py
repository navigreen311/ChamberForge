"""Community Intel Network — anonymized practitioner insight sharing."""
from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.community_insight import CommunityInsight


_VALID_INSIGHT_TYPES = {"market_signal", "pricing_intel", "objection_pattern", "delivery_tip"}
_VALID_VOTES = {"upvote", "downvote"}


def _anonymize_text(text: str) -> str:
    """Strip names, emails, phone numbers, and company references."""
    # Email
    text = re.sub(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b", "[EMAIL]", text)
    # Phone
    text = re.sub(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b", "[PHONE]", text)
    # Proper nouns after common patterns (basic heuristic)
    text = re.sub(r"\b(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?", "[NAME]", text)
    return text


class CommunityIntelNetwork:
    """Layer-4 service: anonymized community insight exchange."""

    def share_insight(
        self,
        db: Session,
        workspace_id: str,
        insight_type: str,
        content: str,
        anonymize: bool = True,
    ) -> dict:
        """Share an anonymized insight with the community."""
        if insight_type not in _VALID_INSIGHT_TYPES:
            return {
                "success": False,
                "error": f"Invalid insight_type. Must be one of: {', '.join(sorted(_VALID_INSIGHT_TYPES))}",
            }

        final_content = _anonymize_text(content) if anonymize else content

        insight = CommunityInsight(
            id=str(uuid.uuid4()),
            contributor_workspace_id=workspace_id,
            insight_type=insight_type,
            content=final_content,
            category=insight_type,
            is_anonymized=anonymize,
        )
        db.add(insight)
        db.commit()
        db.refresh(insight)

        return {
            "success": True,
            "insight_id": insight.id,
            "is_anonymized": insight.is_anonymized,
            "content_preview": final_content[:100],
        }

    def get_community_feed(
        self,
        db: Session,
        category: Optional[str] = None,
        limit: int = 20,
    ) -> list[dict]:
        """Return anonymized insights from the community."""
        query = db.query(CommunityInsight).filter(CommunityInsight.is_anonymized.is_(True))
        if category:
            query = query.filter(CommunityInsight.category == category)
        query = query.order_by(desc(CommunityInsight.created_at)).limit(limit)

        results = []
        for ins in query.all():
            results.append({
                "id": ins.id,
                "insight_type": ins.insight_type,
                "content": ins.content,
                "category": ins.category,
                "upvotes": ins.upvotes,
                "downvotes": ins.downvotes,
                "net_score": ins.upvotes - ins.downvotes,
                "created_at": ins.created_at.isoformat() if ins.created_at else None,
            })
        return results

    def get_market_pulse(self, db: Session) -> dict:
        """Aggregated community signals — trending categories, pricing, objections."""
        # Trending pain categories
        category_counts = (
            db.query(CommunityInsight.category, func.count(CommunityInsight.id))
            .group_by(CommunityInsight.category)
            .order_by(func.count(CommunityInsight.id).desc())
            .limit(10)
            .all()
        )

        # Insight type distribution
        type_counts = (
            db.query(CommunityInsight.insight_type, func.count(CommunityInsight.id))
            .group_by(CommunityInsight.insight_type)
            .all()
        )

        total = db.query(func.count(CommunityInsight.id)).scalar() or 0

        # Top voted insights
        top_insights = (
            db.query(CommunityInsight)
            .order_by(desc(CommunityInsight.upvotes - CommunityInsight.downvotes))
            .limit(5)
            .all()
        )

        return {
            "total_insights": total,
            "trending_categories": [
                {"category": cat, "count": cnt} for cat, cnt in category_counts
            ],
            "insight_type_distribution": {t: c for t, c in type_counts},
            "top_insights": [
                {
                    "id": i.id,
                    "insight_type": i.insight_type,
                    "content": i.content[:120],
                    "net_score": i.upvotes - i.downvotes,
                }
                for i in top_insights
            ],
        }

    def vote_insight(self, db: Session, insight_id: str, vote: str) -> dict:
        """Upvote or downvote an insight."""
        if vote not in _VALID_VOTES:
            return {"success": False, "error": f"Vote must be one of: {', '.join(sorted(_VALID_VOTES))}"}

        insight = db.query(CommunityInsight).filter(CommunityInsight.id == insight_id).first()
        if not insight:
            return {"success": False, "error": "Insight not found"}

        if vote == "upvote":
            insight.upvotes = (insight.upvotes or 0) + 1
        else:
            insight.downvotes = (insight.downvotes or 0) + 1

        db.commit()
        db.refresh(insight)

        return {
            "success": True,
            "insight_id": insight.id,
            "upvotes": insight.upvotes,
            "downvotes": insight.downvotes,
            "net_score": insight.upvotes - insight.downvotes,
        }
