"""Partner failures stay the partner's, and a degraded partner is visibly degraded.

P-07 (T-032, T-033, T-049).

Three properties, each false before this package:

  1. a partner 500 retries with backoff and then opens the circuit, rather
     than propagating an `httpx` error into a route handler;
  2. a renamed response field fails at the boundary, naming the partner, the
     endpoint and the field - not as a `KeyError` three layers away, and not
     as a `None` that flows onward as data;
  3. an unconfigured partner produces a typed degraded result, not invented
     data in the partner's own response shape.

The third is why this package matters more than its title suggests. What the
mock layers returned was not placeholder text - it was investment
performance, client risk assessments, verbatim client quotes, and crisis
acknowledgements. Those tests are at the bottom of this file.
"""
from __future__ import annotations

import httpx
import pytest

from app.services.integrations import _resilience
from app.services.integrations._resilience import (
    CircuitBreaker,
    PartnerCircuitOpen,
    PartnerContractError,
    PartnerUnavailable,
    breaker_for,
    call_with_resilience,
    reset_all_breakers,
)
from app.services.integrations._schemas import (
    VOICEFORGE_SCHEMAS,
    ResponseSchema,
    schema_for,
    validate_response,
)
from app.services.integrations.visionaudio_client import VisionAudioForgeClient
from app.services.integrations.voiceforge_client import VoiceForgeClient


@pytest.fixture(autouse=True)
def _clean_breakers():
    reset_all_breakers()
    yield
    reset_all_breakers()


@pytest.fixture(autouse=True)
def _no_sleeping(monkeypatch):
    """Backoff is asserted by inspecting the delays, not by waiting for them."""
    slept: list[float] = []

    async def fake_sleep(seconds):
        slept.append(seconds)

    monkeypatch.setattr(_resilience.asyncio, "sleep", fake_sleep)
    return slept


def _http_error(status: int, headers: dict | None = None) -> httpx.HTTPStatusError:
    request = httpx.Request("GET", "https://partner.test/x")
    response = httpx.Response(status, request=request, headers=headers or {})
    return httpx.HTTPStatusError("boom", request=request, response=response)


# -- 1. Retry, backoff, circuit ---------------------------------------------


@pytest.mark.asyncio
async def test_a_partner_500_is_retried(_no_sleeping):
    attempts = {"n": 0}

    async def flaky():
        attempts["n"] += 1
        if attempts["n"] < 3:
            raise _http_error(503)
        return {"ok": True}

    result = await call_with_resilience("p", "GET", flaky)

    assert result == {"ok": True}
    assert attempts["n"] == 3
    assert len(_no_sleeping) == 2, "each retry must back off"


@pytest.mark.asyncio
async def test_backoff_grows_and_is_jittered(_no_sleeping):
    async def always_fails():
        raise _http_error(500)

    with pytest.raises(PartnerUnavailable):
        await call_with_resilience("p", "GET", always_fails, attempts=4)

    assert len(_no_sleeping) == 3
    # Full jitter: each delay is drawn from [0, ceiling], and the ceiling
    # doubles. Assert the envelope rather than the draw.
    for i, delay in enumerate(_no_sleeping):
        ceiling = min(_resilience.DEFAULT_MAX_DELAY, _resilience.DEFAULT_BASE_DELAY * 2**i)
        assert 0 <= delay <= ceiling


@pytest.mark.asyncio
async def test_a_retry_after_header_is_honoured(_no_sleeping):
    async def rate_limited():
        raise _http_error(429, {"Retry-After": "2.5"})

    with pytest.raises(PartnerUnavailable):
        await call_with_resilience("p", "GET", rate_limited, attempts=2)

    assert _no_sleeping == [2.5], "the partner asked for a specific delay"


@pytest.mark.asyncio
async def test_a_404_is_not_retried(_no_sleeping):
    attempts = {"n": 0}

    async def not_found():
        attempts["n"] += 1
        raise _http_error(404)

    with pytest.raises(PartnerUnavailable):
        await call_with_resilience("p", "GET", not_found)

    assert attempts["n"] == 1, "repeating a request the partner rejected is waste"
    assert _no_sleeping == []


@pytest.mark.asyncio
async def test_a_post_is_not_retried_by_default():
    """The one that matters: POST /calls/initiate rings a client.

    A read timeout usually means the request arrived and the response was
    lost. Retrying it calls the person a second time.
    """
    attempts = {"n": 0}

    async def times_out():
        attempts["n"] += 1
        raise httpx.ReadTimeout("timed out")

    with pytest.raises(PartnerUnavailable) as exc:
        await call_with_resilience("voiceforge", "POST", times_out)

    assert attempts["n"] == 1
    assert "may have side effects" in str(exc.value)


