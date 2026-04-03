"""Tests for workspace settings endpoints."""
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.core.security import get_password_hash
from app.core.dependencies import get_current_user, require_role
from app.db.session import get_db
from app.main import app
from app.models.user import User
from app.models.workspace import Workspace

WORKSPACE_ID = str(uuid.uuid4())
ADMIN_ID = str(uuid.uuid4())
OPERATOR_ID = str(uuid.uuid4())


def _make_user(user_id=ADMIN_ID, email="admin@example.com", name="Admin User",
               role="admin", workspace_id=WORKSPACE_ID):
    u = MagicMock(spec=User)
    u.id = user_id
    u.email = email
    u.name = name
    u.hashed_password = get_password_hash("password123")
    u.role = role
    u.workspace_id = workspace_id
    u.is_active = True
    u.created_at = datetime.now(timezone.utc)
    u.updated_at = datetime.now(timezone.utc)
    return u


def _make_workspace(ws_id=WORKSPACE_ID, owner_id=ADMIN_ID):
    ws = MagicMock(spec=Workspace)
    ws.id = ws_id
    ws.name = "Test Workspace"
    ws.slug = "test-workspace"
    ws.plan = "core"
    ws.owner_id = owner_id
    ws.settings = {"theme": "dark"}
    ws.created_at = datetime.now(timezone.utc)
    ws.updated_at = datetime.now(timezone.utc)
    return ws


def _mock_db():
    return MagicMock()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin():
    return _make_user()


@pytest.fixture
def operator():
    return _make_user(user_id=OPERATOR_ID, email="op@example.com", name="Operator", role="operator")


@pytest.fixture
def workspace():
    return _make_workspace()


@pytest.fixture(autouse=True)
def cleanup():
    yield
    app.dependency_overrides.clear()


class TestGetWorkspaceSettings:
    def test_get_settings(self, client, admin, workspace):
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.return_value = workspace

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.get("/api/v1/workspace-settings/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Test Workspace"
        assert data["slug"] == "test-workspace"
        assert data["settings"]["theme"] == "dark"

    def test_get_settings_not_found(self, client, admin):
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.return_value = None

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.get("/api/v1/workspace-settings/")
        assert resp.status_code == 404


class TestUpdateWorkspaceSettings:
    def test_update_name(self, client, admin, workspace):
        mock_db = _mock_db()
        # First query: _get_workspace; second: slug conflict (not triggered here)
        mock_db.query.return_value.filter.return_value.first.return_value = workspace

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[require_role("admin")] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.put("/api/v1/workspace-settings/", json={"name": "Updated WS"})
        assert resp.status_code == 200
        assert workspace.name == "Updated WS"

    def test_update_slug_conflict(self, client, admin, workspace):
        other_ws = _make_workspace(ws_id=str(uuid.uuid4()))
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            workspace,  # _get_workspace
            other_ws,   # slug conflict check
        ]

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[require_role("admin")] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.put("/api/v1/workspace-settings/", json={"slug": "taken-slug"})
        assert resp.status_code == 409

    def test_non_admin_forbidden(self, client, operator):
        mock_db = _mock_db()
        app.dependency_overrides[get_current_user] = lambda: operator
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.put("/api/v1/workspace-settings/", json={"name": "Hacked"})
        assert resp.status_code == 403


class TestListMembers:
    def test_list_members(self, client, admin):
        member2 = _make_user(user_id=OPERATOR_ID, email="op@example.com",
                             name="Operator", role="operator")
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.order_by.return_value.all.return_value = [
            admin, member2,
        ]

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.get("/api/v1/workspace-settings/members")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2


