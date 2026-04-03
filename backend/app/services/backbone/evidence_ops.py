"""Evidence CRUD and business logic operations."""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.evidence import Evidence
from app.schemas.evidence import EvidenceCreate, EvidenceUpdate
from app.services.agents.research_ai import ResearchAI


class EvidenceOps:
    """Backbone operations for the Evidence Graph."""

    @staticmethod
    def create(db: Session, workspace_id: UUID, data: EvidenceCreate) -> Evidence:
        evidence = Evidence(
            workspace_id=workspace_id,
            source_url=data.source_url,
            source_type=data.source_type,
            publication_date=data.publication_date,
            credibility_score=data.credibility_score,
            extracted_claims=data.extracted_claims,
            contradiction_flags=data.contradiction_flags,
            problem_id=data.problem_id,
        )
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        return evidence

    @staticmethod
    def get(db: Session, evidence_id: UUID) -> Optional[Evidence]:
        return db.query(Evidence).filter(Evidence.id == evidence_id).first()

    @staticmethod
    def list(
        db: Session,
        workspace_id: UUID,
        problem_id: Optional[UUID] = None,
        source_type: Optional[str] = None,
        min_credibility: Optional[float] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> list[Evidence]:
        q = db.query(Evidence).filter(Evidence.workspace_id == workspace_id)
        if problem_id is not None:
            q = q.filter(Evidence.problem_id == problem_id)
        if source_type is not None:
            q = q.filter(Evidence.source_type == source_type)
        if min_credibility is not None:
            q = q.filter(Evidence.credibility_score >= min_credibility)
        return q.order_by(Evidence.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def update(db: Session, evidence_id: UUID, data: EvidenceUpdate) -> Optional[Evidence]:
        evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
        if not evidence:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(evidence, key, value)
        db.commit()
        db.refresh(evidence)
        return evidence

    @staticmethod
    def delete(db: Session, evidence_id: UUID) -> bool:
        evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
        if not evidence:
            return False
        db.delete(evidence)
        db.commit()
        return True

    @staticmethod
    def link_to_problem(db: Session, evidence_id: UUID, problem_id: UUID) -> Optional[Evidence]:
        evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
        if not evidence:
            return None
        evidence.problem_id = problem_id
        db.commit()
        db.refresh(evidence)
        return evidence

    @staticmethod
    def check_duplicate(db: Session, source_url: str) -> Optional[Evidence]:
        return db.query(Evidence).filter(Evidence.source_url == source_url).first()

    @staticmethod
    def get_analyst_queue(db: Session, workspace_id: UUID) -> list[Evidence]:
        """Return evidence items needing analyst review.

        Criteria: credibility_score < 5.0 OR contradiction_flags is not empty/null.
        """
        return (
            db.query(Evidence)
            .filter(
                Evidence.workspace_id == workspace_id,
                or_(
                    Evidence.credibility_score < 5.0,
                    Evidence.contradiction_flags != "[]",
                    Evidence.contradiction_flags.isnot(None),
                ),
            )
            .order_by(Evidence.credibility_score.asc())
            .all()
        )

    @staticmethod
    def recalculate_all_decay(db: Session, workspace_id: UUID) -> int:
        """Recalculate recency decay scores for all evidence in a workspace.

        Returns count of updated records.
        """
        research_ai = ResearchAI()
        evidences = (
            db.query(Evidence).filter(Evidence.workspace_id == workspace_id).all()
        )
        count = 0
        for ev in evidences:
            new_decay = research_ai.compute_recency_decay(
                ev.credibility_score, ev.publication_date
            )
            ev.recency_decay_score = new_decay
            count += 1
        db.commit()
        return count
