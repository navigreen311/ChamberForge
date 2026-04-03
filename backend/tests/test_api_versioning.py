"""Tests for API versioning utilities."""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.api_versioning import check_api_version, deprecated_endpoint


# ---------------------------------------------------------------------------
# Fixtures — lightweight FastAPI app with a version-checked endpoint
# ---------------------------------------------------------------------------

@pytest.fixture()
def versioned_app():
    app = FastAPI()

    @app.get("/ping")
    async def ping(version: str = pytest.importorskip("fastapi").Depends(check_api_version)):
        return {"version": version}

    return app


@pytest.fixture()
def client(versioned_app):
    return TestClient(versioned_app)


# ---------------------------------------------------------------------------
# check_api_version tests
# ---------------------------------------------------------------------------

class TestCheckApiVersion:
    def test_default_version_accepted(self, client):
        """Omitting the header should default to 2026-04-01 and succeed."""
        resp = client.get("/ping")
        assert resp.status_code == 200
        assert resp.json()["version"] == "2026-04-01"

    def test_explicit_supported_version(self, client):
        """Explicitly passing a supported version header succeeds."""
        resp = client.get("/ping", headers={"X-Api-Version": "2026-04-01"})
        assert resp.status_code == 200
        assert resp.json()["version"] == "2026-04-01"

    def test_unsupported_version_rejected(self, client):
        """An unknown version string should return 400."""
        resp = client.get("/ping", headers={"X-Api-Version": "1999-01-01"})
        assert resp.status_code == 400
        assert "Unsupported API version" in resp.json()["detail"]

    def test_empty_version_rejected(self, client):
        """An empty version string should return 400."""
        resp = client.get("/ping", headers={"X-Api-Version": ""})
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# deprecated_endpoint decorator tests
# ---------------------------------------------------------------------------

class TestDeprecatedEndpoint:
    def test_docstring_updated(self):
        """The decorator should prepend a deprecation notice to the docstring."""

        @deprecated_endpoint("2026-10-01", "/api/v2/new")
        async def my_endpoint():
            """Original docs."""

        assert "DEPRECATED" in my_endpoint.__doc__
        assert "2026-10-01" in my_endpoint.__doc__
        assert "/api/v2/new" in my_endpoint.__doc__
        assert "Original docs." in my_endpoint.__doc__

    def test_no_original_docstring(self):
        """Decorator works even when the function has no docstring."""

        @deprecated_endpoint("2026-10-01", "/api/v2/new")
        async def bare():
            pass

        assert "DEPRECATED" in bare.__doc__
        assert "2026-10-01" in bare.__doc__

    def test_function_still_callable(self):
        """The decorated function should remain callable."""
        import asyncio

        @deprecated_endpoint("2026-10-01", "/api/v2/new")
        async def greet():
            return "hello"

        result = asyncio.get_event_loop().run_until_complete(greet())
        assert result == "hello"
