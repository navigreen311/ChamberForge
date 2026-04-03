"""Tests for the Service Quality QA engine."""
import uuid

from app.services.backbone.service_quality_qa import ServiceQualityQA


class TestSLAAdherence:
    def test_returns_sla_items(self):
        result = ServiceQualityQA.check_sla_adherence(
            db=None, workspace_id=uuid.uuid4(), offer_id=uuid.uuid4()
        )
        assert "sla_items" in result
        assert isinstance(result["sla_items"], list)
        assert len(result["sla_items"]) > 0

    def test_sla_items_have_required_fields(self):
        result = ServiceQualityQA.check_sla_adherence(
            db=None, workspace_id=uuid.uuid4(), offer_id=uuid.uuid4()
        )
        for item in result["sla_items"]:
            assert "metric" in item
            assert "target" in item
            assert "actual" in item
            assert "met" in item
            assert isinstance(item["met"], bool)

    def test_adherence_pct_is_valid(self):
        result = ServiceQualityQA.check_sla_adherence(
            db=None, workspace_id=uuid.uuid4(), offer_id=uuid.uuid4()
        )
        pct = result["overall_adherence_pct"]
        assert 0 <= pct <= 100

    def test_adherence_pct_matches_items(self):
        result = ServiceQualityQA.check_sla_adherence(
            db=None, workspace_id=uuid.uuid4(), offer_id=uuid.uuid4()
        )
        met_count = sum(1 for i in result["sla_items"] if i["met"])
        total = len(result["sla_items"])
        expected = round((met_count / total) * 100, 1)
        assert result["overall_adherence_pct"] == expected


class TestOnboardingQuality:
    def test_returns_score_and_checklist(self):
        result = ServiceQualityQA.score_onboarding_quality(db=None, client_id=uuid.uuid4())
        assert "score" in result
        assert "checklist" in result
        assert 0 <= result["score"] <= 100

    def test_checklist_items_have_required_fields(self):
        result = ServiceQualityQA.score_onboarding_quality(db=None, client_id=uuid.uuid4())
        for item in result["checklist"]:
            assert "item" in item
            assert "completed" in item
            assert isinstance(item["completed"], bool)

    def test_score_matches_checklist(self):
        result = ServiceQualityQA.score_onboarding_quality(db=None, client_id=uuid.uuid4())
        completed = sum(1 for i in result["checklist"] if i["completed"])
        total = len(result["checklist"])
        expected = round((completed / total) * 100)
        assert result["score"] == expected


class TestRetentionRisks:
    def test_returns_risk_list(self):
        result = ServiceQualityQA.detect_retention_risks(db=None, workspace_id=uuid.uuid4())
        assert isinstance(result, list)
        assert len(result) > 0

    def test_risk_entries_have_required_fields(self):
        result = ServiceQualityQA.detect_retention_risks(db=None, workspace_id=uuid.uuid4())
        for entry in result:
            assert "client_id" in entry
            assert "risk_level" in entry
            assert entry["risk_level"] in {"low", "medium", "high"}
            assert "signals" in entry
            assert isinstance(entry["signals"], list)
            assert "recommended_action" in entry

    def test_results_sorted_by_risk_score_desc(self):
        result = ServiceQualityQA.detect_retention_risks(db=None, workspace_id=uuid.uuid4())
        scores = [r["risk_score"] for r in result]
        assert scores == sorted(scores, reverse=True)
