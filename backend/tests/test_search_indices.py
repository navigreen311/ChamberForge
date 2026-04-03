"""Tests for search index definitions."""
from app.services.backbone.search_indices import (
    PROBLEM_MAPPING,
    EVIDENCE_MAPPING,
    OFFER_MAPPING,
    CLIENT_MAPPING,
    PARTNER_MAPPING,
    EXPERT_MAPPING,
    get_all_indices,
)


def _fields(mapping: dict) -> set[str]:
    return set(mapping["properties"].keys())


def test_problem_mapping_fields():
    expected = {
        "title", "description", "pain_category",
        "wealth_tier", "lifecycle_stage", "urgency_score", "workspace_id",
    }
    assert expected <= _fields(PROBLEM_MAPPING)
    assert PROBLEM_MAPPING["properties"]["urgency_score"]["type"] == "integer"
    assert "keyword" in str(PROBLEM_MAPPING["properties"]["title"])


def test_evidence_mapping_fields():
    expected = {
        "source_url", "claims", "credibility_score",
        "source_type", "workspace_id",
    }
    assert expected <= _fields(EVIDENCE_MAPPING)
    assert EVIDENCE_MAPPING["properties"]["claims"]["type"] == "nested"


def test_offer_mapping_fields():
    expected = {"name", "value_stack", "delivery_model", "status", "workspace_id"}
    assert expected <= _fields(OFFER_MAPPING)
    assert OFFER_MAPPING["properties"]["value_stack"]["type"] == "nested"


def test_client_mapping_fields():
    expected = {"name", "company", "wealth_tier", "status", "workspace_id"}
    assert expected <= _fields(CLIENT_MAPPING)


def test_partner_mapping_fields():
    expected = {"name", "domain", "credentials", "workspace_id"}
    assert expected <= _fields(PARTNER_MAPPING)


def test_expert_mapping_fields():
    expected = {"name", "specialty", "license_type", "jurisdiction"}
    assert expected <= _fields(EXPERT_MAPPING)


def test_get_all_indices_returns_six():
    indices = get_all_indices()
    assert len(indices) == 6
    for name, mapping in indices.items():
        assert "properties" in mapping
