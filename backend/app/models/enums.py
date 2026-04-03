"""Enumerations for the ChamberForge domain models."""
import enum


class OfferStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    SUNSET = "sunset"


class DeliveryModel(str, enum.Enum):
    RETAINER = "retainer"
    PROJECT = "project"
    HYBRID = "hybrid"
    CONCIERGE = "concierge"
    MEMBERSHIP = "membership"


class PainCategory(str, enum.Enum):
    COORDINATION = "coordination"
    SECURITY = "security"
    PRIVACY = "privacy"
    GOVERNANCE = "governance"
    MEDICAL = "medical"
    TRAVEL = "travel"


class WealthTier(str, enum.Enum):
    HNW = "hnw"          # High Net Worth ($1M-$10M)
    VHNW = "vhnw"        # Very High Net Worth ($10M-$30M)
    UHNW = "uhnw"        # Ultra High Net Worth ($30M+)


class BuyerType(str, enum.Enum):
    PRINCIPAL = "principal"
    FAMILY_OFFICE = "family_office"
    ESTATE_MANAGER = "estate_manager"
    EXECUTIVE_ASSISTANT = "executive_assistant"
    ADVISOR = "advisor"
