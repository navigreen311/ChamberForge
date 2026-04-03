"""Domain enums for ChamberForge."""
import enum


class WealthTier(str, enum.Enum):
    HNWI = "HNWI"
    UHNWI = "UHNWI"
    FamilyOffice = "FamilyOffice"
    Dynasty = "Dynasty"


class BuyerType(str, enum.Enum):
    Founder = "Founder"
    Inheritor = "Inheritor"
    Executive = "Executive"
    Principal = "Principal"


class LifeStage(str, enum.Enum):
    Accumulation = "Accumulation"
    Peak = "Peak"
    Transfer = "Transfer"
    Legacy = "Legacy"


class TriggerEvent(str, enum.Enum):
    Exit = "Exit"
    IPO = "IPO"
    Inheritance = "Inheritance"
    Divorce = "Divorce"
    Prominence = "Prominence"


class PainCategory(str, enum.Enum):
    Coordination = "Coordination"
    Security = "Security"
    Privacy = "Privacy"
    Governance = "Governance"
    Medical = "Medical"
    Travel = "Travel"


class WTPProfile(str, enum.Enum):
    MonthlyRetainer = "MonthlyRetainer"
    ProjectFee = "ProjectFee"
    Subscription = "Subscription"


class TrustChannel(str, enum.Enum):
    PrivateBanker = "PrivateBanker"
    Attorney = "Attorney"
    WealthManager = "WealthManager"
    Direct = "Direct"


class ComplianceRisk(str, enum.Enum):
    NoneRisk = "NoneRisk"
    Low = "Low"
    Medium = "Medium"
    High = "High"
    RegulatedDomain = "RegulatedDomain"


class DeliveryModel(str, enum.Enum):
    Solo = "Solo"
    Team = "Team"
    Orchestrated = "Orchestrated"
    TechAssisted = "TechAssisted"


class ProofMetric(str, enum.Enum):
    HoursSaved = "HoursSaved"
    ExposureScore = "ExposureScore"
    ResponseTime = "ResponseTime"
    RenewalRate = "RenewalRate"


class LifecycleStage(str, enum.Enum):
    Emerging = "Emerging"
    Accelerating = "Accelerating"
    Proven = "Proven"
    Saturated = "Saturated"
    Declining = "Declining"


class UserRole(str, enum.Enum):
    admin = "admin"
    operator = "operator"
    viewer = "viewer"


class WorkspacePlan(str, enum.Enum):
    core = "core"
    pro = "pro"
    enterprise = "enterprise"


class OfferStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    sunset = "sunset"


class ClientStatus(str, enum.Enum):
    prospect = "prospect"
    active = "active"
    alumni = "alumni"


class SourceType(str, enum.Enum):
    peer_reviewed = "peer_reviewed"
    regulatory = "regulatory"
    industry_report = "industry_report"
    enforcement_action = "enforcement_action"
