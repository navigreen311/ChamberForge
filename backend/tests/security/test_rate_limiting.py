"""Tests for rate-limiting middleware."""
import time

import jwt
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.middleware.rate_limiter import RateLimiterMiddleware

JWT_SECRET = "test-secret"
JWT_ALGORITHM = "HS256"


def _make_token(workspace_id: str = "ws-123") -> str:
    return jwt.encode({"workspace_id": workspace_id}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _make_app(
    limit: int = 5,
    window: int = 60,
    workspace_limit: int = 1000,
    endpoint_overrides=None,
) -> TestClient:
    """Create a tiny app with rate limiting for isolated testing."""
    test_app = FastAPI()
    test_app.add_middleware(
        RateLimiterMiddleware,
        default_limit=limit,
        window_seconds=window,
        workspace_limit=workspace_limit,
        endpoint_overrides=endpoint_overrides or {},
        jwt_secret=JWT_SECRET,
        jwt_algorithm=JWT_ALGORITHM,
    )

    @test_app.get("/ping")
    async def ping():
        return {"ok": True}

    @test_app.get("/api/v1/auth/login")
    async def login():
        return {"ok": True}

    @test_app.get("/api/v1/discover/scan")
    async def scan():
        return {"ok": True}

    return TestClient(test_app)


def test_429_after_exceeding_limit():
    client = _make_app(limit=3)
    for i in range(3):
        resp = client.get("/ping")
        assert resp.status_code == 200, f"Request {i+1} should succeed"

    resp = client.get("/ping")
    assert resp.status_code == 429
    assert resp.json()["detail"] == "Too Many Requests"


def test_retry_after_header_present():
    client = _make_app(limit=1)
    client.get("/ping")  # use up the quota
    resp = client.get("/ping")
    assert resp.status_code == 429
    retry = resp.headers.get("Retry-After")
    assert retry is not None
    assert int(retry) > 0


def test_rate_limit_headers_on_success():
    """Successful responses include X-RateLimit-* headers."""
    client = _make_app(limit=10)
    resp = client.get("/ping")
    assert resp.status_code == 200
    assert "X-RateLimit-Limit" in resp.headers
    assert "X-RateLimit-Remaining" in resp.headers
    assert "X-RateLimit-Reset" in resp.headers
    assert resp.headers["X-RateLimit-Limit"] == "10"


def test_rate_limit_remaining_decrements():
    """Remaining count decreases with each request."""
    client = _make_app(limit=5)
    resp1 = client.get("/ping")
    rem1 = int(resp1.headers["X-RateLimit-Remaining"])
    resp2 = client.get("/ping")
    rem2 = int(resp2.headers["X-RateLimit-Remaining"])
    assert rem2 < rem1


def test_429_includes_rate_limit_headers():
    """429 response includes all rate limit headers."""
    client = _make_app(limit=1)
    client.get("/ping")
    resp = client.get("/ping")
    assert resp.status_code == 429
    assert "X-RateLimit-Limit" in resp.headers
    assert resp.headers["X-RateLimit-Remaining"] == "0"
    assert "X-RateLimit-Reset" in resp.headers


def test_ai_endpoint_has_lower_limit():
    """AI endpoints use their specific override limit."""
    client = _make_app(
        limit=100,
        endpoint_overrides={"/api/v1/discover/scan": (2, 60)},
    )
    # First 2 requests succeed
    for _ in range(2):
        resp = client.get("/api/v1/discover/scan")
        assert resp.status_code == 200

    # Third request is rate limited
    resp = client.get("/api/v1/discover/scan")
    assert resp.status_code == 429


def test_auth_endpoint_has_lower_limit():
    """Auth endpoints use their specific override limit."""
    client = _make_app(
        limit=100,
        endpoint_overrides={"/api/v1/auth": (3, 60)},
    )
    for _ in range(3):
        resp = client.get("/api/v1/auth/login")
        assert resp.status_code == 200

    resp = client.get("/api/v1/auth/login")
    assert resp.status_code == 429


def test_workspace_level_limiting():
    """Per-workspace aggregate limit is enforced."""
    client = _make_app(limit=100, workspace_limit=3)
    token = _make_token("ws-abc")
    headers = {"Authorization": f"Bearer {token}"}

    for _ in range(3):
        resp = client.get("/ping", headers=headers)
        assert resp.status_code == 200

    resp = client.get("/ping", headers=headers)
    assert resp.status_code == 429
    assert resp.json()["detail"] == "Workspace rate limit exceeded"


def test_different_workspaces_have_separate_limits():
    """Two different workspaces get independent rate buckets."""
    client = _make_app(limit=100, workspace_limit=2)
    token_a = _make_token("ws-a")
    token_b = _make_token("ws-b")

    # Fill workspace A
    for _ in range(2):
        client.get("/ping", headers={"Authorization": f"Bearer {token_a}"})

    # Workspace A is limited
    resp = client.get("/ping", headers={"Authorization": f"Bearer {token_a}"})
    assert resp.status_code == 429

    # Workspace B still has capacity
    resp = client.get("/ping", headers={"Authorization": f"Bearer {token_b}"})
    assert resp.status_code == 200


def test_unauthenticated_uses_ip_only():
    """Without a token, rate limiting is by IP only."""
    client = _make_app(limit=2)
    for _ in range(2):
        resp = client.get("/ping")
        assert resp.status_code == 200

    resp = client.get("/ping")
    assert resp.status_code == 429
