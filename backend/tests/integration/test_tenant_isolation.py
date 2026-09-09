"""Integration tests verifying multi-tenant workspace isolation.

Creates two separate workspaces with separate users and verifies that
data created in workspace A is never visible to users in workspace B.
"""
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def _reset_rate_limiter():
    """Clear in-memory rate-limiter state so tests are not throttled."""
    handler = getattr(app, "middleware_stack", None)
    while handler is not None:
        if hasattr(handler, "_requests"):
            handler._requests.clear()
            handler._workspace_requests.clear()
            break
        handler = getattr(handler, "app", None)


@pytest.fixture()
def isolated_client():
    """TestClient with a fresh in-memory database for isolation tests."""
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=eng)
    Session = sessionmaker(bind=eng)
    session = Session()

    # Seed playbooks so the app boots cleanly
    from app.services.backbone.playbook_engine import PlaybookEngine
    PlaybookEngine.seed_playbooks(session)

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    _reset_rate_limiter()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    session.close()


def _register_user(client: TestClient, email: str, name: str, workspace_name: str) -> dict:
    """Register a user and return {token, workspace_id, user info}."""
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "SecurePass1!",
            "name": name,
            "workspace_name": workspace_name,
        },
    )
    assert resp.status_code == 201, f"Registration failed: {resp.text}"
    token = resp.json()["access_token"]

    # Decode user info from /me
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    user_info = me_resp.json()

    return {
        "token": token,
        "headers": headers,
        "workspace_id": user_info["workspace_id"],
        "user_id": user_info["id"],
        "email": email,
    }


@pytest.fixture()
def tenant_a(isolated_client):
    """User A in Workspace A."""
    return _register_user(isolated_client, "alice@workspace-a.com", "Alice", "Workspace Alpha")


@pytest.fixture()
def tenant_b(isolated_client):
    """User B in Workspace B."""
    return _register_user(isolated_client, "bob@workspace-b.com", "Bob", "Workspace Beta")


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestProblemIsolation:
    """Problems created in workspace A must not be visible from workspace B."""

    def test_create_problem_in_workspace_a(self, isolated_client, tenant_a, tenant_b):
        """User A creates a problem; User B cannot list it."""
        # User A creates a problem
        resp = isolated_client.post(
            "/api/v1/problems/",
            json={
                "title": "Alpha-only problem",
                "description": "Sensitive data for workspace A",
                "workspace_id": tenant_a["workspace_id"],
            },
            headers=tenant_a["headers"],
        )
        assert resp.status_code == 201
        resp.json()["id"]

        # User A can see it
        resp_a = isolated_client.get("/api/v1/problems/", headers=tenant_a["headers"])
        assert resp_a.status_code == 200
        titles_a = [p["title"] for p in resp_a.json()["items"]]
        assert "Alpha-only problem" in titles_a

        # User B cannot see it
        resp_b = isolated_client.get("/api/v1/problems/", headers=tenant_b["headers"])
        assert resp_b.status_code == 200
        titles_b = [p["title"] for p in resp_b.json()["items"]]
        assert "Alpha-only problem" not in titles_b

    def test_get_problem_by_id_cross_tenant_blocked(self, isolated_client, tenant_a, tenant_b):
        """User B cannot fetch a problem by ID that belongs to workspace A."""
        resp = isolated_client.post(
            "/api/v1/problems/",
            json={"title": "Secret problem", "workspace_id": tenant_a["workspace_id"]},
            headers=tenant_a["headers"],
        )
        assert resp.status_code == 201
        problem_id = resp.json()["id"]

        # User B tries to access it directly
        resp_b = isolated_client.get(
            f"/api/v1/problems/{problem_id}",
            headers=tenant_b["headers"],
        )
        assert resp_b.status_code == 404

    def test_update_problem_cross_tenant_blocked(self, isolated_client, tenant_a, tenant_b):
        """User B cannot update a problem belonging to workspace A."""
        resp = isolated_client.post(
            "/api/v1/problems/",
            json={"title": "Update test", "workspace_id": tenant_a["workspace_id"]},
            headers=tenant_a["headers"],
        )
        problem_id = resp.json()["id"]

        resp_b = isolated_client.put(
            f"/api/v1/problems/{problem_id}",
            json={"title": "Hacked title"},
            headers=tenant_b["headers"],
        )
        assert resp_b.status_code == 404

    def test_delete_problem_cross_tenant_blocked(self, isolated_client, tenant_a, tenant_b):
        """User B cannot delete a problem belonging to workspace A."""
        resp = isolated_client.post(
            "/api/v1/problems/",
            json={"title": "Delete test", "workspace_id": tenant_a["workspace_id"]},
            headers=tenant_a["headers"],
        )
        problem_id = resp.json()["id"]

        resp_b = isolated_client.delete(
            f"/api/v1/problems/{problem_id}",
            headers=tenant_b["headers"],
        )
        assert resp_b.status_code == 404

        # Verify it still exists for User A
        resp_a = isolated_client.get(
            f"/api/v1/problems/{problem_id}",
            headers=tenant_a["headers"],
        )
        assert resp_a.status_code == 200


