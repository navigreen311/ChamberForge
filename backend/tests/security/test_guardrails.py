"""Tests for guardrails enforcement on AI outputs."""
from app.services.backbone.guardrails_enforcement import check_output, sanitize_output


def test_licensed_professional_flagged():
    text = "I am a lawyer and I advise you to sign this contract."
    result = check_output(text)
    assert result["safe"] is False
    rules = [f["rule"] for f in result["flags"]]
    assert "no_licensed_professional" in rules


def test_surveillance_language_flagged():
    text = "You can monitor without their knowledge to gather evidence."
    result = check_output(text)
    assert result["safe"] is False
    rules = [f["rule"] for f in result["flags"]]
    assert "no_surveillance" in rules


def test_clean_output_is_safe():
    text = "Here is a summary of the quarterly revenue projections."
    result = check_output(text)
    assert result["safe"] is True
    assert result["flags"] == []


def test_requires_human_review_for_medical():
    text = "Based on your symptoms, here is a treatment plan for your condition."
    result = check_output(text)
    rules = [f["rule"] for f in result["flags"]]
    assert "requires_human_review" in rules


def test_cross_border_flag():
    text = "This transaction is subject to both GDPR and CCPA regulations."
    result = check_output(text)
    rules = [f["rule"] for f in result["flags"]]
    assert "cross_border_flag" in rules


def test_sanitize_output_redacts_professional_claim():
    text = "I'm a doctor and recommend this dosage."
    flags = [{"rule": "no_licensed_professional", "severity": "high", "detail": ""}]
    sanitized = sanitize_output(text, flags)
    assert "I'm a doctor" not in sanitized
    assert "[REDACTED" in sanitized


def test_sanitize_output_appends_disclaimer_for_review():
    text = "Some text about a treatment plan."
    flags = [{"rule": "requires_human_review", "severity": "medium", "detail": ""}]
    sanitized = sanitize_output(text, flags)
    assert "DISCLAIMER" in sanitized
    assert "human expert review" in sanitized
