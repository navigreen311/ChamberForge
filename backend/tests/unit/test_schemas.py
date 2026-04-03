"""Tests for Pydantic schemas."""
import uuid
from datetime import datetime, date

import pytest

from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.schemas.workspace import WorkspaceCreate, WorkspaceRead, WorkspaceUpdate
from app.schemas.problem import ProblemCreate, ProblemRead, ProblemUpdate
from app.schemas.evidence import EvidenceCreate, EvidenceRead, EvidenceUpdate
from app.schemas.offer import OfferCreate, OfferRead, OfferUpdate
from app.schemas.client import ClientCreate, ClientRead, ClientUpdate
from app.schemas.household_graph import HouseholdGraphCreate, HouseholdGraphRead, HouseholdGraphUpdate
from app.schemas.playbook import PlaybookCreate, PlaybookRead, PlaybookUpdate
from app.schemas.audit_log import AuditLogCreate, AuditLogRead


# ---------- User ----------

class TestUserSchemas:
    def test_user_create_required_fields(self):
        u = UserCreate(email="a@b.com", name="A", password="secret")
        assert u.email == "a@b.com"
        assert u.role == "operator"

    def test_user_create_missing_email_fails(self):
        with pytest.raises(Exception):
            UserCreate(name="A", password="secret")

    def test_user_read_from_attributes(self):
        now = datetime.utcnow()
        uid = uuid.uuid4()

        class FakeUser:
            id = uid
            email = "x@y.com"
            name = "X"
            role = "admin"
            workspace_id = None
            is_active = True
            created_at = now
            updated_at = now

        r = UserRead.model_validate(FakeUser())
        assert r.id == uid
        assert r.role == "admin"

    def test_user_update_partial(self):
        u = UserUpdate(name="New Name")
        assert u.name == "New Name"
        assert u.email is None


# ---------- Workspace ----------

class TestWorkspaceSchemas:
    def test_workspace_create(self):
        w = WorkspaceCreate(name="WS", slug="ws")
        assert w.plan == "core"

    def test_workspace_read_from_attributes(self):
        now = datetime.utcnow()

        class FakeWS:
            id = uuid.uuid4()
            name = "WS"
            slug = "ws"
            plan = "pro"
            owner_id = None
            settings = {"theme": "dark"}
            created_at = now
            updated_at = now

        r = WorkspaceRead.model_validate(FakeWS())
        assert r.plan == "pro"


# ---------- Problem ----------

class TestProblemSchemas:
    def test_problem_create_required(self):
        ws = uuid.uuid4()
        p = ProblemCreate(workspace_id=ws, title="Test")
        assert p.status == "active"

    def test_problem_create_missing_title_fails(self):
        with pytest.raises(Exception):
            ProblemCreate(workspace_id=uuid.uuid4())

    def test_problem_create_with_enum_values(self):
        p = ProblemCreate(
            workspace_id=uuid.uuid4(),
            title="T",
            wealth_tier="UHNWI",
            buyer_type="Founder",
            pain_category="Coordination",
        )
        assert p.wealth_tier == "UHNWI"

    def test_problem_read(self):
        now = datetime.utcnow()

        class FakeP:
            id = uuid.uuid4()
            workspace_id = uuid.uuid4()
            title = "T"
            description = None
            wealth_tier = "HNWI"
            buyer_type = None
            life_stage = None
            trigger_event = None
            pain_category = None
            urgency_score = None
            wtp_profile = None
            trust_channel = None
            compliance_risk = None
            delivery_model = None
            proof_metric = None
            lifecycle_stage = None
            status = "active"
            created_by = None
            created_at = now
            updated_at = now

        r = ProblemRead.model_validate(FakeP())
        assert r.wealth_tier == "HNWI"


# ---------- Evidence ----------

