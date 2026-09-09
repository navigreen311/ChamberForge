"""GeoIntelligence — Jurisdiction rules and compliance checking for premium services."""
from __future__ import annotations

from typing import Any

_JURISDICTION_RULES: dict[str, dict[str, Any]] = {
    "US": {
        "country": "United States",
        "data_privacy_law": "CCPA / state-level patchwork; no federal omnibus law",
        "licensing_requirements": [
            "State-specific professional licensing",
            "SEC/FINRA registration for financial advice",
            "State insurance licensing",
        ],
        "cross_border_rules": [
            "OFAC sanctions compliance",
            "FATCA reporting for foreign accounts",
            "FinCEN beneficial-ownership reporting",
        ],
        "applicable_regulations": [
            "CCPA", "HIPAA (health)", "SOX (public companies)",
            "Dodd-Frank", "Bank Secrecy Act",
        ],
        "notes": "Highly fragmented — compliance varies by state and industry.",
    },
    "UK": {
        "country": "United Kingdom",
        "data_privacy_law": "UK GDPR + Data Protection Act 2018",
        "licensing_requirements": [
            "FCA authorization for financial services",
            "SRA regulation for legal services",
            "ICO registration for data processing",
        ],
        "cross_border_rules": [
            "UK adequacy decisions for data transfers",
            "HMRC reporting requirements",
            "Sanctions compliance (OFSI)",
        ],
        "applicable_regulations": [
            "UK GDPR", "FCA Handbook", "Bribery Act 2010",
            "Money Laundering Regulations 2017",
        ],
        "notes": "Post-Brexit divergence from EU rules — monitor ongoing changes.",
    },
    "EU": {
        "country": "European Union",
        "data_privacy_law": "GDPR (General Data Protection Regulation)",
        "licensing_requirements": [
            "Member-state professional licensing",
            "MiFID II for financial instruments",
            "E-commerce Directive compliance",
        ],
        "cross_border_rules": [
            "Standard Contractual Clauses for data transfers",
            "DAC6 / DAC7 reporting (tax)",
            "AMLD6 anti-money-laundering directives",
        ],
        "applicable_regulations": [
            "GDPR", "MiFID II", "PSD2", "AMLD6", "AI Act",
        ],
        "notes": "Strictest data-privacy regime globally; AI Act enforcement beginning.",
    },
    "CH": {
        "country": "Switzerland",
        "data_privacy_law": "revFADP (revised Federal Act on Data Protection, 2023)",
        "licensing_requirements": [
            "FINMA authorization for financial services",
            "Cantonal licensing for certain professions",
        ],
        "cross_border_rules": [
            "Automatic Exchange of Information (AEOI)",
            "Swiss-EU data adequacy",
            "Withholding tax agreements",
        ],
        "applicable_regulations": [
            "revFADP", "FINMA regulations", "Anti-Money Laundering Act (AMLA)",
        ],
        "notes": "Strong banking secrecy tradition but increasing transparency requirements.",
    },
    "AE": {
        "country": "United Arab Emirates",
        "data_privacy_law": "UAE Federal Data Protection Law (2021) / DIFC Data Protection Law / ADGM Data Protection Regulations",
        "licensing_requirements": [
            "Free-zone specific licensing (DIFC, ADGM, DMCC)",
            "SCA licensing for financial activities",
            "Department of Economic Development trade license",
        ],
        "cross_border_rules": [
            "UAE Central Bank regulations",
            "Economic substance requirements",
            "Common Reporting Standard (CRS)",
        ],
        "applicable_regulations": [
            "UAE Data Protection Law", "Anti-Money Laundering Law",
            "Free-zone specific regulations",
        ],
        "notes": "Multiple regulatory regimes (onshore vs. free zones); rapidly evolving.",
    },
    "SG": {
        "country": "Singapore",
        "data_privacy_law": "PDPA (Personal Data Protection Act)",
        "licensing_requirements": [
            "MAS licensing for financial services",
            "ACRA registration for business entities",
            "Professional licensing via respective boards",
        ],
        "cross_border_rules": [
            "PDPA cross-border transfer rules",
            "CRS reporting",
            "MAS Notice on AML/CFT",
        ],
        "applicable_regulations": [
            "PDPA", "Securities and Futures Act", "Payment Services Act",
            "Corruption, Drug Trafficking and Other Serious Crimes Act",
        ],
        "notes": "Business-friendly but strict AML/CFT enforcement.",
    },
    "KY": {
        "country": "Cayman Islands",
        "data_privacy_law": "Data Protection Act 2017 (DPA)",
        "licensing_requirements": [
            "CIMA licensing for financial services",
            "Trade and Business Licensing",
        ],
        "cross_border_rules": [
            "CRS / AEOI reporting",
            "FATCA compliance (Model 1 IGA)",
            "Economic substance requirements",
        ],
        "applicable_regulations": [
            "DPA 2017", "Anti-Money Laundering Regulations",
            "Securities Investment Business Act",
            "Beneficial Ownership Transparency Act",
        ],
        "notes": "Major offshore jurisdiction; strong beneficial-ownership transparency push.",
    },
}


class GeoIntelligence:
    """Jurisdiction rules and compliance analysis for global premium services."""

    @staticmethod
    def get_jurisdiction_rules(country_code: str) -> dict:
        code = country_code.upper()
        if code in _JURISDICTION_RULES:
            return _JURISDICTION_RULES[code]
        return {
            "country": country_code,
            "data_privacy_law": "Unknown — not in reference database",
            "licensing_requirements": [],
            "cross_border_rules": [],
            "applicable_regulations": [],
            "notes": f"No pre-loaded rules for '{country_code}'. Manual research required.",
        }

    @staticmethod
    def check_compliance(jurisdictions: list[str]) -> list[dict]:
        results: list[dict] = []
        for code in jurisdictions:
            rules = GeoIntelligence.get_jurisdiction_rules(code)
            flags: list[str] = []
            if rules.get("licensing_requirements"):
                flags.append(f"Licensing required in {rules['country']}")
            if rules.get("cross_border_rules"):
                flags.append(f"Cross-border rules apply in {rules['country']}")
            if "GDPR" in str(rules.get("applicable_regulations", [])):
                flags.append("GDPR compliance required")
            if "CCPA" in str(rules.get("applicable_regulations", [])):
                flags.append("CCPA compliance required")
            results.append({
                "jurisdiction": code.upper(),
                "country": rules["country"],
                "data_privacy_law": rules["data_privacy_law"],
                "compliance_flags": flags,
                "risk_level": "high" if len(flags) >= 3 else ("medium" if flags else "low"),
            })
        return results
