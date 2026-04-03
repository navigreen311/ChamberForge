"""Tests for playbook template data completeness and correctness."""
import pytest

from app.services.backbone.playbook_data import PLAYBOOK_TEMPLATES

REQUIRED_SLUGS = [
    "private-ops-office",
    "ecosystem-orchestrator",
    "family-cyber-command",
    "footprint-reduction",
    "household-workforce",
    "family-risk-council",
    "next-gen-studio",
    "medical-navigation",
    "property-resilience",
    "travel-reliability",
]

REQUIRED_FIELDS = [
    "slug",
    "name",
    "target_buyer",
    "price_range_min",
    "price_range_max",
    "core_pain",
    "icp",
    "pain_triggers",
    "pricing_model",
    "sop_skeleton",
    "trust_concerns",
    "objection_handling",
    "kpi_stack",
    "voiceforge_assets",
    "visionaudio_assets",
]


def test_all_10_playbooks_exist():
    """Verify all 10 playbook templates are defined."""
    assert len(PLAYBOOK_TEMPLATES) == 10
    slugs = [p["slug"] for p in PLAYBOOK_TEMPLATES]
    for expected_slug in REQUIRED_SLUGS:
        assert expected_slug in slugs, f"Missing playbook: {expected_slug}"


@pytest.mark.parametrize("playbook", PLAYBOOK_TEMPLATES, ids=lambda p: p["slug"])
def test_playbook_has_all_required_fields(playbook):
    """Each playbook must have all required fields."""
    for field in REQUIRED_FIELDS:
        assert field in playbook, f"{playbook['slug']} missing field: {field}"


@pytest.mark.parametrize("playbook", PLAYBOOK_TEMPLATES, ids=lambda p: p["slug"])
def test_icp_is_populated(playbook):
    """ICP must be a non-empty dict."""
    assert isinstance(playbook["icp"], dict)
    assert len(playbook["icp"]) >= 3, f"{playbook['slug']} ICP has too few keys"


@pytest.mark.parametrize("playbook", PLAYBOOK_TEMPLATES, ids=lambda p: p["slug"])
def test_pain_triggers_minimum(playbook):
    """Each playbook must have at least 4 pain triggers."""
    assert isinstance(playbook["pain_triggers"], list)
    assert len(playbook["pain_triggers"]) >= 4, (
        f"{playbook['slug']} has only {len(playbook['pain_triggers'])} pain triggers"
    )


@pytest.mark.parametrize("playbook", PLAYBOOK_TEMPLATES, ids=lambda p: p["slug"])
def test_sop_skeleton_minimum(playbook):
    """Each playbook must have at least 3 SOPs."""
    assert isinstance(playbook["sop_skeleton"], list)
    assert len(playbook["sop_skeleton"]) >= 3, (
        f"{playbook['slug']} has only {len(playbook['sop_skeleton'])} SOPs"
    )
    for sop in playbook["sop_skeleton"]:
        assert "name" in sop
        assert "steps" in sop
        assert len(sop["steps"]) >= 2


@pytest.mark.parametrize("playbook", PLAYBOOK_TEMPLATES, ids=lambda p: p["slug"])
def test_trust_concerns_minimum(playbook):
    """Each playbook must have at least 3 trust concerns."""
    assert isinstance(playbook["trust_concerns"], list)
    assert len(playbook["trust_concerns"]) >= 3


@pytest.mark.parametrize("playbook", PLAYBOOK_TEMPLATES, ids=lambda p: p["slug"])
def test_objection_handling_minimum(playbook):
    """Each playbook must have at least 4 objection-handling pairs."""
    assert isinstance(playbook["objection_handling"], list)
    assert len(playbook["objection_handling"]) >= 4
    for item in playbook["objection_handling"]:
        assert "objection" in item
        assert "response" in item


@pytest.mark.parametrize("playbook", PLAYBOOK_TEMPLATES, ids=lambda p: p["slug"])
def test_kpi_stack_minimum(playbook):
    """Each playbook must have at least 4 KPI items."""
    assert isinstance(playbook["kpi_stack"], list)
    assert len(playbook["kpi_stack"]) >= 4
    for kpi in playbook["kpi_stack"]:
        assert "kpi" in kpi
        assert "target" in kpi


@pytest.mark.parametrize("playbook", PLAYBOOK_TEMPLATES, ids=lambda p: p["slug"])
def test_voiceforge_assets_populated(playbook):
    """Each playbook must have voiceforge assets."""
    assert isinstance(playbook["voiceforge_assets"], list)
    assert len(playbook["voiceforge_assets"]) >= 1


@pytest.mark.parametrize("playbook", PLAYBOOK_TEMPLATES, ids=lambda p: p["slug"])
def test_visionaudio_assets_populated(playbook):
    """Each playbook must have visionaudio assets."""
    assert isinstance(playbook["visionaudio_assets"], list)
    assert len(playbook["visionaudio_assets"]) >= 1


@pytest.mark.parametrize("playbook", PLAYBOOK_TEMPLATES, ids=lambda p: p["slug"])
def test_pricing_model_structure(playbook):
    """Pricing model must have type and base_fee."""
    pm = playbook["pricing_model"]
    assert isinstance(pm, dict)
    assert "type" in pm
    assert "base_fee" in pm
    assert pm["base_fee"] > 0


@pytest.mark.parametrize("playbook", PLAYBOOK_TEMPLATES, ids=lambda p: p["slug"])
def test_price_range_valid(playbook):
    """Price range min must be less than max."""
    assert playbook["price_range_min"] < playbook["price_range_max"]
    assert playbook["price_range_min"] > 0
