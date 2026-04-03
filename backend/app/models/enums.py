"""Enumerations for the ChamberForge domain models."""
import enum


class SourceType(str, enum.Enum):
    PEER_REVIEWED = "peer_reviewed"
    REGULATORY = "regulatory"
    INDUSTRY_REPORT = "industry_report"
    ENFORCEMENT_ACTION = "enforcement_action"


class ClaimCategory(str, enum.Enum):
    FACTUAL = "factual"
    STATISTICAL = "statistical"
    LEGAL = "legal"
    FINANCIAL = "financial"
    REGULATORY = "regulatory"
    OPINION = "opinion"


class RecencyStatus(str, enum.Enum):
    FRESH = "fresh"          # < 6 months
    AGING = "aging"          # 6-18 months
    STALE = "stale"          # > 18 months
