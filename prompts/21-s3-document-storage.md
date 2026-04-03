# Prompt 21: AWS S3 Document Storage & Watermarked PDF Export
Branch: ai-feature/s3-document-storage

## Mission
Build document storage on AWS S3 with CloudFront CDN, watermarked PDF export for all deliverables, and secure pre-signed URL access.

## What to Build

### Backend
1. **services/backbone/storage_service.py** — StorageService:
   - upload_file(workspace_id, file, path) → S3URL — upload to workspace-scoped S3 prefix
   - download_url(workspace_id, path, expires_in=3600) → presigned_url
   - delete_file(workspace_id, path)
   - list_files(workspace_id, prefix) → list[FileInfo]
   - get_cdn_url(path) → cloudfront_url
2. **services/backbone/pdf_export.py** — PDFExportService:
   - export_offer(offer_id, requesting_user_id) → watermarked PDF — invisible watermark with user ID
   - export_trust_pack(trust_pack_id, user_id) → watermarked PDF
   - export_case_study(case_study_id, user_id) → watermarked PDF
   - export_intel_brief(brief_id, user_id) → watermarked PDF
   - add_watermark(pdf_bytes, user_id, workspace_id) → watermarked_pdf_bytes
3. **api/v1/storage.py** — Upload, download, list, delete endpoints
4. **api/v1/exports.py** — Export endpoints for each document type
5. **models/document.py** — Document model: id, workspace_id, file_type, s3_key, size_bytes, uploaded_by, watermark_id, created_at

### Frontend
1. **components/modules/FileUploader.tsx** — Drag-and-drop file uploader with progress
2. **components/modules/DocumentViewer.tsx** — In-browser PDF/document viewer
3. **components/modules/ExportButton.tsx** — Export button with format options (PDF, JSON, CSV)
4. **app/admin/documents/page.tsx** — Document management dashboard

## Tests
- test S3 upload/download with mocked boto3
- test watermark embedding and extraction
- test pre-signed URL generation
- test workspace scoping (can't access other workspace files)

## Commit
feat: add S3 document storage, CloudFront CDN, watermarked PDF export, and secure pre-signed URLs
