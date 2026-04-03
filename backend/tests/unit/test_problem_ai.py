"""Unit tests for ProblemAI service."""
from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest


# ---------------------------------------------------------------------------
# We patch settings BEFORE importing ProblemAI so the module-level
# settings.ANTHROPIC_API_KEY is controlled by us.
# ---------------------------------------------------------------------------

class _FakeSettings:
    ANTHROPIC_API_KEY = "test-key"
    AI_MODEL = "claude-sonnet-4-6"


@pytest.fixture()
def ai_agent():
    """Return a ProblemAI instance with a mocked Anthropic client."""
    with patch("app.services.agents.problem_ai.settings", _FakeSettings()):
        from app.services.agents.problem_ai import ProblemAI
        agent = ProblemAI()
        agent.client = MagicMock()
        return agent


# ---------------------------------------------------------------------------
# discover_problems
# ---------------------------------------------------------------------------
def test_discover_problems_returns_valid_structure(ai_agent):
    sample_response = json.dumps([
        {
            "title": "Test Problem",
            "description": "A test problem description",
            "wealth_tier": "hnw",
            "buyer_type": "individual",
            "pain_category": "tax_optimization",
            "urgency_score": 8,
            "lifecycle_stage": "emerging",
            "trigger_event": "liquidity_event",
            "wtp_profile": "premium",
        }
    ])
    mock_message = MagicMock()
    mock_message.content = [MagicMock(text=sample_response)]
    ai_agent.client.messages.create.return_value = mock_message

    results = ai_agent.discover_problems(
        sources=["wealth management trends 2026"],
        workspace_id="ws-1",
    )

    assert isinstance(results, list)
    assert len(results) == 1
    p = results[0]
    assert "title" in p
    assert "urgency_score" in p
    assert "wealth_tier" in p
    assert "pain_category" in p
    assert "lifecycle_stage" in p


def test_discover_problems_fallback_without_api_key():
    """When API key is empty, sample problems are returned."""
    with patch("app.services.agents.problem_ai.settings", MagicMock(ANTHROPIC_API_KEY="", AI_MODEL="claude-sonnet-4-6")):
        from app.services.agents.problem_ai import ProblemAI
        agent = ProblemAI()
        results = agent.discover_problems(["src"], "ws-1")
        assert isinstance(results, list)
        assert len(results) == 3
        assert all("title" in p for p in results)


# ---------------------------------------------------------------------------
# score_problem
# ---------------------------------------------------------------------------
def test_score_problem_returns_expected_fields(ai_agent):
    mock_message = MagicMock()
    mock_message.content = [MagicMock(text='{"urgency_score": 9, "wtp_confidence": 0.85}')]
    ai_agent.client.messages.create.return_value = mock_message

    result = ai_agent.score_problem({"title": "Test", "description": "Desc"})

    assert "urgency_score" in result
    assert "wtp_confidence" in result
    assert isinstance(result["urgency_score"], int)
    assert isinstance(result["wtp_confidence"], float)


# ---------------------------------------------------------------------------
# classify_lifecycle
# ---------------------------------------------------------------------------
def test_classify_lifecycle_returns_string(ai_agent):
    mock_message = MagicMock()
    mock_message.content = [MagicMock(text="Emerging")]
    ai_agent.client.messages.create.return_value = mock_message

    result = ai_agent.classify_lifecycle({"title": "Test"})
    assert result == "Emerging"
