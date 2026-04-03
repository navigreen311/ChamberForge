"""Tests for rate-limiting middleware."""
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.middleware.rate_limiter import RateLimiterMiddleware


def _make_app(limit: int = 5, window: int = 60) -> TestClient:
    """Create a tiny app with rate limiting for isolated testing."""
    test_app = FastAPI()
    test_app.add_middleware(RateLimiterMiddleware, default_limit=limit, window_seconds=window)

    @test_app.get("/ping")
    async def ping():
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
