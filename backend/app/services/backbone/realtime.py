"""Realtime service using Pusher WebSockets for live notifications."""
import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class MockPusherClient:
    """Mock Pusher client for development without credentials."""

    def trigger(self, channels: Any, event: str, data: dict) -> dict:
        logger.info(f"[MockPusher] trigger channels={channels} event={event} data={data}")
        return {}


class RealtimeService:
    """Manages realtime WebSocket broadcasting via Pusher."""

    def __init__(self):
        if settings.PUSHER_APP_ID and settings.PUSHER_KEY and settings.PUSHER_SECRET:
            import pusher

            self.client = pusher.Pusher(
                app_id=settings.PUSHER_APP_ID,
                key=settings.PUSHER_KEY,
                secret=settings.PUSHER_SECRET,
                cluster=settings.PUSHER_CLUSTER or "us2",
                ssl=True,
            )
            self._mock = False
            logger.info("RealtimeService initialized with Pusher credentials")
        else:
            self.client = MockPusherClient()
            self._mock = True
            logger.warning("RealtimeService using MockPusherClient — no Pusher credentials found")

    @property
    def is_mock(self) -> bool:
        return self._mock

    def broadcast_to_workspace(self, workspace_id: str, event: str, data: dict) -> bool:
        """Broadcast an event to all members of a workspace channel."""
        channel = f"workspace-{workspace_id}"
        try:
            self.client.trigger(channel, event, data)
            return True
        except Exception as e:
            logger.error(f"Failed to broadcast to workspace {workspace_id}: {e}")
            return False

    def broadcast_to_user(self, user_id: str, event: str, data: dict) -> bool:
        """Broadcast an event to a specific user's private channel."""
        channel = f"private-user-{user_id}"
        try:
            self.client.trigger(channel, event, data)
            return True
        except Exception as e:
            logger.error(f"Failed to broadcast to user {user_id}: {e}")
            return False

    def broadcast_crisis(self, workspace_id: str, incident_data: dict) -> bool:
        """Broadcast a high-priority crisis event on a dedicated crisis channel."""
        channel = f"crisis-{workspace_id}"
        crisis_payload = {
            "priority": "critical",
            "incident": incident_data,
        }
        try:
            self.client.trigger(channel, "crisis-alert", crisis_payload)
            return True
        except Exception as e:
            logger.error(f"Failed to broadcast crisis to workspace {workspace_id}: {e}")
            return False


# Singleton instance
realtime_service = RealtimeService()
