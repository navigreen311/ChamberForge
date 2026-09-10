"""Tests for ValidatorAI — mock anthropic, verify 4-dimension validation."""
from __future__ import annotations

import json

import pytest

from app.services.agents.validator_ai import ValidatorAI


@pytest.fixture
def validator():
    """ValidatorAI with no API key → mock mode."""
    return ValidatorAI()


class TestValidateProblemMock:
    """When ANTHROPIC_API_KEY is unset, mock responses are returned."""

    @pytest.mark.asyncio
    async def test_returns_all_four_dimensions(self, validator):
        result = await validator.validate_problem({"title": "Privacy Shield", "pain_category": "Privacy"})
        for dim in ("real", "payable", "deliverable", "ethical"):
            assert f"is_{dim}" in result
            assert f"{dim}_score" in result
            assert f"{dim}_reasoning" in result
        assert "overall_score" in result

    @pytest.mark.asyncio
    async def test_mock_scores_are_positive(self, validator):
        result = await validator.validate_problem({"title": "Test"})
        for dim in ("real", "payable", "deliverable", "ethical"):
            assert result[f"is_{dim}"] is True
            assert 0 <= result[f"{dim}_score"] <= 10

    @pytest.mark.asyncio
    async def test_overall_score_is_float(self, validator):
        result = await validator.validate_problem({"title": "Test"})
        assert isinstance(result["overall_score"], (int, float))


class TestWTPConfidenceMock:
    @pytest.mark.asyncio
    async def test_returns_float_in_range(self, validator):
        score = await validator.score_wtp_confidence({"pain_category": "Privacy"})
        assert 0.0 <= score <= 1.0

    @pytest.mark.asyncio
    async def test_high_wtp_categories(self, validator):
        for cat in ("Privacy", "Security", "Governance", "Medical"):
            score = await validator.score_wtp_confidence({"pain_category": cat})
            assert score > 0.7


class TestFalsePositivesMock:
    @pytest.mark.asyncio
    async def test_returns_list(self, validator):
        result = await validator.detect_false_positives({"description": "A normal problem"})
        assert isinstance(result, list)

    @pytest.mark.asyncio
    async def test_detects_mass_market_language(self, validator):
        result = await validator.detect_false_positives({"description": "This is for everyone"})
        flags = [f["flag"] for f in result]
        assert "mass_market_language" in flags


class TestValidateProblemWithMockedClient:
    """Test with a mocked anthropic client to verify prompt handling."""

    @pytest.mark.asyncio
    async def test_calls_client_and_parses_json(self, monkeypatch):
        fake_response = {
            "is_real": True, "real_score": 8, "real_reasoning": "Good",
            "is_payable": True, "payable_score": 7, "payable_reasoning": "Solid",
            "is_deliverable": True, "deliverable_score": 9, "deliverable_reasoning": "Easy",
            "is_ethical": True, "ethical_score": 10, "ethical_reasoning": "Clean",
            "overall_score": 8.5,
        }

        class FakeContent:
            text = json.dumps(fake_response)

        class FakeMessage:
            content = [FakeContent()]

        class FakeMessages:
            def create(self, **kwargs):
                return FakeMessage()

        class FakeClient:
            messages = FakeMessages()

        validator = ValidatorAI()
        validator.client = FakeClient()

        result = await validator.validate_problem({"title": "Test"})
        assert result["is_real"] is True
        assert result["overall_score"] == 8.5
