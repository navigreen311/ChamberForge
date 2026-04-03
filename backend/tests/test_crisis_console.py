"""Tests for crisis console service — full incident lifecycle."""
import uuid

from app.services.backbone.crisis_console import CrisisConsole


def test_incident_lifecycle(db):
    """Test full lifecycle: create -> add event -> escalate -> lockdown -> resolve."""
    ws = uuid.uuid4()

    # 1. Create
    incident = CrisisConsole.create_incident(db, ws, "Data breach detected", "critical")
    assert incident.status == "active"
    assert incident.severity == "critical"
    assert len(incident.timeline) == 1
    assert incident.timeline[0]["event_type"] == "created"

    iid = incident.id

    # 2. Add timeline event
    incident = CrisisConsole.add_timeline_event(
        db, iid, "investigation", "Security team notified"
    )
    assert len(incident.timeline) == 2
    assert incident.timeline[1]["event_type"] == "investigation"

    # 3. Set escalation tree
    tree = [
        {"level": 1, "contact_name": "CTO", "contact_method": "phone", "role": "Technical Lead"},
        {"level": 2, "contact_name": "CEO", "contact_method": "phone", "role": "Executive"},
    ]
    incident = CrisisConsole.set_escalation_tree(db, iid, tree)
    assert len(incident.escalation_tree) == 2
    assert incident.escalation_tree[0]["contact_name"] == "CTO"

    # 4. Execute lockdown
    actions = ["Disable external API access", "Rotate all credentials"]
    incident = CrisisConsole.execute_lockdown(db, iid, actions)
    assert incident.status == "contained"
    assert len(incident.lockdown_actions) == 2

    # 5. Resolve
    incident = CrisisConsole.resolve_incident(db, iid, "Breach contained, no data exfiltrated")
    assert incident.status == "resolved"
    assert incident.resolved_at is not None


def test_get_active_incidents(db):
    """Active incidents query should exclude resolved ones."""
    ws = uuid.uuid4()

    CrisisConsole.create_incident(db, ws, "Issue A", "low")
    inc_b = CrisisConsole.create_incident(db, ws, "Issue B", "high")
    CrisisConsole.resolve_incident(db, inc_b.id, "Fixed")

    active = CrisisConsole.get_active_incidents(db, ws)
    assert len(active) == 1
    assert active[0].title == "Issue A"


def test_invalid_severity_raises(db):
    """Invalid severity should raise ValueError."""
    import pytest

    ws = uuid.uuid4()
    with pytest.raises(ValueError, match="Invalid severity"):
        CrisisConsole.create_incident(db, ws, "Bad", "extreme")
