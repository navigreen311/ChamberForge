"""The AI spend ceiling - the kill switch the platform claims and did not have.

P-04 (T-031). What existed before was reporting, not control:

  - `AIRuntime.check_budget(db, workspace_id, monthly_budget)` took the
    ceiling **as a parameter from the caller** - the same class of hole P-02
    closed for `workspace_id`. Whoever asked the question also supplied the
    limit;
  - it returned a dict with `over_budget` in it and refused nothing. Every
    caller was free to ignore it, and every caller did;
  - no agent called it at all. The only callers were REST endpoints where a
    client **self-reported** its own usage.

So an AI call could cost money, leave no record, and never be refused.

This module inverts all three. The ceiling is persisted per workspace
(`workspace_budgets`, created by P-01), the spend meter is incremented only
by the server-side call path, and passing the ceiling raises rather than
reports.

**Streaming-safe, which P-23 depends on.** Cost is not known until a stream
finishes, and a refusal cannot be sent once the first token is on the wire.
So enforcement is two-phase, and neither phase holds a transaction open
across the stream: `assert_within_ceiling()` runs *before* the stream opens
and is the only thing that can refuse; `record()` runs *after* it closes, in
its own short transaction. The cost is that a single call may overshoot the
ceiling by one invocation. That is the correct trade - the alternatives are
holding a lock for the length of a stream, or refusing mid-response.

**The log and the meter are deliberately different things.** `AIUsageLog` is
observability, and anyone may add to it - including the client self-report
endpoint that still exists on `primitives.py`. `WorkspaceBudget.spent_usd` is
the meter, and only `record()` moves it. If enforcement read the log, a
client could talk its own ceiling up or down by posting rows.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.db.scope import current_scope
from app.models.ai_usage import AIUsageLog
from app.models.workspace_budget import WorkspaceBudget
from app.services.backbone.ai_cost_tracker import AICostTracker

logger = logging.getLogger("chamberforge.budget")

#: Used when a workspace has no row yet. Deliberately finite: a workspace
#: with no explicit budget must still have a ceiling, or "unconfigured"
#: silently means "unlimited".
DEFAULT_MONTHLY_BUDGET_USD = 250.0


@dataclass(frozen=True)
class BudgetStatus:
    workspace_id: str
    ceiling_usd: float
    spent_usd: float
    enforced: bool
    period_start: Optional[datetime]

    @property
    def remaining_usd(self) -> float:
        return round(self.ceiling_usd - self.spent_usd, 6)

    @property
    def pct_used(self) -> float:
        if self.ceiling_usd <= 0:
            return 100.0
        return round(self.spent_usd / self.ceiling_usd * 100, 2)

    @property
    def over(self) -> bool:
        return self.spent_usd >= self.ceiling_usd

    def as_dict(self) -> dict:
        return {
            "workspace_id": self.workspace_id,
            "budget": self.ceiling_usd,
            "current_spend": round(self.spent_usd, 6),
            "remaining": self.remaining_usd,
            "pct_used": self.pct_used,
            "over_budget": self.over,
            "enforced": self.enforced,
        }


class BudgetExceeded(Exception):
    """Raised instead of making a call that would pass the ceiling."""

    def __init__(self, status: BudgetStatus, operation: str = "ai") -> None:
        self.status = status
        self.operation = operation
        super().__init__(
            f"workspace {status.workspace_id} has spent "
            f"${status.spent_usd:.2f} of its ${status.ceiling_usd:.2f} monthly "
            f"{operation} budget; the call was refused, not queued"
        )


def _month_start(now: Optional[datetime] = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


class BudgetGuard:
    """Enforce, and meter, per-workspace AI spend."""

    @staticmethod
    def workspace_from_context() -> Optional[str]:
        """The workspace of the request in flight, or None.

        Reads the scope P-02's middleware binds, which is what lets the AI
        call path meter itself without every agent method growing a
        `workspace_id` argument - and therefore without touching the routers,
        which belong to six other packages.
        """
        scope = current_scope()
        return scope.workspace_id if scope else None

    @staticmethod
    def get_or_create(db: Session, workspace_id: str) -> WorkspaceBudget:
        """This workspace's budget row, rolled over if the month has turned."""
        row = (
            db.query(WorkspaceBudget)
            .filter(WorkspaceBudget.workspace_id == workspace_id)
            .first()
        )
        if row is None:
            row = WorkspaceBudget(
                workspace_id=workspace_id,
                monthly_budget_usd=DEFAULT_MONTHLY_BUDGET_USD,
                period_start=_month_start(),
                spent_usd=0.0,
                enforced=True,
            )
            db.add(row)
            db.commit()
            db.refresh(row)
            return row

        current = _month_start()
        period = row.period_start
        if period is not None and period.tzinfo is None:
            period = period.replace(tzinfo=timezone.utc)
        if period is None or period < current:
            # A new month. Reset the meter rather than carrying spend
            # forward, which would refuse every call from the second month on.
            row.period_start = current
            row.spent_usd = 0.0
            db.commit()
            db.refresh(row)
        return row

    @staticmethod
    def status(db: Session, workspace_id: str) -> BudgetStatus:
        row = BudgetGuard.get_or_create(db, workspace_id)
        return BudgetStatus(
            workspace_id=workspace_id,
            ceiling_usd=float(row.monthly_budget_usd or 0.0),
            spent_usd=float(row.spent_usd or 0.0),
            enforced=bool(row.enforced),
            period_start=row.period_start,
        )

    @staticmethod
    def assert_within_ceiling(
        db: Session, workspace_id: str, operation: str = "ai"
    ) -> BudgetStatus:
        """Refuse the call if this workspace is at its ceiling.

        Call this *before* opening a stream. It raises `BudgetExceeded`; it
        does not return a flag, because a flag is what the previous
        implementation returned and nobody read it.
        """
        state = BudgetGuard.status(db, workspace_id)
        if state.enforced and state.over:
            logger.warning(
                "budget refusal: workspace=%s spent=%.4f ceiling=%.4f operation=%s",
                workspace_id,
                state.spent_usd,
                state.ceiling_usd,
                operation,
            )
            raise BudgetExceeded(state, operation)
        return state

    @staticmethod
    def record(
        db: Session,
        workspace_id: str,
        agent_name: str,
        tokens_in: int,
        tokens_out: int,
        latency_ms: int,
        model: str,
    ) -> float:
        """Write the usage row and move the meter. Returns the cost in USD.

        The meter is incremented with a SQL-level `spent_usd + :cost` rather
        than a read-modify-write in Python: two concurrent agent calls that
        both read the old value would each write back their own total, and
        one increment would silently vanish.
        """
        cost = AICostTracker.calculate_cost(tokens_in, tokens_out)

        db.add(
            AIUsageLog(
                workspace_id=workspace_id,
                agent_name=agent_name,
                tokens_in=tokens_in,
                tokens_out=tokens_out,
                latency_ms=latency_ms,
                cost_usd=cost,
                model=model,
            )
        )
        BudgetGuard.get_or_create(db, workspace_id)
        (
            db.query(WorkspaceBudget)
            .filter(WorkspaceBudget.workspace_id == workspace_id)
            .update(
                {WorkspaceBudget.spent_usd: WorkspaceBudget.spent_usd + cost},
                synchronize_session=False,
            )
        )
        db.commit()
        return cost
