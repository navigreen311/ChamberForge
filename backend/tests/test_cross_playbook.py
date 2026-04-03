"""Tests for cross-playbook composer."""
from app.services.backbone.cross_playbook import CrossPlaybookComposer


def test_compose_two_playbooks():
    """Composing 2 playbooks should merge all fields correctly."""
    pb1 = {
        "name": "Wealth Advisory",
        "icp": {"net_worth": ">$10M", "interests": ["real estate", "art"]},
        "sops": [{"name": "Onboarding SOP", "steps": ["welcome", "assess"]}],
        "pricing": {"min": 5000, "max": 15000, "pricing_model": "retainer"},
        "journey": [{"name": "Discovery"}, {"name": "Proposal"}],
        "kpis": ["client retention", "AUM growth"],
    }
    pb2 = {
        "name": "Lifestyle Concierge",
        "icp": {"net_worth": ">$5M", "interests": ["travel", "art"]},
        "sops": [
            {"name": "Concierge SOP", "steps": ["intake", "fulfill"]},
            {"name": "Onboarding SOP", "steps": ["different"]},  # dupe name
        ],
        "pricing": {"min": 3000, "max": 10000, "pricing_model": "project"},
        "journey": [{"name": "Discovery"}, {"name": "Fulfillment"}],
        "kpis": ["NPS", "client retention"],
    }

    result = CrossPlaybookComposer.compose([pb1, pb2])

    assert result["name"] == "Wealth Advisory + Lifestyle Concierge"
    assert result["combined_pricing"]["min"] == 8000
    assert result["combined_pricing"]["max"] == 25000

    # SOPs deduped by name
    sop_names = [s["name"] for s in result["merged_sops"]]
    assert len(sop_names) == 2
    assert "Onboarding SOP" in sop_names
    assert "Concierge SOP" in sop_names

    # Journey deduped
    journey_names = [j["name"] for j in result["unified_journey"]]
    assert "Discovery" in journey_names
    assert "Fulfillment" in journey_names
    assert journey_names.count("Discovery") == 1

    # KPIs deduped
    assert "client retention" in result["bundled_kpis"]
    assert "NPS" in result["bundled_kpis"]
    assert result["bundled_kpis"].count("client retention") == 1

    # ICP merged — interests should be union
    interests = result["combined_icp"]["interests"]
    assert set(interests) == {"real estate", "art", "travel"}


def test_pricing_with_discount():
    """Bundle pricing should sum and apply discount."""
    prices = [(5000, 15000), (3000, 10000)]
    result = CrossPlaybookComposer.estimate_bundle_pricing(prices, discount_pct=10.0)

    assert result["min_price"] == 7200.0  # 8000 * 0.9
    assert result["max_price"] == 22500.0  # 25000 * 0.9
    assert result["discount_applied"] == 10.0
    assert result["savings"] == 2500.0


def test_compose_rejects_single_playbook():
    """Should raise when fewer than 2 playbooks given."""
    import pytest

    with pytest.raises(ValueError, match="at least 2"):
        CrossPlaybookComposer.compose([{"name": "Solo"}])
