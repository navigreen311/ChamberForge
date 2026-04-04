"""Integration tests for the Notifications API — CRUD, read status, filtering."""
import uuid

import pytest

from app.services.backbone.notifications import NotificationService


def _create_notification(db_session, user_id, workspace_id, **overrides):
    """Create a notification directly via the service (bypass API for seeding)."""
    defaults = {
        "user_id": uuid.UUID(user_id) if isinstance(user_id, str) else user_id,
        "workspace_id": uuid.UUID(workspace_id) if isinstance(workspace_id, str) else workspace_id,
        "type": "info",
        "title": "Test Notification",
        "body": "This is a test notification body.",
    }
    defaults.update(overrides)
    return NotificationService.create(db_session, **defaults)


class TestNotificationsList:
    def test_list_notifications_empty(self, authed_client):
        new_user = str(uuid.uuid4())
        resp = authed_client.get(f"/api/v1/notifications/?user_id={new_user}")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_notifications_with_data(self, authed_client, db_session):
        user_id = authed_client._test_user.id
        ws_id = authed_client._test_workspace_id
        _create_notification(db_session, user_id, ws_id)
        _create_notification(db_session, user_id, ws_id, title="Second notification")

        resp = authed_client.get(f"/api/v1/notifications/?user_id={user_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 2

    def test_list_notifications_filter_by_type(self, authed_client, db_session):
        user_id = authed_client._test_user.id
        ws_id = authed_client._test_workspace_id
        _create_notification(db_session, user_id, ws_id, type="warning", title="Warning alert")
        _create_notification(db_session, user_id, ws_id, type="info", title="Info note")

        resp = authed_client.get(
            f"/api/v1/notifications/?user_id={user_id}&type=warning"
        )
        assert resp.status_code == 200
        for n in resp.json():
            assert n["type"] == "warning"

    def test_list_notifications_pagination(self, authed_client, db_session):
        user_id = authed_client._test_user.id
        ws_id = authed_client._test_workspace_id
        for i in range(5):
            _create_notification(db_session, user_id, ws_id, title=f"Paginated {i}")

        resp = authed_client.get(
            f"/api/v1/notifications/?user_id={user_id}&skip=0&limit=2"
        )
        assert resp.status_code == 200
        assert len(resp.json()) <= 2

    def test_list_notifications_missing_user_id(self, authed_client):
        resp = authed_client.get("/api/v1/notifications/")
        assert resp.status_code == 422


class TestUnreadNotifications:
    def test_get_unread(self, authed_client, db_session):
        user_id = authed_client._test_user.id
        ws_id = authed_client._test_workspace_id
        _create_notification(db_session, user_id, ws_id, title="Unread one")
        resp = authed_client.get(f"/api/v1/notifications/unread?user_id={user_id}")
        assert resp.status_code == 200
        for n in resp.json():
            assert n["is_read"] is False

    def test_unread_count(self, authed_client, db_session):
        user_id = authed_client._test_user.id
        ws_id = authed_client._test_workspace_id
        _create_notification(db_session, user_id, ws_id, title="Count me")
        resp = authed_client.get(f"/api/v1/notifications/count?user_id={user_id}")
        assert resp.status_code == 200
        assert resp.json()["count"] >= 1


class TestMarkRead:
    def test_mark_single_read(self, authed_client, db_session):
        user_id = authed_client._test_user.id
        ws_id = authed_client._test_workspace_id
        n = _create_notification(db_session, user_id, ws_id, title="Mark me read")
        nid = str(n.id)

        resp = authed_client.put(f"/api/v1/notifications/{nid}/read")
        assert resp.status_code == 200
        assert resp.json()["is_read"] is True

    def test_mark_read_nonexistent(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.put(f"/api/v1/notifications/{fake_id}/read")
        assert resp.status_code == 404

    def test_mark_all_read(self, authed_client, db_session):
        user_id = authed_client._test_user.id
        ws_id = authed_client._test_workspace_id
        _create_notification(db_session, user_id, ws_id, title="Batch read 1")
        _create_notification(db_session, user_id, ws_id, title="Batch read 2")

        resp = authed_client.put(f"/api/v1/notifications/read-all?user_id={user_id}")
        assert resp.status_code == 200
        assert resp.json()["marked"] >= 0

        # Verify unread count is now 0
        count_resp = authed_client.get(
            f"/api/v1/notifications/count?user_id={user_id}"
        )
        assert count_resp.json()["count"] == 0


class TestMarkReadThenVerify:
    def test_read_notification_not_in_unread(self, authed_client, db_session):
        user_id = authed_client._test_user.id
        ws_id = authed_client._test_workspace_id
        n = _create_notification(db_session, user_id, ws_id, title="Will be read")
        nid = str(n.id)

        # Mark read
        authed_client.put(f"/api/v1/notifications/{nid}/read")

        # Get unread — this one should not appear
        unread = authed_client.get(f"/api/v1/notifications/unread?user_id={user_id}")
        unread_ids = [item["id"] for item in unread.json()]
        assert nid not in unread_ids


class TestCleanupOld:
    def test_cleanup_old_returns_count(self, authed_client):
        resp = authed_client.delete("/api/v1/notifications/old?days=90")
        assert resp.status_code == 200
        assert "deleted" in resp.json()
