"""Shared enumerations for ChamberForge models."""
import enum


class WealthTier(str, enum.Enum):
    HNW = "hnw"
    UHNW = "uhnw"
    FAMILY_OFFICE = "family_office"
    INSTITUTIONAL = "institutional"


class ClientStatus(str, enum.Enum):
    PROSPECT = "prospect"
    ONBOARDING = "onboarding"
    ACTIVE = "active"
    PAUSED = "paused"
    CHURNED = "churned"


class OfferStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
    SOLD = "sold"


class DeliveryModel(str, enum.Enum):
    DONE_FOR_YOU = "done_for_you"
    DONE_WITH_YOU = "done_with_you"
    ADVISORY = "advisory"
    HYBRID = "hybrid"


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Frequency(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"
