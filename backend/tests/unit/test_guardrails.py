"""Tests for GuardrailsEngine — verify all 6 rules."""

from app.services.backbone.guardrails_engine import GuardrailsEngine

engine = GuardrailsEngine()


def _find_rule(rules: list[dict], rule_name: str) -> dict:
    return next(r for r in rules if r["rule_name"] == rule_name)


class TestRule1_LicensedProfessional:
    def test_lawyer_blocks(self):
        result = engine.check_offer({"positioning": "Act as your personal lawyer", "services": []})
        rule = _find_rule(result["rules"], "no_licensed_professional")
        assert rule["status"] == "BLOCK"
        assert result["overall_status"] == "BLOCK"

    def test_doctor_blocks(self):
        result = engine.check_offer({"positioning": "Your private doctor on call", "services": []})
        rule = _find_rule(result["rules"], "no_licensed_professional")
        assert rule["status"] == "BLOCK"

    def test_financial_advisor_blocks(self):
        result = engine.check_offer({"positioning": "financial advisor services", "services": []})
        rule = _find_rule(result["rules"], "no_licensed_professional")
        assert rule["status"] == "BLOCK"

    def test_clean_positioning_passes(self):
        result = engine.check_offer({"positioning": "lifestyle concierge", "services": ["travel booking"]})
        rule = _find_rule(result["rules"], "no_licensed_professional")
        assert rule["status"] == "PASS"


class TestRule2_Surveillance:
    def test_surveillance_blocks(self):
        result = engine.check_offer({"description": "We provide surveillance of targets"})
        rule = _find_rule(result["rules"], "no_surveillance")
        assert rule["status"] == "BLOCK"

    def test_surveillance_with_consent_passes(self):
        result = engine.check_offer({"description": "Client-authorized surveillance with explicit consent"})
        rule = _find_rule(result["rules"], "no_surveillance")
        assert rule["status"] == "PASS"


class TestRule3_MedicalLegalTax:
    def test_medical_pain_warns(self):
        result = engine.check_offer({"pain_category": "Medical"})
        rule = _find_rule(result["rules"], "medical_legal_tax_review")
        assert rule["status"] == "WARN"

    def test_governance_pain_warns(self):
        result = engine.check_offer({"pain_category": "Governance"})
        rule = _find_rule(result["rules"], "medical_legal_tax_review")
        assert rule["status"] == "WARN"

    def test_tax_keyword_warns(self):
        result = engine.check_offer({"description": "We handle tax optimization strategies"})
        rule = _find_rule(result["rules"], "medical_legal_tax_review")
        assert rule["status"] == "WARN"


class TestRule4_CrossBorder:
    def test_multiple_jurisdictions_warns(self):
        result = engine.check_offer({"jurisdictions": ["US", "UK", "EU"]})
        rule = _find_rule(result["rules"], "cross_border_data")
        assert rule["status"] == "WARN"

    def test_single_jurisdiction_passes(self):
        result = engine.check_offer({"jurisdictions": ["US"]})
        rule = _find_rule(result["rules"], "cross_border_data")
        assert rule["status"] == "PASS"


class TestRule5_GuaranteeLanguage:
    def test_guarantee_warns(self):
        result = engine.check_offer({"guarantee_framework": {"promise": "Guaranteed results within 30 days"}})
        rule = _find_rule(result["rules"], "guarantee_language")
        assert rule["status"] == "WARN"

    def test_no_guarantee_passes(self):
        result = engine.check_offer({"guarantee_framework": {"promise": "Best-effort service"}})
        rule = _find_rule(result["rules"], "guarantee_language")
        assert rule["status"] == "PASS"


class TestRule6_RegulatedDomain:
    def test_regulated_domain_warns(self):
        result = engine.check_offer({"compliance_risk": "RegulatedDomain"})
        rule = _find_rule(result["rules"], "regulated_domain")
        assert rule["status"] == "WARN"

    def test_low_compliance_passes(self):
        result = engine.check_offer({"compliance_risk": "Low"})
        rule = _find_rule(result["rules"], "regulated_domain")
        assert rule["status"] == "PASS"


class TestCleanOffer:
    def test_clean_offer_passes(self):
        result = engine.check_offer({
            "title": "Premium Travel Concierge",
            "positioning": "luxury travel planning",
            "description": "Curated bespoke travel experiences",
            "services": ["itinerary design", "villa booking"],
            "pain_category": "Travel",
            "jurisdictions": ["US"],
            "guarantee_framework": {},
            "compliance_risk": "Low",
        })
        assert result["overall_status"] == "PASS"
        for rule in result["rules"]:
            assert rule["status"] == "PASS"
