"""Tests for EmailService — send, template rendering, batch."""
import pytest

from app.services.backbone.email_service import EmailService


@pytest.fixture
def email_service():
    """EmailService with no DB session (mock mode)."""
    return EmailService(db_session=None)


@pytest.mark.asyncio
async def test_send_returns_id_and_status(email_service):
    """send() should return a dict with id and 'sent' status."""
    result = await email_service.send(
        to="test@example.com",
        subject="Hello",
        html_body="<p>Hi</p>",
    )
    assert "id" in result
    assert result["status"] == "sent"
    assert result["id"] is not None


@pytest.mark.asyncio
async def test_send_template_renders_and_sends(email_service):
    """send_template() renders variables into the template then sends."""
    result = await email_service.send_template(
        to="user@example.com",
        template_name="welcome",
        variables={
            "name": "Alice",
            "workspace_name": "Acme Corp",
            "dashboard_url": "https://app.chamberforge.com",
            "unsubscribe_url": "#",
        },
    )
    assert result["status"] == "sent"
    assert result["id"] is not None


@pytest.mark.asyncio
async def test_send_template_unknown_template(email_service):
    """send_template() raises KeyError for unknown templates."""
    with pytest.raises(KeyError, match="not_a_template"):
        await email_service.send_template(
            to="user@example.com",
            template_name="not_a_template",
            variables={},
        )


@pytest.mark.asyncio
async def test_batch_send_counts(email_service):
    """send_batch() returns correct sent/failed counts."""
    recipients = [
        {"to": "a@example.com", "name": "Alice"},
        {"to": "b@example.com", "name": "Bob"},
        {"to": "c@example.com", "name": "Charlie"},
    ]
    result = await email_service.send_batch(
        recipients=recipients,
        template_name="onboarding_step_1",
        shared_vars={
            "action_url": "https://app.chamberforge.com/onboarding",
            "unsubscribe_url": "#",
        },
    )
    assert result["sent"] == 3
    assert result["failed"] == 0
    assert len(result["results"]) == 3


@pytest.mark.asyncio
async def test_batch_send_empty_list(email_service):
    """send_batch() with empty recipients returns zero counts."""
    result = await email_service.send_batch(
        recipients=[],
        template_name="welcome",
        shared_vars={},
    )
    assert result["sent"] == 0
    assert result["failed"] == 0
    assert result["results"] == []
