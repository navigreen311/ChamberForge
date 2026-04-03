"""Storage API — upload, list, download, delete documents."""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_workspace_id
from app.db.session import get_db
from app.models.document import Document
from app.services.backbone.storage_service import storage_service

router = APIRouter(prefix="/api/v1/storage", tags=["storage"])

ALLOWED_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/json",
    "text/plain",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    uploaded_by: Optional[str] = Form(None),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """Upload a file to S3 and record it in the database."""
    if file.content_type and file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"File type '{file.content_type}' not allowed")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50 MB limit")

    result = storage_service.upload_file(
        workspace_id=workspace_id,
        file_bytes=file_bytes,
        file_name=file.filename or "untitled",
        content_type=file.content_type or "application/octet-stream",
    )

    doc = Document(
        workspace_id=uuid.UUID(workspace_id),
        file_name=file.filename or "untitled",
        file_type=file.content_type or "application/octet-stream",
        s3_key=result["s3_key"],
        size_bytes=len(file_bytes),
        uploaded_by=uuid.UUID(uploaded_by) if uploaded_by else None,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "id": str(doc.id),
        "file_name": doc.file_name,
        "s3_key": doc.s3_key,
        "size_bytes": doc.size_bytes,
        "url": result["url"],
        "created_at": doc.created_at.isoformat(),
    }


@router.get("/files")
async def list_files(
    prefix: str = Query(""),
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    """List documents for a workspace."""
    docs = (
        db.query(Document)
        .filter(Document.workspace_id == uuid.UUID(workspace_id))
        .order_by(Document.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(d.id),
            "file_name": d.file_name,
            "file_type": d.file_type,
            "size_bytes": d.size_bytes,
            "created_at": d.created_at.isoformat(),
        }
        for d in docs
    ]


@router.get("/files/{doc_id}/download")
async def download_file(doc_id: str, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    """Get a pre-signed download URL for a document."""
    doc = db.query(Document).filter(Document.id == uuid.UUID(doc_id), Document.workspace_id == uuid.UUID(workspace_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    url = storage_service.get_download_url(doc.s3_key)
    return {"url": url, "file_name": doc.file_name}


@router.delete("/files/{doc_id}")
async def delete_file(doc_id: str, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    """Delete a document from S3 and the database."""
    doc = db.query(Document).filter(Document.id == uuid.UUID(doc_id), Document.workspace_id == uuid.UUID(workspace_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    deleted = storage_service.delete_file(doc.s3_key)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete from storage")

    db.delete(doc)
    db.commit()
    return {"deleted": True, "id": doc_id}
