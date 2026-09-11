"""Every admin route refuses anonymous callers and non-admins.

P-16 (T-008, T-009). The audit's highest-severity finding, and it was not
"missing authentication" - it was **no authorisation at all**. There was no
role check anywhere in `admin.py`, and no session check either.

Without credentials of any kind, anyone who could reach the port could:

  - `POST /prompts/rollback` - change what every AI agent says to clients;
  - `POST /flags/set` - turn platform features on or off;
  - `POST /records/legal-hold/release` - **release a legal hold**;
  - `POST /records/cleanup` - run a retention sweep, which deletes;
  - `POST /security/deletion-request/{id}/execute` - **destroy a client's
    records**, with no identity recorded anywhere.

The last two compose into the sharpest sequence in the audit: release the
hold, run the cleanup, and data under legal preservation is gone with no
authenticated actor in the trail. That is spoliation, and the platform would
have recorded nobody doing it.

**Asserted per route, not per router.** A router-level test passes while a
single handler is missing its dependency, and one ungated route on this
surface is the whole problem. The parametrisation below is generated from
the live route table, so a route added later is covered without anyone
remembering to add it here.
"""
from __future__ import annotations

import inspect

import pytest
from fastapi.routing import APIRoute

from app.api.v1 import admin, security
from app.main import app

ADMIN_PREFIXES = ("/api/v1/admin", "/api/v1/security")

#: Dependencies that establish a session at all.
SESSION_DEPENDENCIES = {
    "get_workspace_id",
    "get_current_user",
    "require_role",
    "dependency",
}


def _dependency_names(dependant, acc: set[str] | None = None) -> set[str]:
    acc = acc if acc is not None else set()
    for sub in dependant.dependencies:
        name = getattr(getattr(sub, "call", None), "__name__", None)
        if name:
            acc.add(name)
        _dependency_names(sub, acc)
    return acc


def _privileged_routes() -> list[APIRoute]:
    return [
        r
        for r in app.routes
        if isinstance(r, APIRoute) and r.path.startswith(ADMIN_PREFIXES)
    ]


def _route_ids() -> list[str]:
    return [f"{sorted(r.methods)[0]} {r.path}" for r in _privileged_routes()]


# ---------------------------------------------------------------------------
# 1. Per-route: a session is required, and the role is checked
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("route", _privileged_routes(), ids=_route_ids())
def test_route_requires_a_session(route):
    assert _dependency_names(route.dependant) & SESSION_DEPENDENCIES, (
        f"{route.path} is reachable without a session"
    )


@pytest.mark.parametrize("route", _privileged_routes(), ids=_route_ids())
def test_route_requires_the_admin_role(route):
    """A session is not enough on this surface.

    `get_workspace_id` proves somebody is signed in. These routes roll back
    prompts, flip flags and release legal holds, so they need `require_role`
    specifically - an authenticated non-admin must still be refused.
    """
    source = inspect.getsource(route.endpoint)

    assert 'require_role("admin")' in source, (
        f"{route.path} authenticates but does not check the role"
    )


def test_the_admin_surface_is_not_empty():
    """Guards the guard.

    Both parametrised tests above pass vacuously over an empty list, which
    is how three unregistered routers slipped through the count in P-13,
    P-14 and P-15.
    """
    assert len(_privileged_routes()) >= 37


# ---------------------------------------------------------------------------
# 2. Identity is established, never asserted
# ---------------------------------------------------------------------------


def test_a_legal_hold_release_cannot_name_its_own_releaser():
    """The attribution on ending a preservation obligation.

    `released_by` was a caller-supplied field on an unauthenticated route,
    so the record of who released a hold could name anybody - and would read
    as authoritative afterwards.
    """
    assert "released_by" not in admin.ReleaseLegalHoldRequest.model_fields
    assert "released_by" not in security.LegalHoldRelease.model_fields


def test_a_deletion_request_cannot_name_its_own_requester():
    """It names who authorised destroying a client's records."""
    assert "requested_by" not in security.DeletionRequestCreate.model_fields


def test_a_legal_hold_cannot_name_its_own_creator():
    assert "created_by" not in security.LegalHoldCreate.model_fields
    assert "created_by" not in admin.CreateLegalHoldRequest.model_fields


