"""Operator scope and the sandbox boundary, asserted.

P-02. D2 defers multi-tenancy, so these are not cross-tenant leak tests -
they assert the three things that still matter with one operator:

  1. Scope is bound from the authenticated identity, never from the request.
  2. A request with no resolvable identity is refused, not served.
  3. Sandbox rows and production rows cannot see each other.

The expansion seam matters as much as today's behaviour: when the reseller
tier arrives, these are the tests that should start failing if the second
dimension is wired incorrectly, which is why the last test asserts the seam
exists rather than just that the filter works.
"""
from __future__ import annotations

import uuid

import pytest

from app.db.scope import (
    OperatorScope,
    current_scope,
    require_scope,
    reset_scope,
    scoped_query,
    set_scope,
    unscoped,
)
from app.models.sandbox_environment import SandboxEnvironment
from app.services.backbone.sandbox import SandboxService

WS_A = "ws-aaaa"
WS_B = "ws-bbbb"


@pytest.fixture()
def scope_a():
    token = set_scope(OperatorScope(workspace_id=WS_A, user_id="user-a"))
    yield
    reset_scope(token)


# ── 1. Scope comes from identity, and only from identity ────────────────


def test_scope_is_unbound_by_default() -> None:
    """No implicit scope. A query before auth must fail, not default to one."""
    assert current_scope() is None
    with pytest.raises(LookupError) as exc:
        require_scope()
    assert "before identity was resolved" in str(exc.value)


def test_scope_binds_and_resets(scope_a) -> None:
    assert current_scope().workspace_id == WS_A


def test_scope_does_not_leak_between_requests() -> None:
    """A scope surviving into the next request is the bug this guards.

    Workers are reused, so a leaked context would serve one operator's rows
    to the next caller on that worker.
    """
    token = set_scope(OperatorScope(workspace_id=WS_A))
    assert current_scope().workspace_id == WS_A
    reset_scope(token)
    assert current_scope() is None


def test_scoped_query_filters_on_the_bound_workspace(db_session, scope_a) -> None:
    mine = SandboxEnvironment(
        id=str(uuid.uuid4()), workspace_id=WS_A, name="mine", is_sandbox=True
    )
    theirs = SandboxEnvironment(
        id=str(uuid.uuid4()), workspace_id=WS_B, name="theirs", is_sandbox=True
    )
    db_session.add_all([mine, theirs])
    db_session.commit()

    rows = scoped_query(db_session, SandboxEnvironment).all()
    ids = {r.id for r in rows}
    assert mine.id in ids
    assert theirs.id not in ids, "scoped_query returned another workspace's row"


def test_scoped_query_refuses_without_a_scope(db_session) -> None:
    with pytest.raises(LookupError):
        scoped_query(db_session, SandboxEnvironment).all()


def test_escaping_the_scope_requires_a_stated_reason(db_session, scope_a) -> None:
    """A global query has to say so in the source, so review can see it."""
    with pytest.raises(ValueError):
        unscoped("")

    rows = scoped_query(
        db_session,
        SandboxEnvironment,
        escape=unscoped("test: verifying the escape hatch is explicit"),
    ).all()
    assert isinstance(rows, list)


# ── 2. The sandbox boundary, in both directions ─────────────────────────


def test_sandbox_survives_a_restart(db_session, scope_a) -> None:
    """The whole point of moving off the class-level dict.

    Simulating a restart by discarding the service's in-process state and
    reading again: with a dict, this returned nothing.
    """
    created = SandboxService.create_sandbox(db_session, WS_A, "Demo")
    SandboxService._reset()  # what a process restart used to wipe

    listed = SandboxService.list_sandboxes(db_session, WS_A)
    assert any(s["sandbox_id"] == created["sandbox_id"] for s in listed), (
        "sandbox did not survive a restart - state is still in memory"
    )


def test_production_rows_never_appear_in_a_sandbox_listing(db_session, scope_a) -> None:
    production = SandboxEnvironment(
        id=str(uuid.uuid4()),
        workspace_id=WS_A,
        name="production data",
        is_sandbox=False,
    )
    db_session.add(production)
    db_session.commit()

    listed = SandboxService.list_sandboxes(db_session, WS_A)
    assert production.id not in {s["sandbox_id"] for s in listed}, (
        "a production row surfaced in a sandbox listing"
    )


def test_sandbox_rows_are_not_visible_to_another_operator(db_session, scope_a) -> None:
    SandboxService.create_sandbox(db_session, WS_A, "A's sandbox")

    reset_token = set_scope(OperatorScope(workspace_id=WS_B, user_id="user-b"))
    try:
        assert SandboxService.list_sandboxes(db_session, WS_B) == []
    finally:
        reset_scope(reset_token)


def test_requesting_another_workspace_is_refused(db_session, scope_a) -> None:
    """The audit's finding: the workspace came straight from the URL.

    Anyone could enumerate anyone's sandboxes by editing the path.
    """
    with pytest.raises(PermissionError) as exc:
        SandboxService.list_sandboxes(db_session, WS_B)
    assert "does not belong to this operator" in str(exc.value)


def test_sandbox_is_seeded_on_creation(db_session, scope_a) -> None:
    created = SandboxService.create_sandbox(db_session, WS_A, "Seeded")
    assert created["synthetic_data_loaded"] is True

    full = SandboxService.get_sandbox(db_session, created["sandbox_id"])
    assert full is not None
    assert full["synthetic_data"].get("clients"), "sandbox created without demo data"


# ── 3. The expansion seam D2 asked for ──────────────────────────────────


def test_scope_carries_user_id_for_a_future_dimension() -> None:
    """D2 defers multi-tenancy but the shape must not have to change.

    `user_id` is carried today even though nothing filters on it, so adding
    a second dimension is a change to app/db/scope.py rather than to the
    signature every caller passes around.
    """
    scope = OperatorScope(workspace_id=WS_A, user_id="user-a")
    assert scope.user_id == "user-a"
    assert scope.applies_to(SandboxEnvironment) is True

    class Unscoped:
        """A model with no workspace column - reference data."""

    assert scope.applies_to(Unscoped) is False
