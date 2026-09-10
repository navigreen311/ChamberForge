"""Tests for recency decay computation — CRITICAL correctness tests."""
from datetime import date
from unittest.mock import patch

import pytest

from app.services.agents.research_ai import ResearchAI


@pytest.fixture
def research_ai():
    with patch("app.services.agents.research_ai.settings") as mock_settings:
        mock_settings.ANTHROPIC_API_KEY = ""
        mock_settings.AI_MODEL = "claude-sonnet-4-6"
        ai = ResearchAI()
    return ai


def test_decay_at_zero_months(research_ai):
    """At 0 months elapsed, score should remain unchanged."""
    ref = date(2025, 1, 1)
    pub = date(2025, 1, 1)
    result = research_ai.compute_recency_decay(8.0, pub, ref)
    assert result == 8.0


def test_decay_at_9_months(research_ai):
    """At 9 months: 8.0 * 0.5^(9/18) = 8.0 * 0.707... ≈ 5.66."""
    ref = date(2025, 10, 1)
    pub = date(2025, 1, 1)
    result = research_ai.compute_recency_decay(8.0, pub, ref)
    expected = 8.0 * (0.5 ** (9 / 18))
    assert abs(result - expected) < 0.01
    assert abs(result - 5.66) < 0.01


def test_decay_at_18_months(research_ai):
    """At 18 months: score should be exactly half."""
    ref = date(2026, 7, 1)
    pub = date(2025, 1, 1)
    result = research_ai.compute_recency_decay(8.0, pub, ref)
    assert result == 4.0


def test_decay_at_36_months(research_ai):
    """At 36 months: score should be exactly quarter."""
    ref = date(2028, 1, 1)
    pub = date(2025, 1, 1)
    result = research_ai.compute_recency_decay(8.0, pub, ref)
    assert result == 2.0


def test_decay_with_zero_credibility(research_ai):
    """Zero credibility always stays zero regardless of age."""
    ref = date(2026, 7, 1)
    pub = date(2025, 1, 1)
    result = research_ai.compute_recency_decay(0.0, pub, ref)
    assert result == 0.0


def test_decay_future_publication(research_ai):
    """Publication in the future should not decay (months_elapsed clamped to 0)."""
    ref = date(2025, 1, 1)
    pub = date(2025, 6, 1)
    result = research_ai.compute_recency_decay(8.0, pub, ref)
    assert result == 8.0


def test_decay_defaults_to_today(research_ai):
    """Without reference_date, uses today's date."""
    pub = date.today()
    result = research_ai.compute_recency_decay(10.0, pub)
    assert result == 10.0


def test_identify_stale(research_ai):
    """identify_stale returns IDs of evidence older than threshold."""
    class FakeEvidence:
        def __init__(self, id, pub_date):
            self.id = id
            self.publication_date = pub_date

    today = date.today()
    old = FakeEvidence("old-1", date(today.year - 2, today.month, 1))
    fresh = FakeEvidence("fresh-1", date(today.year, today.month, 1))

    result = research_ai.identify_stale([old, fresh], threshold_months=18)
    assert "old-1" in result
    assert "fresh-1" not in result
