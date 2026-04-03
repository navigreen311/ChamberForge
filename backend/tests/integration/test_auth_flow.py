"""Integration tests for the full authentication flow."""
import pytest


class TestRegister:
    def test_register_success(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "StrongPass1!",
                "name": "New User",
                "workspace_name": "My Workspace",
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_register_duplicate_email(self, client):
        payload = {
            "email": "dupe@example.com",
            "password": "StrongPass1!",
            "name": "First",
            "workspace_name": "WS1",
        }
        resp1 = client.post("/api/v1/auth/register", json=payload)
        assert resp1.status_code == 201

        resp2 = client.post("/api/v1/auth/register", json=payload)
        assert resp2.status_code == 409
        assert "already registered" in resp2.json()["detail"]

    def test_register_short_password(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={
                "email": "short@example.com",
                "password": "Ab1!",
                "name": "Short",
                "workspace_name": "WS",
            },
        )
        assert resp.status_code == 422

    def test_register_invalid_email(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={
                "email": "not-an-email",
                "password": "StrongPass1!",
                "name": "Bad",
                "workspace_name": "WS",
            },
        )
        assert resp.status_code == 422

    def test_register_missing_fields(self, client):
        resp = client.post("/api/v1/auth/register", json={"email": "x@x.com"})
        assert resp.status_code == 422


class TestLogin:
    def test_login_success(self, client):
        # Register first
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "login@example.com",
                "password": "StrongPass1!",
                "name": "Login User",
                "workspace_name": "Login WS",
            },
        )
        resp = client.post(
            "/api/v1/auth/login",
            json={"email": "login@example.com", "password": "StrongPass1!"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_login_wrong_password(self, client):
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "wrongpw@example.com",
                "password": "StrongPass1!",
                "name": "WP User",
                "workspace_name": "WP WS",
            },
        )
        resp = client.post(
            "/api/v1/auth/login",
            json={"email": "wrongpw@example.com", "password": "WrongPassword!"},
        )
        assert resp.status_code == 401
        assert "Invalid" in resp.json()["detail"]

    def test_login_nonexistent_user(self, client):
        resp = client.post(
            "/api/v1/auth/login",
            json={"email": "ghost@example.com", "password": "Anything1!"},
        )
        assert resp.status_code == 401


class TestMeEndpoint:
    def test_get_me_authenticated(self, client, auth_headers):
        resp = client.get("/api/v1/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "test@test.com"
        assert data["name"] == "Test User"
        assert data["role"] == "admin"
        assert data["is_active"] is True

    def test_get_me_no_token(self, client):
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code == 403

    def test_get_me_invalid_token(self, client):
        resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalidtoken123"},
        )
        assert resp.status_code == 401


class TestRefresh:
    def test_refresh_token_flow(self, client):
        # Register to get tokens
        reg = client.post(
            "/api/v1/auth/register",
            json={
                "email": "refresh@example.com",
                "password": "StrongPass1!",
                "name": "Refresh User",
                "workspace_name": "Refresh WS",
            },
        )
        refresh_token = reg.json()["refresh_token"]

        resp = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data

    def test_refresh_invalid_token(self, client):
        resp = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "bogus-token"},
        )
        assert resp.status_code == 401


class TestLogout:
    def test_logout(self, client):
        resp = client.post("/api/v1/auth/logout")
        assert resp.status_code == 200
        assert resp.json()["detail"] == "Successfully logged out"
