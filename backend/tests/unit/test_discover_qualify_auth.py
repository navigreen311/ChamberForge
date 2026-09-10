"""Every Discover & Qualify route requires a session, and identity is not an input.

P-13 (T-008). Twenty-three reachable routes across `discovery`, `qualify` and
`ontology` had no auth dependency at all. Two defects rode along with that,
and both are worse than the missing gate:

**`reviewer_id` came from the request body.** `/risk-queue/{id}/approve` and
`/reject` took the reviewer's identity as a caller-supplied field and wrote
it onto the review record. An unauthenticated caller could approve a risk
item **and attribute it to somebody else** - a named colleague, a compliance
officer who never saw it - and the stored record would show a review that
person did not perform.

**Workspaces came from the caller.** Six discovery routes and `/risk-queue`
and `/stats` took `workspace_id` as a query parameter or body field, four of
them defaulting to `"default"`. Any caller could read or write another firm's
discovery data, risk queue or ontology by naming their workspace.

These are the same defect in two places: input that should have come from the
session. P-02 removed it from `primitives.py`, P-11 removed it from the audit
trail, and this package removes it here.
"""
from __future__ import annotations

import inspect

import pytest
from fastapi.routing import APIRoute

from app.api.v1 import discovery, ontology, qualify
from app.main import app

#: Dependencies that establish a session. Any one of them gates a route.
AUTH_DEPENDENCIES = {
    "get_workspace_id",
    "get_current_user",
    "require_role",
    "require_budget",
    "require_feature",
    "dependency",
}

#: The prefixes this package owns.
OWNED_PREFIXES = (
    "/api/v1/discovery",
    "/api/v1/qualify",
    "/api/v1/ontology",
    "/api/v1/problem-detail",
    "/api/v1/problems",
    "/api/v1/evidence",
)


def _dependency_names(dependant, acc: set[str] | None = None) -> set[str]:
    """Every dependency name in a route's tree, including nested ones.

    Walks the whole tree rather than the top level: `get_workspace_id`
    depends on `get_current_user`, and a route that only names the former
    would otherwise look ungated.
    """
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
    """The package's acceptance criterion, asserted route by route."""
    open_routes = [
        f"{sorted(r.methods)[0]} {r.path}"
        for r in _owned_routes()
        if not (_dependency_names(r.dependant) & AUTH_DEPENDENCIES)
    ]

    assert open_routes == [], f"routes reachable without a session: {open_routes}"


def test_the_slice_has_the_routes_it_is_meant_to():
    """Guards the guard.

    If the routers stopped being registered, the test above would pass over
    an empty list and report the slice closed. `/api/v1/problem-detail` is
    exactly that case - see `test_problem_detail_is_unreachable`.

    An exact count rather than a floor, deliberately: it is a canary. Adding
    or removing a route here should make somebody confirm the auth guard
    still covers it, rather than sliding under a threshold.

    23 gated by this package (discovery 6, qualify 12, ontology 5) plus
    problems 7 and evidence 9, which already had auth.
    """
    assert len(_owned_routes()) == 39


@pytest.mark.parametrize(
    "module,expected",
    [(discovery, 6), (qualify, 12), (ontology, 5)],
)
def test_each_router_declares_the_expected_number_of_routes(module, expected):
    """A route quietly disappearing would also make the auth guard pass."""
    routes = [r for r in module.router.routes if isinstance(r, APIRoute)]

    assert len(routes) == expected


# ---------------------------------------------------------------------------
# 2. Identity is not an input
# ---------------------------------------------------------------------------


def test_a_reviewer_cannot_be_named_by_the_caller():
    """The most serious defect in this slice.

    An approval is a compliance record naming who signed it off. Taking that
    name from the request body made the record worthless - and worse than
    worthless, because it looked authoritative.
    """
    assert "reviewer_id" not in qualify.RiskApproveRequest.model_fields
    assert "reviewer_id" not in qualify.RiskRejectRequest.model_fields


def test_approve_and_reject_take_the_operator_from_the_session():
    for name in ("approve_risk_item", "reject_risk_item"):
        params = inspect.signature(getattr(qualify, name)).parameters
        assert "current_user" in params, f"{name} must resolve its own reviewer"


def test_no_request_body_carries_a_workspace():
    """Six discovery routes took the workspace from the caller.

    Four defaulted to `"default"`, so an anonymous caller reached a real
    workspace without naming one.
    """
    for model in (discovery.ScanRequest, discovery.EventScanRequest):
        assert "workspace_id" not in model.model_fields, (
            f"{model.__name__} lets the caller choose a workspace"
        )


def test_no_route_takes_a_workspace_as_a_query_parameter():
    """`/risk-queue` and `/stats` both did.

    Any caller could list another firm's pending risk reviews, or read their
    ontology distribution, by naming their workspace.
    """
    offenders = []
    for route in _owned_routes():
        for param in route.dependant.query_params:
            if param.name == "workspace_id":
                offenders.append(f"{sorted(route.methods)[0]} {route.path}")

    assert offenders == [], f"workspace is caller-supplied on: {offenders}"


def test_the_workspace_dependency_derives_from_the_session():
    """`get_workspace_id` reads the resolved identity, never the request.

    This is what makes the substitution above meaningful rather than
    cosmetic.
    """
    from app.core.dependencies import get_workspace_id

    params = inspect.signature(get_workspace_id).parameters
    assert list(params) == ["current_user"]


# ---------------------------------------------------------------------------
# 3. Findings this package could not fix
# ---------------------------------------------------------------------------


def test_problem_detail_is_unreachable():
    """Two endpoints exist, are maintained, and cannot be called.

    `problem_detail` is registered only in `app/api/v1/router.py`, which P-00
    was to delete and which nothing imports. `main.py` does not include it,
    and `main.py` is P-00-frozen - so this package gated the routes (they
    must not be open if anyone wires them up) but cannot make them reachable.

    Asserted rather than merely noted, so the day it *is* registered this
    test fails and someone reads the reason.
    """
    registered = [
        r
        for r in app.routes
        if isinstance(r, APIRoute) and r.path.startswith("/api/v1/problem-detail")
    ]

    assert registered == [], (
        "problem_detail is now registered - remove this test and confirm its "
        "two routes are counted by the auth-coverage guard"
    )


def test_problem_detail_routes_are_gated_anyway():
    """Unreachable today is not unreachable forever."""
    from app.api.v1 import problem_detail

    for route in problem_detail.router.routes:
        if not isinstance(route, APIRoute):
            continue
        assert _dependency_names(route.dependant) & AUTH_DEPENDENCIES, (
            f"{route.path} would be open the moment the router is registered"
        )
