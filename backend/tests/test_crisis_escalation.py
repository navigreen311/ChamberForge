"""Tests for CrisisEscalation — initiation and status tracking."""
import pytest

from app.services.integrations.voiceforge_client import VoiceForgeClient
from app.services.integrations.voiceforge_crisis import CrisisEscalation


@pytest.fixture
def crisis():
    client = VoiceForgeClient(api_url="", api_key="")
    return CrisisEscalation(client)


@pytest.fixture
def sample_contacts():
    return [
        {"name": "Alice Chen", "phone": "+14155550101"},
        {"name": "Bob Patel", "phone": "+14155550102"},
        {"name": "Carol Nguyen", "phone": "+14155550103"},
    ]


@pytest.mark.asyncio
async def test_initiate_returns_correct_count(crisis: CrisisEscalation, sample_contacts):
    result = await crisis.initiate_escalation(sample_contacts, "Market flash crash detected")
    assert result["calls_initiated"] == 3
    assert len(result["statuses"]) == 3
    assert "escalation_id" in result


@pytest.mark.asyncio
async def test_initiate_status_values(crisis: CrisisEscalation, sample_contacts):
    result = await crisis.initiate_escalation(sample_contacts, "Compliance breach")
    for status in result["statuses"]:
        assert "contact" in status
        assert status["status"] == "ringing"


@pytest.mark.asyncio
async def test_get_escalation_status(crisis: CrisisEscalation, sample_contacts):
    initiation = await crisis.initiate_escalation(sample_contacts, "Data breach incident")
    eid = initiation["escalation_id"]
    status = await crisis.get_escalation_status(eid)
    assert status["escalation_id"] == eid
    assert isinstance(status["acknowledged_by"], list)
    assert isinstance(status["pending"], list)
    assert isinstance(status["failed"], list)
    # Total should match original contacts
    total = len(status["acknowledged_by"]) + len(status["pending"]) + len(status["failed"])
    assert total == len(sample_contacts)


@pytest.mark.asyncio
async def test_single_contact_escalation(crisis: CrisisEscalation):
    result = await crisis.initiate_escalation(
        [{"name": "Solo Contact", "phone": "+10000000000"}],
        "Minor incident",
    )
    assert result["calls_initiated"] == 1


@pytest.mark.asyncio
async def test_invalid_escalation_id(crisis: CrisisEscalation):
    with pytest.raises(ValueError, match="not found"):
        await crisis.get_escalation_status("does-not-exist")
