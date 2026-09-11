"""Lifecycle, Compliance & Clients: gated, scoped, and attributable.

P-15 (T-008). Twenty-eight reachable routes had no auth dependency. Three
defects came with them, and each is worse than the open gate.

**The export watermark named whoever the caller said.** `/exports/*` took
`user_id` as a query parameter and passed it straight into the watermark:

    CF-WM|user={user_id}|ws={workspace_id}|ts={timestamp}

That stamp is traceability - the thing you consult to identify who leaked a
document. Anyone could export a document watermarked with somebody else's
identity, and misattribute the leak deliberately. A watermark naming a person
the caller chose is worse than no watermark: it produces confident, wrong
evidence.

**Command AI cached across workspaces.** `cache.make_key("command:dashboard")`
had no workspace dimension, so the first request populated a shared key and
every other workspace was served that firm's synthesised dashboard for sixty
seconds.

**Community insights were attributed by the caller.** `ShareRequest` carried
`workspace_id`, so an anonymous caller could publish an insight in another
firm's name - on a network whose value is that contributions are
attributable.
"""
from __future__ import annotations

import inspect

import pytest
from fastapi.routing import APIRoute

from app.api.v1 import clients_dashboard, command, community, exports
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
    "/api/v1/lifecycle",
    "/api/v1/compliance",
    "/api/v1/clients-dashboard",
    "/api/v1/community",
    "/api/v1/exports",
    "/api/v1/command",
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


# ---------------------------------------------------------------------------
# 1. The slice is closed
# ---------------------------------------------------------------------------


def test_every_route_in_the_slice_requires_a_session():
    open_routes = [
        f"{sorted(r.methods)[0]} {r.path}"
        for r in _owned_routes()
        if not (_dependency_names(r.dependant) & AUTH_DEPENDENCIES)
    ]

    assert open_routes == [], f"routes reachable without a session: {open_routes}"


def test_the_slice_has_the_routes_it_is_meant_to():
    """A canary. lifecycle 19 + compliance 14 + community 4 + exports 3 + command 5."""
    assert len(_owned_routes()) == 45


# ---------------------------------------------------------------------------
# 2. The watermark names the operator, not the caller
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "handler",
    ["export_offer", "export_trust_pack", "export_intel_brief"],
)
def test_the_export_identity_is_not_caller_supplied(handler):
    """The most serious defect in this slice.

    A watermark is only evidence if the identity in it is established rather
    than asserted.
    """
    params = inspect.signature(getattr(exports, handler)).parameters

    assert "user_id" not in params, (
        f"{handler} still takes the watermark identity from the caller"
    )
    assert "current_user" in params, f"{handler} must resolve its own operator"


def test_the_watermark_uses_the_session_operator():
    source = inspect.getsource(exports)

    assert "current_user.id" in source
    for handler in ("export_offer", "export_trust_pack", "export_intel_brief"):
        body = inspect.getsource(getattr(exports, handler))
        assert ", user_id)" not in body


def test_no_export_route_takes_a_workspace_query_parameter():
    """`workspace_id: str = Query("default")` named the S3 prefix too."""
    offenders = []
    for route in _owned_routes():
        if not route.path.startswith("/api/v1/exports"):
            continue
        for param in route.dependant.query_params:
            if param.name in ("workspace_id", "user_id"):
                offenders.append(f"{route.path}:{param.name}")

    assert offenders == [], f"identity is caller-supplied on: {offenders}"


# ---------------------------------------------------------------------------
# 3. Caches are per workspace
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("handler", ["dashboard", "daily_brief"])
def test_the_command_cache_is_keyed_by_workspace(handler):
    """Without it, one firm's synthesised dashboard is served to the rest.

    Not exploitable today only because P-04 made CommandAI degrade without an
    API key, so the cached payload carries no data. It becomes live the
    moment a key is configured - which is exactly the kind of latent defect
    that surfaces during a launch.
    """
    source = inspect.getsource(getattr(command, handler))

    assert "make_key(" in source, f"{handler} no longer caches - update this test"
    assert "workspace_id=workspace_id" in source, (
        f"{handler} caches across workspaces"
    )


def test_every_cache_key_in_the_slice_carries_a_workspace():
    """A sweep, so the next cached route cannot forget.

    Parsed rather than grepped: the module docstring quotes the old unscoped
    key on purpose, and a line-based check fails on the explanation.
    """
    import ast

    tree = ast.parse(inspect.getsource(command))
    calls = [
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "make_key"
    ]

    assert calls, "command.py no longer caches - update this test"
    for call in calls:
        assert any(kw.arg == "workspace_id" for kw in call.keywords), (
            f"unscoped cache key at line {call.lineno}"
        )


# ---------------------------------------------------------------------------
# 4. Community insights are attributed by the session
# ---------------------------------------------------------------------------


def test_a_community_insight_cannot_be_attributed_by_the_caller():
    assert "workspace_id" not in community.ShareRequest.model_fields, (
        "an anonymous caller could publish an insight in another firm's name"
    )


def test_share_resolves_its_own_workspace():
    params = inspect.signature(community.share_insight).parameters

    assert "workspace_id" in params
    source = inspect.getsource(community.share_insight)
    assert "payload.workspace_id" not in source


# ---------------------------------------------------------------------------
# 5. The third unregistered router
# ---------------------------------------------------------------------------


def test_clients_dashboard_is_unreachable():
    """Third after `problem_detail` (P-13) and `deliver` (P-14).

    All three are registered only in `app/api/v1/router.py` - the file P-00
    was to delete, which nothing imports.
    """
    registered = [
        r
        for r in app.routes
        if isinstance(r, APIRoute) and r.path.startswith("/api/v1/clients-dashboard")
    ]

    assert registered == [], (
        "clients-dashboard is now registered - confirm its routes are counted "
        "by the auth-coverage guard"
    )


def test_clients_dashboard_routes_are_gated_anyway():
    for route in clients_dashboard.router.routes:
        if not isinstance(route, APIRoute):
            continue
        assert _dependency_names(route.dependant) & AUTH_DEPENDENCIES, (
            f"{route.path} would be open the moment the router is registered"
        )


def test_the_at_risk_query_is_scoped():
    """It returned client names and health scores across every workspace.

    The most direct PII disclosure in the slice.
    """
    source = inspect.getsource(clients_dashboard.get_at_risk_clients)

    assert "Client.workspace_id == workspace_id" in source


def test_the_client_kpi_queries_are_scoped():
    source = inspect.getsource(clients_dashboard.get_client_kpis)

    assert source.count("Client.workspace_id == workspace_id") == 2, (
        "both the active and prospect queries must filter by workspace"
    )


def test_the_client_kpis_carry_no_hardcoded_figures():
    source = inspect.getsource(clients_dashboard.get_client_kpis)

    for invented in ('"mrr": 75000', '"mrr_delta": 12', '"wealth_events_count": 3'):
        assert invented not in source
    assert '"unavailable"' in source