def test_a_prompt_registration_cannot_name_its_own_author():
    assert "user_id" not in admin.RegisterPromptRequest.model_fields


@pytest.mark.parametrize(
    "model",
    [
        admin.CreateRetentionPolicyRequest,
        admin.CreateSandboxRequest,
        security.DeletionRequestCreate,
        security.LegalHoldCreate,
    ],
)
def test_no_privileged_request_body_carries_a_workspace(model):
    """`manual_retention_cleanup(workspace_id)` deletes.

    A caller naming the workspace could run a retention sweep against
    another firm's records.
    """
    assert "workspace_id" not in model.model_fields, (
        f"{model.__name__} lets the caller choose whose records to act on"
    )


def test_no_privileged_route_takes_a_workspace_query_parameter():
    offenders = []
    for route in _privileged_routes():
        for param in route.dependant.query_params:
            if param.name in ("workspace_id", "user_id", "released_by", "created_by"):
                offenders.append(f"{sorted(route.methods)[0]} {route.path}:{param.name}")

    assert offenders == [], f"identity is caller-supplied on: {offenders}"


# ---------------------------------------------------------------------------
# 3. The destructive routes specifically
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/admin/records/cleanup",
        "/api/v1/admin/records/legal-hold/release",
        "/api/v1/security/deletion-request/{request_id}/execute",
        "/api/v1/security/legal-hold/{hold_id}/release",
    ],
)
def test_the_destructive_routes_are_gated(path):
    """Called out individually because these are the ones that lose data.

    Listed by path rather than swept, so that renaming or removing one of
    them fails here and somebody confirms the replacement is gated too.
    """
    matches = [r for r in _privileged_routes() if r.path == path]

    assert matches, f"{path} no longer exists - confirm its replacement is gated"
    source = inspect.getsource(matches[0].endpoint)
    assert 'require_role("admin")' in source


def test_the_release_and_cleanup_pair_cannot_be_reached_anonymously():
    """The spoliation sequence, asserted as a pair.

    Either one alone is serious. Together they destroy data under legal
    preservation with nobody named.
    """
    paths = {
        "/api/v1/admin/records/legal-hold/release",
        "/api/v1/admin/records/cleanup",
    }
    found = {r.path for r in _privileged_routes()} & paths

    assert found == paths
    for route in _privileged_routes():
        if route.path in paths:
            # Checked against the source, not the dependency names:
            # `require_role("admin")` returns an inner function called
            # `dependency`, so the factory's own name never appears in the
            # tree. A name-based check here would pass on any dependency at
            # all, which on these two routes is precisely the wrong answer.
            assert 'require_role("admin")' in inspect.getsource(route.endpoint)


# ---------------------------------------------------------------------------
# 4. The endpoints the UI called and nothing served
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "method,path",
    [
        ("GET", "/api/v1/admin/flags"),
        ("GET", "/api/v1/admin/flags/{name}"),
        ("GET", "/api/v1/admin/prompts/{agent_name}"),
        ("POST", "/api/v1/admin/prompts/{agent_name}/rollback/{version}"),
        ("GET", "/api/v1/admin/white-label"),
        ("PUT", "/api/v1/admin/white-label"),
        ("GET", "/api/v1/admin/white-label/portal-branding"),
        ("POST", "/api/v1/admin/white-label/validate-domain"),
    ],
)
def test_the_missing_admin_endpoints_now_exist(method, path):
    """T-028's stated exception: admin surfaces with no BFF equivalent.

    `POST /flags/set` existed with no way to read a flag back, and
    `POST /prompts/rollback` took a version number the API would not tell
    you. Both were half a feature.
    """
    matches = [
        r for r in _privileged_routes() if r.path == path and method in r.methods
    ]

    assert matches, f"{method} {path} is not registered"


def test_an_unconfigured_white_label_reports_its_absence():
    """Not a default brand.

    A UI shown placeholder branding cannot tell it apart from branding
    somebody chose.
    """
    source = inspect.getsource(admin.get_white_label)

    assert '"configured": False' in source
