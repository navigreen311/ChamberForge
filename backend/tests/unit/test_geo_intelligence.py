"""Tests for GeoIntelligence — jurisdiction rules and compliance checking."""

from app.services.backbone.geo_intelligence import GeoIntelligence

geo = GeoIntelligence()


class TestGetJurisdictionRules:
    def test_us_returns_ccpa(self):
        rules = geo.get_jurisdiction_rules("US")
        assert rules["country"] == "United States"
        assert "CCPA" in str(rules["applicable_regulations"])

    def test_eu_returns_gdpr(self):
        rules = geo.get_jurisdiction_rules("EU")
        assert rules["country"] == "European Union"
        assert "GDPR" in str(rules["applicable_regulations"])
        assert "GDPR" in rules["data_privacy_law"]

    def test_uk_has_data_privacy_law(self):
        rules = geo.get_jurisdiction_rules("UK")
        assert "UK GDPR" in rules["data_privacy_law"]

    def test_ch_has_revfadp(self):
        rules = geo.get_jurisdiction_rules("CH")
        assert "revFADP" in rules["data_privacy_law"]

    def test_ae_has_rules(self):
        rules = geo.get_jurisdiction_rules("AE")
        assert rules["country"] == "United Arab Emirates"
        assert len(rules["licensing_requirements"]) > 0

    def test_sg_has_pdpa(self):
        rules = geo.get_jurisdiction_rules("SG")
        assert "PDPA" in rules["data_privacy_law"]

    def test_ky_has_rules(self):
        rules = geo.get_jurisdiction_rules("KY")
        assert rules["country"] == "Cayman Islands"

    def test_unknown_country_returns_empty(self):
        rules = geo.get_jurisdiction_rules("ZZ")
        assert rules["licensing_requirements"] == []
        assert rules["cross_border_rules"] == []
        assert rules["applicable_regulations"] == []

    def test_case_insensitive(self):
        rules = geo.get_jurisdiction_rules("us")
        assert rules["country"] == "United States"


class TestCheckCompliance:
    def test_returns_list_of_dicts(self):
        results = geo.check_compliance(["US", "EU"])
        assert len(results) == 2
        assert all("jurisdiction" in r for r in results)

    def test_gdpr_flag_for_eu(self):
        results = geo.check_compliance(["EU"])
        flags = results[0]["compliance_flags"]
        assert any("GDPR" in f for f in flags)

    def test_ccpa_flag_for_us(self):
        results = geo.check_compliance(["US"])
        flags = results[0]["compliance_flags"]
        assert any("CCPA" in f for f in flags)

    def test_unknown_country_low_risk(self):
        results = geo.check_compliance(["ZZ"])
        assert results[0]["risk_level"] == "low"