class TestInviteMember:
    def test_invite_success(self, client, admin):
        from unittest.mock import patch as _patch

        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.return_value = None

        # Patch User in the workspace_settings module to avoid SQLAlchemy mapper config
        invited = _make_user(
            user_id=str(uuid.uuid4()),
            email="newmember@example.com",
            name="newmember",
            role="analyst",
            workspace_id=WORKSPACE_ID,
        )

        with _patch("app.api.v1.workspace_settings.User", return_value=invited):
            app.dependency_overrides[get_current_user] = lambda: admin
            app.dependency_overrides[require_role("admin")] = lambda: admin
            app.dependency_overrides[get_db] = lambda: mock_db
            resp = client.post(
                "/api/v1/workspace-settings/members/invite",
                json={"email": "newmember@example.com", "role": "analyst"},
            )
            assert resp.status_code == 201
            data = resp.json()
            assert data["email"] == "newmember@example.com"
            assert data["role"] == "analyst"

    def test_invite_duplicate(self, client, admin):
        existing = _make_user(email="existing@example.com")
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.return_value = existing

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[require_role("admin")] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.post(
            "/api/v1/workspace-settings/members/invite",
            json={"email": "existing@example.com", "role": "operator"},
        )
        assert resp.status_code == 409

    def test_invite_invalid_role(self, client, admin):
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.return_value = None

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[require_role("admin")] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.post(
            "/api/v1/workspace-settings/members/invite",
            json={"email": "new2@example.com", "role": "superuser"},
        )
        assert resp.status_code == 422


class TestChangeRole:
    def test_change_role_success(self, client, admin):
        target = _make_user(user_id=OPERATOR_ID, email="op@example.com",
                            name="Operator", role="operator")
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.return_value = target

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[require_role("admin")] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.put(
            f"/api/v1/workspace-settings/members/{OPERATOR_ID}/role",
            json={"role": "advisor"},
        )
        assert resp.status_code == 200
        assert resp.json()["role"] == "advisor"

    def test_change_role_invalid(self, client, admin):
        target = _make_user(user_id=OPERATOR_ID, email="op@example.com")
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.return_value = target

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[require_role("admin")] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.put(
            f"/api/v1/workspace-settings/members/{OPERATOR_ID}/role",
            json={"role": "superuser"},
        )
        assert resp.status_code == 422

    def test_change_role_not_found(self, client, admin):
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.return_value = None

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[require_role("admin")] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        fake_id = str(uuid.uuid4())
        resp = client.put(
            f"/api/v1/workspace-settings/members/{fake_id}/role",
            json={"role": "advisor"},
        )
        assert resp.status_code == 404


class TestRemoveMember:
    def test_remove_member(self, client, admin):
        target = _make_user(user_id=OPERATOR_ID, email="op@example.com")
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.return_value = target

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[require_role("admin")] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.delete(f"/api/v1/workspace-settings/members/{OPERATOR_ID}")
        assert resp.status_code == 200
        assert target.is_active is False

    def test_cannot_remove_self(self, client, admin):
        mock_db = _mock_db()
        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[require_role("admin")] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.delete(f"/api/v1/workspace-settings/members/{ADMIN_ID}")
        assert resp.status_code == 400


class TestUsageStats:
    def test_usage_returns_stats(self, client, admin):
        mock_db = _mock_db()
        # Chain: query().filter().scalar() for counts
        # Chain: query().filter().first() for AI stats tuple
        scalar_mock = MagicMock()
        scalar_mock.scalar.side_effect = [5, 3, 2]  # problems, offers, members
        filter_mock = MagicMock()
        filter_mock.filter.return_value = scalar_mock

        # We need to handle multiple query() calls, each with different chains
        # Simpler: just mock the whole thing to return reasonable values
        mock_db.query.return_value.filter.return_value.scalar.side_effect = [5, 3, 2]
        mock_db.query.return_value.filter.return_value.first.return_value = (10, 4.50)

        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.get("/api/v1/workspace-settings/usage")
        assert resp.status_code == 200
        data = resp.json()
        assert data["problems_created"] == 5
        assert data["offers_active"] == 3
        assert data["members_count"] == 2
        assert data["ai_calls_this_month"] == 10
        assert data["ai_cost_this_month"] == 4.50
