"""Runtime guardrails applied to AI-generated outputs before delivery."""
from __future__ import annotations

import re
from typing import Any, Dict, List

# --------------- rule patterns ---------------

_LICENSED_PROFESSIONAL_PATTERNS = [
    re.compile(r"\b(?:I am|I'm)\s+(?:a|an|your)\s+(?:lawyer|attorney|doctor|physician|financial advisor|accountant|tax advisor|medical professional)\b", re.IGNORECASE),
    re.compile(r"\b(?:as your|acting as your)\s+(?:lawyer|attorney|doctor|physician|financial advisor|accountant|tax advisor)\b", re.IGNORECASE),
]

_SURVEILLANCE_PATTERNS = [
    re.compile(r"\bmonitor\s+without\b", re.IGNORECASE),
    re.compile(r"\btrack\s+(?:their\s+)?location\b", re.IGNORECASE),
    re.compile(r"\bsurveillance\s+without\s+consent\b", re.IGNORECASE),
    re.compile(r"\bspy\s+on\b", re.IGNORECASE),
]

_DOMAIN_KEYWORDS: Dict[str, List[str]] = {
    "medical": ["diagnosis", "prescription", "treatment plan", "medical condition", "dosage"],
    "legal": ["legal advice", "legal opinion", "lawsuit", "litigation", "court order"],
    "tax": ["tax liability", "tax deduction", "file taxes", "tax return", "tax obligation"],
    "security": ["vulnerability", "exploit", "penetration test", "zero-day"],
}

_JURISDICTION_PATTERNS = re.compile(
    r"\b(?:US|UK|EU|GDPR|CCPA|HIPAA|SOX|PCI|PIPEDA|LGPD|APPI)\b"
)


# --------------- public API ---------------

def check_output(output_text: str, context: dict | None = None) -> dict:
    """Scan AI output against all guardrail rules.

    Returns ``{safe: bool, flags: [{rule, severity, detail}]}``.
    """
    context = context or {}
    flags: list[dict] = []

    # Rule 1: no licensed professional impersonation
    for pattern in _LICENSED_PROFESSIONAL_PATTERNS:
        match = pattern.search(output_text)
        if match:
            flags.append({
                "rule": "no_licensed_professional",
                "severity": "high",
                "detail": f"Matched: '{match.group()}'",
            })

    # Rule 2: no surveillance language
    for pattern in _SURVEILLANCE_PATTERNS:
        match = pattern.search(output_text)
        if match:
            flags.append({
                "rule": "no_surveillance",
                "severity": "high",
                "detail": f"Matched: '{match.group()}'",
            })

    # Rule 3: requires human review for sensitive domains
    for domain, keywords in _DOMAIN_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in output_text.lower():
                flags.append({
                    "rule": "requires_human_review",
                    "severity": "medium",
                    "detail": f"Domain '{domain}' keyword detected: '{kw}'",
                })
                break  # one flag per domain is enough

    # Rule 4: cross-border / multi-jurisdiction
    jurisdictions = set(_JURISDICTION_PATTERNS.findall(output_text))
    if len(jurisdictions) >= 2:
        flags.append({
            "rule": "cross_border_flag",
            "severity": "medium",
            "detail": f"Multiple jurisdictions detected: {', '.join(sorted(jurisdictions))}",
        })

    return {"safe": len(flags) == 0, "flags": flags}


def sanitize_output(output_text: str, flags: list[dict]) -> str:
    """Redact or append disclaimers for flagged content."""
    result = output_text

    has_professional = any(f["rule"] == "no_licensed_professional" for f in flags)
    has_surveillance = any(f["rule"] == "no_surveillance" for f in flags)
    has_review = any(f["rule"] == "requires_human_review" for f in flags)
    has_cross_border = any(f["rule"] == "cross_border_flag" for f in flags)

    # Redact professional impersonation
    if has_professional:
        for pattern in _LICENSED_PROFESSIONAL_PATTERNS:
            result = pattern.sub("[REDACTED — professional claim removed]", result)

    # Redact surveillance language
    if has_surveillance:
        for pattern in _SURVEILLANCE_PATTERNS:
            result = pattern.sub("[REDACTED — surveillance language removed]", result)

    # Append disclaimers
    disclaimers: list[str] = []
    if has_review:
        disclaimers.append(
            "DISCLAIMER: This output touches sensitive professional domains "
            "and requires human expert review before acting upon it."
        )
    if has_cross_border:
        disclaimers.append(
            "DISCLAIMER: Multiple legal jurisdictions detected. "
            "Consult qualified professionals in each relevant jurisdiction."
        )

    if disclaimers:
        result = result.rstrip() + "\n\n" + "\n\n".join(disclaimers)

    return result
