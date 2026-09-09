"""Tests for Stripe webhook endpoint and event routing."""
import json

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_webhook_invoice_paid():
    event = {
        "type": "invoice.paid",
        "data": {"object": {"id": "inv_test_001", "amount_paid": 500000}},
    }
    response = client.post(
        "/api/v1/webhooks/stripe",
        content=json.dumps(event),
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["event"] == "invoice.paid"
    assert body["invoice_id"] == "inv_test_001"


def test_webhook_subscription_updated():
    event = {
        "type": "customer.subscription.updated",
        "data": {"object": {"id": "sub_test_001", "status": "past_due"}},
    }
    response = client.post(
        "/api/v1/webhooks/stripe",
        content=json.dumps(event),
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["event"] == "customer.subscription.updated"
    assert body["new_status"] == "past_due"


def test_webhook_subscription_deleted():
    event = {
        "type": "customer.subscription.deleted",
        "data": {"object": {"id": "sub_test_002"}},
    }
    response = client.post(
        "/api/v1/webhooks/stripe",
        content=json.dumps(event),
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["event"] == "customer.subscription.deleted"


def test_webhook_unknown_event():
    event = {
        "type": "some.unknown.event",
        "data": {"object": {}},
    }
    response = client.post(
        "/api/v1/webhooks/stripe",
        content=json.dumps(event),
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "ignored"


def test_webhook_invalid_payload():
    response = client.post(
        "/api/v1/webhooks/stripe",
        content=b"not json",
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 400
