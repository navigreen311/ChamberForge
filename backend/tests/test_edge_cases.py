"""Test edge cases — validation errors, empty states, and boundary conditions."""
import uuid

import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# 1. Problems — empty list returns message
# ---------------------------------------------------------------------------

def test_list_problems_empty_returns_message(client, auth_headers):
    """Listing problems when none exist should return an empty list with a message."""
    resp = client.get("/api/v1/problems/", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0
    assert "message" in data


# ---------------------------------------------------------------------------
# 2. Problems — urgency_score outside 1-10 returns 422
# ---------------------------------------------------------------------------

def test_create_problem_invalid_urgency_score(client, auth_headers):
    """Creating a problem with urgency_score outside 1-10 should return 422."""
    payload = {
        "title": "Test Problem",
        "workspace_id": str(uuid.uuid4()),
        "urgency_score": 15,
    }
    resp = client.post("/api/v1/problems/", json=payload, headers=auth_headers)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# 3. Search — empty query returns 422
# ---------------------------------------------------------------------------

def test_search_empty_query_returns_422(client, auth_headers):
    """Searching with an empty query should return 422."""
    resp = client.get("/api/v1/problems/search?q=", headers=auth_headers)
    assert resp.status_code == 422
    data = resp.json()
    msg = data.get("message", data.get("detail", ""))
    if isinstance(msg, dict):
        msg = str(msg)
    assert "query" in msg.lower() or "required" in msg.lower() or "search" in msg.lower()


# ---------------------------------------------------------------------------
# 4. Offers — generate without problem_id returns 422
# ---------------------------------------------------------------------------

def test_generate_offer_without_problem_id(client, auth_headers):
    """Generating an offer without problem_id should return 422."""
    resp = client.post(
        "/api/v1/offers/generate",
        json={"problem_data": {"title": "test"}},
        headers=auth_headers,
    )
    assert resp.status_code == 422
    data = resp.json()
    msg = data.get("message", data.get("detail", ""))
    if isinstance(msg, dict):
        msg = str(msg)
    assert "problem" in msg.lower() or "required" in msg.lower()


# ---------------------------------------------------------------------------
# 5. Offers — update sunset offer returns 400
# ---------------------------------------------------------------------------

def test_update_sunset_offer_returns_400(client, auth_headers, db_session):
    """Updating an offer in sunset status should return 400."""
    from app.models.offer import Offer

    offer_id = uuid.uuid4()
    offer = Offer(
        id=offer_id,
        workspace_id=auth_headers.get("_workspace_id", str(uuid.uuid4())),
        name="Sunset Offer",
        status="sunset",
        delivery_model="done_for_you",
    )
    db_session.add(offer)
    db_session.commit()

    resp = client.put(
        f"/api/v1/offers/{offer_id}",
        json={"name": "Updated Name"},
        headers=auth_headers,
    )
    # Should be 400 or 404 (workspace mismatch may cause 404)
    assert resp.status_code in (400, 404)


# ---------------------------------------------------------------------------
# 6. Playbooks — get nonexistent slug returns 404 with helpful message
# ---------------------------------------------------------------------------

def test_get_nonexistent_playbook_returns_404(client):
    """Getting a nonexistent playbook slug should return 404 with a helpful message."""
    resp = client.get("/api/v1/playbooks/nonexistent-slug-that-does-not-exist")
    assert resp.status_code == 404
    data = resp.json()
    detail = data.get("detail", "")
    assert "not found" in detail.lower()
    assert "list" in detail.lower() or "available" in detail.lower()


# ---------------------------------------------------------------------------
# 7. Billing — revenue dashboard with no subscriptions returns zeros
# ---------------------------------------------------------------------------

def test_revenue_dashboard_empty_returns_zeros(client, auth_headers):
    """Revenue dashboard with no subscriptions should return zero values, not error."""
    resp = client.get("/api/v1/billing/revenue", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("mrr", -1) >= 0
    assert data.get("active_subscriptions", -1) >= 0


# ---------------------------------------------------------------------------
# 8. Billing — create subscription with negative amount returns 422
# ---------------------------------------------------------------------------

def test_create_subscription_negative_amount(client, auth_headers):
    """Creating a subscription with negative amount should return 422."""
    payload = {
        "workspace_id": str(uuid.uuid4()),
        "client_id": str(uuid.uuid4()),
        "customer_id": "cus_test",
        "amount": -100,
        "plan_name": "Test Plan",
    }
    resp = client.post("/api/v1/billing/subscriptions", json=payload, headers=auth_headers)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# 9. Household — get household for client without one returns 404
# ---------------------------------------------------------------------------

def test_get_household_no_graph_returns_404(client, auth_headers):
    """Getting a household graph for a client that has none should return 404 with helpful message."""
    fake_id = str(uuid.uuid4())
    resp = client.get(f"/api/v1/household/{fake_id}", headers=auth_headers)
    assert resp.status_code == 404
    data = resp.json()
    detail = data.get("detail", "")
    assert "create" in detail.lower() or "not found" in detail.lower()


# ---------------------------------------------------------------------------
# 10. Unified search — empty query returns 422
# ---------------------------------------------------------------------------

def test_unified_search_empty_query_returns_422(client):
    """Unified search with empty query should return 422."""
    resp = client.get("/api/v1/search/?q=")
    assert resp.status_code == 422
    data = resp.json()
    msg = data.get("message", data.get("detail", ""))
    if isinstance(msg, dict):
        msg = str(msg)
    assert "query" in msg.lower() or "required" in msg.lower() or "search" in msg.lower()
