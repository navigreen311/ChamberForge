"""Domain enums for the Qualify layer."""
import enum


class WealthTier(str, enum.Enum):
    AFFLUENT = "Affluent"           # $1M-$5M
    HNW = "HNW"                     # $5M-$30M
    UHNW = "UHNW"                   # $30M-$100M
    ULTRA = "Ultra"                 # $100M+


class BuyerType(str, enum.Enum):
    INDIVIDUAL = "Individual"
    FAMILY_OFFICE = "FamilyOffice"
    CORPORATE = "Corporate"
    TRUST = "Trust"
    FOUNDATION = "Foundation"


class LifeStage(str, enum.Enum):
    ACCUMULATION = "Accumulation"
    PRESERVATION = "Preservation"
    TRANSITION = "Transition"
    LEGACY = "Legacy"
    NEXT_GEN = "NextGen"


class PainCategory(str, enum.Enum):
    PRIVACY = "Privacy"
    SECURITY = "Security"
    LIFESTYLE = "Lifestyle"
    GOVERNANCE = "Governance"
    LEGACY_PLANNING = "LegacyPlanning"
    REPUTATION = "Reputation"
    TRAVEL = "Travel"
    MEDICAL = "Medical"
    EDUCATION = "Education"
    CONCIERGE = "Concierge"


class ComplianceRisk(str, enum.Enum):
    NONE = "None"
    LOW = "Low"
    MODERATE = "Moderate"
    REGULATED_DOMAIN = "RegulatedDomain"
    HIGH = "High"


class DeliveryModel(str, enum.Enum):
    SOLO = "Solo"
    TEAM = "Team"
    ORCHESTRATED = "Orchestrated"
    TECH_ASSISTED = "TechAssisted"


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ReviewStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"
