"""Operator scope - the single place a request's identity becomes a filter.

P-02 (D2). ChamberForge runs one operator per instance for now, so this
resolves to one workspace and the filter is close to a no-op. The point is
not today's filtering; it is that **there is exactly one place** that decides
what a request may see. When the white-label reseller tier arrives, adding a
second dimension means changing this module, not auditing 45 routers.

Two rules make that work:

1. Scope comes from the **authenticated identity**, never from the request.
   A `workspace_id` in a path or body is a claim the caller made up. The
   audit found `primitives.py` trusting exactly that on unauthenticated
   routes, which let anyone read or write any workspace's data by typing a
   different id.

2. Anything not scoped is scoped **explicitly**, by calling
   `unscoped(reason=...)`. A query that escapes the filter should have to say
   so in the source, so a reviewer can see it.

D2 defers row-level security. This is deliberately an application-layer
filter with the seam for RLS later - see docs/data-architecture.md.
"""
from __future__ import annotations

import contextvars
from dataclasses import dataclass
from typing import Any, Iterable

from sqlalchemy.orm import Query, Session


@dataclass(frozen=True)
class OperatorScope:
    """What the current request is allowed to see.

    `workspace_id` is the only dimension today. `user_id` is carried so that
    audit and ownership checks have it without a second lookup, and so the
    shape does not change when per-user scoping is needed.
    """

    workspace_id: str
    user_id: str | None = None

    def applies_to(self, model: type) -> bool:
        """True when *model* carries a column this scope can filter on."""
        return hasattr(model, "workspace_id")


# Request-scoped, so a background task or a second request cannot see another
# request's scope. contextvars - not threading.local - because FastAPI runs
# handlers on an event loop and a thread may serve many requests.
_current: contextvars.ContextVar[OperatorScope | None] = contextvars.ContextVar(
    "chamberforge_operator_scope", default=None
)


def set_scope(scope: OperatorScope | None) -> contextvars.Token:
    """Bind the scope for the current request. Returns a reset token."""
    return _current.set(scope)


def reset_scope(token: contextvars.Token) -> None:
    _current.reset(token)


def current_scope() -> OperatorScope | None:
    return _current.get()


def require_scope() -> OperatorScope:
    """The scope, or an error naming what went wrong.

    Reaching this with nothing bound means a route ran without resolving an
    identity - a bug in the auth chain, not a user error.
    """
    scope = _current.get()
    if scope is None:
        raise LookupError(
            "no operator scope bound to this request: a query ran before "
            "identity was resolved. Routes must depend on get_workspace_id."
        )
    return scope


class _Unscoped:
    """Marker for a query that deliberately escapes the filter."""

    __slots__ = ("reason",)

    def __init__(self, reason: str) -> None:
        self.reason = reason


def unscoped(reason: str) -> _Unscoped:
    """Declare that a query intentionally crosses the scope boundary.

    Use for genuinely global reads - health checks, cross-workspace admin
    reporting, migrations. The reason is required so it shows up in review
    rather than hiding behind a bare query.
    """
    if not reason:
        raise ValueError("unscoped() requires a reason")
    return _Unscoped(reason)


def scoped_query(
    db: Session,
    model: type,
    *,
    escape: _Unscoped | None = None,
) -> Query:
    """A query already filtered to the current operator.

    Prefer this over `db.query(Model)` anywhere a model carries
    `workspace_id`. It is the seam: when scoping grows a second dimension,
    every caller inherits it.
    """
    query = db.query(model)

    if escape is not None:
        return query

    if not hasattr(model, "workspace_id"):
        # Not a scoped model - reference data, platform tables. Nothing to
        # filter on, so returning it unfiltered is correct rather than lax.
        return query

    scope = require_scope()
    return query.filter(model.workspace_id == scope.workspace_id)


def assert_owned(rows: Iterable[Any], model: type) -> None:
    """Fail loudly when a result set escaped the scope.

    A belt-and-braces check for code paths that still build their own
    queries. Cheap on small result sets and worth it on anything that leaves
    the process.
    """
    scope = current_scope()
    if scope is None or not hasattr(model, "workspace_id"):
        return
    for row in rows:
        owner = getattr(row, "workspace_id", None)
        if owner is not None and owner != scope.workspace_id:
            raise PermissionError(
                "row %r belongs to workspace %r, not %r - a query escaped the "
                "operator scope" % (getattr(row, "id", "?"), owner, scope.workspace_id)
            )
