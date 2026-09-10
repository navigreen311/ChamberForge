"""Tests for Problem Ontology Engine service."""
import uuid

import pytest

from app.services.backbone.ontology_engine import OntologyEngine, _extensions


@pytest.fixture()
def ontology():
    # Reset extensions between tests
    _extensions.clear()
    return OntologyEngine()


class TestGetOntologySchema:
    def test_returns_all_fields(self, ontology):
        schema = ontology.get_ontology_schema()
        expected_fields = {
            "wealth_tier", "buyer_type", "life_stage", "trigger_event",
            "pain_category", "wtp_profile", "trust_channel", "compliance_risk",
            "delivery_model", "proof_metric", "lifecycle_stage",
        }
        assert expected_fields.issubset(set(schema.keys()))

    def test_each_field_has_description_and_values(self, ontology):
        schema = ontology.get_ontology_schema()
        for field, meta in schema.items():
            assert "description" in meta
            assert "allowed_values" in meta
            assert len(meta["allowed_values"]) > 0


class TestValidateAgainstOntology:
    def test_valid_data_passes(self, ontology):
        result = ontology.validate_against_ontology({"wealth_tier": "hnw"})
        assert result["valid"] is True
        assert len(result["errors"]) == 0

    def test_invalid_value_fails(self, ontology):
        result = ontology.validate_against_ontology({"wealth_tier": "nonexistent_tier"})
        assert result["valid"] is False
        assert len(result["errors"]) > 0

    def test_case_insensitive_auto_correction(self, ontology):
        result = ontology.validate_against_ontology({"wealth_tier": "HNW"})
        # "HNW" should either match directly or be auto-corrected
        assert result["valid"] is True or len(result["auto_corrections"]) > 0

    def test_empty_data_is_valid(self, ontology):
        result = ontology.validate_against_ontology({})
        assert result["valid"] is True


class TestSuggestClassifications:
    def test_suggests_from_exit_text(self, ontology):
        result = ontology.suggest_classifications(
            "Founder just sold company in a major acquisition exit event"
        )
        assert "suggestions" in result
        assert result["suggestions"].get("trigger_event") is not None

    def test_suggests_pain_category(self, ontology):
        result = ontology.suggest_classifications(
            "Client needs privacy and security for their estate planning"
        )
        suggestions = result["suggestions"]
        assert suggestions.get("pain_category") is not None


class TestUpdateOntologyMappings:
    def test_add_new_values(self, ontology):
        result = ontology.update_ontology_mappings("wealth_tier", ["custom_tier_xyz"])
        assert result["success"] is True
        assert "custom_tier_xyz" in result["added"]

        # Verify it appears in schema
        schema = ontology.get_ontology_schema()
        assert "custom_tier_xyz" in schema["wealth_tier"]["allowed_values"]

    def test_unknown_field_fails(self, ontology):
        result = ontology.update_ontology_mappings("nonexistent_field", ["val"])
        assert result["success"] is False


class TestGetOntologyStats:
    def test_returns_dict(self, ontology, db):
        ws_id = str(uuid.uuid4())
        stats = ontology.get_ontology_stats(db, ws_id)
        assert isinstance(stats, dict)
        assert "wealth_tier" in stats
