"""Integration tests for the Notifications API — CRUD, read status, filtering."""
import uuid

import pytest

from app.services.backbone.notifications import NotificationService

USER_ID = str(uuid.uuid4())
WORKSPACE_ID = str(uuid.uuid4())


def _create_notification(db_session, **overrides):
    """Create a notification directly via the service (bypass API for seeding)."""
    defaults = {
        "user_id": uuid.UUID(USER_ID),
        "workspace_id": uuid.UUID(WORKSPACE_ID),
        "type": "info",
        "title": "Test Notification",
        "body": "This is a test notification body.",
    }
    defaults.update(overrides)
    return NotificationService.create(db_session, **defaults)


class TestNotificationsList:
    def test_list_notifications_empty(self, client):
        new_user = str(uuid.uuid4())
        resp = client.get(f"/api/v1/notifications/?user_id={new_user}")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_notifications_with_data(self, client, db_session):
        _create_notification(db_session)
        _create_notification(db_session, title="Second notification")

        resp = client.get(f"/api/v1/notifications/?user_id={USER_ID}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 2

    def test_list_notifications_filter_by_type(self, client, db_session):
        _create_notification(db_session, type="warning", title="Warning alert")
        _create_notification(db_session, type="info", title="Info note")

        resp = client.get(
            f"/api/v1/notifications/?user_id={USER_ID}&type=warning"
        )
        assert resp.status_code == 200
        for n in resp.json():
            assert n["type"] == "warning"

    def test_list_notifications_pagination(self, client, db_session):
        for i in range(5):
            _create_notification(db_session, title=f"Paginated {i}")

        resp = client.get(
            f"/api/v1/notifications/?user_id={USER_ID}&skip=0&limit=2"
        )
        assert resp.status_code == 200
        assert len(resp.json()) <= 2

    def test_list_notifications_missing_user_id(self, client):
        resp = client.get("/api/v1/notifications/")
        assert resp.status_code == 422


class TestUnreadNotifications:
    def test_get_unread(self, client, db_session):
        _create_notification(db_session, title="Unread one")
        resp = client.get(f"/api/v1/notifications/unread?user_id={USER_ID}")
        assert resp.status_code == 200
        for n in resp.json():
            assert n["is_read"] is False

    def test_unread_count(self, client, db_session):
        _create_notification(db_session, title="Count me")
        resp = client.get(f"/api/v1/notifications/count?user_id={USER_ID}")
        assert resp.status_code == 200
        assert resp.json()["count"] >= 1


class TestMarkRead:
    def test_mark_single_read(self, client, db_session):
        n = _create_notification(db_session, title="Mark me read")
        nid = str(n.id)

        resp = client.put(f"/api/v1/notifications/{nid}/read")
        assert resp.status_code == 200
        assert resp.json()["is_read"] is True

    def test_mark_read_nonexistent(self, client):
        fake_id = str(uuid.uuid4())
        resp = client.put(f"/api/v1/notifications/{fake_id}/read")
        assert resp.status_code == 404

    def test_mark_all_read(self, client, db_session):
        _create_notification(db_session, title="Batch read 1")
        _create_notification(db_session, title="Batch read 2")

        resp = client.put(f"/api/v1/notifications/read-all?user_id={USER_ID}")
        assert resp.status_code == 200
        assert resp.json()["marked"] >= 0

        # Verify unread count is now 0
        count_resp = client.get(
            f"/api/v1/notifications/count?user_id={USER_ID}"
        )
        assert count_resp.json()["count"] == 0


class TestMarkReadThenVerify:
    def test_read_notification_not_in_unread(self, client, db_session):
        n = _create_notification(db_session, title="Will be read")
        nid = str(n.id)

        # Mark read
        client.put(f"/api/v1/notifications/{nid}/read")

        # Get unread — this one should not appear
        unread = client.get(f"/api/v1/notifications/unread?user_id={USER_ID}")
        unread_ids = [item["id"] for item in unread.json()]
        assert nid not in unread_ids


class TestCleanupOld:
    def test_cleanup_old_returns_count(self, client):
        resp = client.delete("/api/v1/notifications/old?days=90")
        assert resp.status_code == 200
        assert "deleted" in resp.json()
