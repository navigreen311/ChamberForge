"""Tests for ResearchAI - claims come from the source, or not at all.

Rewritten by P-04. One test here asserted the defect:
`test_ingest_source_no_api_key` checked that an unconfigured agent returned
"sample data with 3 claims", each with text, a confidence and a category.

Those claims were constants - "Regulatory compliance costs increased 23%
year-over-year", confidence 0.85 - attributed to whatever document the
caller had just passed in. For an agent whose entire purpose is provenance,
inventing a statistic and crediting it to a real source is the worst
available failure.

The rest of this file kept its shape; the fixtures now inject a client
rather than patching the agent module's settings, because the key is read on
the shared call path.
"""
import json
from unittest.mock import MagicMock

import pytest

from app.services.agents.base_agent import is_degraded
from app.services.agents.research_ai import ResearchAI


@pytest.fixture
def research_ai(monkeypatch):
    """An agent on a deployment with no API key configured."""
    monkeypatch.setattr("app.services.agents.base_agent.settings.ANTHROPIC_API_KEY", "")
    return ResearchAI()


@pytest.fixture
def research_ai_with_client():
    """An agent with a stub provider client. ResearchAI calls synchronously."""
    ai = ResearchAI()
    ai._client = MagicMock()
    return ai


def _returns(ai, text):
    message = MagicMock()
    message.content = [MagicMock(text=text)]
    message.usage = MagicMock(input_tokens=10, output_tokens=5)
    ai._client.messages.create.return_value = message


@pytest.mark.asyncio
async def test_ingest_source_invents_no_claims(research_ai):
    result = await research_ai.ingest_source("Some text about regulations", "regulatory")

    assert is_degraded(result)
    assert "claims" not in result, "a claim credited to a source must come from it"
    assert "estimated_credibility" not in result


@pytest.mark.asyncio
async def test_ingest_source_with_mocked_client(research_ai_with_client):
    ai = research_ai_with_client
    expected = {
        "claims": [{"claim_text": "Test claim", "confidence": 0.9, "category": "factual"}],
        "estimated_credibility": 8,
        "key_findings": ["Key finding 1"],
    }
    _returns(ai, json.dumps(expected))

    result = await ai.ingest_source("Test document text", "peer_reviewed")

    assert result == expected
    ai._client.messages.create.assert_called_once()


@pytest.mark.asyncio
async def test_ingest_source_handles_markdown_fences(research_ai_with_client):
    ai = research_ai_with_client
    expected = {
        "claims": [{"claim_text": "A claim", "confidence": 0.8, "category": "legal"}],
        "estimated_credibility": 6,
        "key_findings": ["Finding"],
    }
    _returns(ai, "```json\n" + json.dumps(expected) + "\n```")

    result = await ai.ingest_source("Some text", "regulatory")

    assert result == expected


def test_detect_contradictions_no_client(research_ai):
    result = research_ai.detect_contradictions(
        [{"claim_text": "A", "confidence": 0.9}],
        [{"claim_text": "B", "confidence": 0.8}],
    )
    assert result == []


def test_detect_contradictions_with_client(research_ai_with_client):
    ai = research_ai_with_client
    expected = [
        {
            "claim_a": "Rate increased 20%",
            "claim_b": "Rate decreased 5%",
            "explanation": "Directly contradictory claims about rate direction",
        }
    ]
    _returns(ai, json.dumps(expected))

    result = ai.detect_contradictions(
        [{"claim_text": "Rate increased 20%", "confidence": 0.9}],
        [{"claim_text": "Rate decreased 5%", "confidence": 0.8}],
    )

    assert result == expected
    ai._client.messages.create.assert_called_once()
