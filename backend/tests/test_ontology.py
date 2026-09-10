"""Tests for Problem Ontology Engine service."""
import uuid

import pytest

from app.db.scope import OperatorScope, reset_scope, set_scope
from app.services.backbone.ontology_engine import OntologyEngine


@pytest.fixture()
def ontology():
    # P-09: extensions are rows scoped by workspace, not a module-level dict,
    # so there is no global state to clear between tests. The `db_session`
    # fixture rolls back, which is what isolates them now.
    return OntologyEngine()


@pytest.fixture()
def scoped():
    """Bind an operator scope, as the tenant middleware does per request."""
    token = set_scope(OperatorScope(workspace_id="ws-ontology-test", user_id="u1"))
    yield
    reset_scope(token)


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
    def test_add_new_values(self, ontology, db_session, scoped):
        result = ontology.update_ontology_mappings(
            "wealth_tier", ["custom_tier_xyz"], db=db_session
        )
        assert result["success"] is True
        assert "custom_tier_xyz" in result["added"]

        # Verify it appears in schema
        schema = ontology.get_ontology_schema(db=db_session)
        assert "custom_tier_xyz" in schema["wealth_tier"]["allowed_values"]

    def test_unknown_field_fails(self, ontology, db_session, scoped):
        result = ontology.update_ontology_mappings(
            "nonexistent_field", ["val"], db=db_session
        )
        assert result["success"] is False

    def test_an_extension_needs_a_workspace(self, ontology, db_session):
        """P-09: without a scope an extension has no owner.

        It used to be appended to a process-global list and applied to every
        workspace, which is the tenancy leak this package removed.
        """
        result = ontology.update_ontology_mappings(
            "wealth_tier", ["orphan_tier"], db=db_session
        )
        assert result["success"] is False


class TestGetOntologyStats:
    def test_returns_dict(self, ontology, db):
        ws_id = str(uuid.uuid4())
        stats = ontology.get_ontology_stats(db, ws_id)
        assert isinstance(stats, dict)
        assert "wealth_tier" in stats
