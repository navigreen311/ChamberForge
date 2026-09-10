"""Tests for Community Intel Network service."""
import uuid

import pytest

from app.services.backbone.community_intel import CommunityIntelNetwork, _anonymize_text


@pytest.fixture()
def network():
    return CommunityIntelNetwork()


class TestAnonymizeText:
    def test_strips_email(self):
        result = _anonymize_text("Contact john@example.com for details")
        assert "[EMAIL]" in result
        assert "john@example.com" not in result

    def test_strips_phone(self):
        result = _anonymize_text("Call 555-123-4567 today")
        assert "[PHONE]" in result
        assert "555-123-4567" not in result


class TestShareInsight:
    def test_share_valid_insight(self, network, db):
        ws_id = str(uuid.uuid4())
        result = network.share_insight(
            db, ws_id, "market_signal", "Seeing increased demand for estate planning"
        )
        assert result["success"] is True
        assert "insight_id" in result

    def test_share_with_anonymization(self, network, db):
        ws_id = str(uuid.uuid4())
        result = network.share_insight(
            db, ws_id, "pricing_intel",
            "Mr. Smith at john@example.com quoted $50k retainers",
            anonymize=True,
        )
        assert result["success"] is True
        assert result["is_anonymized"] is True

    def test_invalid_insight_type(self, network, db):
        ws_id = str(uuid.uuid4())
        result = network.share_insight(db, ws_id, "invalid_type", "content")
        assert result["success"] is False


class TestGetCommunityFeed:
    def test_returns_list(self, network, db):
        feed = network.get_community_feed(db)
        assert isinstance(feed, list)

    def test_feed_after_sharing(self, network, db):
        ws_id = str(uuid.uuid4())
        network.share_insight(db, ws_id, "delivery_tip", "Always follow up within 24h")
        feed = network.get_community_feed(db)
        assert len(feed) >= 1
        assert feed[0]["insight_type"] == "delivery_tip"

    def test_feed_category_filter(self, network, db):
        ws_id = str(uuid.uuid4())
        network.share_insight(db, ws_id, "market_signal", "Wealth tax discussions increasing")
        network.share_insight(db, ws_id, "pricing_intel", "Retainers up 15%")
        feed = network.get_community_feed(db, category="market_signal")
        assert all(f["category"] == "market_signal" for f in feed)


class TestGetMarketPulse:
    def test_returns_structure(self, network, db):
        pulse = network.get_market_pulse(db)
        assert "total_insights" in pulse
        assert "trending_categories" in pulse
        assert "insight_type_distribution" in pulse
        assert "top_insights" in pulse


class TestVoteInsight:
    def test_upvote(self, network, db):
        ws_id = str(uuid.uuid4())
        shared = network.share_insight(db, ws_id, "market_signal", "Test insight")
        result = network.vote_insight(db, shared["insight_id"], "upvote")
        assert result["success"] is True
        assert result["upvotes"] == 1

    def test_downvote(self, network, db):
        ws_id = str(uuid.uuid4())
        shared = network.share_insight(db, ws_id, "market_signal", "Test insight")
        result = network.vote_insight(db, shared["insight_id"], "downvote")
        assert result["success"] is True
        assert result["downvotes"] == 1

    def test_invalid_vote(self, network, db):
        result = network.vote_insight(db, str(uuid.uuid4()), "invalid")
        assert result["success"] is False

    def test_vote_nonexistent_insight(self, network, db):
        result = network.vote_insight(db, str(uuid.uuid4()), "upvote")
        assert result["success"] is False
