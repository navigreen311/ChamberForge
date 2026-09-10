"""Tests for ValidatorAI - the 4-dimension gate answers or abstains.

Rewritten by P-04. The old suite was called `TestValidateProblemMock` and it
asserted, with no API key, that `is_real`, `is_payable`, `is_deliverable` and
`is_ethical` were all `True`, each with a score between 0 and 10.

That is a validation gate returning a pass for every problem it is shown,
without analysing any of them - and the reasoning strings said so plainly:
"No ethical concerns identified." A recorded approval nobody made is worse
than no approval at all, and `test_mock_scores_are_positive` guaranteed it
stayed that way.
"""
from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.services.agents.base_agent import is_degraded
from app.services.agents.validator_ai import ValidatorAI


@pytest.fixture(autouse=True)
def _no_api_key(monkeypatch):
    monkeypatch.setattr("app.services.agents.base_agent.settings.ANTHROPIC_API_KEY", "")


@pytest.fixture
def validator():
    return ValidatorAI()


def _client(payload):
    message = MagicMock()
    message.content = [MagicMock(text=json.dumps(payload))]
    message.usage = MagicMock(input_tokens=10, output_tokens=5)
    client = AsyncMock()
    client.messages.create = AsyncMock(return_value=message)
    return client


class TestValidateProblemUnconfigured:
    @pytest.mark.asyncio
    async def test_it_abstains_rather_than_approving(self, validator):
        result = await validator.validate_problem(
            {"title": "Privacy Shield", "pain_category": "Privacy"}
        )

        assert is_degraded(result)
        for dim in ("real", "payable", "deliverable", "ethical"):
            assert f"is_{dim}" not in result, "an unearned pass is a false record"

    @pytest.mark.asyncio
    async def test_no_ethical_clearance_is_issued(self, validator):
        """The old mock answered "No ethical concerns identified" every time."""
        result = await validator.validate_problem({"title": "Test"})

        assert "ethical_reasoning" not in result
        assert "overall_score" not in result


class TestWTPConfidenceUnconfigured:
    @pytest.mark.asyncio
    async def test_returns_an_out_of_range_sentinel(self, validator):
        """0.82 and 0.65 were keyword lookups dressed as confidence scores.

        -1.0 is outside the documented 0.0-1.0 range, so a caller cannot
        plot it, average it, or mistake it for a reading.
        """
        score = await validator.score_wtp_confidence({"pain_category": "Privacy"})
        assert score == -1.0

    @pytest.mark.asyncio
    async def test_no_category_scores_high_without_analysis(self, validator):
        for cat in ("Privacy", "Security", "Governance", "Medical"):
            assert await validator.score_wtp_confidence({"pain_category": cat}) < 0


class TestFalsePositivesUnconfigured:
    @pytest.mark.asyncio
    async def test_returns_no_flags(self, validator):
        result = await validator.detect_false_positives({"description": "This is for everyone"})
        assert result == []


class TestConfigured:
    @pytest.mark.asyncio
    async def test_calls_the_client_and_parses_json(self, validator):
        payload = {
            "is_real": True,
            "real_score": 8,
            "real_reasoning": "Good",
            "is_payable": True,
            "payable_score": 7,
            "payable_reasoning": "Solid",
            "is_deliverable": True,
            "deliverable_score": 9,
            "deliverable_reasoning": "Easy",
            "is_ethical": True,
            "ethical_score": 10,
            "ethical_reasoning": "Clean",
            "overall_score": 8.5,
        }
        validator.client = _client(payload)

        result = await validator.validate_problem({"title": "Test"})

        assert result["is_real"] is True
        assert result["overall_score"] == 8.5
        assert not is_degraded(result)

    @pytest.mark.asyncio
    async def test_a_refusal_is_not_read_as_a_score(self, validator):
        """The model declining to answer must not become a confidence value."""
        message = MagicMock()
        message.content = [MagicMock(text="I cannot assess this.")]
        message.usage = MagicMock(input_tokens=1, output_tokens=1)
        validator.client = AsyncMock()
        validator.client.messages.create = AsyncMock(return_value=message)

        assert await validator.score_wtp_confidence({"pain_category": "Privacy"}) == -1.0
