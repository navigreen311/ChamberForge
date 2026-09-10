"""Notification tasks send something, or say they did not.

Rewritten by P-08.

`test_dispatch_notification_creates_record` was named for a record that was
never created: the task returned the dictionary it had been handed, with
`read: False` and a timestamp, and persisted nothing. The test asserted every
field it had just passed in — which any `pass`-bodied function returning its
own arguments would satisfy.

`test_send_email_notification` asserted `status == "sent"` for a body whose
only content was a `# TODO: integrate with Resend API`, and
`test_send_weekly_digest` asserted `"sent"` for a digest that went to nobody.
"""
import pytest

from app.jobs._result import D4_BLOCKED, STATUS_BLOCKED, STATUS_DONE
from app.jobs.celery_app import celery_app


@pytest.fixture(autouse=True)
def celery_eager_mode():
    """Run all Celery tasks synchronously for testing."""
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
    yield
    celery_app.conf.task_always_eager = False
    celery_app.conf.task_eager_propagates = False


def test_dispatch_notification_reports_that_it_cannot_persist():
    """It returned its own arguments and called that a created record."""
    from app.jobs.tasks.notification_tasks import dispatch_notification

    data = dispatch_notification.apply(
        args=["user-42", "info", "Welcome!", "Your account is ready.", "/dashboard"]
    ).result

    assert data["status"] == STATUS_BLOCKED
    assert data["blocked_reason"] == D4_BLOCKED
    assert data["target_table"] == "Notification"
    assert "read" not in data, "an unpersisted notification has no read state"


def test_an_email_actually_reaches_the_service(monkeypatch):
    """Asserts the service was called, not that a dictionary came back."""
    from app.jobs.tasks import notification_tasks

    sent: list[dict] = []

    class FakeEmail:
        def __init__(self, db_session=None):
            pass

        async def send_template(self, **kwargs):
            sent.append(kwargs)
            return {"id": "msg-1", "status": "sent"}

    monkeypatch.setattr(notification_tasks, "EmailService", FakeEmail)

    data = notification_tasks.send_email_notification.apply(
        args=["user@example.com", "welcome", {"name": "Alice"}]
    ).result

    assert data["status"] == STATUS_DONE
    assert data["message_id"] == "msg-1"
    assert sent and sent[0]["to"] == "user@example.com"
    assert sent[0]["template_name"] == "welcome"


def test_a_rejected_email_is_not_reported_as_sent(monkeypatch):
    from app.jobs.tasks import notification_tasks

    class Rejecting:
        def __init__(self, db_session=None):
            pass

        async def send_template(self, **kwargs):
            return {"id": None, "status": "failed"}

    monkeypatch.setattr(notification_tasks, "EmailService", Rejecting)

    data = notification_tasks.send_email_notification.apply(
        args=["user@example.com", "welcome", {}]
    ).result

    assert data["status"] == STATUS_BLOCKED
    assert data["blocked_reason"] == notification_tasks.REASON_SEND_FAILED


def test_an_email_with_no_recipient_is_refused():
    from app.jobs.tasks.notification_tasks import send_email_notification

    data = send_email_notification.apply(args=["", "welcome", {}]).result

    assert data["status"] == STATUS_BLOCKED


# The weekly digest needs a database, so its tests live in `test_jobs.py`
# alongside the other tasks that touch one:
#   - test_a_digest_with_no_recipient_is_not_reported_as_sent
#   - test_a_digest_counts_real_evidence_activity
# Duplicating them here without the session fixture would assert less, not
# more.
