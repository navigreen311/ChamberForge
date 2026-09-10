"""Durable records of scoring decisions - so a past decision can be explained.

P-09 (T-039). Four services computed a score and discarded it:
`red_team_auditor`, `client_health`, `decision_room` and `guardrails_engine`.
Each returned a verdict to its caller and kept nothing, so *"why was this
offer approved in March"* had no answer at all - not a hard one, none.

For a compliance surface that matters more than it sounds. A guardrails
BLOCK that was later overridden, a red-team audit that passed an offer now
under question, a client marked healthy the month before they left: each was
a decision the platform made and could not account for.

`inputs` is stored beside the score deliberately. A recorded verdict without
its inputs lets you *recite* a past decision but not *explain* it, and the
question people actually ask is why - which needs what the scorer was
looking at.

This module is not in P-09's card, which lists only the two test files under
`creates`. It exists because four services need the same write path, and
putting it inside one of them would have made the other three import from an
unrelated service.
"""
from __future__ import annotations

import logging
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.db.scope import current_scope
from app.db.session import SessionLocal
from app.models.scoring_result import ScoringResult

logger = logging.getLogger("chamberforge.scoring")

SCORER_RED_TEAM = "red_team_auditor"
SCORER_CLIENT_HEALTH = "client_health"
SCORER_DECISION_ROOM = "decision_room"
SCORER_GUARDRAILS = "guardrails_engine"


def resolve_workspace(workspace_id: Optional[str] = None) -> Optional[str]:
    """The workspace to file this decision under, or None.

    Reads the operator scope P-02's middleware binds, so scoring services do
    not need a `workspace_id` argument threaded through routers that belong
    to other packages.
    """
    if workspace_id:
        return workspace_id
    scope = current_scope()
    return scope.workspace_id if scope else None


def record_score(
    *,
    scorer: str,
    subject_type: str,
    subject_id: str,
    inputs: dict[str, Any],
    score: Optional[float] = None,
    verdict: Optional[str] = None,
    detail: Optional[dict[str, Any]] = None,
    db: Optional[Session] = None,
    workspace_id: Optional[str] = None,
) -> Optional[ScoringResult]:
    """Persist one scoring decision. Returns the row, or None if not recorded.

    **Never raises.** A scoring service must not fail because its audit trail
    did - refusing to score an offer because a write failed would turn a
    record-keeping problem into an outage. But a silent drop is the failure
    nobody notices, so a failure is logged and None returned, and callers
    that care can check.

    Skips silently when no workspace can be resolved. An unscoped scoring
    record cannot be retrieved by the workspace that made it and would be
    invisible to the scope filter - writing it would create a row nobody can
    read and the filter cannot reach.
    """
    workspace_id = resolve_workspace(workspace_id)
    if not workspace_id:
        logger.warning(
            "%s scored %s/%s with no workspace bound; the decision was not recorded",
            scorer,
            subject_type,
            subject_id or "?",
        )
        return None

    if not subject_id:
        # Worth recording anyway: the inputs and the verdict still answer
        # "what was scored and how", which is most of the value. But say so,
        # because it cannot be joined back to the offer or client later.
        logger.info(
            "%s recorded a score with no subject id; it will not be retrievable by subject",
            scorer,
        )

    owned = db is None
    session = db or SessionLocal()
    try:
        row = ScoringResult(
            workspace_id=workspace_id,
            scorer=scorer,
            subject_type=subject_type,
            subject_id=subject_id or "",
            score=score,
            verdict=verdict,
            inputs=inputs or {},
            detail=detail or {},
        )
        session.add(row)
        session.commit()
        session.refresh(row)
        return row
    except Exception as exc:
        logger.error("failed to record %s score: %s", scorer, exc)
        try:
            session.rollback()
        except Exception:  # pragma: no cover - rollback on a dead session
            pass
        return None
    finally:
        if owned:
            session.close()


def get_scores(
    db: Session,
    *,
    subject_type: Optional[str] = None,
    subject_id: Optional[str] = None,
    scorer: Optional[str] = None,
    workspace_id: Optional[str] = None,
    limit: int = 100,
) -> list[ScoringResult]:
    """Past decisions, newest first, scoped to one workspace.

    The workspace filter is not optional. `scoring_results` carries a
    `workspace_id` and P-02's rule is that a query on such a table is scoped
    - reading another firm's scoring history would be the same class of leak
    as the ontology dict this package also removed.
    """
    workspace_id = resolve_workspace(workspace_id)
    if not workspace_id:
        return []

    query = db.query(ScoringResult).filter(
        ScoringResult.workspace_id == workspace_id
    )
    if subject_type:
        query = query.filter(ScoringResult.subject_type == subject_type)
    if subject_id:
        query = query.filter(ScoringResult.subject_id == subject_id)
    if scorer:
        query = query.filter(ScoringResult.scorer == scorer)

    return (
        query.order_by(ScoringResult.created_at.desc(), ScoringResult.id.desc())
        .limit(limit)
        .all()
    )
