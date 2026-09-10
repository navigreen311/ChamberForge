"""Tests for AlumniSystem service."""
import pytest

from app.services.backbone.alumni_system import AlumniSystem


class TestCreateAlumniRecord:
    def test_creates_record_with_required_fields(self):
        record = AlumniSystem.create_alumni_record(
            None, "client-001", ["Final report", "Asset transfer docs"]
        )
        assert record["client_id"] == "client-001"
        assert record["status"] == "alumni"
        assert "graduated_at" in record
        assert record["final_deliverables"] == ["Final report", "Asset transfer docs"]
        assert "id" in record

    def test_empty_deliverables(self):
        record = AlumniSystem.create_alumni_record(None, "client-002", [])
        assert record["final_deliverables"] == []
        assert record["client_id"] == "client-002"

    def test_unique_ids(self):
        r1 = AlumniSystem.create_alumni_record(None, "c1", [])
        r2 = AlumniSystem.create_alumni_record(None, "c2", [])
        assert r1["id"] != r2["id"]


class TestScheduleTouchpoint:
    def test_creates_touchpoint(self):
        tp = AlumniSystem.schedule_touchpoint(
            None, "client-001", "check-in", "2026-06-15"
        )
        assert tp["client_id"] == "client-001"
        assert tp["type"] == "check-in"
        assert tp["scheduled_date"] == "2026-06-15"
        assert tp["status"] == "scheduled"


class TestGetReferralCandidates:
    @pytest.mark.asyncio
    async def test_returns_list(self):
        candidates = await AlumniSystem.get_referral_candidates(None, "ws-001")
        assert isinstance(candidates, list)
        assert len(candidates) > 0
        assert "health_score_at_exit" in candidates[0]


class TestGetReentryPath:
    @pytest.mark.asyncio
    async def test_returns_reentry_data(self):
        result = await AlumniSystem.get_reentry_path(None, "client-001")
        assert result["client_id"] == "client-001"
        assert "last_engagement" in result
        assert "time_since" in result
        assert "recommended_reentry_offer" in result
