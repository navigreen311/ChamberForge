"""Unit tests for ProblemAI - discovered problems, or none.

Rewritten by P-04. `test_discover_problems_fallback_without_api_key` asserted
that an unconfigured agent returned exactly three problems, each with a
title. They came from SAMPLE_PROBLEMS: a fixed list, returned regardless of
which sources the caller passed in, presented as discovered from them.

`test_classify_lifecycle_returns_string` and `test_score_problem_*` had the
same shape - a constant answered for every input.
"""
from __future__ import annotations

import json
from unittest.mock import MagicMock

import pytest

from app.services.agents.base_agent import is_degraded
from app.services.agents.problem_ai import ProblemAI

PROBLEM = {"title": "Test", "description": "Desc"}


def _client(text):
    """ProblemAI is synchronous, so a plain mock is the right transport."""
    message = MagicMock()
    message.content = [MagicMock(text=text)]
    message.usage = MagicMock(input_tokens=10, output_tokens=5)
    client = MagicMock()
    client.messages.create.return_value = message
    return client


@pytest.fixture()
def unconfigured(monkeypatch):
    monkeypatch.setattr("app.services.agents.base_agent.settings.ANTHROPIC_API_KEY", "")
    return ProblemAI()


@pytest.fixture()
def ai_agent(db_session, monkeypatch):
    """A configured agent whose meter is reachable.

    `discover_problems` takes an explicit workspace_id, so the budget check
    runs - and P-04 makes an unreadable meter a refusal, not a free pass.
    The session has to be the test one or every call here degrades.
    """
    monkeypatch.setattr(
        "app.services.agents.base_agent.SessionLocal", lambda: db_session
    )
    agent = ProblemAI()
    agent.client = _client("[]")
    return agent


# -- discover_problems ------------------------------------------------------


def test_discover_problems_returns_valid_structure(ai_agent):
    discovered = [
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
    ]
    ai_agent.client = _client(json.dumps(discovered))

    results = ai_agent.discover_problems(
        sources=["wealth management trends 2026"], workspace_id="ws-1"
    )

    assert results == discovered


def test_discover_problems_finds_nothing_without_a_key(unconfigured):
    """It used to return three invented problems attributed to the sources."""
    results = unconfigured.discover_problems(["src"], "ws-1")
    assert results == []


# -- score_problem ----------------------------------------------------------


def test_score_problem_returns_expected_fields(ai_agent):
    ai_agent.client = _client('{"urgency_score": 9, "wtp_confidence": 0.85}')

    result = ai_agent.score_problem(PROBLEM)

    assert result["urgency_score"] == 9
    assert result["wtp_confidence"] == 0.85


def test_score_problem_invents_no_score(unconfigured):
    """A fixed urgency of 7 and a WTP confidence of 0.75, for anything."""
    result = unconfigured.score_problem(PROBLEM)

    assert is_degraded(result)
    assert "urgency_score" not in result


# -- classify_lifecycle -----------------------------------------------------


def test_classify_lifecycle_returns_string(ai_agent):
    ai_agent.client = _client("Emerging")

    assert ai_agent.classify_lifecycle({"title": "Test"}) == "Emerging"


def test_classify_lifecycle_returns_nothing_without_a_key(unconfigured):
    """It answered "emerging" - a real stage - for every problem."""
    assert unconfigured.classify_lifecycle({"title": "Test"}) == ""