@pytest.mark.asyncio
async def test_a_post_declared_idempotent_is_retried(_no_sleeping):
    attempts = {"n": 0}

    async def times_out():
        attempts["n"] += 1
        if attempts["n"] < 2:
            raise httpx.ReadTimeout("timed out")
        return {"ok": True}

    result = await call_with_resilience("p", "POST", times_out, idempotent=True)

    assert result == {"ok": True}
    assert attempts["n"] == 2


@pytest.mark.asyncio
async def test_the_circuit_opens_after_repeated_failure(_no_sleeping):
    async def always_fails():
        raise _http_error(500)

    breaker = breaker_for("flaky-partner")
    breaker.failure_threshold = 2

    for _ in range(2):
        with pytest.raises(PartnerUnavailable):
            await call_with_resilience("flaky-partner", "GET", always_fails, attempts=1)

    assert breaker.state == "open"

    # The next call must not reach the partner at all.
    reached = {"n": 0}

    async def should_not_run():
        reached["n"] += 1
        return {}

    with pytest.raises(PartnerCircuitOpen):
        await call_with_resilience("flaky-partner", "GET", should_not_run)

    assert reached["n"] == 0


def test_a_breaker_half_opens_after_its_cooldown(monkeypatch):
    breaker = CircuitBreaker(name="p", failure_threshold=1, reset_seconds=30.0)
    now = {"t": 1000.0}
    monkeypatch.setattr(_resilience.time, "monotonic", lambda: now["t"])

    breaker.record_failure()
    assert breaker.state == "open"

    now["t"] += 31.0
    assert breaker.state == "half_open", "a probe must eventually be allowed through"


@pytest.mark.asyncio
async def test_success_closes_the_circuit(_no_sleeping):
    breaker = breaker_for("recovering")
    breaker.failure_threshold = 3

    async def fails():
        raise _http_error(500)

    with pytest.raises(PartnerUnavailable):
        await call_with_resilience("recovering", "GET", fails, attempts=1)

    async def works():
        return {"ok": True}

    await call_with_resilience("recovering", "GET", works)
    assert breaker.state == "closed"


# -- 2. The boundary rejects a changed contract -----------------------------


def test_a_renamed_field_fails_at_the_boundary():
    """Names the partner, the endpoint and the field.

    "KeyError: 'call_id'" three layers into a service does not tell the
    person reading it that a partner shipped a breaking change.
    """
    schema = VOICEFORGE_SCHEMAS["/calls/initiate"]

    with pytest.raises(PartnerContractError) as exc:
        validate_response("voiceforge", schema, {"callId": "abc", "status": "ok"})

    message = str(exc.value)
    assert "voiceforge" in message
    assert "call_id" in message
    assert "renamed or removed" in message


def test_a_null_required_field_is_refused():
    """A null transcript used to flow onward and land on a client record."""
    schema = VOICEFORGE_SCHEMAS["/calls/{id}/transcript"]

    with pytest.raises(PartnerContractError) as exc:
        validate_response("voiceforge", schema, {"transcript": None})

    assert "null" in str(exc.value)


def test_a_wrong_type_is_refused():
    schema = VOICEFORGE_SCHEMAS["/calls/initiate"]

    with pytest.raises(PartnerContractError) as exc:
        validate_response("voiceforge", schema, {"call_id": 12345, "status": "ok"})

    assert "expected str" in str(exc.value)


def test_a_non_object_response_is_refused():
    schema = VOICEFORGE_SCHEMAS["/calls/initiate"]

    with pytest.raises(PartnerContractError):
        validate_response("voiceforge", schema, ["not", "an", "object"])


def test_unknown_extra_fields_are_allowed():
    """A partner adding a field must not break us.

    A schema that fails on additions is one people start bypassing.
    """
    schema = VOICEFORGE_SCHEMAS["/calls/initiate"]
    result = validate_response(
        "voiceforge", schema, {"call_id": "a", "status": "ok", "new_field": 1}
    )
    assert result["new_field"] == 1


def test_paths_with_ids_match_their_schema():
    schema = schema_for(VOICEFORGE_SCHEMAS, "/calls/abc-123-def/transcript")
    assert schema is not None
    assert schema.endpoint == "GET /calls/{id}/transcript"


def test_an_unknown_path_has_no_schema():
    assert schema_for(VOICEFORGE_SCHEMAS, "/something/else") is None


def test_an_optional_field_of_the_wrong_type_does_not_fail_the_call():
    schema = ResponseSchema(
        endpoint="GET /x", required={"a": str}, optional={"b": int}
    )
    result = validate_response("p", schema, {"a": "ok", "b": "not-an-int"})
    assert result["a"] == "ok"


# -- 3. Unconfigured is degraded, never fabricated --------------------------


