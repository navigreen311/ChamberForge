"""Tests for SQLAlchemy models and enums."""
import uuid

from app.models.audit_log import AuditLog
from app.models.client import Client
from app.models.enums import (
    BuyerType,
    ClientStatus,
    ComplianceRisk,
    DeliveryModel,
    LifecycleStage,
    LifeStage,
    OfferStatus,
    PainCategory,
    ProofMetric,
    SourceType,
    TriggerEvent,
    TrustChannel,
    UserRole,
    WealthTier,
    WorkspacePlan,
    WTPProfile,
)
from app.models.evidence import Evidence
from app.models.household_graph import HouseholdGraph
from app.models.offer import Offer
from app.models.playbook import Playbook
from app.models.problem import Problem
from app.models.user import User
from app.models.workspace import Workspace

# ---------- Enum tests ----------

class TestEnums:
    def test_wealth_tier_values(self):
        assert WealthTier.HNWI.value == "HNWI"
        assert WealthTier.UHNWI.value == "UHNWI"
        assert WealthTier.FamilyOffice.value == "FamilyOffice"
        assert WealthTier.Dynasty.value == "Dynasty"
        # Merged enum may have additional values from different worktrees
        assert len(WealthTier) >= 4

    def test_buyer_type_values(self):
        assert BuyerType.Founder.value == "Founder"
        assert len(BuyerType) >= 4

    def test_life_stage_values(self):
        expected = {"Accumulation", "Peak", "Transfer", "Legacy"}
        actual = {ls.value for ls in LifeStage}
        assert expected.issubset(actual)

    def test_trigger_event_values(self):
        assert TriggerEvent.IPO.value == "IPO"
        assert len(TriggerEvent) >= 5

    def test_pain_category_values(self):
        assert PainCategory.Coordination.value == "Coordination"
        assert len(PainCategory) >= 6

    def test_wtp_profile_values(self):
        assert len(WTPProfile) >= 3

    def test_trust_channel_values(self):
        assert TrustChannel.PrivateBanker.value == "PrivateBanker"
        assert len(TrustChannel) >= 4

    def test_compliance_risk_values(self):
        assert ComplianceRisk.NoneRisk.value == "NoneRisk"
        assert ComplianceRisk.RegulatedDomain.value == "RegulatedDomain"
        assert len(ComplianceRisk) >= 5

    def test_delivery_model_values(self):
        assert DeliveryModel.TechAssisted.value == "TechAssisted"
        assert len(DeliveryModel) >= 4

    def test_proof_metric_values(self):
        assert len(ProofMetric) >= 4

    def test_lifecycle_stage_values(self):
        assert len(LifecycleStage) >= 5

    def test_user_role_values(self):
        assert UserRole.admin.value == "admin"
        assert len(UserRole) >= 3

    def test_workspace_plan_values(self):
        assert len(WorkspacePlan) >= 3

    def test_offer_status_values(self):
        assert OfferStatus.DRAFT.value == "draft"
        assert len(OfferStatus) >= 3

    def test_client_status_values(self):
        assert len(ClientStatus) >= 3

    def test_source_type_values(self):
        assert SourceType.peer_reviewed.value == "peer_reviewed"
        assert len(SourceType) >= 4

    def test_enum_is_str(self):
        """All enums should be string enums."""
        assert isinstance(WealthTier.HNWI, str)
        assert isinstance(UserRole.admin, str)
        assert isinstance(SourceType.regulatory, str)


# ---------- Model instantiation tests ----------

class TestUserModel:
    def test_create_user(self):
        u = User(
            id=uuid.uuid4(),
            email="test@example.com",
            name="Test User",
            hashed_password="hashed",
            role="operator",
            is_active=True,
        )
        assert u.email == "test@example.com"
        assert u.role == "operator"
        assert u.is_active is True


class TestWorkspaceModel:
    def test_create_workspace(self):
        w = Workspace(
            id=uuid.uuid4(),
            name="Test Workspace",
            slug="test-workspace",
            plan="core",
        )
        assert w.slug == "test-workspace"
        assert w.plan == "core"


class TestProblemModel:
    def test_create_problem(self):
        ws_id = uuid.uuid4()
        p = Problem(
            id=uuid.uuid4(),
            workspace_id=ws_id,
            title="Test Problem",
            description="A test problem",
            wealth_tier="UHNWI",
            status="active",
        )
        assert p.title == "Test Problem"
        assert p.workspace_id == ws_id

    def test_problem_has_relationship_attrs(self):
        """Problem should declare evidences and offers relationships."""
        Problem(
            id=uuid.uuid4(),
            workspace_id=uuid.uuid4(),
            title="Rel test",
        )
        # Relationship descriptors exist on the class
        assert hasattr(Problem, "evidences")
        assert hasattr(Problem, "offers")


class TestEvidenceModel:
    def test_create_evidence(self):
        e = Evidence(
            id=uuid.uuid4(),
            workspace_id=uuid.uuid4(),
            source_url="https://example.com",
            source_type="peer_reviewed",
            credibility_score=0.85,
        )
        assert e.source_type == "peer_reviewed"
        assert e.credibility_score == 0.85


class TestOfferModel:
    def test_create_offer(self):
        o = Offer(
            id=uuid.uuid4(),
            workspace_id=uuid.uuid4(),
            name="Premium Offer",
            status="draft",
        )
        assert o.name == "Premium Offer"
        assert o.status == "draft"


class TestClientModel:
    def test_create_client(self):
        c = Client(
            id=uuid.uuid4(),
            workspace_id=uuid.uuid4(),
            name="Jane Doe",
            company="Doe Holdings",
            wealth_tier="UHNWI",
            status="prospect",
        )
        assert c.name == "Jane Doe"
        assert c.health_score is None or c.health_score == 100.0


class TestHouseholdGraphModel:
    def test_create_household_graph(self):
        hg = HouseholdGraph(
            id=uuid.uuid4(),
            client_id=uuid.uuid4(),
        )
        assert hg.client_id is not None


class TestPlaybookModel:
    def test_create_playbook(self):
        pb = Playbook(
            id=uuid.uuid4(),
            slug="test-playbook",
            name="Test Playbook",
            target_buyer="Founders",
            price_range_min=10000,
            price_range_max=25000,
            core_pain="Coordination",
        )
        assert pb.slug == "test-playbook"
        assert pb.price_range_min == 10000


class TestAuditLogModel:
    def test_create_audit_log(self):
        al = AuditLog(
            id=uuid.uuid4(),
            workspace_id=uuid.uuid4(),
            action="create",
            resource_type="problem",
            resource_id=uuid.uuid4(),
        )
        assert al.action == "create"
        assert al.resource_type == "problem"
