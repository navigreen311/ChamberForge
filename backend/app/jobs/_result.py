"""What a background task reports when it did, or did not, do its work.

P-08 (T-030). The five scheduled tasks returned dictionaries like this:

    {"workspace_id": ws, "brief_generated": True, "dashboard_refreshed": True}

from bodies that touched no database and called no service. `daily_brief`
fires at 06:00 every morning, logged "AI synthesis completed", and recorded
that a brief had been generated. **The platform reported automation it did
not perform**, every night, in a form indistinguishable from having performed
it.

So there are three outcomes here rather than two, and the third is the one
that was missing:

  - **done** - the work happened; the counts are real;
  - **failed** - it was attempted and something broke;
  - **blocked** - it could not be attempted, and why.

`blocked` exists because several of these tasks cannot be implemented without
a ruling that is not the engineer's to make (see `D4_BLOCKED` below). A
blocked task must be visibly blocked. Returning `done` with zero counts would
be the same lie in quieter clothing - and a zero is exactly what a
`pass`-bodied task returns.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

STATUS_DONE = "done"
STATUS_FAILED = "failed"
STATUS_BLOCKED = "blocked"

#: The reason a task cannot run: it would have to write a Prisma-owned table.
#:
#: D4 makes Prisma the source of truth for the domain models. A Celery worker
#: writing `Problem` or `Offer` through SQLAlchemy would write the retired
#: duplicate, which nothing reads - so the job would appear to succeed and
#: produce nothing an operator can see. That is a worse failure than not
#: running, because it is invisible.
D4_BLOCKED = "d4_prisma_owned_table"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def done(**fields: Any) -> dict:
    """The work happened. *fields* carry the real counts."""
    return {"status": STATUS_DONE, "timestamp": _now(), **fields}


def blocked(reason: str, detail: str, **fields: Any) -> dict:
    """The work could not be attempted, and this is why.

    Deliberately carries no success counters. A caller reading
    `result["records_updated"]` gets a KeyError rather than a zero it might
    reasonably mistake for "nothing needed doing".
    """
    return {
        "status": STATUS_BLOCKED,
        "blocked_reason": reason,
        "blocked_detail": detail,
        "timestamp": _now(),
        **fields,
    }


def failed(detail: str, **fields: Any) -> dict:
    """It was attempted and broke. Used where a retry is not appropriate."""
    return {
        "status": STATUS_FAILED,
        "error": detail,
        "timestamp": _now(),
        **fields,
    }


def is_done(result: Optional[dict]) -> bool:
    return bool(result) and result.get("status") == STATUS_DONE