@pytest.mark.asyncio
async def test_voiceforge_unconfigured_returns_a_typed_degraded_result():
    client = VoiceForgeClient(api_url="", api_key="")

    result = await client.get_transcript("call-1")

    assert result["degraded"] is True
    assert result["degraded_reason"] == "partner_not_configured"
    assert result["partner"] == "voiceforge"


@pytest.mark.asyncio
async def test_an_unconfigured_identity_check_never_reads_as_verified():
    """The most serious of the mock payloads.

    It answered `{"verified": True, "confidence": 0.95}` with no API key, so
    an unconfigured deployment confirmed every identity it was asked about.

    The degraded result carries no `verified` key at all, so a caller doing
    `result.get("verified")` gets None and fails closed - which is asserted
    here, because that is the exact expression the callers use.
    """
    client = VoiceForgeClient(api_url="", api_key="")

    result = await client.verify_identity("user-1", "passphrase")

    assert result.get("verified") is not True
    assert not result.get("verified")
    assert "confidence" not in result


@pytest.mark.asyncio
async def test_no_transcript_or_sentiment_is_invented():
    client = VoiceForgeClient(api_url="", api_key="")

    transcript = await client.get_transcript("call-1")
    sentiment = await client.get_sentiment("call-1")

    assert "transcript" not in transcript
    assert "sentiment" not in sentiment
    assert "score" not in sentiment


@pytest.mark.asyncio
async def test_visionaudio_invents_no_quarterly_report():
    """The largest fabrication in the codebase.

    An unconfigured render of a quarterly report returned total AUM of
    $847.3M, a net return of +4.2%, alpha of 85bps, a Sharpe ratio of 1.42
    and four dated investment recommendations - with an output_url pointing
    at a .pptx. An advisor could have put that in front of a client.
    """
    client = VisionAudioForgeClient(api_url="https://x.test", api_key="")

    result = await client.render_presentation({"type": "quarterly_report"})

    assert result["degraded"] is True
    assert "sections" not in result
    assert "output_url" not in result
    assert "render_id" not in result
    assert "847.3" not in str(result)


@pytest.mark.asyncio
async def test_visionaudio_invents_no_proof_metrics():
    client = VisionAudioForgeClient(api_url="https://x.test", api_key="")

    result = await client.produce_video({"type": "proof_walkthrough"})

    assert result["degraded"] is True
    assert "before_after_metrics" not in result
    assert "284" not in str(result)


@pytest.mark.asyncio
async def test_a_degraded_render_offers_no_download_link():
    """A link to a host that resolves nowhere is worse than no link."""
    client = VisionAudioForgeClient(api_url="https://x.test", api_key="")

    result = await client.get_render_status("r-1")

    assert "mock.visionaudioforge.io" not in str(result)
    assert result.get("output_url") is None


# -- 4. The modules built on top stay honest --------------------------------


@pytest.mark.asyncio
async def test_secure_comms_refuses_to_deliver_when_it_cannot_verify():
    from app.services.integrations.voiceforge_secure_comms import (
        OUTCOME_UNAVAILABLE,
        SecureVoiceComms,
    )

    comms = SecureVoiceComms(VoiceForgeClient(api_url="", api_key=""))

    result = await comms.deliver(
        user_id="u1", passphrase="p", phone="+1", message="account detail"
    )

    assert result.delivered is False
    assert result.outcome == OUTCOME_UNAVAILABLE


@pytest.mark.asyncio
async def test_secure_comms_separates_refused_from_unverifiable():
    """Different failures need different actions.

    "The client failed verification" and "we could not check" must not
    render the same way to an operator.
    """
    from app.services.integrations.voiceforge_secure_comms import (
        REASON_NOT_VERIFIED,
        SecureVoiceComms,
    )

    class Refusing(VoiceForgeClient):
        def __init__(self):
            super().__init__(api_url="", api_key="")

        async def verify_identity(self, user_id, passphrase):
            return {"verified": False}

    result = await SecureVoiceComms(Refusing()).verify("u1", "p")

    assert result.reason == REASON_NOT_VERIFIED


@pytest.mark.asyncio
async def test_secure_comms_will_not_disclose_on_low_confidence():
    from app.services.integrations.voiceforge_secure_comms import (
        REASON_LOW_CONFIDENCE,
        SecureVoiceComms,
    )

    class Unsure(VoiceForgeClient):
        def __init__(self):
            super().__init__(api_url="", api_key="")

        async def verify_identity(self, user_id, passphrase):
            return {"verified": True, "confidence": 0.4}

    result = await SecureVoiceComms(Unsure()).verify("u1", "p")

    assert result.delivered is False
    assert result.reason == REASON_LOW_CONFIDENCE


