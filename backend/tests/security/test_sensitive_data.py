"""Sensitive data exposure tests.

Verify that passwords, API keys, internal IDs, and stack traces are never leaked.
"""

from fastapi.testclient import TestClient

from app.core.config import settings


class TestPasswordNeverReturned:
    """Passwords must never appear in any API response."""

    def test_register_response_has_no_password(self, client: TestClient):
        """Registration response should contain tokens, never the password."""
        resp = client.post(
            "/api/v1/auth/register",
            json={
                "email": "pwtest@example.com",
                "password": "SuperSecret123!",
                "name": "Password Test",
                "workspace_name": "PW Test Workspace",
            },
        )
        body = resp.text
        assert "SuperSecret123!" not in body
        assert "hashed_password" not in body

    def test_login_response_has_no_password(self, client: TestClient):
        """Login response should contain tokens, never the password."""
        # Register first
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "pwtest2@example.com",
                "password": "AnotherSecret456!",
                "name": "PW Test 2",
                "workspace_name": "PW Test WS 2",
            },
        )
        resp = client.post(
            "/api/v1/auth/login",
            json={"email": "pwtest2@example.com", "password": "AnotherSecret456!"},
        )
        body = resp.text
        assert "AnotherSecret456!" not in body
        assert "hashed_password" not in body

    def test_me_endpoint_has_no_password(self, client: TestClient, auth_headers: dict):
        """GET /auth/me should never include password or hash."""
        resp = client.get("/api/v1/auth/me", headers=auth_headers)
        body = resp.text
        assert "password" not in body.lower() or "hashed_password" not in body


class TestAPIKeyNeverReturned:
    """API keys and secrets must not appear in responses."""

    def test_health_endpoint_no_secrets(self, client: TestClient):
        """Health endpoint should not leak configuration secrets."""
        resp = client.get("/api/health")
        body = resp.text
        # Check that actual secret values are not in the response
        if settings.JWT_SECRET and settings.JWT_SECRET != "changeme":
            assert settings.JWT_SECRET not in body
        if settings.ANTHROPIC_API_KEY:
            assert settings.ANTHROPIC_API_KEY not in body
        if settings.STRIPE_SECRET_KEY:
            assert settings.STRIPE_SECRET_KEY not in body


class TestInternalIDsNotLeaked:
    """Internal implementation details should not leak in error messages."""

    def test_404_error_no_internal_ids(self, client: TestClient, auth_headers: dict):
        """404 responses should not expose internal database details."""
        resp = client.get(
            "/api/v1/problems/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        if resp.status_code == 404:
            body = resp.text.lower()
            assert "traceback" not in body
            assert "sqlalchemy" not in body
            assert "postgresql" not in body

    def test_validation_error_no_stack_trace(self, client: TestClient, auth_headers: dict):
        """Validation errors should not include stack traces."""
        resp = client.post(
            "/api/v1/problems/",
            json={"invalid_field": "value"},
            headers=auth_headers,
        )
        if resp.status_code == 422:
            body = resp.text.lower()
            assert "traceback" not in body
            assert "file \"/app" not in body


class TestDocsDisabledInProduction:
    """API documentation should be disabled in production mode."""

    def test_docs_endpoint_in_current_env(self, client: TestClient):
        """If APP_ENV is production, /api/docs should be disabled or return 404."""
        resp = client.get("/api/docs")
        if settings.APP_ENV == "production":
            assert resp.status_code in (404, 403), (
                f"/api/docs should be disabled in production, got {resp.status_code}"
            )
        else:
            # In dev/test, docs are expected to be available
            assert resp.status_code == 200

    def test_redoc_endpoint_in_current_env(self, client: TestClient):
        """If APP_ENV is production, /api/redoc should be disabled or return 404."""
        resp = client.get("/api/redoc")
        if settings.APP_ENV == "production":
            assert resp.status_code in (404, 403), (
                f"/api/redoc should be disabled in production, got {resp.status_code}"
            )
        else:
            assert resp.status_code == 200
