"""Tests for notification API endpoints."""
import uuid

from app.services.backbone.notifications import NotificationService

svc = NotificationService()


def _create_notification(db_session, user_id, workspace_id, type_: str = "info", title: str = "Test", body: str = "Body"):
    """Helper: create a notification via the service directly."""
    uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    wid = uuid.UUID(workspace_id) if isinstance(workspace_id, str) else workspace_id
    n = svc.create(db_session, uid, wid, type_, title, body)
    return n


class TestListNotifications:
    def test_list_empty(self, authed_client):
        resp = authed_client.get(f"/api/v1/notifications/?user_id={uuid.uuid4()}")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_with_notifications(self, authed_client, db_session):
        uid = authed_client._test_user.id
        wid = authed_client._test_workspace_id
        _create_notification(db_session, uid, wid)
        _create_notification(db_session, uid, wid, type_="warning", title="Warn")
        resp = authed_client.get(f"/api/v1/notifications/?user_id={uid}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_list_with_type_filter(self, authed_client, db_session):
        uid = authed_client._test_user.id
        wid = authed_client._test_workspace_id
        _create_notification(db_session, uid, wid, type_="info")
        _create_notification(db_session, uid, wid, type_="critical", title="Crit")
        resp = authed_client.get(f"/api/v1/notifications/?user_id={uid}&type=critical")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["type"] == "critical"

    def test_list_pagination(self, authed_client, db_session):
        uid = authed_client._test_user.id
        wid = authed_client._test_workspace_id
        for i in range(5):
            _create_notification(db_session, uid, wid, title=f"N{i}")
        resp = authed_client.get(f"/api/v1/notifications/?user_id={uid}&skip=2&limit=2")
        assert resp.status_code == 200
        assert len(resp.json()) == 2


class TestUnreadNotifications:
    def test_unread_only(self, authed_client, db_session):
        uid = authed_client._test_user.id
        wid = authed_client._test_workspace_id
        n = _create_notification(db_session, uid, wid)
        _create_notification(db_session, uid, wid, title="Second")
        # Mark first as read
        authed_client.put(f"/api/v1/notifications/{n.id}/read")
        resp = authed_client.get(f"/api/v1/notifications/unread?user_id={uid}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["title"] == "Second"


class TestUnreadCount:
    def test_count_zero(self, authed_client):
        uid = authed_client._test_user.id
        resp = authed_client.get(f"/api/v1/notifications/count?user_id={uid}")
        assert resp.status_code == 200
        assert resp.json()["count"] == 0

    def test_count_after_create(self, authed_client, db_session):
        uid = authed_client._test_user.id
        wid = authed_client._test_workspace_id
        _create_notification(db_session, uid, wid)
        _create_notification(db_session, uid, wid)
        resp = authed_client.get(f"/api/v1/notifications/count?user_id={uid}")
        assert resp.status_code == 200
        assert resp.json()["count"] == 2


class TestMarkRead:
    def test_mark_read(self, authed_client, db_session):
        uid = authed_client._test_user.id
        wid = authed_client._test_workspace_id
        n = _create_notification(db_session, uid, wid)
        resp = authed_client.put(f"/api/v1/notifications/{n.id}/read")
        assert resp.status_code == 200
        assert resp.json()["is_read"] is True

    def test_mark_read_not_found(self, authed_client):
        fake_id = uuid.uuid4()
        resp = authed_client.put(f"/api/v1/notifications/{fake_id}/read")
        assert resp.status_code == 404


class TestMarkAllRead:
    def test_mark_all_read(self, authed_client, db_session):
        uid = authed_client._test_user.id
        wid = authed_client._test_workspace_id
        _create_notification(db_session, uid, wid)
        _create_notification(db_session, uid, wid)
        _create_notification(db_session, uid, wid)
        resp = authed_client.put(f"/api/v1/notifications/read-all?user_id={uid}")
        assert resp.status_code == 200
        assert resp.json()["marked"] == 3

        count_resp = authed_client.get(f"/api/v1/notifications/count?user_id={uid}")
        assert count_resp.json()["count"] == 0


class TestCleanupOld:
    def test_cleanup_no_old(self, authed_client, db_session):
        uid = authed_client._test_user.id
        wid = authed_client._test_workspace_id
        _create_notification(db_session, uid, wid)
        resp = authed_client.delete("/api/v1/notifications/old?days=90")
        assert resp.status_code == 200
        assert resp.json()["deleted"] == 0
