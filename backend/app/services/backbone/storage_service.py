"""S3 document storage service with automatic mock fallback."""
from __future__ import annotations

import io
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

from app.core.config import settings

logger = logging.getLogger(__name__)


class _MockS3Store:
    """In-memory S3 mock used when real AWS credentials are unavailable."""

    def __init__(self) -> None:
        self._objects: dict[str, bytes] = {}
        self._metadata: dict[str, dict] = {}

    def put_object(self, *, Bucket: str, Key: str, Body: bytes, ContentType: str, **_kw):
        self._objects[Key] = Body
        self._metadata[Key] = {
            "ContentType": ContentType,
            "ContentLength": len(Body),
            "LastModified": datetime.now(timezone.utc),
        }
        return {"ResponseMetadata": {"HTTPStatusCode": 200}}

    def delete_object(self, *, Bucket: str, Key: str, **_kw):
        self._objects.pop(Key, None)
        self._metadata.pop(Key, None)
        return {"ResponseMetadata": {"HTTPStatusCode": 204}}

    def list_objects_v2(self, *, Bucket: str, Prefix: str = "", **_kw):
        contents = []
        for key, meta in self._metadata.items():
            if key.startswith(Prefix):
                contents.append({
                    "Key": key,
                    "Size": meta["ContentLength"],
                    "LastModified": meta["LastModified"],
                })
        return {"Contents": contents} if contents else {}

    def generate_presigned_url(self, ClientMethod: str, Params: dict, ExpiresIn: int = 3600):
        key = Params.get("Key", "unknown")
        return f"https://mock-s3.local/{Params.get('Bucket', 'bucket')}/{key}?expires={ExpiresIn}"

    def head_object(self, *, Bucket: str, Key: str, **_kw):
        if Key not in self._objects:
            raise ClientError(
                {"Error": {"Code": "404", "Message": "Not Found"}},
                "HeadObject",
            )
        return self._metadata[Key]


class StorageService:
    """Manages file upload/download/delete against S3 (or in-memory mock)."""

    def __init__(self) -> None:
        self.bucket = settings.AWS_S3_BUCKET or "chamberforge-local"
        self.region = settings.AWS_REGION
        self._use_mock = False

        try:
            if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
                raise NoCredentialsError()
            self.client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=self.region,
            )
            # Quick connectivity check
            self.client.list_buckets()
            logger.info("StorageService connected to AWS S3 (bucket=%s)", self.bucket)
        except (NoCredentialsError, ClientError, Exception) as exc:
            logger.warning(
                "AWS S3 unavailable (%s) — using in-memory mock storage", exc
            )
            self.client = _MockS3Store()
            self._use_mock = True

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def upload_file(
        self,
        workspace_id: str,
        file_bytes: bytes,
        file_name: str,
        content_type: str,
    ) -> dict:
        """Upload bytes to S3, return {s3_key, url}."""
        unique_id = uuid.uuid4().hex[:12]
        s3_key = f"{workspace_id}/{unique_id}/{file_name}"

        self.client.put_object(
            Bucket=self.bucket,
            Key=s3_key,
            Body=file_bytes,
            ContentType=content_type,
        )
        url = self.get_download_url(s3_key)
        logger.info("Uploaded %s (%d bytes)", s3_key, len(file_bytes))
        return {"s3_key": s3_key, "url": url}

    def get_download_url(self, s3_key: str, expires_in: int = 3600) -> str:
        """Return a pre-signed download URL for the given key."""
        return self.client.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": self.bucket, "Key": s3_key},
            ExpiresIn=expires_in,
        )

    def delete_file(self, s3_key: str) -> bool:
        """Delete an object from S3. Returns True on success."""
        try:
            self.client.delete_object(Bucket=self.bucket, Key=s3_key)
            logger.info("Deleted %s", s3_key)
            return True
        except (ClientError, Exception) as exc:
            logger.error("Failed to delete %s: %s", s3_key, exc)
            return False

    def list_files(self, workspace_id: str, prefix: str = "") -> list[dict]:
        """List objects under a workspace prefix."""
        full_prefix = f"{workspace_id}/{prefix}"
        try:
            response = self.client.list_objects_v2(
                Bucket=self.bucket, Prefix=full_prefix
            )
            contents = response.get("Contents", [])
            return [
                {
                    "key": obj["Key"],
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"].isoformat()
                    if hasattr(obj["LastModified"], "isoformat")
                    else str(obj["LastModified"]),
                }
                for obj in contents
            ]
        except (ClientError, Exception) as exc:
            logger.error("Failed to list files for %s: %s", workspace_id, exc)
            return []


# Module-level singleton (lazy import-friendly)
storage_service = StorageService()
