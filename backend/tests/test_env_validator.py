"""Tests for startup environment variable validation."""
from unittest.mock import patch

from app.core.env_validator import validate_environment


class TestValidateEnvironment:
    """Tests for validate_environment()."""

    def test_jwt_default_detected(self):
        """JWT_SECRET='changeme' should produce an error."""
        with patch("app.core.env_validator.settings") as mock_settings:
            mock_settings.JWT_SECRET = "changeme"
            mock_settings.DATABASE_URL = "postgresql://localhost/db"
            # Optional vars all set
            mock_settings.ANTHROPIC_API_KEY = "sk-ant-xxx"
            mock_settings.STRIPE_SECRET_KEY = "sk_test_xxx"
            mock_settings.RESEND_API_KEY = "re_xxx"
            mock_settings.AWS_ACCESS_KEY_ID = "AKIA_xxx"
            mock_settings.ELASTICSEARCH_URL = "http://localhost:9200"

            result = validate_environment()

            assert len(result["errors"]) == 1
            assert "JWT_SECRET" in result["errors"][0]

    def test_jwt_empty_detected(self):
        """JWT_SECRET='' should produce an error."""
        with patch("app.core.env_validator.settings") as mock_settings:
            mock_settings.JWT_SECRET = ""
            mock_settings.DATABASE_URL = "postgresql://localhost/db"
            mock_settings.ANTHROPIC_API_KEY = "sk-ant-xxx"
            mock_settings.STRIPE_SECRET_KEY = "sk_test_xxx"
            mock_settings.RESEND_API_KEY = "re_xxx"
            mock_settings.AWS_ACCESS_KEY_ID = "AKIA_xxx"
            mock_settings.ELASTICSEARCH_URL = "http://localhost:9200"

            result = validate_environment()

            assert len(result["errors"]) == 1
            assert "JWT_SECRET" in result["errors"][0]

    def test_sqlite_warning(self):
        """SQLite DATABASE_URL should produce a warning."""
        with patch("app.core.env_validator.settings") as mock_settings:
            mock_settings.JWT_SECRET = "a-real-secret-key-here"
            mock_settings.DATABASE_URL = "sqlite:///./test.db"
            mock_settings.ANTHROPIC_API_KEY = "sk-ant-xxx"
            mock_settings.STRIPE_SECRET_KEY = "sk_test_xxx"
            mock_settings.RESEND_API_KEY = "re_xxx"
            mock_settings.AWS_ACCESS_KEY_ID = "AKIA_xxx"
            mock_settings.ELASTICSEARCH_URL = "http://localhost:9200"

            result = validate_environment()

            assert len(result["errors"]) == 0
            assert any("SQLite" in w for w in result["warnings"])

    def test_missing_optional_vars_warn(self):
        """Missing optional vars should produce warnings, not errors."""
        with patch("app.core.env_validator.settings") as mock_settings:
            mock_settings.JWT_SECRET = "a-real-secret-key-here"
            mock_settings.DATABASE_URL = "postgresql://localhost/db"
            mock_settings.ANTHROPIC_API_KEY = ""
            mock_settings.STRIPE_SECRET_KEY = ""
            mock_settings.RESEND_API_KEY = ""
            mock_settings.AWS_ACCESS_KEY_ID = ""
            mock_settings.ELASTICSEARCH_URL = ""

            result = validate_environment()

            assert len(result["errors"]) == 0
            assert len(result["warnings"]) == 5
            warning_text = " ".join(result["warnings"])
            assert "ANTHROPIC_API_KEY" in warning_text
            assert "STRIPE_SECRET_KEY" in warning_text
            assert "RESEND_API_KEY" in warning_text
            assert "AWS_ACCESS_KEY_ID" in warning_text
            assert "ELASTICSEARCH_URL" in warning_text

    def test_all_vars_set_no_issues(self):
        """When all vars are properly configured, no errors or warnings."""
        with patch("app.core.env_validator.settings") as mock_settings:
            mock_settings.JWT_SECRET = "a-real-secret-key-here"
            mock_settings.DATABASE_URL = "postgresql://localhost/db"
            mock_settings.ANTHROPIC_API_KEY = "sk-ant-xxx"
            mock_settings.STRIPE_SECRET_KEY = "sk_test_xxx"
            mock_settings.RESEND_API_KEY = "re_xxx"
            mock_settings.AWS_ACCESS_KEY_ID = "AKIA_xxx"
            mock_settings.ELASTICSEARCH_URL = "http://localhost:9200"

            result = validate_environment()

            assert result["errors"] == []
            assert result["warnings"] == []

    def test_returns_dict_with_expected_keys(self):
        """Return value always has 'errors' and 'warnings' keys."""
        with patch("app.core.env_validator.settings") as mock_settings:
            mock_settings.JWT_SECRET = "changeme"
            mock_settings.DATABASE_URL = "sqlite:///test.db"
            mock_settings.ANTHROPIC_API_KEY = ""
            mock_settings.STRIPE_SECRET_KEY = ""
            mock_settings.RESEND_API_KEY = ""
            mock_settings.AWS_ACCESS_KEY_ID = ""
            mock_settings.ELASTICSEARCH_URL = ""

            result = validate_environment()

            assert "errors" in result
            assert "warnings" in result
            assert isinstance(result["errors"], list)
            assert isinstance(result["warnings"], list)
