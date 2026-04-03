"""Document model for S3-backed file storage."""
import uuid
from datetime import datetime, timezone

import sqlalchemy as sa
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    file_name = Column(String(512), nullable=False)
    file_type = Column(String(128), nullable=False, index=True)
    s3_key = Column(String(1024), nullable=False, unique=True)
    size_bytes = Column(Integer, nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), nullable=True)
    watermark_id = Column(String(256), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        sa.Index("ix_documents_workspace_file_type", "workspace_id", "file_type"),
    )

    def __repr__(self) -> str:
        return f"<Document {self.file_name} ({self.id})>"
