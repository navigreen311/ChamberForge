"""Tests for notification API endpoints."""
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app

# In-memory SQLite with StaticPool so all connections share the same database
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

USER_ID = str(uuid.uuid4())
WORKSPACE_ID = str(uuid.uuid4())


@pytest.fixture(autouse=True)
def setup_db():
    """Recreate tables before each test."""
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


def _create_notification(type_: str = "info", title: str = "Test", body: str = "Body"):
    """Helper: create a notification via the service directly."""
    from app.services.backbone.notifications import NotificationService

    db = TestSession()
    svc = NotificationService()
    n = svc.create(db, uuid.UUID(USER_ID), uuid.UUID(WORKSPACE_ID), type_, title, body)
    db.close()
    return n


class TestListNotifications:
    def test_list_empty(self):
        resp = client.get(f"/api/v1/notifications/?user_id={USER_ID}")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_with_notifications(self):
        _create_notification()
        _create_notification(type_="warning", title="Warn")
        resp = client.get(f"/api/v1/notifications/?user_id={USER_ID}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_list_with_type_filter(self):
        _create_notification(type_="info")
        _create_notification(type_="critical", title="Crit")
        resp = client.get(f"/api/v1/notifications/?user_id={USER_ID}&type=critical")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["type"] == "critical"

    def test_list_pagination(self):
        for i in range(5):
            _create_notification(title=f"N{i}")
        resp = client.get(f"/api/v1/notifications/?user_id={USER_ID}&skip=2&limit=2")
        assert resp.status_code == 200
        assert len(resp.json()) == 2


class TestUnreadNotifications:
    def test_unread_only(self):
        n = _create_notification()
        _create_notification(title="Second")
        # Mark first as read
        client.put(f"/api/v1/notifications/{n.id}/read")
        resp = client.get(f"/api/v1/notifications/unread?user_id={USER_ID}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["title"] == "Second"


class TestUnreadCount:
    def test_count_zero(self):
        resp = client.get(f"/api/v1/notifications/count?user_id={USER_ID}")
        assert resp.status_code == 200
        assert resp.json()["count"] == 0

    def test_count_after_create(self):
        _create_notification()
        _create_notification()
        resp = client.get(f"/api/v1/notifications/count?user_id={USER_ID}")
        assert resp.status_code == 200
        assert resp.json()["count"] == 2


class TestMarkRead:
    def test_mark_read(self):
        n = _create_notification()
        resp = client.put(f"/api/v1/notifications/{n.id}/read")
        assert resp.status_code == 200
        assert resp.json()["is_read"] is True

    def test_mark_read_not_found(self):
        fake_id = uuid.uuid4()
        resp = client.put(f"/api/v1/notifications/{fake_id}/read")
        assert resp.status_code == 404


class TestMarkAllRead:
    def test_mark_all_read(self):
        _create_notification()
        _create_notification()
        _create_notification()
        resp = client.put(f"/api/v1/notifications/read-all?user_id={USER_ID}")
        assert resp.status_code == 200
        assert resp.json()["marked"] == 3

        count_resp = client.get(f"/api/v1/notifications/count?user_id={USER_ID}")
        assert count_resp.json()["count"] == 0


class TestCleanupOld:
    def test_cleanup_no_old(self):
        _create_notification()
        resp = client.delete("/api/v1/notifications/old?days=90")
        assert resp.status_code == 200
        assert resp.json()["deleted"] == 0
