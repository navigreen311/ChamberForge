"""End-to-end tests for file upload, list, download, and delete endpoints."""
import io
import uuid

import pytest

WORKSPACE_ID = "00000000-0000-0000-0000-000000000001"


class TestUploadEndToEnd:
    """Upload a file, verify the Document record, download URL, list, and delete."""

    def test_upload_returns_document_id_and_url(self, authed_client):
        """POST /api/v1/storage/upload — should save file and return doc metadata."""
        file_content = b"Hello, ChamberForge!"
        response = authed_client.post(
            "/api/v1/storage/upload",
            data={"workspace_id": WORKSPACE_ID},
            files={"file": ("test-doc.txt", io.BytesIO(file_content), "text/plain")},
        )

        assert response.status_code == 200
        body = response.json()
        assert "id" in body
        assert body["file_name"] == "test-doc.txt"
        assert body["size_bytes"] == len(file_content)
        assert "url" in body
        assert body["s3_key"]  # non-empty

    def test_upload_rejects_disallowed_type(self, authed_client):
        """POST /upload — should 400 for disallowed content types."""
        response = authed_client.post(
            "/api/v1/storage/upload",
            data={"workspace_id": WORKSPACE_ID},
            files={
                "file": (
                    "malware.exe",
                    io.BytesIO(b"bad"),
                    "application/x-msdownload",
                )
            },
        )
        assert response.status_code == 400
        assert "not allowed" in response.json().get("detail", response.json().get("message", ""))

    def test_list_files_returns_uploaded_document(self, authed_client):
        """Upload then GET /files — the document should appear in the list."""
        # Upload
        authed_client.post(
            "/api/v1/storage/upload",
            data={"workspace_id": WORKSPACE_ID},
            files={"file": ("list-test.csv", io.BytesIO(b"a,b,c"), "text/csv")},
        )

        # List
        response = authed_client.get(
            f"/api/v1/storage/files?workspace_id={WORKSPACE_ID}"
        )
        assert response.status_code == 200
        docs = response.json()
        assert any(d["file_name"] == "list-test.csv" for d in docs)

    def test_download_returns_presigned_url(self, authed_client):
        """Upload then GET /files/{id}/download — should return a URL."""
        upload = authed_client.post(
            "/api/v1/storage/upload",
            data={"workspace_id": WORKSPACE_ID},
            files={
                "file": ("dl-test.json", io.BytesIO(b'{"key":"val"}'), "application/json")
            },
        )
        doc_id = upload.json()["id"]

        response = authed_client.get(f"/api/v1/storage/files/{doc_id}/download")
        assert response.status_code == 200
        body = response.json()
        assert "url" in body
        assert body["file_name"] == "dl-test.json"

    def test_download_404_for_unknown_id(self, authed_client):
        """GET /files/{bad_id}/download — should 404."""
        fake_id = str(uuid.uuid4())
        response = authed_client.get(f"/api/v1/storage/files/{fake_id}/download")
        assert response.status_code == 404

    def test_delete_removes_document(self, authed_client):
        """Upload then DELETE /files/{id} — document should be gone."""
        upload = authed_client.post(
            "/api/v1/storage/upload",
            data={"workspace_id": WORKSPACE_ID},
            files={"file": ("del-test.txt", io.BytesIO(b"bye"), "text/plain")},
        )
        doc_id = upload.json()["id"]

        # Delete
        del_resp = authed_client.delete(f"/api/v1/storage/files/{doc_id}")
        assert del_resp.status_code == 200
        assert del_resp.json()["deleted"] is True

        # Verify gone
        dl_resp = authed_client.get(f"/api/v1/storage/files/{doc_id}/download")
        assert dl_resp.status_code == 404


class TestExportEndpoints:
    """Verify export endpoints return PDF bytes and include watermark metadata."""

    @pytest.fixture(autouse=True)
    def _user_id(self):
        self.user_id = str(uuid.uuid4())

    def test_export_offer_returns_pdf(self, authed_client):
        response = authed_client.post(
            f"/api/v1/exports/offer/offer-123?user_id={self.user_id}"
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert b"%PDF" in response.content
        # Watermark comment should be appended
        assert b"ChamberForge-Watermark" in response.content
        assert self.user_id.encode() in response.content
        # S3 download URL header
        assert "x-download-url" in response.headers

    def test_export_trust_pack_returns_pdf(self, authed_client):
        response = authed_client.post(
            f"/api/v1/exports/trust-pack/tp-456?user_id={self.user_id}"
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert b"%PDF" in response.content
        assert b"ChamberForge-Watermark" in response.content

    def test_export_intel_brief_returns_pdf(self, authed_client):
        response = authed_client.post(
            f"/api/v1/exports/intel-brief/ib-789?user_id={self.user_id}"
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert b"%PDF" in response.content
        assert b"ChamberForge-Watermark" in response.content
