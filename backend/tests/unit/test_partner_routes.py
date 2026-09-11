"""VoiceForge & VisionAudio: gated, scoped, and honest about the partner.

P-18 (T-008, final slice). Twenty-five routes across two routers, none of
which required a session.

The stakes differ from the other router packages. `POST /crisis/escalate`
**places telephone calls** to a caller-supplied list of numbers with a
caller-supplied incident summary, so an open route here is a way to make the
platform dial strangers on a firm's behalf. The fifteen VisionAudio routes
each render a **client-facing deliverable** - a quarterly performance report,
a proof scorecard, a trust pack, a firm's brand identity - on that firm's
partner quota.

Three properties are asserted, each standing for a defect that was there:

1. every route requires a session;
2. persona-sim, crisis and training session ids do not resolve across
   workspaces - they did, because the stateful services were held in
   process-wide singletons;
3. a partner that did not answer surfaces as 503, not as a 200 whose body
   happens to be empty.
"""
from __future__ import annotations

import inspect

import pytest
from fastapi.routing import APIRoute

from app.api.v1 import visionaudio, voiceforge
from app.main import app

AUTH_DEPENDENCIES = {
    "get_workspace_id",
    "get_current_user",
    "require_role",
    "dependency",
}

OWNED_PREFIXES = ("/api/v1/voiceforge", "/api/v1/visionaudio")


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
    """Guards the guard - the parametrised test above passes vacuously over
    an empty list, which is how three unregistered routers escaped the count
    in P-13 through P-15."""
    assert len(_owned_routes()) == 25


def test_crisis_escalation_requires_a_session():
    """Named by path rather than swept up in the parametrisation.

    This route dials telephone numbers. If it is ever renamed or replaced,
    somebody should have to confirm the replacement is gated rather than
    have the suite quietly stop covering it.
    """
    paths = {r.path for r in _owned_routes()}
    assert "/api/v1/voiceforge/crisis/escalate" in paths

    route = next(
        r for r in _owned_routes()
        if r.path == "/api/v1/voiceforge/crisis/escalate"
    )
    assert _dependency_names(route.dependant) & AUTH_DEPENDENCIES


# ---------------------------------------------------------------------------
# 2. Session state does not cross workspaces
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "getter, store",
    [
        (voiceforge._get_persona, voiceforge._persona_instances),
        (voiceforge._get_crisis, voiceforge._crisis_instances),
        (voiceforge._get_trainer, voiceforge._trainer_instances),
    ],
)
def test_each_workspace_gets_its_own_service_instance(getter, store):
    """These were module-level singletons, so `self._sessions` was one dict
    for the whole process and a session id from one firm resolved for any
    other."""
    store.clear()

    a = getter("workspace-a")
    b = getter("workspace-b")

    assert a is not b
    assert getter("workspace-a") is a  # stable within a workspace


@pytest.mark.asyncio
async def test_a_persona_session_does_not_resolve_in_another_workspace():
    """The property the per-workspace instances exist to provide."""
    voiceforge._persona_instances.clear()

    started = await voiceforge._get_persona("workspace-a").start_session(
        "founder", "Quarterly review roleplay"
    )
    session_id = started["session_id"]

    # Same id, different workspace.
    with pytest.raises(ValueError):
        await voiceforge._get_persona("workspace-b").send_message(
            session_id, "hello"
        )

    # And it still works in its own workspace, so the test is not passing
    # because the session was never created.
    assert await voiceforge._get_persona("workspace-a").send_message(
        session_id, "hello"
    )


@pytest.mark.asyncio
async def test_a_training_session_does_not_resolve_in_another_workspace():
    """A training session ends in a certification result, so resolving one
    across firms means assessing somebody else's trainee."""
    voiceforge._trainer_instances.clear()

    started = await voiceforge._get_trainer("workspace-a").start_training_module(
        "discovery_call", "user-1"
    )
    session_id = started["session_id"]

    with pytest.raises(ValueError):
        await voiceforge._get_trainer("workspace-b").assess_performance(session_id)


# ---------------------------------------------------------------------------
# 3. Identity is not an input
# ---------------------------------------------------------------------------


def test_the_trainee_is_not_named_by_the_caller():
    """`trainee_id` was a request field, and it is what the certification
    result is recorded against - the same defect P-16 fixed on `released_by`
    and `requested_by`."""
    assert "trainee_id" not in voiceforge.TrainerStartRequest.model_fields

    source = inspect.getsource(voiceforge.trainer_start)
    assert "current_user.id" in source, (
        "the trainee must come from the session, not the request body"
    )


# ---------------------------------------------------------------------------
# 4. A partner that did not answer is a 503
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "reason",
    ["partner_not_configured", "partner_unavailable", "partner_contract_changed"],
)
@pytest.mark.parametrize("gate", [voiceforge._partner_gate, visionaudio._gate])
def test_a_partner_outage_is_503(gate, reason):
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc:
        gate({"degraded": True, "degraded_reason": reason, "degraded_detail": "d"})

    assert exc.value.status_code == 503


@pytest.mark.parametrize("gate", [voiceforge._partner_gate, visionaudio._gate])
def test_a_degraded_result_about_the_callers_own_input_is_not_503(gate):
    """`no_calls` is a complete and correct answer - there was nothing to
    analyse. A 503 would tell the caller to retry something that will never
    change."""
    result = {
        "degraded": True,
        "degraded_reason": "no_calls",
        "degraded_detail": "No calls were supplied to analyse.",
    }

    assert gate(result) is result


@pytest.mark.parametrize("gate", [voiceforge._partner_gate, visionaudio._gate])
def test_a_real_answer_passes_through_untouched(gate):
    result = {"render_id": "r-1", "status": "queued"}

    assert gate(result) is result


def test_a_template_set_with_no_render_ids_is_503():
    """`generate_templates` returns a list whose entries keep only
    `render_id` and `status`, so the degraded flag does not survive into
    them. Not one render queued is the observable form of the outage."""
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc:
        visionaudio._gate(
            [
                {"template_type": "pitch_deck", "render_id": None, "status": None},
                {"template_type": "proposal", "render_id": None, "status": None},
            ]
        )

    assert exc.value.status_code == 503


def test_a_partly_queued_template_set_is_not_503():
    """One render queued is a real, partial answer, and the caller can see
    which entries are missing."""
    templates = [
        {"template_type": "pitch_deck", "render_id": "r-1", "status": "queued"},
        {"template_type": "proposal", "render_id": None, "status": None},
    ]

    assert visionaudio._gate(templates) is templates


def test_an_empty_template_set_is_not_503():
    """No templates requested is not a partner outage."""
    assert visionaudio._gate([]) == []
