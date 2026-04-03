"""Tests for storage API endpoints."""
import io
import uuid
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import get_db


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

class FakeDocument:
    """Mimics the Document ORM model for tests."""
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


@pytest.fixture
def fake_db():
    """A mocked SQLAlchemy session."""
    db = MagicMock()
    # Make query().filter().first() and query().filter().order_by().all() work
    db.query.return_value.filter.return_value.first.return_value = None
    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = []
    return db


@pytest.fixture
def client(fake_db):
    """FastAPI test client with overridden DB dependency."""
    def override_get_db():
        yield fake_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Upload tests
# ---------------------------------------------------------------------------

class TestUploadEndpoint:
    @patch("app.api.v1.storage.storage_service")
    def test_upload_success(self, mock_storage, client, fake_db):
        ws_id = str(uuid.uuid4())
        mock_storage.upload_file.return_value = {
            "s3_key": f"{ws_id}/abc/test.pdf",
            "url": "https://mock-s3.local/test.pdf",
        }

        # Make db.refresh populate the object
        def fake_refresh(obj):
            from datetime import datetime, timezone
            obj.id = uuid.uuid4()
            obj.created_at = datetime.now(timezone.utc)

        fake_db.refresh = fake_refresh

        response = client.post(
            "/api/v1/storage/upload",
            data={"workspace_id": ws_id},
            files={"file": ("test.pdf", b"fake pdf content", "application/pdf")},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["file_name"] == "test.pdf"
        assert "s3_key" in body
        assert "url" in body

    def test_upload_invalid_type(self, client):
        response = client.post(
            "/api/v1/storage/upload",
            data={"workspace_id": str(uuid.uuid4())},
            files={"file": ("hack.exe", b"bad", "application/x-msdownload")},
        )
        assert response.status_code == 400
        assert "not allowed" in response.json()["detail"]


# ---------------------------------------------------------------------------
# List tests
# ---------------------------------------------------------------------------

class TestListEndpoint:
    def test_list_empty(self, client):
        ws_id = str(uuid.uuid4())
        response = client.get(f"/api/v1/storage/files?workspace_id={ws_id}")
        assert response.status_code == 200
        assert response.json() == []


# ---------------------------------------------------------------------------
# Download tests
# ---------------------------------------------------------------------------

class TestDownloadEndpoint:
    def test_download_not_found(self, client):
        doc_id = str(uuid.uuid4())
        response = client.get(f"/api/v1/storage/files/{doc_id}/download")
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# Delete tests
# ---------------------------------------------------------------------------

class TestDeleteEndpoint:
    def test_delete_not_found(self, client):
        doc_id = str(uuid.uuid4())
        response = client.delete(f"/api/v1/storage/files/{doc_id}")
        assert response.status_code == 404
