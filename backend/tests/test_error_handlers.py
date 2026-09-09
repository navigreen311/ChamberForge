"""Tests for standardized error responses — exception classes and global handlers."""
import pytest
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

from app.core.error_handlers import (
    app_exception_handler,
    generic_exception_handler,
    validation_exception_handler,
)
from app.core.exceptions import (
    AppException,
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    ExternalServiceError,
    NotFoundError,
    RateLimitError,
    ValidationError,
)

# ---------------------------------------------------------------------------
# Helpers — tiny FastAPI app wired with our handlers
# ---------------------------------------------------------------------------


def _make_app() -> FastAPI:
    app = FastAPI()
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    @app.get("/not-found")
    def _not_found():
        raise NotFoundError("Widget", "abc-123")

    @app.get("/validation")
    def _validation():
        raise ValidationError("Bad input", {"email": "invalid format"})

    @app.get("/auth")
    def _auth():
        raise AuthenticationError("Token expired")

    @app.get("/authz")
    def _authz():
        raise AuthorizationError()

    @app.get("/rate-limit")
    def _rate_limit():
        raise RateLimitError(retry_after=30)

    @app.get("/conflict")
    def _conflict():
        raise ConflictError("Slug already taken", resource="Workspace")

    @app.get("/external")
    def _external():
        raise ExternalServiceError("Stripe", "Connection refused")

    @app.get("/boom")
    def _boom():
        raise RuntimeError("unexpected")

    class StrictBody(BaseModel):
        name: str = Field(..., min_length=1)
        age: int

    @app.post("/validate-body")
    def _validate_body(body: StrictBody):
        return {"ok": True}

    return app


@pytest.fixture()
def client():
    return TestClient(_make_app(), raise_server_exceptions=False)


# ---------------------------------------------------------------------------
# Exception class unit tests
# ---------------------------------------------------------------------------


class TestNotFoundError:
    def test_status_and_envelope(self, client: TestClient):
        resp = client.get("/not-found")
        assert resp.status_code == 404
        body = resp.json()
        assert body["error_code"] == "NOT_FOUND"
        assert "Widget" in body["message"]
        assert body["details"]["resource"] == "Widget"
        assert body["details"]["id"] == "abc-123"

    def test_default_resource_id_is_none(self):
        err = NotFoundError("Offer")
        assert err.details["id"] is None


class TestValidationError:
    def test_status_and_field_errors(self, client: TestClient):
        resp = client.get("/validation")
        assert resp.status_code == 422
        body = resp.json()
        assert body["error_code"] == "VALIDATION_ERROR"
        assert body["details"]["field_errors"]["email"] == "invalid format"


class TestAuthenticationError:
    def test_status_and_message(self, client: TestClient):
        resp = client.get("/auth")
        assert resp.status_code == 401
        body = resp.json()
        assert body["error_code"] == "AUTHENTICATION_ERROR"
        assert body["message"] == "Token expired"

    def test_default_message(self):
        err = AuthenticationError()
        assert "Authentication required" in err.detail["message"]


class TestAuthorizationError:
    def test_status_and_default_message(self, client: TestClient):
        resp = client.get("/authz")
        assert resp.status_code == 403
        body = resp.json()
        assert body["error_code"] == "AUTHORIZATION_ERROR"
        assert body["message"] == "Insufficient permissions"


class TestRateLimitError:
    def test_status_and_retry_after(self, client: TestClient):
        resp = client.get("/rate-limit")
        assert resp.status_code == 429
        body = resp.json()
        assert body["error_code"] == "RATE_LIMIT_EXCEEDED"
        assert body["details"]["retry_after"] == 30


class TestConflictError:
    def test_status_and_resource(self, client: TestClient):
        resp = client.get("/conflict")
        assert resp.status_code == 409
        body = resp.json()
        assert body["error_code"] == "CONFLICT"
        assert body["details"]["resource"] == "Workspace"


class TestExternalServiceError:
    def test_status_and_service(self, client: TestClient):
        resp = client.get("/external")
        assert resp.status_code == 502
        body = resp.json()
        assert body["error_code"] == "EXTERNAL_SERVICE_ERROR"
        assert body["details"]["service"] == "Stripe"
        assert "Connection refused" in body["message"]


# ---------------------------------------------------------------------------
# Global handler tests
# ---------------------------------------------------------------------------


class TestGenericExceptionHandler:
    def test_unhandled_error_returns_500(self, client: TestClient):
        resp = client.get("/boom")
        assert resp.status_code == 500
        body = resp.json()
        assert body["error_code"] == "INTERNAL_ERROR"
        assert body["message"] == "An unexpected error occurred"
        assert body["details"] is None


class TestRequestValidationHandler:
    def test_pydantic_validation_errors(self, client: TestClient):
        resp = client.post("/validate-body", json={"age": "not-a-number"})
        assert resp.status_code == 422
        body = resp.json()
        assert body["error_code"] == "VALIDATION_ERROR"
        assert body["message"] == "Request validation failed"
        assert "field_errors" in body["details"]
        # Both 'name' (missing) and 'age' (wrong type) should appear
        assert len(body["details"]["field_errors"]) >= 1


class TestConsistentEnvelope:
    """Every error response must contain the same top-level keys."""

    REQUIRED_KEYS = {"error_code", "message", "details", "request_id"}

    @pytest.mark.parametrize(
        "path",
        [
            "/not-found",
            "/validation",
            "/auth",
            "/authz",
            "/rate-limit",
            "/conflict",
            "/external",
            "/boom",
        ],
    )
    def test_envelope_keys(self, client: TestClient, path: str):
        resp = client.get(path)
        body = resp.json()
        assert self.REQUIRED_KEYS.issubset(body.keys()), (
            f"Missing keys in {path}: {self.REQUIRED_KEYS - body.keys()}"
        )
