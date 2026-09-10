"""AI-related background tasks.

P-08 (T-030). Every task in this module returned a success-shaped dictionary
from a body that called nothing:

    result = {"workspace_id": ws, "brief_generated": True,
              "dashboard_refreshed": True}

`daily_brief` fires at 06:00 daily and `run_command_ai_synthesis` reported a
generated brief and a refreshed dashboard every single morning, having done
neither.

**Three of these four cannot be implemented, and that is a ruling, not a
bug.** Under D4, Prisma owns `Problem`, `Offer` and `Notification`. A Celery
worker writing them through SQLAlchemy would write the *retired duplicate*
tables, which nothing reads - so the job would appear to succeed and produce
nothing an operator can see. That is strictly worse than not running, because
it is invisible rather than absent.

They now return a **blocked** result naming the constraint, and they have
been removed from the Beat schedule. A job that cannot do its work should not
fire nightly and log that it did.

`run_evidence_ingestion` moved to `evidence_tasks.ingest_evidence`, because
its write target is `evidence`, which FastAPI owns - so unlike its former
neighbours, it can actually complete.

**What unblocks the rest:** a decision on how a worker reaches Prisma-owned
tables. The `ExportJob` precedent in `docs/data-architecture.md` is the
obvious shape - the FastAPI export worker writes `s3Key` and `status` back to
a Prisma-owned row by direct Postgres write on the shared connection string,
and D5b calls that "the one intentional cross-stack write". Extending it to
these three is Ivan's call, not this package's.
"""
import logging

from app.jobs._result import D4_BLOCKED, blocked
from app.jobs.celery_app import celery_app

logger = logging.getLogger(__name__)

_PRISMA_WRITE_DETAIL = (
    "Under D4 this result belongs in a Prisma-owned table, which a Celery "
    "worker cannot write. Writing the retired SQLAlchemy duplicate would "
    "succeed silently and produce a row nothing reads. Needs a ruling on a "
    "sanctioned cross-stack write, as ExportJob already has."
)


@celery_app.task(bind=True, name="app.jobs.tasks.ai_tasks.run_problem_discovery")
def run_problem_discovery(self, workspace_id: str, sources: list[str]) -> dict:
    """Discover problems from supplied sources. **Blocked under D4.**

    Discovery itself works - `ProblemAI.discover_problems` is real and, since
    P-04, metered and honest about being unconfigured. The blocker is that
    the discovered problems have nowhere to go: `Problem` is Prisma-owned.

    Running discovery and discarding the result would spend real AI budget to
    produce nothing, so the call is not made.
    """
    logger.warning(
        "problem discovery is blocked for workspace %s: %s", workspace_id, D4_BLOCKED
    )
    return blocked(
        D4_BLOCKED,
        f"Problem discovery writes `Problem`. {_PRISMA_WRITE_DETAIL}",
        workspace_id=workspace_id,
        sources_supplied=len(sources),
        target_table="Problem",
    )


@celery_app.task(bind=True, name="app.jobs.tasks.ai_tasks.run_offer_generation")
def run_offer_generation(self, workspace_id: str, problem_id: str) -> dict:
    """Generate offer recommendations. **Blocked under D4.**"""
    logger.warning(
        "offer generation is blocked for workspace %s: %s", workspace_id, D4_BLOCKED
    )
    return blocked(
        D4_BLOCKED,
        f"Offer generation writes `Offer`. {_PRISMA_WRITE_DETAIL}",
        workspace_id=workspace_id,
        problem_id=problem_id,
        target_table="Offer",
    )


@celery_app.task(bind=True, name="app.jobs.tasks.ai_tasks.run_command_ai_synthesis")
def run_command_ai_synthesis(self, workspace_id: str) -> dict:
    """Daily brief synthesis. **Blocked under D4.**

    This is the one that ran every morning and reported success. The brief
    can be *computed* - `CommandAI.generate_daily_brief` is real - but it has
    no home a worker may write: reaching the operator means a Prisma
    `Notification`, and the Settings surface that would display it reads
    Prisma too.

    Computing a brief and dropping it would spend AI budget nightly to
    produce nothing, so it is not computed either.
    """
    logger.warning(
        "daily brief synthesis is blocked for workspace %s: %s",
        workspace_id,
        D4_BLOCKED,
    )
    return blocked(
        D4_BLOCKED,
        f"The daily brief is delivered via `Notification`. {_PRISMA_WRITE_DETAIL}",
        workspace_id=workspace_id,
        target_table="Notification",
    )
