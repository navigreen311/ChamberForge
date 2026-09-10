"""Tests for CrisisEscalation - what is known, and what is not claimed.

Rewritten by P-07, and this file is worth reading as a cautionary example.

`test_get_escalation_status` asserted that acknowledged + pending + failed
summed to the number of contacts - that every contact had a definite,
categorised outcome. It passed against a client with **no API key**, because
outcomes were read from `_RESPONSE_PATTERNS[i % 6]`, a static table of
hand-written results assigned by list position.

So the suite's strongest assertion about crisis escalation was that every
emergency contact had a known outcome, and it was satisfied by a system that
had placed no calls and asked no one. `test_initiate_status_values` went
further and asserted `status == "ringing"` for calls that were never dialled.

The contract now: placement is reported because it is known; acknowledgement
is not, because it is not.
"""
import pytest

from app.services.integrations.voiceforge_client import VoiceForgeClient
from app.services.integrations.voiceforge_crisis import (
    OUTCOME_NOT_PLACED,
    OUTCOME_UNKNOWN,
    CrisisEscalation,
)


@pytest.fixture
def crisis():
    """An unconfigured deployment - no calls can be placed."""
    return CrisisEscalation(VoiceForgeClient(api_url="", api_key=""))


@pytest.fixture
def working_crisis():
    """A configured deployment whose calls are accepted by the partner."""

    class Working(VoiceForgeClient):
        def __init__(self):
            super().__init__(api_url="", api_key="")
            self.placed: list[str] = []

        async def initiate_call(self, to_number, purpose, metadata=None):
            self.placed.append(to_number)
            return {"call_id": f"call-{len(self.placed)}", "status": "initiated"}

    return CrisisEscalation(Working())


@pytest.fixture
def sample_contacts():
    return [
        {"name": "Alice Chen", "phone": "+14155550101"},
        {"name": "Bob Patel", "phone": "+14155550102"},
        {"name": "Carol Nguyen", "phone": "+14155550103"},
    ]


# ---- Unconfigured: nothing was called, and it says so ----


@pytest.mark.asyncio
async def test_unplaced_calls_are_not_counted_as_initiated(crisis, sample_contacts):
    """`calls_initiated` was `len(statuses)` - every contact, regardless."""
    result = await crisis.initiate_escalation(sample_contacts, "Market flash crash")

    assert result["calls_initiated"] == 0
    assert result["calls_not_placed"] == 3
    assert len(result["statuses"]) == 3


@pytest.mark.asyncio
async def test_an_unplaced_call_is_not_reported_as_ringing(crisis, sample_contacts):
    result = await crisis.initiate_escalation(sample_contacts, "Compliance breach")

    for status in result["statuses"]:
        assert status["status"] == "not_placed"
        assert status["outcome"] == OUTCOME_NOT_PLACED
        assert status["failure_detail"]


@pytest.mark.asyncio
async def test_no_acknowledgement_is_ever_claimed(crisis, sample_contacts):
    """The defect that mattered.

    A firm reading "Acknowledged: 3 of 3" during a live incident could stand
    down believing every contact had been reached.
    """
    initiation = await crisis.initiate_escalation(sample_contacts, "Data breach")
    status = await crisis.get_escalation_status(initiation["escalation_id"])

    assert status["outcomes_known"] is False
    assert "acknowledged" not in status["summary"]
    assert "avg_response_time_seconds" not in status["summary"]
    assert status["summary"]["calls_placed"] == 0
    assert status["summary"]["calls_not_placed"] == 3


@pytest.mark.asyncio
async def test_the_status_tells_the_operator_to_confirm_directly(
    crisis, sample_contacts
):
    initiation = await crisis.initiate_escalation(sample_contacts, "Data breach")
    status = await crisis.get_escalation_status(initiation["escalation_id"])

    assert "confirm receipt directly" in status["outcomes_note"]


# ---- Configured: placement is known, outcome is not ----


@pytest.mark.asyncio
async def test_placed_calls_are_counted(working_crisis, sample_contacts):
    result = await working_crisis.initiate_escalation(sample_contacts, "Incident")

    assert result["calls_initiated"] == 3
    assert result["calls_not_placed"] == 0
    assert all(s["call_id"] for s in result["statuses"])


@pytest.mark.asyncio
async def test_a_placed_call_still_has_an_unknown_outcome(
    working_crisis, sample_contacts
):
    """Placing a call is not the same as reaching a person.

    This was invented even with a real API key: the partner's response was
    used for its call_id and nothing else.
    """
    initiation = await working_crisis.initiate_escalation(sample_contacts, "Incident")
    status = await working_crisis.get_escalation_status(initiation["escalation_id"])

    assert status["summary"]["calls_placed"] == 3
    assert status["outcomes_known"] is False
    assert all(c["outcome"] == OUTCOME_UNKNOWN for c in status["contacts"])


@pytest.mark.asyncio
async def test_every_contact_appears_in_the_status(working_crisis, sample_contacts):
    initiation = await working_crisis.initiate_escalation(sample_contacts, "Incident")
    status = await working_crisis.get_escalation_status(initiation["escalation_id"])

    assert len(status["contacts"]) == len(sample_contacts)
    assert {c["contact"] for c in status["contacts"]} == {
        c["name"] for c in sample_contacts
    }


@pytest.mark.asyncio
async def test_single_contact_escalation(working_crisis):
    result = await working_crisis.initiate_escalation(
        [{"name": "Solo Contact", "phone": "+10000000000"}], "Minor incident"
    )
    assert result["calls_initiated"] == 1


@pytest.mark.asyncio
async def test_invalid_escalation_id(crisis):
    with pytest.raises(ValueError, match="not found"):
        await crisis.get_escalation_status("does-not-exist")
