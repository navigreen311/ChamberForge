"""Tests for the S3 storage service (using mock backend)."""
import uuid

import pytest

from app.services.backbone.storage_service import StorageService, _MockS3Store


@pytest.fixture
def service():
    """Create a StorageService that always uses the mock backend."""
    svc = StorageService.__new__(StorageService)
    svc.bucket = "test-bucket"
    svc.region = "us-east-1"
    svc._use_mock = True
    svc.client = _MockS3Store()
    return svc


class TestUpload:
    def test_upload_returns_s3_key_and_url(self, service: StorageService):
        ws = str(uuid.uuid4())
        result = service.upload_file(ws, b"hello world", "test.txt", "text/plain")
        assert "s3_key" in result
        assert "url" in result
        assert result["s3_key"].startswith(f"{ws}/")
        assert "test.txt" in result["s3_key"]

    def test_upload_stores_correct_bytes(self, service: StorageService):
        ws = str(uuid.uuid4())
        data = b"binary content here"
        result = service.upload_file(ws, data, "doc.pdf", "application/pdf")
        # Verify the mock store has the data
        assert service.client._objects[result["s3_key"]] == data


class TestDownloadUrl:
    def test_presigned_url_contains_key(self, service: StorageService):
        url = service.get_download_url("workspace/abc/file.pdf")
        assert "file.pdf" in url
        assert "expires=" in url

    def test_custom_expiry(self, service: StorageService):
        url = service.get_download_url("key", expires_in=600)
        assert "600" in url


class TestDelete:
    def test_delete_existing_file(self, service: StorageService):
        ws = str(uuid.uuid4())
        result = service.upload_file(ws, b"data", "f.txt", "text/plain")
        assert service.delete_file(result["s3_key"]) is True
        assert result["s3_key"] not in service.client._objects

    def test_delete_nonexistent_file(self, service: StorageService):
        # Should still return True (S3 delete is idempotent)
        assert service.delete_file("no/such/key") is True


class TestListFiles:
    def test_list_returns_uploaded_files(self, service: StorageService):
        ws = str(uuid.uuid4())
        service.upload_file(ws, b"a", "a.txt", "text/plain")
        service.upload_file(ws, b"bb", "b.txt", "text/plain")

        files = service.list_files(ws)
        assert len(files) == 2
        assert all("key" in f and "size" in f and "last_modified" in f for f in files)

    def test_list_empty_workspace(self, service: StorageService):
        files = service.list_files(str(uuid.uuid4()))
        assert files == []

    def test_list_with_prefix_filter(self, service: StorageService):
        ws = str(uuid.uuid4())
        service.upload_file(ws, b"x", "x.txt", "text/plain")
        # Prefix that won't match any sub-key
        files = service.list_files(ws, prefix="nonexistent/")
        assert files == []
