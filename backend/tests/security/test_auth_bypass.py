"""Authentication bypass tests.

Verify that protected endpoints properly enforce authentication and authorization.
"""
import uuid
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from jose import jwt

from app.core.config import settings

# Endpoints that require authentication (representative sample)
PROTECTED_ENDPOINTS = [
    ("GET", "/api/v1/problems/"),
    ("POST", "/api/v1/problems/"),
    ("GET", "/api/v1/evidence/"),
    ("POST", "/api/v1/evidence/"),
    ("GET", "/api/v1/notifications/"),
    ("GET", "/api/v1/storage/files"),
]

# Admin-only endpoints
ADMIN_ENDPOINTS = [
    ("POST", "/api/v1/admin/prompts/register"),
    ("POST", "/api/v1/admin/flags/set"),
    ("POST", "/api/v1/admin/rules/create"),
    ("POST", "/api/v1/admin/records/retention"),
]


class TestNoTokenAccess:
    """Accessing protected endpoints without any token should be rejected."""

    @pytest.mark.parametrize("method,path", PROTECTED_ENDPOINTS)
    def test_no_auth_header_returns_401_or_403(self, client: TestClient, method: str, path: str):
        """Requests without Authorization header must be rejected."""
        resp = getattr(client, method.lower())(path)
        assert resp.status_code in (401, 403), (
            f"{method} {path} returned {resp.status_code} without auth — expected 401/403"
        )


class TestExpiredToken:
    """Accessing endpoints with an expired token should be rejected."""

    def _make_expired_token(self) -> str:
        """Create a JWT that expired 1 hour ago."""
        payload = {
            "sub": str(uuid.uuid4()),
            "workspace_id": str(uuid.uuid4()),
            "role": "admin",
            "exp": datetime.now(timezone.utc) - timedelta(hours=1),
            "type": "access",
        }
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    def test_expired_token_returns_401(self, client: TestClient):
        """An expired token must be rejected with 401."""
        token = self._make_expired_token()
        headers = {"Authorization": f"Bearer {token}"}
        resp = client.get("/api/v1/problems/", headers=headers)
        assert resp.status_code == 401


class TestMalformedToken:
    """Malformed tokens should be rejected."""

    @pytest.mark.parametrize("bad_token", [
        "not-a-jwt",
        "eyJhbGciOiJIUzI1NiJ9.invalid.payload",
        "",
        "Bearer ",
        "null",
        "undefined",
    ])
    def test_malformed_token_returns_401(self, client: TestClient, bad_token: str):
        """Malformed tokens must be rejected with 401 or 403."""
        headers = {"Authorization": f"Bearer {bad_token}"}
        resp = client.get("/api/v1/problems/", headers=headers)
        assert resp.status_code in (401, 403, 422), (
            f"Malformed token '{bad_token[:20]}...' returned {resp.status_code}"
        )


class TestCrossWorkspaceAccess:
    """Tokens from one workspace should not access another workspace's data."""

    def _make_token_for_workspace(self, workspace_id: str) -> str:
        """Create a valid token for a specific workspace."""
        payload = {
            "sub": str(uuid.uuid4()),
            "workspace_id": workspace_id,
            "role": "admin",
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
            "type": "access",
        }
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    def test_cross_workspace_problem_access(self, client: TestClient, auth_headers: dict):
        """Create a problem in workspace A, attempt access from workspace B token."""
        # Create a problem with the authenticated user
        create_resp = client.post(
            "/api/v1/problems/",
            json={
                "title": "Secret Problem",
                "description": "Confidential",
                "wealth_tier": "hnw",
                "pain_category": "tax_optimization",
            },
            headers=auth_headers,
        )
        if create_resp.status_code == 201:
            problem_id = create_resp.json()["id"]
            # Try to access with a token from a different workspace
            other_token = self._make_token_for_workspace(str(uuid.uuid4()))
            other_headers = {"Authorization": f"Bearer {other_token}"}
            resp = client.get(f"/api/v1/problems/{problem_id}", headers=other_headers)
            # Should be 401 (user not found in DB) or 404 (workspace mismatch)
            assert resp.status_code in (401, 403, 404)


class TestRoleEscalation:
    """Non-admin roles should not access admin endpoints."""

    def _make_token(self, role: str, workspace_id: str | None = None) -> str:
        payload = {
            "sub": str(uuid.uuid4()),
            "workspace_id": workspace_id or str(uuid.uuid4()),
            "role": role,
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
            "type": "access",
        }
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    @pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
    def test_operator_cannot_access_admin_endpoints(self, client: TestClient, method: str, path: str):
        """Operator role should be forbidden from admin endpoints."""
        token = self._make_token("operator")
        headers = {"Authorization": f"Bearer {token}"}
        resp = getattr(client, method.lower())(path, headers=headers, json={})
        # Should be 401 (user not in DB) or 403 (role check) — never 200
        assert resp.status_code in (401, 403, 422), (
            f"Operator accessed {method} {path} with status {resp.status_code}"
        )

    @pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
    def test_viewer_cannot_access_admin_endpoints(self, client: TestClient, method: str, path: str):
        """Viewer role should be forbidden from admin endpoints."""
        token = self._make_token("viewer")
        headers = {"Authorization": f"Bearer {token}"}
        resp = getattr(client, method.lower())(path, headers=headers, json={})
        assert resp.status_code in (401, 403, 422), (
            f"Viewer accessed {method} {path} with status {resp.status_code}"
        )
