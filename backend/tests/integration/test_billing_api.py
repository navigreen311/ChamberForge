"""Integration tests for the Billing API — customers, subscriptions, invoices, revenue."""
import uuid

import pytest

WORKSPACE_ID = str(uuid.uuid4())
CLIENT_ID = str(uuid.uuid4())


class TestCustomers:
    def test_create_customer(self, client):
        resp = client.post(
            "/api/v1/billing/customers",
            json={
                "name": "Jane Doe",
                "email": "jane@example.com",
                "metadata": {"tier": "uhnw"},
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "stripe_customer_id" in data
        assert data["stripe_customer_id"].startswith("cus_") or data["stripe_customer_id"].startswith("mock_")

    def test_create_customer_minimal(self, client):
        resp = client.post(
            "/api/v1/billing/customers",
            json={"name": "Minimal", "email": "min@example.com"},
        )
        assert resp.status_code == 200
        assert "stripe_customer_id" in resp.json()


class TestSubscriptions:
    def test_create_subscription(self, client):
        # First create a customer
        cust = client.post(
            "/api/v1/billing/customers",
            json={"name": "Sub User", "email": "sub@example.com"},
        )
        customer_id = cust.json()["stripe_customer_id"]

        resp = client.post(
            "/api/v1/billing/subscriptions",
            json={
                "workspace_id": WORKSPACE_ID,
                "client_id": CLIENT_ID,
                "customer_id": customer_id,
                "amount": 15000.0,
                "plan_name": "Premium Ops",
                "interval": "month",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data["status"] == "active"
        assert "stripe_subscription_id" in data

    def test_create_subscription_missing_fields(self, client):
        resp = client.post(
            "/api/v1/billing/subscriptions",
            json={"workspace_id": WORKSPACE_ID},
        )
        assert resp.status_code == 422

    def test_cancel_subscription(self, client):
        # Create customer and subscription
        cust = client.post(
            "/api/v1/billing/customers",
            json={"name": "Cancel User", "email": "cancel@example.com"},
        )
        customer_id = cust.json()["stripe_customer_id"]

        sub = client.post(
            "/api/v1/billing/subscriptions",
            json={
                "workspace_id": WORKSPACE_ID,
                "client_id": CLIENT_ID,
                "customer_id": customer_id,
                "amount": 10000.0,
                "plan_name": "Core Plan",
            },
        )
        sub_id = sub.json()["stripe_subscription_id"]

        resp = client.delete(f"/api/v1/billing/subscriptions/{sub_id}")
        assert resp.status_code == 200
        assert resp.json()["status"] == "canceled"


class TestInvoices:
    def test_create_invoice(self, client):
        cust = client.post(
            "/api/v1/billing/customers",
            json={"name": "Invoice User", "email": "inv@example.com"},
        )
        customer_id = cust.json()["stripe_customer_id"]

        resp = client.post(
            "/api/v1/billing/invoices",
            json={
                "workspace_id": WORKSPACE_ID,
                "client_id": CLIENT_ID,
                "customer_id": customer_id,
                "line_items": [
                    {"description": "Monthly retainer", "amount": 15000},
                    {"description": "Travel coordination", "amount": 3000},
                ],
                "due_date": "2025-12-31",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data["amount"] == 18000
        assert data["status"] == "draft"

    def test_list_invoices(self, client):
        # Create an invoice first
        cust = client.post(
            "/api/v1/billing/customers",
            json={"name": "List Inv", "email": "listinv@example.com"},
        )
        customer_id = cust.json()["stripe_customer_id"]
        client.post(
            "/api/v1/billing/invoices",
            json={
                "workspace_id": WORKSPACE_ID,
                "client_id": CLIENT_ID,
                "customer_id": customer_id,
                "line_items": [{"description": "Service", "amount": 5000}],
            },
        )

        resp = client.get(f"/api/v1/billing/invoices?workspace_id={WORKSPACE_ID}")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
        assert len(resp.json()) >= 1

    def test_create_invoice_missing_fields(self, client):
        resp = client.post(
            "/api/v1/billing/invoices",
            json={"workspace_id": WORKSPACE_ID},
        )
        assert resp.status_code == 422


class TestRevenueDashboard:
    def test_revenue_dashboard(self, client):
        resp = client.get(
            f"/api/v1/billing/revenue?workspace_id={WORKSPACE_ID}"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "mrr" in data
        assert "arr" in data
        assert "active_subscriptions" in data
        assert "churn_rate" in data

    def test_revenue_dashboard_missing_workspace(self, client):
        resp = client.get("/api/v1/billing/revenue")
        assert resp.status_code == 422


class TestReferrals:
    def test_create_referral(self, client):
        resp = client.post(
            "/api/v1/billing/referrals",
            json={
                "workspace_id": WORKSPACE_ID,
                "referrer_id": str(uuid.uuid4()),
                "referred_client_id": str(uuid.uuid4()),
                "deal_value": 50000.0,
                "commission_pct": 10.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["commission_amount"] == 5000.0
        assert data["status"] == "pending"

    def test_referral_report(self, client):
        resp = client.get(
            f"/api/v1/billing/referrals?workspace_id={WORKSPACE_ID}"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "total_referrals" in data
        assert "referrals" in data
