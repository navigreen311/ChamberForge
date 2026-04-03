"""Tests for WhiteLabelService — CRUD, portal branding, domain validation."""
import uuid

import pytest

from app.services.backbone.white_label import WhiteLabelService


@pytest.fixture()
def ws_id():
    return uuid.UUID("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")


class TestWhiteLabelCRUD:
    def test_get_config_returns_none_when_empty(self, db, ws_id):
        result = WhiteLabelService.get_config(db, ws_id)
        assert result is None

    def test_update_creates_new_config(self, db, ws_id):
        config = WhiteLabelService.update_config(db, ws_id, {
            "brand_name": "Acme Corp",
            "primary_color": "#ff5500",
        })
        assert config.brand_name == "Acme Corp"
        assert config.primary_color == "#ff5500"
        assert config.secondary_color == "#102a43"  # default
        assert config.is_active is True

    def test_get_config_after_create(self, db, ws_id):
        WhiteLabelService.update_config(db, ws_id, {"brand_name": "TestBrand"})
        config = WhiteLabelService.get_config(db, ws_id)
        assert config is not None
        assert config.brand_name == "TestBrand"

    def test_update_existing_config(self, db, ws_id):
        WhiteLabelService.update_config(db, ws_id, {"brand_name": "V1"})
        config = WhiteLabelService.update_config(db, ws_id, {
            "brand_name": "V2",
            "logo_url": "https://example.com/logo.png",
        })
        assert config.brand_name == "V2"
        assert config.logo_url == "https://example.com/logo.png"

    def test_update_all_fields(self, db, ws_id):
        config = WhiteLabelService.update_config(db, ws_id, {
            "brand_name": "Full Config",
            "logo_url": "https://example.com/logo.png",
            "primary_color": "#aabbcc",
            "secondary_color": "#112233",
            "favicon_url": "https://example.com/fav.ico",
            "custom_domain": "portal.example.com",
            "email_from_name": "Support",
            "email_from_address": "support@example.com",
            "portal_footer_text": "Powered by Acme",
            "is_active": True,
        })
        assert config.brand_name == "Full Config"
        assert config.custom_domain == "portal.example.com"
        assert config.email_from_name == "Support"
        assert config.portal_footer_text == "Powered by Acme"

    def test_invalid_hex_color_raises(self, db, ws_id):
        with pytest.raises(ValueError, match="Invalid hex color"):
            WhiteLabelService.update_config(db, ws_id, {"primary_color": "red"})

    def test_invalid_hex_color_too_short(self, db, ws_id):
        with pytest.raises(ValueError, match="Invalid hex color"):
            WhiteLabelService.update_config(db, ws_id, {"primary_color": "#abc"})

    def test_invalid_domain_raises(self, db, ws_id):
        with pytest.raises(ValueError, match="Invalid domain"):
            WhiteLabelService.update_config(db, ws_id, {"custom_domain": "not a domain!!"})

    def test_unknown_fields_ignored(self, db, ws_id):
        config = WhiteLabelService.update_config(db, ws_id, {
            "brand_name": "Safe",
            "unknown_field": "should be ignored",
        })
        assert config.brand_name == "Safe"
        assert not hasattr(config, "unknown_field")


class TestPortalBranding:
    def test_defaults_when_no_config(self, db, ws_id):
        branding = WhiteLabelService.get_portal_branding(db, ws_id)
        assert branding["brand_name"] == "ChamberForge"
        assert branding["primary_color"] == "#fbbf24"
        assert branding["secondary_color"] == "#102a43"
        assert branding["logo_url"] is None
        assert branding["footer_text"] is None

    def test_returns_configured_branding(self, db, ws_id):
        WhiteLabelService.update_config(db, ws_id, {
            "brand_name": "BrandX",
            "primary_color": "#00ff00",
            "secondary_color": "#0000ff",
            "portal_footer_text": "Custom footer",
            "logo_url": "https://example.com/logo.svg",
        })
        branding = WhiteLabelService.get_portal_branding(db, ws_id)
        assert branding["brand_name"] == "BrandX"
        assert branding["primary_color"] == "#00ff00"
        assert branding["secondary_color"] == "#0000ff"
        assert branding["footer_text"] == "Custom footer"
        assert branding["logo_url"] == "https://example.com/logo.svg"

    def test_inactive_config_returns_defaults(self, db, ws_id):
        WhiteLabelService.update_config(db, ws_id, {
            "brand_name": "Inactive",
            "is_active": False,
        })
        branding = WhiteLabelService.get_portal_branding(db, ws_id)
        assert branding["brand_name"] == "ChamberForge"  # default


class TestDomainValidation:
    def test_valid_domain(self):
        result = WhiteLabelService.validate_custom_domain("portal.example.com")
        assert result["valid"] is True
        assert len(result["dns_records_needed"]) == 2
        cname = result["dns_records_needed"][0]
        assert cname["type"] == "CNAME"
        assert cname["value"] == "portal.chamberforge.com"

    def test_valid_subdomain(self):
        result = WhiteLabelService.validate_custom_domain("app.client.co")
        assert result["valid"] is True

    def test_invalid_domain_empty(self):
        result = WhiteLabelService.validate_custom_domain("")
        assert result["valid"] is False

    def test_invalid_domain_no_tld(self):
        result = WhiteLabelService.validate_custom_domain("localhost")
        assert result["valid"] is False

    def test_invalid_domain_special_chars(self):
        result = WhiteLabelService.validate_custom_domain("my domain!.com")
        assert result["valid"] is False

    def test_txt_record_includes_domain(self):
        result = WhiteLabelService.validate_custom_domain("custom.example.org")
        txt = result["dns_records_needed"][1]
        assert txt["type"] == "TXT"
        assert "custom.example.org" in txt["name"]