@pytest.mark.asyncio
async def test_a_truthy_non_boolean_does_not_pass_verification():
    """`verified: "false"` is a truthy string."""
    from app.services.integrations.voiceforge_secure_comms import SecureVoiceComms

    class Odd(VoiceForgeClient):
        def __init__(self):
            super().__init__(api_url="", api_key="")

        async def verify_identity(self, user_id, passphrase):
            return {"verified": "false"}

    assert (await SecureVoiceComms(Odd()).verify("u1", "p")).delivered is False


@pytest.mark.asyncio
async def test_a_brief_that_did_not_render_offers_no_link():
    from app.services.integrations.visionaudio_brief import ClientBrief

    brief = ClientBrief(VisionAudioForgeClient(api_url="https://x.test", api_key=""))

    result = await brief.render(client_name="Family A", period="Q1 2026", sections=[])

    assert result.queued is False
    assert result.ready is False
    assert result.output_url is None


# -- 5. The client-facing analyses no longer invent --------------------------


@pytest.mark.asyncio
async def test_call_sentiment_invents_no_quotes():
    """`_CALL_PROFILES` attributed verbatim quotes to a real call id.

    "really pleased with the performance", "let's increase the allocation" -
    selected by md5 of the call id, so the same invented quotes came back
    every time an advisor opened that client's record.
    """
    from app.services.integrations.voiceforge_health import VoiceHealthAnalysis

    analysis = VoiceHealthAnalysis(VoiceForgeClient(api_url="", api_key=""))

    result = await analysis.analyze_call_sentiment("call-abc")

    assert result["degraded"] is True
    assert "key_phrases" not in result
    assert "sentiment_score" not in result
    assert "recommended_action" not in result


@pytest.mark.asyncio
async def test_engagement_trends_refuse_to_average_nothing():
    from app.services.integrations.voiceforge_health import VoiceHealthAnalysis

    analysis = VoiceHealthAnalysis(VoiceForgeClient(api_url="", api_key=""))

    result = await analysis.get_engagement_trends("client-1", ["c1", "c2"])

    assert result["degraded"] is True
    assert result["data_points"] == 0
    assert "trend" not in result, "a trend over no data is not a trend"


@pytest.mark.asyncio
async def test_crisis_escalation_never_claims_an_acknowledgement():
    """The most dangerous one.

    Acknowledgement was read from a static table indexed by the contact's
    position in the list - and it was invented even with a real API key,
    because the partner was never asked. A firm could have stood down
    believing a principal had been reached.
    """
    from app.services.integrations.voiceforge_crisis import CrisisEscalation

    crisis = CrisisEscalation(VoiceForgeClient(api_url="", api_key=""))

    started = await crisis.initiate_escalation(
        contacts=[
            {"name": "Principal", "phone": "+1"},
            {"name": "Counsel", "phone": "+2"},
        ],
        incident_summary="Data incident",
    )
    status = await crisis.get_escalation_status(started["escalation_id"])

    assert started["calls_initiated"] == 0
    assert started["calls_not_placed"] == 2
    assert status["outcomes_known"] is False
    assert "acknowledged" not in status["summary"]
    assert all(c["outcome"] == "not_placed" for c in status["contacts"])


@pytest.mark.asyncio
async def test_a_placed_crisis_call_has_an_unknown_outcome():
    """Placed is known. Answered is not, and must not be implied."""
    from app.services.integrations.voiceforge_crisis import (
        OUTCOME_UNKNOWN,
        CrisisEscalation,
    )

    class Working(VoiceForgeClient):
        def __init__(self):
            super().__init__(api_url="", api_key="")

        async def initiate_call(self, to_number, purpose, metadata=None):
            return {"call_id": "c-1", "status": "initiated"}

    crisis = CrisisEscalation(Working())
    started = await crisis.initiate_escalation(
        contacts=[{"name": "Principal", "phone": "+1"}],
        incident_summary="Data incident",
    )
    status = await crisis.get_escalation_status(started["escalation_id"])

    assert started["calls_initiated"] == 1
    assert status["contacts"][0]["outcome"] == OUTCOME_UNKNOWN
    assert status["outcomes_known"] is False


@pytest.mark.asyncio
async def test_certification_progress_is_not_a_constant():
    """It returned 3 of 8 modules and 37.5% for every trainee.

    That is a training compliance record, and it was the same one for
    everybody who was ever asked about.
    """
    from app.services.integrations.visionaudio_trainer import VideoTrainer

    trainer = VideoTrainer(
        VisionAudioForgeClient(api_url="https://x.test", api_key="")
    )
    result = await trainer.get_certification_progress("t-1")

    assert result["degraded"] is True
    assert result["completion_percentage"] is None
    assert result["modules_completed"] is None
