"""Tests for NotificationService CRUD operations."""
import uuid
from datetime import datetime, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.session import Base
from app.models.notification import Notification
from app.services.backbone.notifications import NotificationService


@pytest.fixture
def db():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine)
    session = TestSession()
    yield session
    session.close()


@pytest.fixture
def user_id():
    return uuid.uuid4()


@pytest.fixture
def workspace_id():
    return uuid.uuid4()


@pytest.fixture
def svc():
    return NotificationService()


class TestNotificationServiceCreate:
    def test_create_notification(self, db, user_id, workspace_id, svc):
        n = svc.create(db, user_id, workspace_id, "info", "Test Title", "Test body")
        assert n.id is not None
        assert n.user_id == user_id
        assert n.workspace_id == workspace_id
        assert n.type == "info"
        assert n.title == "Test Title"
        assert n.body == "Test body"
        assert n.is_read is False
        assert n.action_url is None

    def test_create_with_action_url(self, db, user_id, workspace_id, svc):
        n = svc.create(db, user_id, workspace_id, "warning", "Alert", "Details", action_url="/dashboard")
        assert n.action_url == "/dashboard"

    def test_create_critical(self, db, user_id, workspace_id, svc):
        n = svc.create(db, user_id, workspace_id, "critical", "Critical!", "Something broke")
        assert n.type == "critical"


class TestNotificationServiceGetUnread:
    def test_get_unread_returns_only_unread(self, db, user_id, workspace_id, svc):
        svc.create(db, user_id, workspace_id, "info", "Unread 1", "Body")
        svc.create(db, user_id, workspace_id, "info", "Unread 2", "Body")
        n3 = svc.create(db, user_id, workspace_id, "info", "Read", "Body")
        svc.mark_read(db, n3.id)

        unread = svc.get_unread(db, user_id)
        assert len(unread) == 2
        assert all(not n.is_read for n in unread)

    def test_get_unread_respects_limit(self, db, user_id, workspace_id, svc):
        for i in range(5):
            svc.create(db, user_id, workspace_id, "info", f"N{i}", "Body")
        assert len(svc.get_unread(db, user_id, limit=3)) == 3

    def test_get_unread_empty(self, db, user_id, svc):
        assert svc.get_unread(db, user_id) == []


class TestNotificationServiceMarkRead:
    def test_mark_read(self, db, user_id, workspace_id, svc):
        n = svc.create(db, user_id, workspace_id, "info", "Title", "Body")
        assert n.is_read is False

        updated = svc.mark_read(db, n.id)
        assert updated.is_read is True

    def test_mark_read_nonexistent(self, db, svc):
        result = svc.mark_read(db, uuid.uuid4())
        assert result is None

    def test_mark_all_read(self, db, user_id, workspace_id, svc):
        for i in range(4):
            svc.create(db, user_id, workspace_id, "info", f"N{i}", "Body")

        count = svc.mark_all_read(db, user_id)
        assert count == 4
        assert svc.get_unread_count(db, user_id) == 0

    def test_mark_all_read_no_unread(self, db, user_id, svc):
        count = svc.mark_all_read(db, user_id)
        assert count == 0


class TestNotificationServiceCount:
    def test_unread_count(self, db, user_id, workspace_id, svc):
        for i in range(3):
            svc.create(db, user_id, workspace_id, "info", f"N{i}", "Body")
        assert svc.get_unread_count(db, user_id) == 3

    def test_unread_count_after_read(self, db, user_id, workspace_id, svc):
        n = svc.create(db, user_id, workspace_id, "info", "Title", "Body")
        svc.mark_read(db, n.id)
        assert svc.get_unread_count(db, user_id) == 0


class TestNotificationServiceGetAll:
    def test_get_all_with_type_filter(self, db, user_id, workspace_id, svc):
        svc.create(db, user_id, workspace_id, "info", "Info", "Body")
        svc.create(db, user_id, workspace_id, "warning", "Warn", "Body")
        svc.create(db, user_id, workspace_id, "critical", "Crit", "Body")

        all_notifs = svc.get_all(db, user_id)
        assert len(all_notifs) == 3

        warnings = svc.get_all(db, user_id, type_filter="warning")
        assert len(warnings) == 1
        assert warnings[0].type == "warning"

    def test_get_all_pagination(self, db, user_id, workspace_id, svc):
        for i in range(10):
            svc.create(db, user_id, workspace_id, "info", f"N{i}", "Body")
        page1 = svc.get_all(db, user_id, skip=0, limit=5)
        page2 = svc.get_all(db, user_id, skip=5, limit=5)
        assert len(page1) == 5
        assert len(page2) == 5


class TestNotificationServiceDeleteOld:
    def test_delete_old(self, db, user_id, workspace_id, svc):
        # Create a notification and manually backdate it
        n = svc.create(db, user_id, workspace_id, "info", "Old", "Body")
        n.created_at = datetime.utcnow() - timedelta(days=100)
        db.commit()

        svc.create(db, user_id, workspace_id, "info", "Recent", "Body")

        deleted = svc.delete_old(db, days=90)
        assert deleted == 1

        remaining = svc.get_all(db, user_id)
        assert len(remaining) == 1
        assert remaining[0].title == "Recent"
