"""Tests for ServiceDesignStudio."""

from app.services.backbone.service_design import ServiceDesignStudio


class TestGenerateSOPs:
    def test_returns_list_with_required_fields(self):
        studio = ServiceDesignStudio()
        value_stack = [
            {"name": "Core Service", "description": "Primary", "delivery_method": "retainer", "estimated_hours": 80},
            {"name": "Monitoring", "description": "Oversight", "delivery_method": "retainer", "estimated_hours": 40},
        ]
        sops = studio.generate_sops("Test Offer", "retainer", value_stack)

        assert isinstance(sops, list)
        # Onboarding + 2 layers + Escalation = 4
        assert len(sops) == 4

        for sop in sops:
            assert "title" in sop
            assert "description" in sop
            assert "steps" in sop
            assert isinstance(sop["steps"], list)
            assert len(sop["steps"]) > 0
            assert "owner_role" in sop
            assert "frequency" in sop
            assert "quality_checks" in sop
            assert isinstance(sop["quality_checks"], list)

    def test_empty_value_stack(self):
        studio = ServiceDesignStudio()
        sops = studio.generate_sops("Empty Offer", "project", [])
        # Should still have onboarding + escalation
        assert len(sops) == 2


class TestMapClientJourney:
    def test_returns_stages(self):
        studio = ServiceDesignStudio()
        value_stack = [
            {"name": "Service A", "description": "desc", "delivery_method": "retainer", "estimated_hours": 40},
        ]
        journey = studio.map_client_journey("Test Offer", value_stack)

        assert "stages" in journey
        assert "total_duration" in journey
        assert "escalation_paths" in journey
        assert isinstance(journey["stages"], list)
        assert len(journey["stages"]) == 5  # 5 defined stages

        for stage in journey["stages"]:
            assert "name" in stage
            assert "duration" in stage
            assert "touchpoints" in stage
            assert "deliverables" in stage
            assert "success_criteria" in stage


class TestDesignTouchpoints:
    def test_generates_touchpoints_from_journey(self):
        studio = ServiceDesignStudio()
        journey = studio.map_client_journey("Test", [{"name": "Svc"}])
        touchpoints = studio.design_touchpoints(journey)

        assert isinstance(touchpoints, list)
        assert len(touchpoints) > 0
        for tp in touchpoints:
            assert "touchpoint_name" in tp
            assert "channel" in tp
            assert "frequency" in tp
            assert "owner" in tp
            assert "template" in tp
