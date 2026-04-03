"""Tests for PersonaSimulator — conversation flow management."""

import pytest
from unittest.mock import AsyncMock, patch

from app.services.backbone.persona_simulator import PersonaSimulator


@pytest.fixture
def simulator():
    return PersonaSimulator(api_key="test-key", model="test-model")


def test_create_session(simulator):
    """Test session creation returns proper structure."""
    session = simulator.create_session(
        persona_name="Victoria Chen",
        persona_role="CFO at Fortune 500",
        persona_traits=["skeptical", "data-driven"],
        scenario="Discovery call for $200K engagement",
        difficulty="medium",
    )

    assert "session_id" in session
    assert session["persona_name"] == "Victoria Chen"
    assert session["persona_role"] == "CFO at Fortune 500"
    assert session["status"] == "active"
    assert session["difficulty"] == "medium"


def test_get_session(simulator):
    """Test getting a session after creation."""
    created = simulator.create_session(
        persona_name="Test Persona",
        persona_role="CEO",
        persona_traits=["analytical"],
        scenario="Test scenario",
    )

    session = simulator.get_session(created["session_id"])
    assert session is not None
    assert session["persona_name"] == "Test Persona"
    assert session["turn_count"] == 0
    assert session["history"] == []


def test_get_nonexistent_session(simulator):
    """Test getting a session that doesn't exist."""
    assert simulator.get_session("nonexistent-id") is None


@pytest.mark.asyncio
async def test_send_message_returns_response(simulator):
    """Test sending a message returns a persona response (fallback)."""
    created = simulator.create_session(
        persona_name="Test Persona",
        persona_role="CEO",
        persona_traits=["skeptical"],
        scenario="Sales pitch",
        difficulty="medium",
    )

    result = await simulator.send_message(
        created["session_id"],
        "Hi, I'd like to discuss our advisory service.",
    )

    assert result is not None
    assert "persona_response" in result
    assert result["turn_number"] == 1
    assert isinstance(result["persona_response"], str)
    assert len(result["persona_response"]) > 0


@pytest.mark.asyncio
async def test_conversation_history_tracked(simulator):
    """Test that conversation history is maintained."""
    created = simulator.create_session(
        persona_name="Test Persona",
        persona_role="CEO",
        persona_traits=["analytical"],
        scenario="Test",
    )
    sid = created["session_id"]

    await simulator.send_message(sid, "First message")
    await simulator.send_message(sid, "Second message")

    history = simulator.get_history(sid)
    assert len(history) == 4  # 2 user + 2 assistant messages
    assert history[0]["role"] == "user"
    assert history[0]["content"] == "First message"
    assert history[1]["role"] == "assistant"
    assert history[2]["role"] == "user"
    assert history[2]["content"] == "Second message"


@pytest.mark.asyncio
async def test_send_message_to_ended_session(simulator):
    """Test sending message to ended session returns None."""
    created = simulator.create_session(
        persona_name="Test",
        persona_role="CEO",
        persona_traits=[],
        scenario="Test",
    )
    sid = created["session_id"]

    simulator.end_session(sid)
    result = await simulator.send_message(sid, "Hello?")
    assert result is None


def test_end_session(simulator):
    """Test ending a session."""
    created = simulator.create_session(
        persona_name="Test",
        persona_role="CEO",
        persona_traits=[],
        scenario="Test",
    )

    result = simulator.end_session(created["session_id"])
    assert result is not None
    assert result["status"] == "completed"


def test_end_nonexistent_session(simulator):
    """Test ending a non-existent session."""
    assert simulator.end_session("nonexistent") is None


@pytest.mark.asyncio
async def test_score_performance_empty_session(simulator):
    """Test scoring an empty session."""
    created = simulator.create_session(
        persona_name="Test",
        persona_role="CEO",
        persona_traits=[],
        scenario="Test",
    )

    result = await simulator.score_performance(created["session_id"])
    assert result is not None
    assert result["overall_score"] == 0
    assert result["feedback"] == "No messages sent yet."


@pytest.mark.asyncio
async def test_score_performance_with_messages(simulator):
    """Test scoring after messages (fallback scoring)."""
    created = simulator.create_session(
        persona_name="Test",
        persona_role="CEO",
        persona_traits=["skeptical"],
        scenario="Test",
        difficulty="medium",
    )
    sid = created["session_id"]

    await simulator.send_message(sid, "Hi, can I ask about your challenges?")
    await simulator.send_message(sid, "We help companies achieve 3x growth through our framework.")

    result = await simulator.score_performance(sid)
    assert result is not None
    assert result["overall_score"] > 0
    assert "dimensions" in result
    assert "rapport" in result["dimensions"]
    assert "discovery" in result["dimensions"]
    assert "value_proposition" in result["dimensions"]
    assert "objection_handling" in result["dimensions"]
    assert "closing" in result["dimensions"]
    assert isinstance(result["coaching_tips"], list)


@pytest.mark.asyncio
async def test_difficulty_affects_fallback_response(simulator):
    """Test that difficulty level affects fallback responses."""
    easy_session = simulator.create_session(
        persona_name="Easy",
        persona_role="CEO",
        persona_traits=[],
        scenario="Test",
        difficulty="easy",
    )
    hard_session = simulator.create_session(
        persona_name="Hard",
        persona_role="CEO",
        persona_traits=[],
        scenario="Test",
        difficulty="hard",
    )

    easy_result = await simulator.send_message(easy_session["session_id"], "Hello")
    hard_result = await simulator.send_message(hard_session["session_id"], "Hello")

    # Both should have responses
    assert easy_result["persona_response"]
    assert hard_result["persona_response"]
    # They should be different (different difficulty)
    assert easy_result["persona_response"] != hard_result["persona_response"]


@pytest.mark.asyncio
async def test_score_nonexistent_session(simulator):
    """Test scoring a non-existent session."""
    result = await simulator.score_performance("nonexistent")
    assert result is None


def test_get_history_empty(simulator):
    """Test getting history of non-existent session."""
    assert simulator.get_history("nonexistent") == []
