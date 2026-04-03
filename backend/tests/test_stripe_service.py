"""Tests for StripeService — mock mode (no API key required)."""
import json
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

import pytest

from app.services.backbone.stripe_service import StripeService


@pytest.fixture
def svc():
    """Create a StripeService in mock mode regardless of env."""
    service = StripeService.__new__(StripeService)
    service.mock_mode = True
    service._mock_customers = {}
    service._mock_subscriptions = {}
    service._mock_invoices = {}
    return service


# -- Customer ----------------------------------------------------------------

def test_create_customer(svc):
    result = svc.create_customer("Jane Doe", "jane@example.com", {"tier": "platinum"})
    assert "stripe_customer_id" in result
    assert result["stripe_customer_id"].startswith("cus_")


# -- Subscription ------------------------------------------------------------

def test_create_subscription(svc):
    cust = svc.create_customer("Bob", "bob@example.com")
    cid = cust["stripe_customer_id"]
    result = svc.create_subscription(cid, 5000.0, "Premium Retainer")
    assert result["status"] == "active"
    assert result["subscription_id"].startswith("sub_")
    assert "current_period_end" in result


def test_cancel_subscription(svc):
    cust = svc.create_customer("Bob", "bob@example.com")
    sub = svc.create_subscription(cust["stripe_customer_id"], 5000.0, "Premium")
    result = svc.cancel_subscription(sub["subscription_id"])
    assert result["status"] == "canceled"


# -- Invoice -----------------------------------------------------------------

def test_create_invoice(svc):
    cust = svc.create_customer("Alice", "alice@example.com")
    cid = cust["stripe_customer_id"]
    items = [
        {"description": "Strategy session", "amount": 2500.0},
        {"description": "Implementation", "amount": 7500.0},
    ]
    result = svc.create_invoice(cid, items)
    assert result["amount"] == 10000.0
    assert result["status"] == "draft"
    assert result["invoice_id"].startswith("inv_")


# -- Payment history ---------------------------------------------------------

def test_payment_history(svc):
    cust = svc.create_customer("Dave", "dave@example.com")
    cid = cust["stripe_customer_id"]
    svc.create_invoice(cid, [{"amount": 1000}])
    svc.create_invoice(cid, [{"amount": 2000}])
    history = svc.get_payment_history(cid)
    assert len(history) == 2


# -- Webhook routing ---------------------------------------------------------

def test_webhook_invoice_paid(svc):
    event = {"type": "invoice.paid", "data": {"object": {"id": "inv_123"}}}
    result = svc.handle_webhook(json.dumps(event).encode(), "")
    assert result["event"] == "invoice.paid"
    assert result["invoice_id"] == "inv_123"


def test_webhook_subscription_updated(svc):
    event = {
        "type": "customer.subscription.updated",
        "data": {"object": {"id": "sub_456", "status": "past_due"}},
    }
    result = svc.handle_webhook(json.dumps(event).encode(), "")
    assert result["event"] == "customer.subscription.updated"
    assert result["new_status"] == "past_due"


def test_webhook_unknown_event(svc):
    event = {"type": "unknown.event", "data": {"object": {}}}
    result = svc.handle_webhook(json.dumps(event).encode(), "")
    assert result["status"] == "ignored"


# -- Revenue dashboard -------------------------------------------------------

def test_revenue_dashboard_math(svc):
    """Build a mock DB session with known data and verify KPI math."""
    workspace_id = str(uuid.uuid4())
    now = datetime.now(tz=timezone.utc)

    # Mock subscription objects
    class FakeSub:
        def __init__(self, amount, status, client_id, created_at=None):
            self.id = uuid.uuid4()
            self.amount = amount
            self.status = status
            self.client_id = client_id
            self.workspace_id = workspace_id
            self.created_at = created_at or now

    active_subs = [
        FakeSub(5000, "active", uuid.uuid4()),
        FakeSub(3000, "active", uuid.uuid4()),
    ]

    # Build a mock DB query chain
    db = MagicMock()

    def mock_query_side_effect(*models):
        q = MagicMock()

        # Determine what model is being queried
        model = models[0] if models else None

        def mock_filter(*args):
            fq = MagicMock()
            fq.filter = mock_filter
            # For subscription list query
            fq.all = MagicMock(return_value=active_subs)
            # For scalar queries (count / sum)
            fq.scalar = MagicMock(return_value=0)
            return fq

        q.filter = mock_filter
        q.all = MagicMock(return_value=active_subs)
        q.scalar = MagicMock(return_value=0)
        return q

    db.query = MagicMock(side_effect=mock_query_side_effect)

    result = svc.get_revenue_dashboard(db, workspace_id)

    assert result["mrr"] == 8000.0
    assert result["arr"] == 96000.0
    assert result["active_subscriptions"] == 2
    assert "total_revenue_ytd" in result
    assert "churn_rate" in result
