"""Every Build & Sell route requires a session, and the figures are scoped.

P-14 (T-008). Thirty-four reachable routes had no auth dependency - the
largest single slice in the run, twenty-eight of them in `sell.py` alone.

Two data defects came with them, and both are worse than the open gate.

**`/offers/kpis` queried across every workspace.** `db.query(Offer).filter(
Offer.status == 'active')` had no workspace filter at all, so the MRR,
pipeline value and offer counts on any firm's dashboard were summed over the
entire database. On a single-operator deployment that is invisible; the
moment a second firm exists it is a cross-tenant disclosure of revenue.

**Measured and invented figures were mixed in one response.** `mrr_delta`,
`renewals_due` and `needs_attention_count` were hardcoded to 12, 1 and 2 and
returned beside the computed values, with nothing marking which was which.
`/offers/mrr-history` returned a fixed six-month revenue series under a
`# TODO`, identical for every firm.
"""
from __future__ import annotations

import inspect

import pytest
from fastapi.routing import APIRoute

from app.api.v1 import deliver, offers
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
    "/api/v1/offers",
    "/api/v1/build",
    "/api/v1/sell",
    "/api/v1/household",
    "/api/v1/deliver",
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
    """A canary, not a floor.

    If a router stopped being registered the test above would pass over a
    shorter list and report the slice closed. `/api/v1/deliver` is exactly
    that case - see `test_deliver_is_unreachable`.

    offers 14 + build 10 + sell 38 + household 8 = 70.
    """
    assert len(_owned_routes()) == 70


@pytest.mark.parametrize("prefix,expected", [
    ("/api/v1/offers", 14),
    ("/api/v1/build", 10),
    ("/api/v1/sell", 38),
    ("/api/v1/household", 8),
])
def test_each_router_declares_the_expected_number_of_routes(prefix, expected):
    routes = [r for r in _owned_routes() if r.path.startswith(prefix)]

    assert len(routes) == expected


# ---------------------------------------------------------------------------
# 2. Figures are scoped, and not invented
# ---------------------------------------------------------------------------


def test_the_kpi_query_is_scoped_to_a_workspace():
    """The cross-tenant leak.

    Asserted against the source because the defect is the *absence* of a
    filter - a response-shape test cannot see it, and on a single-workspace
    test database neither can a behavioural one.
    """
    source = inspect.getsource(offers.get_offer_kpis)

    assert source.count("Offer.workspace_id == workspace_id") == 2, (
        "both the active and draft queries must filter by workspace"
    )
    assert "Client.workspace_id == workspace_id" in source, (
        "the health-score lookup reaches into clients and must be scoped too"
    )


def test_the_kpi_response_carries_no_hardcoded_figures():
    """12, 1 and 2 were returned beside real computed values.

    A dashboard that mixes measured and invented numbers without marking
    which is which is worse than one that omits the invented ones.
    """
    source = inspect.getsource(offers.get_offer_kpis)

    for invented in ('"mrr_delta": 12', '"renewals_due": 1', '"needs_attention_count": 2'):
        assert invented not in source


def test_the_kpi_response_names_what_it_cannot_compute():
    """Omitted, and said so - not silently dropped.

    A field that simply disappears reads as a bug; one listed as unavailable
    reads as a decision.
    """
    source = inspect.getsource(offers.get_offer_kpis)

    assert '"unavailable"' in source
    assert "mrr_delta" in source, "the omitted fields must still be named"


def test_mrr_history_is_not_a_fixed_series():
    """It returned 52,000 rising to 75,000, the same for every firm."""
    source = inspect.getsource(offers.get_mrr_history)

    for invented in ("52000", "58000", "63000", "68000", "72000", "75000"):
        assert invented not in source
    assert '"available": False' in source


# ---------------------------------------------------------------------------
# 3. The deliver router - fabricated, and unreachable
# ---------------------------------------------------------------------------


def test_deliver_is_unreachable():
    """A second router registered nowhere, after `problem_detail` in P-13.

    `main.py` does not include it and it appears only in
    `app/api/v1/router.py` - the file P-00 was to delete, which nothing
    imports. That is why its six routes never showed up in the open-route
    count despite having no auth.

    Asserted so that the day someone registers it, this fails and they read
    why.
    """
    registered = [
        r
        for r in app.routes
        if isinstance(r, APIRoute) and r.path.startswith("/api/v1/deliver")
    ]

    assert registered == [], (
        "deliver is now registered - confirm its routes are counted by the "
        "auth-coverage guard and that it returns real data, not the "
        "unavailable placeholder"
    )


def test_deliver_routes_are_gated_anyway():
    """Unreachable today is not unreachable forever."""
    for route in deliver.router.routes:
        if not isinstance(route, APIRoute):
            continue
        assert _dependency_names(route.dependant) & AUTH_DEPENDENCIES, (
            f"{route.path} would be open the moment the router is registered"
        )


def test_deliver_invents_no_client_operations_data():
    """It returned named clients and actionable figures.

    "Wellington Trust: Incident Response Plan 2 days overdue" is something an
    operator acts on within the hour, and none of it existed.

    Checks each handler's own source rather than the module's, so the
    explanatory docstrings at the top - which quote the removed data on
    purpose - do not make this pass or fail for the wrong reason.
    """
    invented = (
        "Wellington Trust",
        "Elizabeth Thornton",
        "Harrington Dynasty",
        "Marcus Reid",
        "Sarah Chen",
        "sla_adherence",
        "qa_pass_rate",
    )

    for route in deliver.router.routes:
        if not isinstance(route, APIRoute):
            continue
        source = inspect.getsource(route.endpoint)
        marker = chr(34) * 3
        body = source.split(marker)[-1] if source.count(marker) >= 2 else source
        for name in invented:
            assert name not in body, (
                f"{route.path} still returns fabricated data: {name}"
            )


def test_deliver_reports_unavailable_rather_than_zero():
    """A zero on a delivery console is a claim: "nothing overdue"."""
    source = inspect.getsource(deliver)

    assert '"available": False' in source
    assert "_UNAVAILABLE" in source
