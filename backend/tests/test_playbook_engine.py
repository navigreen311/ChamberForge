"""Tests for PlaybookEngine service layer."""
import uuid

import pytest

from app.services.backbone.playbook_engine import PlaybookEngine, DEFAULT_SECTIONS


class TestGetPlaybooks:
    def test_get_all_returns_10(self, db):
        playbooks = PlaybookEngine.get_all_playbooks(db)
        assert len(playbooks) == 10

    def test_get_by_slug(self, db):
        playbook = PlaybookEngine.get_playbook(db, "private-ops-office")
        assert playbook is not None
        assert playbook.name == "Private Ops Office"

    def test_get_nonexistent_slug(self, db):
        playbook = PlaybookEngine.get_playbook(db, "does-not-exist")
        assert playbook is None


class TestActivation:
    def test_activate_creates_record(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "private-ops-office")
        assert activation is not None
        assert activation.workspace_id == workspace_id
        assert activation.status == "active"
        assert activation.completed_sections == 0
        assert activation.total_sections == len(DEFAULT_SECTIONS)

    def test_activate_sets_default_progress(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "ecosystem-orchestrator")
        assert isinstance(activation.progress, dict)
        for section in DEFAULT_SECTIONS:
            assert activation.progress[section] == "not_started"

    def test_activate_nonexistent_playbook(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "fake-slug")
        assert activation is None


class TestCustomization:
    def test_customize_merges_overrides(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "family-cyber-command")
        updated = PlaybookEngine.customize_playbook(
            db, activation.id, {"icp": {"wealth_tier": "Custom Tier"}, "custom_field": "value"}
        )
        assert updated.customizations["icp"]["wealth_tier"] == "Custom Tier"
        assert updated.customizations["custom_field"] == "value"

    def test_customize_preserves_existing(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "footprint-reduction")
        PlaybookEngine.customize_playbook(db, activation.id, {"key1": "val1"})
        updated = PlaybookEngine.customize_playbook(db, activation.id, {"key2": "val2"})
        assert updated.customizations["key1"] == "val1"
        assert updated.customizations["key2"] == "val2"

    def test_customize_nonexistent(self, db):
        result = PlaybookEngine.customize_playbook(db, uuid.uuid4(), {"x": 1})
        assert result is None


class TestProgress:
    def test_get_progress_initial(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "household-workforce")
        progress = PlaybookEngine.get_progress(db, activation.id)
        assert progress["completion_pct"] == 0.0
        assert progress["playbook_name"] == "Household Workforce"
        assert len(progress["sections"]) == len(DEFAULT_SECTIONS)
        assert progress["next_step"] == DEFAULT_SECTIONS[0]

    def test_update_section_to_complete(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "family-risk-council")
        updated = PlaybookEngine.update_section_progress(
            db, activation.id, "ICP Definition", "complete"
        )
        assert updated.completed_sections == 1
        assert updated.progress["ICP Definition"] == "complete"

    def test_update_section_in_progress(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "next-gen-studio")
        updated = PlaybookEngine.update_section_progress(
            db, activation.id, "SOP Configuration", "in_progress"
        )
        assert updated.progress["SOP Configuration"] == "in_progress"
        assert updated.completed_sections == 0

    def test_update_invalid_status(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "medical-navigation")
        result = PlaybookEngine.update_section_progress(
            db, activation.id, "ICP Definition", "invalid"
        )
        assert result is None

    def test_update_invalid_section(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "property-resilience")
        result = PlaybookEngine.update_section_progress(
            db, activation.id, "Nonexistent Section", "complete"
        )
        assert result is None

    def test_all_sections_complete_marks_completed(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "travel-reliability")
        for section in DEFAULT_SECTIONS:
            activation = PlaybookEngine.update_section_progress(
                db, activation.id, section, "complete"
            )
        assert activation.status == "completed"
        assert activation.completed_sections == len(DEFAULT_SECTIONS)

    def test_progress_percentage(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "private-ops-office")
        PlaybookEngine.update_section_progress(db, activation.id, "ICP Definition", "complete")
        PlaybookEngine.update_section_progress(db, activation.id, "Pain Trigger Mapping", "complete")
        progress = PlaybookEngine.get_progress(db, activation.id)
        assert progress["completion_pct"] == 25.0


class TestExport:
    def test_export_includes_playbook_data(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "private-ops-office")
        export = PlaybookEngine.export_playbook(db, activation.id)
        assert export is not None
        assert export["slug"] == "private-ops-office"
        assert "activation" in export
        assert export["activation"]["workspace_id"] == str(workspace_id)
        assert "exported_at" in export

    def test_export_applies_customizations(self, db, workspace_id):
        activation = PlaybookEngine.activate_playbook(db, workspace_id, "ecosystem-orchestrator")
        PlaybookEngine.customize_playbook(
            db, activation.id, {"target_buyer": "Custom Buyer Segment"}
        )
        export = PlaybookEngine.export_playbook(db, activation.id)
        assert export["target_buyer"] == "Custom Buyer Segment"

    def test_export_nonexistent(self, db):
        result = PlaybookEngine.export_playbook(db, uuid.uuid4())
        assert result is None
