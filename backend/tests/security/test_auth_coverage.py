"""Auth-coverage guard - every route must require authentication.

P-00 lands this in ADVISORY mode: it reports the open routes and passes, so
that it does not block the parallel build while the six router packages work
through their slices. P-26 flips ENFORCING to True, at which point an
unauthenticated route fails the suite.

This is the run's primary progress counter. The audit found 149 routes with
no auth dependency across 22 routers - including all 22 admin routes, which
can roll back AI prompts, flip feature flags and alter records governance.
Each router package closes its slice; at P-18 the count must reach zero.

Ownership: P-00 creates it, P-26 promotes it. Router packages must not edit
the allowlist to make their slice pass - that is the one way to make this
guard worthless.
"""
from __future__ import annotations

import os

from fastapi.routing import APIRoute

from app.main import app

# Flip to True in P-26. Until then the guard reports without failing.
ENFORCING = os.getenv("AUTH_COVERAGE_ENFORCING", "").lower() in ("1", "true", "yes")

# The only routes that may legitimately be reached without a session.
# Adding to this list is a security decision, not a convenience - it needs a
# reviewer, and the reason belongs in the comment beside the entry.
PUBLIC_ALLOWLIST = {
    "/api/v1/health/",          # liveness, no data
    "/api/v1/health/live",      # liveness probe, no data
    "/api/v1/health/ready",     # readiness probe, no data
    "/api/v1/metrics/",         # scraped by the metrics collector
    # NOT allowlisted, deliberately: /api/v1/health/dependencies and
    # /api/v1/metrics/detailed both disclose infrastructure state and should
    # require a session. They stay in the open-route count until a router
    # package closes them.
    "/api/v1/auth/login",       # pre-authentication by definition
    "/api/v1/auth/register",    # pre-authentication by definition
    "/api/v1/auth/refresh",     # presents a refresh token, not a session
    "/api/v1/webhooks/stripe",  # authenticated by Stripe signature (P-29)
    "/openapi.json",
    "/api/docs",
    "/api/redoc",
}

# Client-facing portal routes authenticate by single-use magic-link token
# rather than by session. P-30 owns them and asserts the token rules
# separately; they are not "open".
TOKEN_AUTH_PREFIXES = ("/api/v1/portal/{token}",)

AUTH_MARKERS = (
    "get_current_user",
    "get_workspace_id",
    "require_role",
    "require_feature",
    "require_budget",
)


def _dependency_names(route: APIRoute) -> set[str]:
    names: set[str] = set()
    for dep in route.dependant.dependencies:
        call = getattr(dep, "call", None)
        if call is not None:
            names.add(getattr(call, "__name__", ""))
            # require_role/require_feature return an inner closure; the
            # factory name lives on the closure's qualname.
            names.add(getattr(call, "__qualname__", "").split(".")[0])
    return {n for n in names if n}


def _is_public(path: str) -> bool:
    return path in PUBLIC_ALLOWLIST or path.startswith(tuple(TOKEN_AUTH_PREFIXES))


def collect_open_routes() -> list[tuple[str, str]]:
    """Return (method, path) for every route with no auth dependency."""
    open_routes: list[tuple[str, str]] = []
    for route in app.routes:
        if not isinstance(route, APIRoute):
            continue
        if _is_public(route.path):
            continue
        if _dependency_names(route) & set(AUTH_MARKERS):
            continue
        for method in sorted(route.methods - {"HEAD", "OPTIONS"}):
            open_routes.append((method, route.path))
    return sorted(open_routes, key=lambda mp: (mp[1], mp[0]))


def test_auth_coverage() -> None:
    open_routes = collect_open_routes()

    by_router: dict[str, int] = {}
    for _method, path in open_routes:
        parts = path.strip("/").split("/")
        key = parts[2] if len(parts) >= 3 else path
        by_router[key] = by_router.get(key, 0) + 1

    print("\n=== AUTH COVERAGE ===")
    print("routes with no auth dependency: %d" % len(open_routes))
    for key in sorted(by_router, key=lambda k: -by_router[k]):
        print("  %-24s %d" % (key, by_router[key]))

    if ENFORCING:
        assert not open_routes, (
            "%d route(s) accept anonymous requests:\n%s"
            % (
                len(open_routes),
                "\n".join("  %-6s %s" % (m, p) for m, p in open_routes),
            )
        )
    else:
        print("ADVISORY MODE - not failing. P-26 sets AUTH_COVERAGE_ENFORCING=1.")
