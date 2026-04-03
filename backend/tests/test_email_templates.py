"""Tests for email template rendering."""
import pytest

from app.services.backbone.email_templates import (
    TEMPLATES,
    get_template,
    list_templates,
    render_template,
)

# ---------------------------------------------------------------------------
# Sample variables for each template (minimum required set)
# ---------------------------------------------------------------------------
SAMPLE_VARS: dict[str, dict] = {
    "welcome": {
        "name": "Test User",
        "workspace_name": "Test Workspace",
        "dashboard_url": "https://example.com",
        "unsubscribe_url": "#",
    },
    "onboarding_step_1": {
        "name": "Test User",
        "action_url": "https://example.com",
        "unsubscribe_url": "#",
    },
    "onboarding_step_2": {
        "name": "Test User",
        "action_url": "https://example.com",
        "unsubscribe_url": "#",
    },
    "onboarding_step_3": {
        "name": "Test User",
        "action_url": "https://example.com",
        "unsubscribe_url": "#",
    },
    "deliverable_ready": {
        "name": "Test User",
        "deliverable_type": "Report",
        "client_name": "Client X",
        "download_url": "https://example.com",
        "unsubscribe_url": "#",
    },
    "alert_critical": {
        "alert_title": "Server Down",
        "alert_message": "Primary DB unresponsive.",
        "action_url": "https://example.com",
        "unsubscribe_url": "#",
    },
    "alert_warning": {
        "alert_title": "High Memory",
        "alert_message": "Memory usage above 90%.",
        "action_url": "https://example.com",
        "unsubscribe_url": "#",
    },
    "invoice": {
        "name": "Test User",
        "invoice_number": "1001",
        "amount": "$5,000",
        "due_date": "2026-05-01",
        "payment_url": "https://example.com",
        "unsubscribe_url": "#",
    },
    "renewal_reminder": {
        "name": "Test User",
        "offer_name": "Premium Plan",
        "renewal_date": "2026-06-01",
        "manage_url": "https://example.com",
        "unsubscribe_url": "#",
    },
    "weekly_digest": {
        "name": "Test User",
        "workspace_name": "Test Workspace",
        "new_clients": "5",
        "deliverables_completed": "12",
        "revenue": "$25,000",
        "dashboard_url": "https://example.com",
        "unsubscribe_url": "#",
    },
}


class TestTemplateRegistry:
    def test_all_templates_present(self):
        """Every expected template name exists in the registry."""
        expected = {
            "welcome",
            "onboarding_step_1",
            "onboarding_step_2",
            "onboarding_step_3",
            "deliverable_ready",
            "alert_critical",
            "alert_warning",
            "invoice",
            "renewal_reminder",
            "weekly_digest",
        }
        assert set(TEMPLATES.keys()) == expected

    def test_get_template_returns_dict(self):
        tmpl = get_template("welcome")
        assert tmpl is not None
        assert "subject_template" in tmpl
        assert "html_template" in tmpl

    def test_get_template_missing(self):
        assert get_template("nonexistent") is None

    def test_list_templates_count(self):
        result = list_templates()
        assert len(result) == len(TEMPLATES)
        for item in result:
            assert "name" in item
            assert "subject_template" in item


class TestTemplateRendering:
    @pytest.mark.parametrize("template_name", list(TEMPLATES.keys()))
    def test_all_templates_render_without_errors(self, template_name):
        """Every template renders successfully with its sample vars."""
        variables = SAMPLE_VARS[template_name]
        rendered = render_template(template_name, variables)
        assert "subject" in rendered
        assert "html_body" in rendered
        assert len(rendered["subject"]) > 0
        assert len(rendered["html_body"]) > 0

    def test_variable_substitution_in_subject(self):
        rendered = render_template("deliverable_ready", SAMPLE_VARS["deliverable_ready"])
        assert "Report" in rendered["subject"]

    def test_variable_substitution_in_body(self):
        rendered = render_template("welcome", SAMPLE_VARS["welcome"])
        assert "Test User" in rendered["html_body"]
        assert "Test Workspace" in rendered["html_body"]

    def test_invoice_subject_has_number_and_amount(self):
        rendered = render_template("invoice", SAMPLE_VARS["invoice"])
        assert "1001" in rendered["subject"]
        assert "$5,000" in rendered["subject"]

    def test_render_unknown_template_raises(self):
        with pytest.raises(KeyError, match="not_real"):
            render_template("not_real", {})

    def test_missing_variable_raises(self):
        with pytest.raises(KeyError):
            render_template("welcome", {})  # missing required vars
