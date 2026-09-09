"""Tests for Wealth Event Monitor service."""
import uuid
from datetime import datetime

import pytest

from app.models.wealth_event import WealthEvent
from app.services.backbone.wealth_event_monitor import WealthEventMonitor


@pytest.fixture()
def monitor():
    return WealthEventMonitor()


class TestScanEvents:
    def test_returns_list(self, monitor):
        events = monitor.scan_events()
        assert isinstance(events, list)
        assert len(events) > 0

    def test_event_has_required_fields(self, monitor):
        events = monitor.scan_events()
        required = {"event_type", "person_name", "estimated_wealth_impact", "date", "source", "relevance_score"}
        for ev in events:
            assert required.issubset(set(ev.keys())), f"Missing fields: {required - set(ev.keys())}"

    def test_event_types_are_valid(self, monitor):
        valid_types = {"exit", "ipo", "inheritance", "divorce", "board_appointment", "prominence"}
        events = monitor.scan_events()
        for ev in events:
            assert ev["event_type"] in valid_types


class TestClassifyBuyingWindow:
    def test_returns_required_fields(self, monitor):
        window = monitor.classify_buying_window({"event_type": "exit", "relevance_score": 0.9})
        required = {"window_type", "urgency", "recommended_action", "timing_notes"}
        assert required.issubset(set(window.keys()))

    def test_high_relevance_exit_is_urgent(self, monitor):
        window = monitor.classify_buying_window({"event_type": "exit", "relevance_score": 0.95})
        assert window["urgency"] >= 8

    def test_low_relevance_prominence_is_not_urgent(self, monitor):
        window = monitor.classify_buying_window({"event_type": "prominence", "relevance_score": 0.2})
        assert window["urgency"] <= 5


class TestGetActiveWindows:
    def test_returns_sorted_by_urgency(self, db):
        ws_id = str(uuid.uuid4())
        # Create two events with different relevance
        for etype, relevance in [("exit", 0.95), ("prominence", 0.2)]:
            ev = WealthEvent(
                id=str(uuid.uuid4()),
                workspace_id=ws_id,
                event_type=etype,
                person_name="Test Person",
                relevance_score=relevance,
                buying_window_status="open",
                detected_at=datetime.utcnow(),
            )
            db.add(ev)
        db.commit()

        monitor = WealthEventMonitor()
        windows = monitor.get_active_windows(db, ws_id)
        assert len(windows) == 2
        assert windows[0]["urgency"] >= windows[1]["urgency"]


class TestLinkToProblem:
    def test_link_success(self, db):
        ws_id = str(uuid.uuid4())
        ev = WealthEvent(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            event_type="exit",
            person_name="Jane Doe",
            buying_window_status="open",
            detected_at=datetime.utcnow(),
        )
        db.add(ev)
        db.commit()

        monitor = WealthEventMonitor()
        problem_id = str(uuid.uuid4())
        result = monitor.link_to_problem(db, ev.id, problem_id)
        assert result["success"] is True
        assert result["linked_problem_id"] == problem_id

    def test_link_nonexistent_event(self, db):
        monitor = WealthEventMonitor()
        result = monitor.link_to_problem(db, str(uuid.uuid4()), str(uuid.uuid4()))
        assert result["success"] is False
