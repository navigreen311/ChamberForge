"""Tests for template versioning service."""
import uuid

from app.services.backbone.template_versioning import TemplateVersioning


def test_create_version_increments(db):
    """Creating versions should auto-increment version_number."""
    ws = uuid.uuid4()
    tid = uuid.uuid4()

    v1 = TemplateVersioning.create_version(
        db, ws, "offer", tid, {"title": "V1"}, "Initial version"
    )
    assert v1.version_number == 1
    assert v1.is_active is True

    v2 = TemplateVersioning.create_version(
        db, ws, "offer", tid, {"title": "V2"}, "Updated title"
    )
    assert v2.version_number == 2
    assert v2.is_active is True

    # v1 should now be inactive
    db.refresh(v1)
    assert v1.is_active is False


def test_get_version_history(db):
    """Version history returns all versions newest first."""
    ws = uuid.uuid4()
    tid = uuid.uuid4()

    TemplateVersioning.create_version(db, ws, "playbook", tid, {"a": 1}, "v1")
    TemplateVersioning.create_version(db, ws, "playbook", tid, {"a": 2}, "v2")
    TemplateVersioning.create_version(db, ws, "playbook", tid, {"a": 3}, "v3")

    history = TemplateVersioning.get_version_history(db, tid)
    assert len(history) == 3
    assert history[0].version_number == 3
    assert history[2].version_number == 1


def test_rollback_changes_active(db):
    """Rollback should activate the target version and deactivate others."""
    ws = uuid.uuid4()
    tid = uuid.uuid4()

    TemplateVersioning.create_version(db, ws, "sop", tid, {"step": "A"}, "v1")
    TemplateVersioning.create_version(db, ws, "sop", tid, {"step": "B"}, "v2")
    TemplateVersioning.create_version(db, ws, "sop", tid, {"step": "C"}, "v3")

    rolled = TemplateVersioning.rollback(db, tid, 1)
    assert rolled.version_number == 1
    assert rolled.is_active is True

    active = TemplateVersioning.get_active_version(db, tid)
    assert active.version_number == 1


def test_diff_finds_changes():
    """Diff should detect added, removed, and changed keys."""
    v1 = {"title": "Hello", "price": 100, "old_field": True}
    v2 = {"title": "Hello World", "price": 100, "new_field": "yes"}

    diff = TemplateVersioning.diff_versions(v1, v2)
    assert "new_field" in diff["added"]
    assert "old_field" in diff["removed"]
    assert "title" in diff["changed"]
    assert "price" not in diff["changed"]
