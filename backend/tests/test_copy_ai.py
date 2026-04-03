"""Tests for CopyAI agent — positioning output structure validation."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.agents.copy_ai import CopyAI


@pytest.fixture
def copy_ai():
    return CopyAI(api_key="test-key", model="test-model")


@pytest.fixture
def sample_offer():
    return {
        "name": "Executive Advisory Program",
        "target_market": "PE-backed SaaS CEOs",
        "industry": "technology",
        "price": 50000,
        "pain_points": ["stalled growth", "high churn"],
        "outcomes": ["3x revenue", "market leadership"],
        "differentiators": ["proprietary growth framework"],
    }


@pytest.mark.asyncio
async def test_generate_positioning_structure(copy_ai, sample_offer):
    """Test that positioning output has correct structure (using fallback)."""
    # With no API key set to a real value, it will use fallback
    result = await copy_ai.generate_positioning(sample_offer)

    assert "one_liner" in result
    assert "elevator_pitch" in result
    assert "pas_copy" in result
    assert "tagline" in result

    assert isinstance(result["one_liner"], str)
    assert isinstance(result["elevator_pitch"], str)
    assert isinstance(result["tagline"], str)

    pas = result["pas_copy"]
    assert "problem" in pas
    assert "agitate" in pas
    assert "solution" in pas
    assert isinstance(pas["problem"], str)
    assert isinstance(pas["agitate"], str)
    assert isinstance(pas["solution"], str)


@pytest.mark.asyncio
async def test_generate_positioning_includes_offer_data(copy_ai, sample_offer):
    """Test that generated copy references the offer data."""
    result = await copy_ai.generate_positioning(sample_offer)

    # The fallback copy should reference the offer name
    combined = (
        result["one_liner"]
        + result["elevator_pitch"]
        + result["tagline"]
        + result["pas_copy"]["problem"]
    )
    assert "Executive Advisory Program" in combined or "PE-backed SaaS CEOs" in combined


@pytest.mark.asyncio
async def test_generate_positioning_with_empty_offer(copy_ai):
    """Test positioning with minimal offer data uses defaults."""
    result = await copy_ai.generate_positioning({})

    assert result["one_liner"]
    assert result["elevator_pitch"]
    assert result["pas_copy"]["problem"]


@pytest.mark.asyncio
async def test_generate_positioning_with_llm_mock(copy_ai, sample_offer):
    """Test positioning when LLM returns valid JSON."""
    mock_response = '{"one_liner":"Test liner","elevator_pitch":"Test pitch","pas_copy":{"problem":"P","agitate":"A","solution":"S"},"tagline":"Tag"}'

    with patch.object(copy_ai, "_call_llm", new_callable=AsyncMock, return_value=mock_response):
        result = await copy_ai.generate_positioning(sample_offer)

    assert result["one_liner"] == "Test liner"
    assert result["elevator_pitch"] == "Test pitch"
    assert result["tagline"] == "Tag"
    assert result["pas_copy"]["problem"] == "P"


@pytest.mark.asyncio
async def test_generate_outreach_structure(copy_ai, sample_offer):
    """Test outreach output structure."""
    buyer = {"name": "John Smith", "role": "CTO", "industry": "tech", "pain_points": ["scaling issues"]}
    result = await copy_ai.generate_outreach(sample_offer, buyer)

    assert "email_sequence" in result
    assert "linkedin_messages" in result
    assert "objection_handling" in result

    assert len(result["email_sequence"]) == 3
    assert len(result["linkedin_messages"]) == 3
    assert len(result["objection_handling"]) == 5

    for email in result["email_sequence"]:
        assert "subject" in email
        assert "body" in email
        assert "cta" in email

    for obj in result["objection_handling"]:
        assert "objection" in obj
        assert "response" in obj


@pytest.mark.asyncio
async def test_generate_authority_content_structure(copy_ai, sample_offer):
    """Test authority content output structure."""
    result = await copy_ai.generate_authority_content(sample_offer)

    assert "thought_leadership_topics" in result
    assert "article_outlines" in result
    assert "media_pitch" in result

    assert isinstance(result["thought_leadership_topics"], list)
    assert isinstance(result["article_outlines"], list)
    assert isinstance(result["media_pitch"], str)

    for outline in result["article_outlines"]:
        assert "title" in outline
        assert "sections" in outline
