"""Tests for end-to-end X-Request-ID tracing."""
import uuid


class TestRequestIDTracing:
    """Verify that the X-Request-ID header is propagated through the stack."""

    def test_response_contains_request_id_header(self, client):
        """Every response should carry an X-Request-ID header."""
        resp = client.get("/api/v1/health")
        assert "x-request-id" in resp.headers
        # Validate it's a proper UUID
        uuid.UUID(resp.headers["x-request-id"])

    def test_client_sent_request_id_is_echoed_back(self, client):
        """When the client sends X-Request-ID, the server echoes it."""
        custom_id = str(uuid.uuid4())
        resp = client.get("/api/v1/health", headers={"X-Request-ID": custom_id})
        assert resp.headers["x-request-id"] == custom_id

    def test_error_response_includes_request_id(self, client):
        """Error responses should include request_id in the JSON body."""
        # Hit a non-existent route that triggers a 404 or a known error endpoint.
        # Use validation error by posting invalid JSON to a known endpoint.
        custom_id = str(uuid.uuid4())
        resp = client.post(
            "/api/v1/auth/login",
            json={},
            headers={"X-Request-ID": custom_id},
        )
        # Should be a 422 validation error
        assert resp.status_code == 422
        body = resp.json()
        assert body["request_id"] == custom_id
        assert resp.headers["x-request-id"] == custom_id

    def test_generated_id_matches_between_header_and_body_on_error(self, client):
        """When no X-Request-ID is sent, the generated one appears in both header and body."""
        resp = client.post(
            "/api/v1/auth/login",
            json={},
        )
        assert resp.status_code == 422
        header_id = resp.headers["x-request-id"]
        body_id = resp.json()["request_id"]
        assert header_id == body_id
        uuid.UUID(header_id)  # Validate format
