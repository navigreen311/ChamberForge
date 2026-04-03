"""Tests for notification background tasks."""
import pytest

from app.jobs.celery_app import celery_app


@pytest.fixture(autouse=True)
def celery_eager_mode():
    """Run all Celery tasks synchronously for testing."""
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
    yield
    celery_app.conf.task_always_eager = False
    celery_app.conf.task_eager_propagates = False


def test_dispatch_notification_creates_record():
    from app.jobs.tasks.notification_tasks import dispatch_notification

    result = dispatch_notification.apply(
        args=["user-42", "info", "Welcome!", "Your account is ready.", "/dashboard"]
    )
    assert result.successful()
    data = result.result
    assert data["user_id"] == "user-42"
    assert data["type"] == "info"
    assert data["title"] == "Welcome!"
    assert data["body"] == "Your account is ready."
    assert data["action_url"] == "/dashboard"
    assert data["read"] is False
    assert "created_at" in data


def test_dispatch_notification_without_action_url():
    from app.jobs.tasks.notification_tasks import dispatch_notification

    result = dispatch_notification.apply(
        args=["user-42", "alert", "Heads up", "Something happened."]
    )
    assert result.successful()
    data = result.result
    assert data["action_url"] is None


def test_send_email_notification():
    from app.jobs.tasks.notification_tasks import send_email_notification

    result = send_email_notification.apply(
        args=["user@example.com", "welcome", {"name": "Alice"}]
    )
    assert result.successful()
    data = result.result
    assert data["to"] == "user@example.com"
    assert data["template"] == "welcome"
    assert data["status"] == "sent"


def test_send_weekly_digest():
    from app.jobs.tasks.notification_tasks import send_weekly_digest

    result = send_weekly_digest.apply(args=["ws-001"])
    assert result.successful()
    data = result.result
    assert data["workspace_id"] == "ws-001"
    assert data["status"] == "sent"
