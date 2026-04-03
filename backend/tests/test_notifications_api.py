"""Tests for notification API endpoints."""
import uuid

import pytest

from app.services.backbone.notifications import NotificationService

USER_ID = str(uuid.uuid4())
WORKSPACE_ID = str(uuid.uuid4())

svc = NotificationService()


def _create_notification(db_session, type_: str = "info", title: str = "Test", body: str = "Body"):
    """Helper: create a notification via the service directly."""
    n = svc.create(db_session, uuid.UUID(USER_ID), uuid.UUID(WORKSPACE_ID), type_, title, body)
    return n


class TestListNotifications:
    def test_list_empty(self, client):
        resp = client.get(f"/api/v1/notifications/?user_id={USER_ID}")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_with_notifications(self, client, db_session):
        _create_notification(db_session)
        _create_notification(db_session, type_="warning", title="Warn")
        resp = client.get(f"/api/v1/notifications/?user_id={USER_ID}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_list_with_type_filter(self, client, db_session):
        _create_notification(db_session, type_="info")
        _create_notification(db_session, type_="critical", title="Crit")
        resp = client.get(f"/api/v1/notifications/?user_id={USER_ID}&type=critical")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["type"] == "critical"

    def test_list_pagination(self, client, db_session):
        for i in range(5):
            _create_notification(db_session, title=f"N{i}")
        resp = client.get(f"/api/v1/notifications/?user_id={USER_ID}&skip=2&limit=2")
        assert resp.status_code == 200
        assert len(resp.json()) == 2


class TestUnreadNotifications:
    def test_unread_only(self, client, db_session):
        n = _create_notification(db_session)
        _create_notification(db_session, title="Second")
        # Mark first as read
        client.put(f"/api/v1/notifications/{n.id}/read")
        resp = client.get(f"/api/v1/notifications/unread?user_id={USER_ID}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["title"] == "Second"


class TestUnreadCount:
    def test_count_zero(self, client):
        resp = client.get(f"/api/v1/notifications/count?user_id={USER_ID}")
        assert resp.status_code == 200
        assert resp.json()["count"] == 0

    def test_count_after_create(self, client, db_session):
        _create_notification(db_session)
        _create_notification(db_session)
        resp = client.get(f"/api/v1/notifications/count?user_id={USER_ID}")
        assert resp.status_code == 200
        assert resp.json()["count"] == 2


class TestMarkRead:
    def test_mark_read(self, client, db_session):
        n = _create_notification(db_session)
        resp = client.put(f"/api/v1/notifications/{n.id}/read")
        assert resp.status_code == 200
        assert resp.json()["is_read"] is True

    def test_mark_read_not_found(self, client):
        fake_id = uuid.uuid4()
        resp = client.put(f"/api/v1/notifications/{fake_id}/read")
        assert resp.status_code == 404


class TestMarkAllRead:
    def test_mark_all_read(self, client, db_session):
        _create_notification(db_session)
        _create_notification(db_session)
        _create_notification(db_session)
        resp = client.put(f"/api/v1/notifications/read-all?user_id={USER_ID}")
        assert resp.status_code == 200
        assert resp.json()["marked"] == 3

        count_resp = client.get(f"/api/v1/notifications/count?user_id={USER_ID}")
        assert count_resp.json()["count"] == 0


class TestCleanupOld:
    def test_cleanup_no_old(self, client, db_session):
        _create_notification(db_session)
        resp = client.delete("/api/v1/notifications/old?days=90")
        assert resp.status_code == 200
        assert resp.json()["deleted"] == 0
