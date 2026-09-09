"""Tests for RetainerOps service."""

import pytest

from app.services.backbone.retainer_ops import RetainerOps


@pytest.fixture
def ops():
    return RetainerOps()


def test_create_customer_mock(ops):
    result = ops.create_customer("Test Client", "test@example.com")
    assert "stripe_customer_id" in result
    assert result["stripe_customer_id"].startswith("cus_mock_")


def test_create_subscription_mock(ops):
    result = ops.create_subscription("cus_mock_123", 5000.0, "Monthly Retainer")
    assert "subscription_id" in result
    assert result["subscription_id"].startswith("sub_mock_")
    assert result["status"] == "active"
    assert result["monthly_amount"] == 5000.0


def test_create_invoice_mock(ops):
    line_items = [
        {"description": "Advisory Services", "amount": 10000.0},
        {"description": "Implementation Fee", "amount": 5000.0},
    ]
    result = ops.create_invoice("cus_mock_123", line_items, "2026-05-01")
    assert "invoice_id" in result
    assert result["invoice_id"].startswith("inv_mock_")
    assert result["amount_due"] == 15000.0
    assert result["status"] == "open"
    assert "hosted_invoice_url" in result


def test_get_revenue_summary(ops):
    result = ops.get_revenue_summary("workspace_abc")
    assert result["workspace_id"] == "workspace_abc"
    assert "mrr" in result
    assert "arr" in result
    assert "active_subscriptions" in result
    assert "pending_invoices" in result
    assert result["currency"] == "usd"


def test_create_invoice_empty_line_items(ops):
    result = ops.create_invoice("cus_mock_123", [], "2026-06-01")
    assert result["amount_due"] == 0.0


def test_multiple_customers_get_unique_ids(ops):
    r1 = ops.create_customer("Client A", "a@example.com")
    r2 = ops.create_customer("Client B", "b@example.com")
    assert r1["stripe_customer_id"] != r2["stripe_customer_id"]
