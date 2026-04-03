"""Tests for PersonaSimIntegration — full session lifecycle."""
import pytest

from app.services.integrations.voiceforge_client import VoiceForgeClient
from app.services.integrations.voiceforge_persona_sim import PersonaSimIntegration


@pytest.fixture
def persona_sim():
    client = VoiceForgeClient(api_url="", api_key="")
    return PersonaSimIntegration(client)


@pytest.mark.asyncio
async def test_start_session(persona_sim: PersonaSimIntegration):
    result = await persona_sim.start_session("founder", "Discuss portfolio allocation")
    assert "session_id" in result
    assert result["persona"]["name"] == "Alexander Harrington"
    assert "opening_message" in result
    assert len(result["opening_message"]) > 0


@pytest.mark.asyncio
async def test_send_message(persona_sim: PersonaSimIntegration):
    session = await persona_sim.start_session("cfo", "Annual review")
    reply = await persona_sim.send_message(session["session_id"], "Let me walk you through the numbers.")
    assert "response" in reply
    assert "sentiment" in reply
    assert "coaching_tip" in reply


@pytest.mark.asyncio
async def test_end_session_returns_score(persona_sim: PersonaSimIntegration):
    session = await persona_sim.start_session("inheritor", "Estate planning introduction")
    await persona_sim.send_message(session["session_id"], "Hello, great to meet you.")
    result = await persona_sim.end_session(session["session_id"])
    assert 0 <= result["performance_score"] <= 100
    assert isinstance(result["strengths"], list)
    assert isinstance(result["improvements"], list)
    assert isinstance(result["transcript"], list)


@pytest.mark.asyncio
async def test_full_session_flow(persona_sim: PersonaSimIntegration):
    """Start → send multiple messages → end = complete flow."""
    start = await persona_sim.start_session("family_office_principal", "Multi-gen wealth review")
    sid = start["session_id"]

    await persona_sim.send_message(sid, "I'd like to discuss governance structures.")
    await persona_sim.send_message(sid, "What are your priorities for the next generation?")

    end = await persona_sim.end_session(sid)
    assert end["performance_score"] >= 60
    # Transcript should have opening + 2 user + 2 persona = 5 messages
    assert len(end["transcript"]) == 5


@pytest.mark.asyncio
async def test_invalid_persona_type(persona_sim: PersonaSimIntegration):
    with pytest.raises(ValueError, match="Unknown persona_type"):
        await persona_sim.start_session("alien", "First contact")


@pytest.mark.asyncio
async def test_end_invalid_session(persona_sim: PersonaSimIntegration):
    with pytest.raises(ValueError, match="not found"):
        await persona_sim.end_session("nonexistent-session-id")
