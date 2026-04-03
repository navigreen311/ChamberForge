"""Tests for RealtimeService with mocked Pusher client."""
import pytest
from unittest.mock import MagicMock, patch

from app.services.backbone.realtime import RealtimeService, MockPusherClient


@pytest.fixture
def service():
    """Create a RealtimeService with mock client."""
    svc = RealtimeService()
    # Force mock client for testing
    svc.client = MockPusherClient()
    svc._mock = True
    return svc


@pytest.fixture
def service_with_spy():
    """Create a RealtimeService with a spy on trigger calls."""
    svc = RealtimeService()
    mock_client = MagicMock()
    mock_client.trigger.return_value = {}
    svc.client = mock_client
    svc._mock = False
    return svc, mock_client


class TestRealtimeServiceInit:
    def test_mock_client_when_no_credentials(self):
        """Without credentials, service should use MockPusherClient."""
        svc = RealtimeService()
        assert svc.is_mock is True
        assert isinstance(svc.client, MockPusherClient)


class TestBroadcastToWorkspace:
    def test_broadcast_to_workspace_success(self, service_with_spy):
        svc, mock = service_with_spy
        result = svc.broadcast_to_workspace("ws-123", "notification", {"msg": "hello"})
        assert result is True
        mock.trigger.assert_called_once_with("workspace-ws-123", "notification", {"msg": "hello"})

    def test_broadcast_to_workspace_failure(self, service_with_spy):
        svc, mock = service_with_spy
        mock.trigger.side_effect = Exception("Connection error")
        result = svc.broadcast_to_workspace("ws-123", "notification", {"msg": "hello"})
        assert result is False

    def test_broadcast_to_workspace_mock(self, service):
        result = service.broadcast_to_workspace("ws-123", "test-event", {"data": 1})
        assert result is True


class TestBroadcastToUser:
    def test_broadcast_to_user_success(self, service_with_spy):
        svc, mock = service_with_spy
        result = svc.broadcast_to_user("user-456", "alert", {"type": "info"})
        assert result is True
        mock.trigger.assert_called_once_with("private-user-user-456", "alert", {"type": "info"})

    def test_broadcast_to_user_failure(self, service_with_spy):
        svc, mock = service_with_spy
        mock.trigger.side_effect = Exception("Timeout")
        result = svc.broadcast_to_user("user-456", "alert", {"type": "info"})
        assert result is False


class TestBroadcastCrisis:
    def test_broadcast_crisis_success(self, service_with_spy):
        svc, mock = service_with_spy
        incident = {"id": "inc-1", "severity": "high", "description": "System outage"}
        result = svc.broadcast_crisis("ws-789", incident)
        assert result is True
        mock.trigger.assert_called_once_with(
            "crisis-ws-789",
            "crisis-alert",
            {"priority": "critical", "incident": incident},
        )

    def test_broadcast_crisis_failure(self, service_with_spy):
        svc, mock = service_with_spy
        mock.trigger.side_effect = Exception("Network error")
        result = svc.broadcast_crisis("ws-789", {"id": "inc-1"})
        assert result is False

    def test_broadcast_crisis_mock(self, service):
        result = service.broadcast_crisis("ws-789", {"id": "inc-1", "severity": "high"})
        assert result is True


class TestMockPusherClient:
    def test_trigger_returns_empty_dict(self):
        mock = MockPusherClient()
        result = mock.trigger("channel", "event", {"key": "val"})
        assert result == {}
