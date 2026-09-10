"""ScoringResult - a durable record of a scoring decision.

P-01 creates the table; P-09 writes to it from red_team_auditor,
client_health, decision_room and guardrails_engine. All four currently
compute a score and discard it, which means "why was this offer approved in
March" has no answer. `inputs` is stored alongside the score so a past
decision can be explained rather than merely recited.
"""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa

from app.db.session import Base


class ScoringResult(Base):
    __tablename__ = "scoring_results"
    __table_args__ = (
        sa.Index("ix_scoring_results_subject", "subject_type", "subject_id"),
        sa.Index("ix_scoring_results_ws_scorer", "workspace_id", "scorer"),
    )

    id = sa.Column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = sa.Column(sa.String(36), nullable=False)
    scorer = sa.Column(sa.String(50), nullable=False)
    subject_type = sa.Column(sa.String(50), nullable=False)
    subject_id = sa.Column(sa.String(36), nullable=False)
    score = sa.Column(sa.Float, nullable=True)
    verdict = sa.Column(sa.String(50), nullable=True)
    inputs = sa.Column(sa.JSON, nullable=False, default=dict)
    detail = sa.Column(sa.JSON, nullable=False, default=dict)
    created_at = sa.Column(
        sa.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
