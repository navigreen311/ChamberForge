"""Report generation background tasks.

P-08 (T-030). Both returned `"status": "generated"` from bodies with a
`# TODO` where the aggregation belonged. `generate_revenue_report` returned
`total_revenue: 0` alongside it - a generated revenue report asserting zero
revenue, which on a platform serving wealth advisors is a figure somebody
could act on.

The scorecard is now built from FastAPI-owned tables. The revenue report is
blocked: billing lives in Prisma `Invoice`/`Subscription` under D4 and P-29,
and the SQLAlchemy `invoices`/`subscriptions` duplicates are among the ten
retired tables nothing writes. Reporting revenue from those would produce a
confident zero forever.
"""
import logging
from datetime import datetime, timezone

from sqlalchemy import func

from app.db.session import SessionLocal
from app.jobs._result import D4_BLOCKED, blocked, done
from app.jobs.celery_app import celery_app
from app.models.ai_usage import AIUsageLog
from app.models.evidence import Evidence
from app.models.scoring_result import ScoringResult

logger = logging.getLogger(__name__)

_QUARTER_MONTHS = {"Q1": (1, 3), "Q2": (4, 6), "Q3": (7, 9), "Q4": (10, 12)}


def _quarter_bounds(quarter: str) -> tuple[datetime, datetime] | None:
    """(start, end) for a "2026-Q1" string, or None if unparseable.

    Returns None rather than defaulting to the current quarter: a scorecard
    silently covering a different period than its title is worse than one
    that refuses to build.
    """
    try:
        year_part, q_part = quarter.upper().split("-")
        year = int(year_part)
        first, last = _QUARTER_MONTHS[q_part]
    except (ValueError, KeyError):
        return None

    start = datetime(year, first, 1, tzinfo=timezone.utc)
    if last == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, last + 1, 1, tzinfo=timezone.utc)
    return start, end


@celery_app.task(bind=True, name="app.jobs.tasks.report_tasks.generate_quarterly_scorecard")
def generate_quarterly_scorecard(self, workspace_id: str, quarter: str) -> dict:
    """Build a quarterly performance scorecard from recorded activity.

    Every figure comes from a FastAPI-owned table and is a count or a sum of
    rows that exist: AI spend and invocations from `ai_usage_logs` (P-04),
    scoring decisions from `scoring_results` (P-09), evidence gathered from
    `evidence`.

    Deliberately no client, offer or revenue figures - those are Prisma-owned
    and unreachable from a worker. Their absence is stated in the result
    rather than represented as zero.
    """
    logger.info(
        "Generating quarterly scorecard for workspace %s (%s)", workspace_id, quarter
    )
    bounds = _quarter_bounds(quarter)
    if bounds is None:
        return blocked(
            "unparseable_quarter",
            f"'{quarter}' is not a quarter. Expected a string like '2026-Q1'.",
            workspace_id=workspace_id,
            quarter=quarter,
        )

    start, end = bounds
    db = SessionLocal()
    try:
        usage = db.query(AIUsageLog).filter(
            AIUsageLog.workspace_id == workspace_id,
            AIUsageLog.created_at >= start,
            AIUsageLog.created_at < end,
        )
        ai_invocations = usage.count()
        ai_spend = (
            usage.with_entities(func.sum(AIUsageLog.cost_usd)).scalar() or 0.0
        )

        decisions = db.query(ScoringResult).filter(
            ScoringResult.workspace_id == workspace_id,
            ScoringResult.created_at >= start,
            ScoringResult.created_at < end,
        )
        scoring_decisions = decisions.count()
        by_scorer = dict(
            decisions.with_entities(
                ScoringResult.scorer, func.count(ScoringResult.id)
            )
            .group_by(ScoringResult.scorer)
            .all()
        )

        evidence_gathered = (
            db.query(Evidence)
            .filter(
                Evidence.workspace_id == workspace_id,
                Evidence.created_at >= start,
                Evidence.created_at < end,
            )
            .count()
        )

        logger.info(
            "Scorecard for %s %s: %d AI calls, %d scoring decisions, %d evidence",
            workspace_id,
            quarter,
            ai_invocations,
            scoring_decisions,
            evidence_gathered,
        )
        return done(
            workspace_id=workspace_id,
            quarter=quarter,
            period_start=start.isoformat(),
            period_end=end.isoformat(),
            ai_invocations=ai_invocations,
            ai_spend_usd=round(float(ai_spend), 6),
            scoring_decisions=scoring_decisions,
            scoring_by_scorer=by_scorer,
            evidence_gathered=evidence_gathered,
            excludes=[
                "clients",
                "offers",
                "deliverables",
                "revenue",
            ],
            excludes_reason=(
                "Prisma-owned under D4 and not reachable from a worker. "
                "Absent rather than zero."
            ),
        )
    except Exception as exc:
        logger.exception("Scorecard generation failed for workspace %s", workspace_id)
        db.rollback()
        raise self.retry(exc=exc, countdown=120, max_retries=2)
    finally:
        db.close()


@celery_app.task(bind=True, name="app.jobs.tasks.report_tasks.generate_revenue_report")
def generate_revenue_report(self, workspace_id: str, period: str) -> dict:
    """Generate a revenue report. **Blocked under D4.**

    This returned `total_revenue: 0` with `"status": "generated"`. A revenue
    figure of zero, reported as a completed report, is the most directly
    actionable false number in the job layer.

    Billing is Prisma `Invoice`/`Subscription` (D4, P-29). The SQLAlchemy
    `invoices`/`subscriptions` tables are among the ten retired duplicates,
    so reporting from them would produce a confident zero indefinitely.
    """
    logger.warning(
        "revenue report is blocked for workspace %s: %s", workspace_id, D4_BLOCKED
    )
    return blocked(
        D4_BLOCKED,
        "Revenue lives in Prisma `Invoice`/`Subscription` (P-29). The "
        "SQLAlchemy duplicates are retired, so a report built from them "
        "would show zero revenue forever.",
        workspace_id=workspace_id,
        period=period,
        target_table="Invoice",
    )
