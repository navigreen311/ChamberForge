"""Tests for profile endpoints."""
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.core.dependencies import get_current_user
from app.core.security import get_password_hash
from app.db.session import get_db
from app.main import app
from app.models.user import User


def _make_user(
    user_id=None, email="test@example.com", name="Test User",
    password="oldpassword123", role="admin", workspace_id=None,
):
    u = MagicMock(spec=User)
    u.id = user_id or str(uuid.uuid4())
    u.email = email
    u.name = name
    u.hashed_password = get_password_hash(password)
    u.role = role
    u.workspace_id = workspace_id or str(uuid.uuid4())
    u.is_active = True
    u.created_at = datetime.now(timezone.utc)
    u.updated_at = datetime.now(timezone.utc)
    return u


def _mock_db():
    return MagicMock()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def cleanup():
    yield
    app.dependency_overrides.clear()


class TestGetProfile:
    def test_get_profile_success(self, client):
        user = _make_user()
        app.dependency_overrides[get_current_user] = lambda: user
        resp = client.get("/api/v1/profile/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"
        assert data["role"] == "admin"

    def test_get_profile_unauthenticated(self, client):
        resp = client.get("/api/v1/profile/")
        assert resp.status_code in (401, 403)


class TestUpdateProfile:
    def test_update_name(self, client):
        user = _make_user()
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.return_value = None

        app.dependency_overrides[get_current_user] = lambda: user
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.put("/api/v1/profile/", json={"name": "New Name"})
        assert resp.status_code == 200
        assert resp.json()["name"] == "New Name"

    def test_update_email_conflict(self, client):
        user = _make_user()
        other = _make_user(email="taken@example.com")
        mock_db = _mock_db()
        mock_db.query.return_value.filter.return_value.first.return_value = other

        app.dependency_overrides[get_current_user] = lambda: user
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.put("/api/v1/profile/", json={"email": "taken@example.com"})
        assert resp.status_code == 409
        assert "already in use" in resp.json()["detail"]

    def test_update_email_invalid(self, client):
        user = _make_user()
        mock_db = _mock_db()

        app.dependency_overrides[get_current_user] = lambda: user
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.put("/api/v1/profile/", json={"email": "not-an-email"})
        assert resp.status_code == 422


class TestChangePassword:
    def test_change_password_success(self, client):
        user = _make_user(password="correctOldPass")
        mock_db = _mock_db()

        app.dependency_overrides[get_current_user] = lambda: user
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.put(
            "/api/v1/profile/password",
            json={"current_password": "correctOldPass", "new_password": "newSecurePass123"},
        )
        assert resp.status_code == 200
        assert "updated" in resp.json()["detail"].lower()

    def test_change_password_wrong_current(self, client):
        user = _make_user(password="correctOldPass")
        mock_db = _mock_db()

        app.dependency_overrides[get_current_user] = lambda: user
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.put(
            "/api/v1/profile/password",
            json={"current_password": "wrongPassword", "new_password": "newPass123456"},
        )
        assert resp.status_code == 400
        assert "incorrect" in resp.json()["detail"].lower()

    def test_change_password_too_short(self, client):
        user = _make_user(password="correctOldPass")
        mock_db = _mock_db()

        app.dependency_overrides[get_current_user] = lambda: user
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.put(
            "/api/v1/profile/password",
            json={"current_password": "correctOldPass", "new_password": "short"},
        )
        assert resp.status_code == 422


class TestDeleteAccount:
    def test_soft_delete(self, client):
        user = _make_user()
        mock_db = _mock_db()

        app.dependency_overrides[get_current_user] = lambda: user
        app.dependency_overrides[get_db] = lambda: mock_db
        resp = client.delete("/api/v1/profile/")
        assert resp.status_code == 200
        assert "deactivated" in resp.json()["detail"].lower()
        assert user.is_active is False
