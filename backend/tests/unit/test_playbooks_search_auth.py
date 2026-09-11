"""Playbooks, Notifications & Search: gated, and scoped where it matters.

P-17 (T-008). Thirty-nine reachable routes across six files had no auth
dependency. Two defects rode along, both the same shape this run has found in
every router package.

**Playbook workspaces came from the caller.** `/activations` *required*
`workspace_id` as a query parameter, and `ActivateRequest`,
`CreateOfferRequest` and `ComposeRequest` each carried one in the body. So an
anonymous caller could list another firm's activations, activate a playbook
in their workspace, or turn one into a **client-facing offer** there. P-14
flagged the last of these when it gated `activate_to_offer` in the engine;
this package owns the route.

**Unified search cached across workspaces.** `cache.make_key("search:unified",
...)` had no workspace dimension, so the first caller's results were served
to every other workspace for sixty seconds. Search returns arbitrary indexed
content, which makes it the broadest of the three unscoped caches found in
this run - P-15 fixed the two in `command.py` and flagged this one.
"""
from __future__ import annotations

import ast
import inspect

import pytest
from fastapi.routing import APIRoute

from app.api.v1 import email, playbooks, search
from app.main import app

AUTH_DEPENDENCIES = {
    "get_workspace_id",
    "get_current_user",
    "require_role",
    "require_budget",
    "require_feature",
    "dependency",
}

OWNED_PREFIXES = (
    "/api/v1/playbooks",
    "/api/v1/notifications",
    "/api/v1/email",
    "/api/v1/search",
    "/api/v1/storage",
    "/api/v1/jobs",
    "/api/v1/onboarding",
    "/api/v1/polish",
)


def _dependency_names(dependant, acc: set[str] | None = None) -> set[str]:
    acc = acc if acc is not None else set()
    for sub in dependant.dependencies:
        name = getattr(getattr(sub, "call", None), "__name__", None)
        if name:
            acc.add(name)
        _dependency_names(sub, acc)
    return acc


def _owned_routes() -> list[APIRoute]:
    return [
        r
        for r in app.routes
        if isinstance(r, APIRoute) and r.path.startswith(OWNED_PREFIXES)
    ]


def _route_ids() -> list[str]:
    return [f"{sorted(r.methods)[0]} {r.path}" for r in _owned_routes()]


# ---------------------------------------------------------------------------
# 1. The slice is closed, asserted per route
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("route", _owned_routes(), ids=_route_ids())
def test_route_requires_a_session(route):
    assert _dependency_names(route.dependant) & AUTH_DEPENDENCIES, (
        f"{route.path} is reachable without a session"
    )


def test_the_slice_is_not_empty():
    """Guards the guard - a vacuous pass is how three routers escaped the
    count in P-13, P-14 and P-15."""
    assert len(_owned_routes()) >= 50


# ---------------------------------------------------------------------------
# 2. Playbook workspaces come from the session
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "model",
    [
        playbooks.ActivateRequest,
        playbooks.CreateOfferRequest,
        playbooks.ComposeRequest,
    ],
)
def test_no_playbook_request_body_carries_a_workspace(model):
    """`CreateOfferRequest` mattered most: it creates a client-facing offer."""
    assert "workspace_id" not in model.model_fields, (
        f"{model.__name__} lets the caller choose whose workspace to act in"
    )


def test_no_owned_route_takes_a_workspace_query_parameter():
    """`/playbooks/activations` required one, so any caller could list
    another firm's activations by naming their workspace."""
    offenders = []
    for route in _owned_routes():
        for param in route.dependant.query_params:
            if param.name == "workspace_id":
                offenders.append(f"{sorted(route.methods)[0]} {route.path}")

    assert offenders == [], f"workspace is caller-supplied on: {offenders}"


def test_activation_and_offer_creation_use_the_session_workspace():
    for name in ("activate_playbook", "create_offer_from_activation"):
        handler = getattr(playbooks, name, None)
        if handler is None:
            continue
        source = inspect.getsource(handler)
        assert "body.workspace_id" not in source, (
            f"{name} still reads the workspace from the request body"
        )


def test_email_history_is_scoped_to_the_session():
    """It accepted an optional `workspace_id`, so a caller could read
    another firm's send history by naming it."""
    params = inspect.signature(email.get_history).parameters

    assert "workspace_id" in params
    default = params["workspace_id"].default
    assert "Depends" in type(default).__name__ or hasattr(default, "dependency")


# ---------------------------------------------------------------------------
# 3. The search cache is per workspace
# ---------------------------------------------------------------------------


def test_the_search_cache_is_keyed_by_workspace():
    """The broadest of the three unscoped caches this run found.

    Unified search returns arbitrary indexed content, so a shared key
    disclosed whatever the first caller happened to search for.

    Parsed rather than grepped: the module explains the old key in prose.
    """
    tree = ast.parse(inspect.getsource(search))
    calls = [
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "make_key"
    ]

    assert calls, "search.py no longer caches - update this test"
    for call in calls:
        assert any(kw.arg == "workspace_id" for kw in call.keywords), (
            f"unscoped search cache key at line {call.lineno}"
        )


def test_two_workspaces_do_not_share_a_search_cache_key():
    """Asserted on the keys themselves, not just on the call shape."""
    from app.core.cache import cache

    a = cache.make_key("search:unified", workspace_id="ws-a", q="acme")
    b = cache.make_key("search:unified", workspace_id="ws-b", q="acme")

    assert a != b


def test_the_playbook_list_cache_is_deliberately_global():
    """The one unscoped key that is correct.

    Playbooks are the ten seeded templates, identical for every workspace.
    Recorded here so a future reader does not "fix" it into a per-workspace
    key and quietly multiply the cache by the tenant count.
    """
    source = inspect.getsource(playbooks.list_playbooks)

    assert 'make_key("playbooks:list")' in source
    assert "seeded global templates" in inspect.getsource(playbooks)
