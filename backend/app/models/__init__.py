"""SQLAlchemy models for ChamberForge."""
from app.models.ai_usage import AIUsageLog  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.automation_rule import AutomationRule  # noqa: F401
from app.models.billing import Invoice, Referral, Subscription  # noqa: F401
from app.models.client import Client  # noqa: F401
from app.models.client_portal import ClientPortalAccess  # noqa: F401
from app.models.community_insight import CommunityInsight  # noqa: F401
from app.models.consent import ConsentRecord  # noqa: F401
from app.models.crisis_incident import CrisisIncident  # noqa: F401
from app.models.deletion_request import DeletionRequest  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.drip_status import DripStatus  # noqa: F401
from app.models.email_log import EmailLog  # noqa: F401
from app.models.evidence import Evidence  # noqa: F401
from app.models.feature_flag import FeatureFlag  # noqa: F401
from app.models.household_graph import HouseholdGraph  # noqa: F401
from app.models.legal_hold import LegalHold  # noqa: F401
from app.models.message import SecureMessage  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.offer import Offer  # noqa: F401
from app.models.onboarding import OnboardingProgress  # noqa: F401

# P-01: support tables the later packages fill in. All four are FastAPI-owned
# under D4 - none is a domain model and none appears in the Prisma schema.
from app.models.ontology_extension import OntologyExtension  # noqa: F401,E402
from app.models.playbook import Playbook  # noqa: F401
from app.models.playbook_activation import PlaybookActivation  # noqa: F401
from app.models.problem import Problem  # noqa: F401
from app.models.prompt_version import PromptVersion  # noqa: F401
from app.models.retention_policy import RetentionPolicy  # noqa: F401
from app.models.risk_review import RiskReview  # noqa: F401
from app.models.sandbox_environment import SandboxEnvironment  # noqa: F401,E402
from app.models.scoring_result import ScoringResult  # noqa: F401,E402
from app.models.template_version import TemplateVersion  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.user_mfa import MFAConfig  # noqa: F401
from app.models.wealth_event import WealthEvent  # noqa: F401
from app.models.white_label import WhiteLabelConfig  # noqa: F401
from app.models.workspace import Workspace  # noqa: F401
from app.models.workspace_budget import WorkspaceBudget  # noqa: F401,E402
