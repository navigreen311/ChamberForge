"""Tests for ResearchAI agent."""
import json
from unittest.mock import MagicMock, patch

import pytest

from app.services.agents.research_ai import ResearchAI


@pytest.fixture
def research_ai():
    """Create a ResearchAI instance with no API key."""
    with patch("app.services.agents.research_ai.settings") as mock_settings:
        mock_settings.ANTHROPIC_API_KEY = ""
        mock_settings.AI_MODEL = "claude-sonnet-4-6"
        ai = ResearchAI()
    return ai


@pytest.fixture
def research_ai_with_client():
    """Create a ResearchAI instance with a mocked Anthropic client."""
    with patch("app.services.agents.research_ai.settings") as mock_settings:
        mock_settings.ANTHROPIC_API_KEY = "test-key"
        mock_settings.AI_MODEL = "claude-sonnet-4-6"
        with patch("anthropic.Anthropic") as mock_anthropic_cls:
            mock_client = MagicMock()
            mock_anthropic_cls.return_value = mock_client
            ai = ResearchAI()
            ai._client = mock_client
    return ai


@pytest.mark.asyncio
async def test_ingest_source_no_api_key(research_ai):
    """Without API key, ingest_source returns sample data with 3 claims."""
    result = await research_ai.ingest_source("Some text about regulations", "regulatory")

    assert "claims" in result
    assert len(result["claims"]) == 3
    assert "estimated_credibility" in result
    assert "key_findings" in result
    for claim in result["claims"]:
        assert "claim_text" in claim
        assert "confidence" in claim
        assert "category" in claim


@pytest.mark.asyncio
async def test_ingest_source_with_mocked_client(research_ai_with_client):
    """With API key, ingest_source calls Claude and parses the response."""
    ai = research_ai_with_client
    expected = {
        "claims": [
            {"claim_text": "Test claim", "confidence": 0.9, "category": "factual"}
        ],
        "estimated_credibility": 8,
        "key_findings": ["Key finding 1"],
    }

    mock_message = MagicMock()
    mock_message.content = [MagicMock(text=json.dumps(expected))]
    ai._client.messages.create.return_value = mock_message

    result = await ai.ingest_source("Test document text", "peer_reviewed")

    assert result == expected
    ai._client.messages.create.assert_called_once()


@pytest.mark.asyncio
async def test_ingest_source_handles_markdown_fences(research_ai_with_client):
    """Handles response wrapped in markdown code fences."""
    ai = research_ai_with_client
    expected = {
        "claims": [{"claim_text": "A claim", "confidence": 0.8, "category": "legal"}],
        "estimated_credibility": 6,
        "key_findings": ["Finding"],
    }

    mock_message = MagicMock()
    mock_message.content = [MagicMock(text=f"```json\n{json.dumps(expected)}\n```")]
    ai._client.messages.create.return_value = mock_message

    result = await ai.ingest_source("Some text", "regulatory")
    assert result == expected


def test_detect_contradictions_no_client(research_ai):
    """Without API key, detect_contradictions returns empty list."""
    result = research_ai.detect_contradictions(
        [{"claim_text": "A", "confidence": 0.9}],
        [{"claim_text": "B", "confidence": 0.8}],
    )
    assert result == []


def test_detect_contradictions_with_client(research_ai_with_client):
    """With client, detect_contradictions calls Claude and parses response."""
    ai = research_ai_with_client
    expected = [
        {
            "claim_a": "Rate increased 20%",
            "claim_b": "Rate decreased 5%",
            "explanation": "Directly contradictory claims about rate direction",
        }
    ]

    mock_message = MagicMock()
    mock_message.content = [MagicMock(text=json.dumps(expected))]
    ai._client.messages.create.return_value = mock_message

    result = ai.detect_contradictions(
        [{"claim_text": "Rate increased 20%", "confidence": 0.9}],
        [{"claim_text": "Rate decreased 5%", "confidence": 0.8}],
    )
    assert result == expected
    ai._client.messages.create.assert_called_once()
