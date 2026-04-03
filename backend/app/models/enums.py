"""Domain enums for ChamberForge."""
import enum


class WealthTier(str, enum.Enum):
    HNW = "hnw"
    UHNW = "uhnw"
    FAMILY_OFFICE = "family_office"
    INSTITUTIONAL = "institutional"
    HNWI = "HNWI"
    UHNWI = "UHNWI"
    FamilyOffice = "FamilyOffice"
    Dynasty = "Dynasty"
    AFFLUENT = "affluent"


class BuyerType(str, enum.Enum):
    Founder = "Founder"
    Inheritor = "Inheritor"
    Executive = "Executive"
    Principal = "Principal"
    INDIVIDUAL = "individual"
    COUPLE = "couple"
    FAMILY = "family"
    FAMILY_OFFICE = "family_office"
    INSTITUTION = "institution"


class LifeStage(str, enum.Enum):
    Accumulation = "Accumulation"
    Peak = "Peak"
    Transfer = "Transfer"
    Legacy = "Legacy"
    ACCUMULATION = "accumulation"
    PRESERVATION = "preservation"
    DISTRIBUTION = "distribution"
    TRANSITION = "transition"
    LEGACY = "legacy"


class TriggerEvent(str, enum.Enum):
    Exit = "Exit"
    IPO = "IPO"
    Inheritance = "Inheritance"
    Divorce = "Divorce"
    Prominence = "Prominence"
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
    Coordination = "Coordination"
    Security = "Security"
    Privacy = "Privacy"
    Governance = "Governance"
    Medical = "Medical"
    Travel = "Travel"
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
    MonthlyRetainer = "MonthlyRetainer"
    ProjectFee = "ProjectFee"
    Subscription = "Subscription"
    PREMIUM = "premium"
    ULTRA_PREMIUM = "ultra_premium"
    VALUE_CONSCIOUS = "value_conscious"
    OUTCOME_BASED = "outcome_based"


class TrustChannel(str, enum.Enum):
    PrivateBanker = "PrivateBanker"
    Attorney = "Attorney"
    WealthManager = "WealthManager"
    Direct = "Direct"
    REFERRAL = "referral"
    ADVISOR = "advisor"
    FAMILY_OFFICE = "family_office"
    DIGITAL = "digital"
    EVENT = "event"
    MEDIA = "media"


class ComplianceRisk(str, enum.Enum):
    NoneRisk = "NoneRisk"
    Low = "Low"
    Medium = "Medium"
    High = "High"
    RegulatedDomain = "RegulatedDomain"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DeliveryModel(str, enum.Enum):
    DONE_FOR_YOU = "done_for_you"
    DONE_WITH_YOU = "done_with_you"
    ADVISORY = "advisory"
    HYBRID = "hybrid"
    Solo = "Solo"
    Team = "Team"
    Orchestrated = "Orchestrated"
    TechAssisted = "TechAssisted"
    WHITE_GLOVE = "white_glove"
    DIGITAL = "digital"


class ProofMetric(str, enum.Enum):
    HoursSaved = "HoursSaved"
    ExposureScore = "ExposureScore"
    ResponseTime = "ResponseTime"
    RenewalRate = "RenewalRate"
    NPS = "nps"
    RETENTION_RATE = "retention_rate"
    REVENUE_PER_CLIENT = "revenue_per_client"
    CLIENT_LIFETIME_VALUE = "client_lifetime_value"
    REFERRAL_RATE = "referral_rate"


class LifecycleStage(str, enum.Enum):
    Emerging = "Emerging"
    Accelerating = "Accelerating"
    Proven = "Proven"
    Saturated = "Saturated"
    Declining = "Declining"
    EMERGING = "emerging"
    ACCELERATING = "accelerating"
    PROVEN = "proven"
    SATURATED = "saturated"
    DECLINING = "declining"


class UserRole(str, enum.Enum):
    admin = "admin"
    operator = "operator"
    viewer = "viewer"
    OWNER = "owner"
    MEMBER = "member"


class WorkspacePlan(str, enum.Enum):
    core = "core"
    pro = "pro"
    enterprise = "enterprise"


class OfferStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
    SOLD = "sold"
    sunset = "sunset"


class ClientStatus(str, enum.Enum):
    PROSPECT = "prospect"
    ONBOARDING = "onboarding"
    ACTIVE = "active"
    PAUSED = "paused"
    CHURNED = "churned"
    alumni = "alumni"


class SourceType(str, enum.Enum):
    peer_reviewed = "peer_reviewed"
    regulatory = "regulatory"
    industry_report = "industry_report"
    enforcement_action = "enforcement_action"


class ClaimCategory(str, enum.Enum):
    FACTUAL = "factual"
    STATISTICAL = "statistical"
    LEGAL = "legal"
    FINANCIAL = "financial"
    REGULATORY = "regulatory"
    OPINION = "opinion"


class RecencyStatus(str, enum.Enum):
    FRESH = "fresh"
    AGING = "aging"
    STALE = "stale"


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
