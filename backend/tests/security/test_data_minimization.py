"""Tests for data minimization / response filtering."""
from app.core.data_minimization import filter_response, sanitize_log_data


def test_viewer_cannot_see_restricted_fields():
    data = {
        "id": "abc",
        "name": "Alice",
        "hashed_password": "xxx",
        "ip_address": "1.2.3.4",
        "stripe_customer_id": "cus_123",
        "internal_notes": "VIP client",
    }
    result = filter_response(data, user_role="viewer")
    assert "hashed_password" not in result
    assert "ip_address" not in result
    assert "stripe_customer_id" not in result
    assert "internal_notes" not in result
    assert result["name"] == "Alice"


def test_operator_cannot_see_additional_fields():
    data = {
        "id": "abc",
        "workspace_settings": {"theme": "dark"},
        "billing_details": {"plan": "enterprise"},
        "hashed_password": "xxx",
    }
    result = filter_response(data, user_role="operator")
    assert "workspace_settings" not in result
    assert "billing_details" not in result
    assert "hashed_password" not in result


def test_admin_sees_everything():
    data = {
        "hashed_password": "xxx",
        "ip_address": "1.2.3.4",
        "stripe_customer_id": "cus_123",
        "internal_notes": "notes",
        "workspace_settings": {},
        "billing_details": {},
    }
    result = filter_response(data, user_role="admin")
    assert result == data


def test_sanitize_log_data_redacts_pii():
    data = {
        "email": "alice@example.com",
        "name": "Alice",
        "phone": "555-0100",
        "action": "login",
    }
    sanitized = sanitize_log_data(data)
    assert sanitized["email"] == "***REDACTED***"
    assert sanitized["name"] == "***REDACTED***"
    assert sanitized["phone"] == "***REDACTED***"
    assert sanitized["action"] == "login"
