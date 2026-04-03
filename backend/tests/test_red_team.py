"""Tests for red-team offer auditor."""
from app.services.backbone.red_team_auditor import RedTeamAuditor


def test_surveillance_offer_fails_compliance():
    """An offer involving surveillance should FAIL on compliance."""
    offer = {
        "name": "Executive Surveillance Package",
        "description": "Covert monitoring and surveillance of competitor executives",
        "services": ["surveillance", "wiretap analysis", "location tracking"],
        "team": [{"name": "Agent A"}, {"name": "Agent B"}, {"name": "Agent C"}],
        "channels": ["in-person", "remote"],
        "pricing": {"max": 50000},
        "costs": {"total": 20000},
    }

    result = RedTeamAuditor.audit_offer(offer)

    # Find compliance dimension
    compliance = next(d for d in result["dimensions"] if d["name"] == "compliance_check")
    assert compliance["status"] == "FAIL"
    assert any("surveillance" in f.lower() for f in compliance["findings"])


def test_clean_offer_passes():
    """A well-structured offer with no red flags should PASS."""
    offer = {
        "name": "Premium Wealth Planning",
        "description": "Comprehensive financial planning for high-net-worth families",
        "services": ["portfolio review", "estate planning", "tax optimization"],
        "team": [
            {"name": "Senior Advisor"},
            {"name": "Tax Specialist"},
            {"name": "Estate Planner"},
        ],
        "channels": ["in-person", "video", "phone"],
        "delivery_model": {"automation_level": "partial"},
        "pricing": {"max": 100000},
        "costs": {"total": 40000},
        "proprietary_elements": ["Proprietary risk model", "Custom reporting framework"],
        "partnerships": ["Top-tier custodian"],
    }

    result = RedTeamAuditor.audit_offer(offer)
    assert result["overall_status"] == "PASS"
    assert result["score"] >= 70


def test_audit_returns_all_dimensions():
    """Audit should always return exactly 5 dimensions."""
    result = RedTeamAuditor.audit_offer({"name": "Basic Offer"})

    assert len(result["dimensions"]) == 5
    dim_names = {d["name"] for d in result["dimensions"]}
    assert dim_names == {
        "compliance_check",
        "delivery_fragility",
        "margin_stress",
        "competitive_vulnerability",
        "reputation_risk",
    }

    # Each dimension should have required fields
    for dim in result["dimensions"]:
        assert "score" in dim
        assert "status" in dim
        assert "findings" in dim
        assert "recommendations" in dim
        assert dim["status"] in ("PASS", "WARN", "FAIL")
        assert 0 <= dim["score"] <= 100


def test_fragile_delivery_warns():
    """Single-person team with no backup should flag delivery fragility."""
    offer = {
        "name": "Solo Consultant",
        "description": "One-man advisory shop",
        "services": ["consulting"],
        "team": [{"name": "Solo Guy"}],
        "channels": ["email"],
        "delivery_model": {"automation_level": "none"},
    }

    result = RedTeamAuditor.audit_offer(offer)
    delivery = next(d for d in result["dimensions"] if d["name"] == "delivery_fragility")
    assert delivery["status"] in ("WARN", "FAIL")
    assert any("single" in f.lower() or "key-person" in f.lower() for f in delivery["findings"])