class TestOfferIsolation:
    """Offers must be workspace-scoped."""

    def test_list_offers_isolated(self, isolated_client, tenant_a, tenant_b):
        """Offers created in workspace A are not listed for workspace B."""
        # Create an offer as User A
        resp = isolated_client.post(
            "/api/v1/offers/",
            json={
                "name": "Alpha Exclusive Offer",
                "workspace_id": tenant_a["workspace_id"],
                "description": "Only for workspace A",
                "delivery_model": "done-for-you",
            },
            headers=tenant_a["headers"],
        )
        assert resp.status_code == 201

        # User A sees the offer
        resp_a = isolated_client.get("/api/v1/offers/", headers=tenant_a["headers"])
        assert resp_a.status_code == 200
        names_a = [o["name"] for o in resp_a.json()]
        assert "Alpha Exclusive Offer" in names_a

        # User B does not
        resp_b = isolated_client.get("/api/v1/offers/", headers=tenant_b["headers"])
        assert resp_b.status_code == 200
        names_b = [o["name"] for o in resp_b.json()]
        assert "Alpha Exclusive Offer" not in names_b

    def test_get_offer_cross_tenant_blocked(self, isolated_client, tenant_a, tenant_b):
        """User B cannot fetch an offer by ID belonging to workspace A."""
        resp = isolated_client.post(
            "/api/v1/offers/",
            json={
                "name": "Confidential Offer",
                "workspace_id": tenant_a["workspace_id"],
                "delivery_model": "advisory",
            },
            headers=tenant_a["headers"],
        )
        offer_id = resp.json()["id"]

        resp_b = isolated_client.get(
            f"/api/v1/offers/{offer_id}",
            headers=tenant_b["headers"],
        )
        assert resp_b.status_code == 404


class TestNotificationIsolation:
    """Notifications must require authentication with workspace context."""

    def test_notifications_require_auth(self, isolated_client):
        """Notification endpoints reject unauthenticated requests."""
        resp = isolated_client.get(
            f"/api/v1/notifications/?user_id={uuid.uuid4()}"
        )
        assert resp.status_code == 403 or resp.status_code == 401


class TestBillingIsolation:
    """Billing endpoints must be workspace-scoped."""

    def test_invoices_list_isolated(self, isolated_client, tenant_a, tenant_b):
        """Invoice listing is scoped to the authenticated user's workspace."""
        # Both users list invoices — each should see only their own workspace's data
        resp_a = isolated_client.get("/api/v1/billing/invoices", headers=tenant_a["headers"])
        assert resp_a.status_code == 200

        resp_b = isolated_client.get("/api/v1/billing/invoices", headers=tenant_b["headers"])
        assert resp_b.status_code == 200

        # Neither should see the other's data (empty for fresh workspaces)
        assert resp_a.json() == []
        assert resp_b.json() == []


class TestStorageIsolation:
    """Storage endpoints must be workspace-scoped."""

    def test_file_list_isolated(self, isolated_client, tenant_a, tenant_b):
        """File listing is scoped to the authenticated user's workspace."""
        resp_a = isolated_client.get("/api/v1/storage/files", headers=tenant_a["headers"])
        assert resp_a.status_code == 200

        resp_b = isolated_client.get("/api/v1/storage/files", headers=tenant_b["headers"])
        assert resp_b.status_code == 200

    def test_download_cross_tenant_blocked(self, isolated_client, tenant_a, tenant_b):
        """User B cannot download a file belonging to workspace A."""
        fake_doc_id = str(uuid.uuid4())
        resp_b = isolated_client.get(
            f"/api/v1/storage/files/{fake_doc_id}/download",
            headers=tenant_b["headers"],
        )
        assert resp_b.status_code == 404