class TestEvidenceSchemas:
    def test_evidence_create(self):
        e = EvidenceCreate(workspace_id=uuid.uuid4())
        assert e.extracted_claims == []

    def test_evidence_read(self):
        now = datetime.utcnow()

        class FakeE:
            id = uuid.uuid4()
            problem_id = None
            workspace_id = uuid.uuid4()
            source_url = "https://example.com"
            source_type = "regulatory"
            publication_date = date(2025, 1, 1)
            credibility_score = 0.9
            extracted_claims = ["claim1"]
            contradiction_flags = []
            recency_decay_score = 0.1
            created_at = now
            updated_at = now

        r = EvidenceRead.model_validate(FakeE())
        assert r.source_type == "regulatory"


# ---------- Offer ----------

class TestOfferSchemas:
    def test_offer_create(self):
        o = OfferCreate(workspace_id=uuid.uuid4(), name="O")
        assert o.status == "draft"

    def test_offer_create_missing_name_fails(self):
        with pytest.raises(Exception):
            OfferCreate(workspace_id=uuid.uuid4())


# ---------- Client ----------

class TestClientSchemas:
    def test_client_create(self):
        c = ClientCreate(workspace_id=uuid.uuid4(), name="Client A")
        assert c.status == "prospect"

    def test_client_read(self):
        now = datetime.utcnow()

        class FakeC:
            id = uuid.uuid4()
            workspace_id = uuid.uuid4()
            name = "C"
            company = "Corp"
            wealth_tier = "HNWI"
            buyer_type = "Executive"
            life_stage = "Peak"
            status = "active"
            onboarded_at = now
            health_score = 95.0
            created_at = now
            updated_at = now

        r = ClientRead.model_validate(FakeC())
        assert r.health_score == 95.0


# ---------- HouseholdGraph ----------

class TestHouseholdGraphSchemas:
    def test_household_graph_create(self):
        hg = HouseholdGraphCreate(client_id=uuid.uuid4())
        assert hg.members == []
        assert hg.jurisdictions == []

    def test_household_graph_read(self):
        now = datetime.utcnow()

        class FakeHG:
            id = uuid.uuid4()
            client_id = uuid.uuid4()
            members = [{"name": "John"}]
            properties = []
            staff = []
            vendors = []
            entities = []
            risk_exposures = []
            jurisdictions = ["US", "UK"]
            updated_at = now

        r = HouseholdGraphRead.model_validate(FakeHG())
        assert len(r.jurisdictions) == 2


# ---------- Playbook ----------

class TestPlaybookSchemas:
    def test_playbook_create(self):
        pb = PlaybookCreate(slug="test", name="Test")
        assert pb.icp == {}
        assert pb.pain_triggers == []

    def test_playbook_read(self):
        class FakePB:
            id = uuid.uuid4()
            slug = "test"
            name = "Test"
            target_buyer = "Founders"
            price_range_min = 10000.0
            price_range_max = 25000.0
            core_pain = "Coordination"
            icp = {"wealth_tier": "UHNWI"}
            pain_triggers = ["exit"]
            pricing_model = {"type": "retainer"}
            sop_skeleton = {}
            trust_concerns = []
            kpi_stack = [{"metric": "HoursSaved"}]

        r = PlaybookRead.model_validate(FakePB())
        assert r.price_range_min == 10000.0


# ---------- AuditLog ----------

class TestAuditLogSchemas:
    def test_audit_log_create(self):
        al = AuditLogCreate(
            workspace_id=uuid.uuid4(),
            action="create",
            resource_type="problem",
        )
        assert al.details == {}

    def test_audit_log_read(self):
        now = datetime.utcnow()

        class FakeAL:
            id = uuid.uuid4()
            workspace_id = uuid.uuid4()
            user_id = None
            action = "delete"
            resource_type = "offer"
            resource_id = uuid.uuid4()
            details = {"reason": "test"}
            ip_address = "127.0.0.1"
            timestamp = now

        r = AuditLogRead.model_validate(FakeAL())
        assert r.action == "delete"
