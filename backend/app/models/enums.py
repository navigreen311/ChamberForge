"""Enumerations for ChamberForge domain models."""
import enum


class WealthTier(str, enum.Enum):
    AFFLUENT = "affluent"
    HNW = "hnw"
    UHNW = "uhnw"
    FAMILY_OFFICE = "family_office"


class BuyerType(str, enum.Enum):
    INDIVIDUAL = "individual"
    COUPLE = "couple"
    FAMILY = "family"
    FAMILY_OFFICE = "family_office"
    INSTITUTION = "institution"


class LifeStage(str, enum.Enum):
    ACCUMULATION = "accumulation"
    PRESERVATION = "preservation"
    DISTRIBUTION = "distribution"
    TRANSITION = "transition"
    LEGACY = "legacy"


class TriggerEvent(str, enum.Enum):
    LIQUIDITY_EVENT = "liquidity_event"
    INHERITANCE = "inheritance"
    DIVORCE = "divorce"
    RETIREMENT = "retirement"
    RELOCATION = "relocation"
    HEALTH_CRISIS = "health_crisis"
    BUSINESS_EXIT = "business_exit"
    MARKET_DOWNTURN = "market_downturn"
    REGULATORY_CHANGE = "regulatory_change"
    FAMILY_GROWTH = "family_growth"


class PainCategory(str, enum.Enum):
    WEALTH_PRESERVATION = "wealth_preservation"
    TAX_OPTIMIZATION = "tax_optimization"
    ESTATE_PLANNING = "estate_planning"
    LIFESTYLE_MANAGEMENT = "lifestyle_management"
    PRIVACY_SECURITY = "privacy_security"
    FAMILY_GOVERNANCE = "family_governance"
    PHILANTHROPY = "philanthropy"
    CONCIERGE = "concierge"
    COMPLIANCE = "compliance"
    INVESTMENT = "investment"


class WTPProfile(str, enum.Enum):
    """Willingness To Pay profile."""
    PREMIUM = "premium"
    ULTRA_PREMIUM = "ultra_premium"
    VALUE_CONSCIOUS = "value_conscious"
    OUTCOME_BASED = "outcome_based"


class TrustChannel(str, enum.Enum):
    REFERRAL = "referral"
    ADVISOR = "advisor"
    FAMILY_OFFICE = "family_office"
    DIGITAL = "digital"
    EVENT = "event"
    MEDIA = "media"


class ComplianceRisk(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DeliveryModel(str, enum.Enum):
    WHITE_GLOVE = "white_glove"
    HYBRID = "hybrid"
    DIGITAL = "digital"
    ADVISORY = "advisory"


class ProofMetric(str, enum.Enum):
    NPS = "nps"
    RETENTION_RATE = "retention_rate"
    REVENUE_PER_CLIENT = "revenue_per_client"
    CLIENT_LIFETIME_VALUE = "client_lifetime_value"
    REFERRAL_RATE = "referral_rate"


class LifecycleStage(str, enum.Enum):
    EMERGING = "emerging"
    ACCELERATING = "accelerating"
    PROVEN = "proven"
    SATURATED = "saturated"
    DECLINING = "declining"


class UserRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"
