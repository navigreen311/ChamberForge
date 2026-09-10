"""Evidence lifecycle background tasks.

P-08 (T-030). Both tasks in this module had a `# TODO` where the database
access belonged and returned `records_updated: 0` from a body that opened no
session. `stale_source_check` fires at midnight every night and
`evidence_refresh` weekly, so the platform reported two nightly maintenance
jobs it was not running.

Both are now real. `evidence` is a **FastAPI-owned** table (see
`docs/data-architecture.md`), so a worker may write it directly - unlike the
domain models under D4, which is why the AI tasks next door are blocked and
these are not.
"""
import asyncio
import logging
import uuid
from datetime import date, datetime, timedelta, timezone

from app.db.session import SessionLocal
from app.jobs._result import done
from app.jobs.celery_app import celery_app
from app.models.evidence import Evidence
from app.services.agents.research_ai import ResearchAI

logger = logging.getLogger(__name__)

#: Evidence older than this is flagged for review rather than trusted.
DEFAULT_STALE_MONTHS = 18

#: Credibility halves every 18 months. The formula lives in ResearchAI and is
#: called rather than reimplemented - a second copy would drift, and this job
#: writing different numbers than the read path would be worse than not
#: running at all.
_RESEARCH = ResearchAI()


@celery_app.task(bind=True, name="app.jobs.tasks.evidence_tasks.refresh_recency_scores")
def refresh_recency_scores(self, workspace_id: str) -> dict:
    """Recalculate temporal-decay recency scores for a workspace's evidence.

    Evidence does not become false with age, but it does become weaker, and a
    credibility score that was computed once at ingestion overstates old
    sources indefinitely. This is the job that keeps the number honest.
    """
    logger.info("Refreshing recency scores for workspace %s", workspace_id)
    db = SessionLocal()
    try:
        rows = (
            db.query(Evidence)
            .filter(Evidence.workspace_id == workspace_id)
            .all()
        )

        updated = 0
        today = date.today()
        for row in rows:
            if row.publication_date is None:
                continue
            decayed = _RESEARCH.compute_recency_decay(
                credibility_score=float(row.credibility_score or 0.0),
                publication_date=row.publication_date,
                reference_date=today,
            )
            decayed = round(float(decayed), 4)
            if row.recency_decay_score != decayed:
                row.recency_decay_score = decayed
                updated += 1

        db.commit()
        logger.info(
            "Recency refresh done for %s: %d of %d records updated",
            workspace_id,
            updated,
            len(rows),
        )
        return done(
            workspace_id=workspace_id,
            records_examined=len(rows),
            records_updated=updated,
        )
    except Exception as exc:
        logger.exception("Recency refresh failed for workspace %s", workspace_id)
        db.rollback()
        raise self.retry(exc=exc, countdown=60, max_retries=3)
    finally:
        db.close()


@celery_app.task(bind=True, name="app.jobs.tasks.evidence_tasks.flag_stale_sources")
def flag_stale_sources(
    self, workspace_id: str, threshold_months: int = DEFAULT_STALE_MONTHS
) -> dict:
    """Flag evidence older than *threshold_months* as stale.

    The flag goes in `contradiction_flags`, which is the column the read path
    already surfaces. Adding a column would be a schema change, and
    `alembic/` belongs to P-01.

    Flagging is idempotent: this runs nightly, and an evidence record must not
    accumulate the same flag once per night for the rest of its life.
    """
    logger.info(
        "Flagging stale sources for workspace %s (threshold=%d months)",
        workspace_id,
        threshold_months,
    )
    db = SessionLocal()
    try:
        cutoff = date.today() - timedelta(days=int(threshold_months * 30.44))
        rows = (
            db.query(Evidence)
            .filter(
                Evidence.workspace_id == workspace_id,
                Evidence.publication_date < cutoff,
            )
            .all()
        )

        flag = f"stale_over_{threshold_months}_months"
        flagged = 0
        for row in rows:
            flags = list(row.contradiction_flags or [])
            if flag in flags:
                continue
            flags.append(flag)
            row.contradiction_flags = flags
            flagged += 1

        db.commit()
        logger.info(
            "Stale check done for %s: %d newly flagged of %d past cutoff",
            workspace_id,
            flagged,
            len(rows),
        )
        return done(
            workspace_id=workspace_id,
            threshold_months=threshold_months,
            cutoff=cutoff.isoformat(),
            records_past_cutoff=len(rows),
            records_flagged=flagged,
        )
    except Exception as exc:
        logger.exception("Stale source check failed for workspace %s", workspace_id)
        db.rollback()
        raise self.retry(exc=exc, countdown=60, max_retries=3)
    finally:
        db.close()


@celery_app.task(bind=True, name="app.jobs.tasks.evidence_tasks.ingest_evidence")
def ingest_evidence(
    self,
    workspace_id: str,
    source_url: str,
    source_text: str,
    source_type: str,
    problem_id: str | None = None,
) -> dict:
    """Extract claims from a source and store them as evidence.

    Moved here from `ai_tasks` because the write target is `evidence`, which
    FastAPI owns - so unlike its neighbours in that module, this one can
    actually complete.

    The AI call goes through P-04's governed path, so it is metered against
    the workspace budget and returns a marked degraded result rather than
    invented claims when no API key is configured. When it degrades, **no
    evidence row is written**: a research record whose claims were fabricated
    is worse than a missing one.
    """
    logger.info(
        "Ingesting evidence for workspace %s (type=%s)", workspace_id, source_type
    )
    db = SessionLocal()
    try:
        # ResearchAI.ingest_source is a coroutine and belongs to P-07
        # ("call them, don't change them"), so the task drives its own loop
        # rather than the service growing a sync variant for one caller.
        extracted = asyncio.run(_RESEARCH.ingest_source(source_text, source_type))

        if extracted.get("degraded"):
            logger.warning(
                "Evidence ingestion degraded for %s: %s",
                workspace_id,
                extracted.get("degraded_reason"),
            )
            return {
                "status": "blocked",
                "blocked_reason": extracted.get("degraded_reason", "ai_unavailable"),
                "blocked_detail": extracted.get(
                    "degraded_detail", "No claims were extracted."
                ),
                "workspace_id": workspace_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        claims = extracted.get("claims") or []
        row = Evidence(
            # Explicit: 21 models in app/models default this to the uuid4
            # callable rather than str(uuid4()), which SQLite rejects
            # outright. See the escalation - it belongs to P-01 to fix once.
            id=str(uuid.uuid4()),
            workspace_id=workspace_id,
            problem_id=problem_id,
            source_url=source_url,
            source_type=source_type,
            publication_date=date.today(),
            credibility_score=float(extracted.get("estimated_credibility") or 5.0),
            extracted_claims=claims,
            contradiction_flags=[],
            recency_decay_score=float(extracted.get("estimated_credibility") or 5.0),
        )
        db.add(row)
        db.commit()

        logger.info(
            "Evidence ingested for %s: %d claims from %s", workspace_id, len(claims), source_url
        )
        return done(
            workspace_id=workspace_id,
            evidence_id=row.id,
            source_type=source_type,
            claims_extracted=len(claims),
        )
    except Exception as exc:
        logger.exception("Evidence ingestion failed for workspace %s", workspace_id)
        db.rollback()
        raise self.retry(exc=exc, countdown=30, max_retries=3)
    finally:
        db.close()
