"""Tests for the PDF export service."""
import pytest

from app.services.backbone.pdf_export import PDFExportService


@pytest.fixture
def service():
    return PDFExportService()


class TestExportToPdf:
    def test_returns_bytes(self, service: PDFExportService):
        result = service.export_to_pdf("Test Title", [])
        assert isinstance(result, bytes)
        assert len(result) > 0

    def test_pdf_header(self, service: PDFExportService):
        result = service.export_to_pdf("Title", [])
        assert result[:5] == b"%PDF-"

    def test_sections_text(self, service: PDFExportService):
        sections = [
            {"heading": "Section 1", "content": "Hello world", "type": "text"},
        ]
        result = service.export_to_pdf("Doc", sections)
        assert len(result) > 100

    def test_sections_table(self, service: PDFExportService):
        sections = [
            {
                "heading": "Data",
                "content": [
                    {"Name": "Alice", "Amount": "100"},
                    {"Name": "Bob", "Amount": "200"},
                ],
                "type": "table",
            },
        ]
        result = service.export_to_pdf("Table Doc", sections)
        assert result[:5] == b"%PDF-"

    def test_sections_list(self, service: PDFExportService):
        sections = [
            {"heading": "Items", "content": ["Item A", "Item B", "Item C"], "type": "list"},
        ]
        result = service.export_to_pdf("List Doc", sections)
        assert result[:5] == b"%PDF-"

    def test_with_metadata(self, service: PDFExportService):
        result = service.export_to_pdf(
            "Meta Doc", [], metadata={"Author": "Test", "Date": "2026-01-01"}
        )
        assert isinstance(result, bytes)


class TestWatermark:
    def test_watermark_adds_metadata(self, service: PDFExportService):
        pdf = service.export_to_pdf("Test", [])
        watermarked = service.add_watermark(pdf, "user-123", "ws-456")
        assert len(watermarked) > len(pdf)
        assert b"ChamberForge-Watermark" in watermarked
        assert b"user-123" in watermarked
        assert b"ws-456" in watermarked

    def test_watermark_preserves_pdf(self, service: PDFExportService):
        pdf = service.export_to_pdf("Test", [])
        watermarked = service.add_watermark(pdf, "u1", "w1")
        assert watermarked[:5] == b"%PDF-"


class TestOfferExport:
    def test_export_offer_produces_pdf(self, service: PDFExportService):
        offer_data = {
            "id": "offer-001",
            "title": "Test Offer",
            "workspace_id": "ws-test",
            "summary": "An offer summary.",
            "terms": "Standard terms.",
            "status": "Draft",
            "conditions": ["Condition 1", "Condition 2"],
        }
        result = service.export_offer(offer_data, "user-abc")
        assert result[:5] == b"%PDF-"
        assert b"ChamberForge-Watermark" in result


class TestTrustPackExport:
    def test_export_trust_pack_produces_pdf(self, service: PDFExportService):
        trust_data = {
            "id": "tp-001",
            "title": "Trust Pack",
            "workspace_id": "ws-test",
            "summary": "Verification summary.",
            "items": ["ID verified", "Funds confirmed"],
        }
        result = service.export_trust_pack(trust_data, "user-xyz")
        assert result[:5] == b"%PDF-"
        assert b"ChamberForge-Watermark" in result


class TestIntelBriefExport:
    def test_export_intel_brief_produces_pdf(self, service: PDFExportService):
        brief_data = {
            "id": "ib-001",
            "title": "Intel Brief",
            "workspace_id": "ws-test",
            "overview": "Market overview.",
            "findings": ["Finding 1"],
            "analysis": "Deep analysis.",
            "classification": "Internal",
            "recommendations": ["Rec 1"],
        }
        result = service.export_intel_brief(brief_data, "user-def")
        assert result[:5] == b"%PDF-"
        assert b"ChamberForge-Watermark" in result
