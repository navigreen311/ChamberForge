"""Comprehensive seed script for ChamberForge.

Seeds all core entities: workspace, users, playbooks, problems, offers,
clients, household graphs, evidence, and notifications.

All operations are idempotent — safe to run multiple times.
"""
import sys
import os
import uuid
from datetime import date, datetime, timezone

# Allow running from repo root: python -m scripts.seed
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from sqlalchemy import inspect
from app.db.session import engine, SessionLocal, Base

# Import all models so Base.metadata knows every table
from app.models.user import User
from app.models.workspace import Workspace
from app.models.playbook import Playbook
from app.models.problem import Problem
from app.models.offer import Offer
from app.models.client import Client
from app.models.household_graph import HouseholdGraph
from app.models.evidence import Evidence
from app.models.notification import Notification

# Try to import playbook data from seed_playbooks; fall back gracefully
try:
    from scripts.seed_playbooks import PLAYBOOKS as PLAYBOOK_DATA
except ImportError:
    try:
        from seed_playbooks import PLAYBOOKS as PLAYBOOK_DATA
    except ImportError:
        PLAYBOOK_DATA = None


# ---------------------------------------------------------------------------
# Deterministic UUIDs so re-runs are idempotent
# ---------------------------------------------------------------------------
WORKSPACE_ID = uuid.UUID("00000000-0000-4000-a000-000000000001")
ADMIN_USER_ID = uuid.UUID("00000000-0000-4000-a000-000000000010")
OPERATOR_USER_ID = uuid.UUID("00000000-0000-4000-a000-000000000011")

PROBLEM_IDS = [uuid.UUID(f"00000000-0000-4000-b000-00000000000{i}") for i in range(1, 6)]
OFFER_IDS = [uuid.UUID(f"00000000-0000-4000-c000-00000000000{i}") for i in range(1, 4)]
CLIENT_IDS = [uuid.UUID(f"00000000-0000-4000-d000-00000000000{i}") for i in range(1, 6)]
EVIDENCE_IDS = [uuid.UUID(f"00000000-0000-4000-e{i:03d}-000000000001") for i in range(1, 11)]
NOTIFICATION_IDS = [uuid.UUID(f"00000000-0000-4000-f000-00000000000{i}") for i in range(1, 6)]

NOW = datetime.now(timezone.utc)


def _hash_password(plain: str) -> str:
    """Simple bcrypt-style hash. Uses passlib if available, else stores prefixed plaintext."""
    try:
        from passlib.context import CryptContext
        ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return ctx.hash(plain)
    except ImportError:
        # Fallback: store with marker so app layer can detect
        import hashlib
        return "sha256:" + hashlib.sha256(plain.encode()).hexdigest()


def seed_tables():
    """Create all tables if they don't exist."""
    print("Creating tables...")
    Base.metadata.create_all(engine)
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    print(f"  {len(table_names)} tables present: {', '.join(sorted(table_names))}")


def seed_workspace(db):
    """Seed demo workspace."""
    existing = db.query(Workspace).filter_by(slug="demo").first()
    if existing:
        print("  Workspace 'demo' already exists — skipping")
        return
    ws = Workspace(
        id=str(WORKSPACE_ID),
        name="ChamberForge Demo",
        slug="demo",
        plan="enterprise",
        owner_id=str(ADMIN_USER_ID),
        settings={"features": ["voice", "vision", "billing"]},
    )
    db.add(ws)
    db.flush()
    print("  Created workspace: ChamberForge Demo (slug=demo)")


def seed_users(db):
    """Seed admin and operator users."""
    hashed = _hash_password("changeme123")

    users = [
        {
            "id": str(ADMIN_USER_ID),
            "email": "admin@chamberforge.dev",
            "name": "Demo Admin",
            "hashed_password": hashed,
            "role": "admin",
            "workspace_id": str(WORKSPACE_ID),
        },
        {
            "id": str(OPERATOR_USER_ID),
            "email": "operator@chamberforge.dev",
            "name": "Demo Operator",
            "hashed_password": hashed,
            "role": "operator",
            "workspace_id": str(WORKSPACE_ID),
        },
    ]

    for u in users:
        existing = db.query(User).filter_by(email=u["email"]).first()
        if existing:
            print(f"  User {u['email']} already exists — skipping")
            continue
        db.add(User(**u))
        print(f"  Created user: {u['email']} (role={u['role']})")
    db.flush()


def seed_playbooks(db):
    """Seed 10 playbooks from seed_playbooks.py data."""
    if PLAYBOOK_DATA is None:
        print("  Playbook data not importable — skipping playbook seed")
        return

    existing_slugs = {p.slug for p in db.query(Playbook.slug).all()}
    inserted = 0
    for data in PLAYBOOK_DATA:
        if data["slug"] not in existing_slugs:
            db.add(Playbook(**data))
            inserted += 1
    db.flush()
    print(f"  Seeded {inserted} playbooks ({len(PLAYBOOK_DATA) - inserted} already existed)")


def seed_problems(db):
    """Seed 5 sample problems across different tiers and pain categories."""
    problems = [
        {
            "id": str(PROBLEM_IDS[0]),
            "workspace_id": str(WORKSPACE_ID),
            "title": "Multi-entity coordination overload after $80M exit",
            "description": "Founder with 4 LLCs, 2 trusts, and 3 advisors has no single point of coordination. Tax deadlines missed twice this year.",
            "wealth_tier": "UHNWI",
            "buyer_type": "Founder",
            "life_stage": "Peak",
            "trigger_event": "Exit",
            "pain_category": "Coordination",
            "wtp_profile": "MonthlyRetainer",
            "compliance_risk": "Medium",
            "delivery_model": "done_for_you",
            "lifecycle_stage": "Proven",
            "urgency_score": 9,
            "wtp_confidence": 0.85,
            "source": "referral",
            "geo": "US-NY",
            "status": "active",
            "created_by": str(ADMIN_USER_ID),
        },
        {
            "id": str(PROBLEM_IDS[1]),
            "workspace_id": str(WORKSPACE_ID),
            "title": "Deepfake impersonation targeting family office principal",
            "description": "CEO of single-family office received AI-generated voice clone call requesting wire transfer. No incident response protocol exists.",
            "wealth_tier": "FamilyOffice",
            "buyer_type": "Principal",
            "life_stage": "Peak",
            "trigger_event": "Prominence",
            "pain_category": "Security",
            "wtp_profile": "MonthlyRetainer",
            "compliance_risk": "High",
            "delivery_model": "done_for_you",
            "lifecycle_stage": "Accelerating",
            "urgency_score": 10,
            "wtp_confidence": 0.92,
            "source": "direct",
            "geo": "US-CA",
            "status": "active",
            "created_by": str(ADMIN_USER_ID),
        },
        {
            "id": str(PROBLEM_IDS[2]),
            "workspace_id": str(WORKSPACE_ID),
            "title": "Data broker exposure for public-facing tech executive",
            "description": "Home address, phone number, and family members' names found on 60+ data broker sites. Recent stalking incident.",
            "wealth_tier": "HNWI",
            "buyer_type": "Executive",
            "life_stage": "Peak",
            "trigger_event": "Prominence",
            "pain_category": "Privacy",
            "wtp_profile": "Subscription",
            "compliance_risk": "Low",
            "delivery_model": "done_for_you",
            "lifecycle_stage": "Proven",
            "urgency_score": 8,
            "wtp_confidence": 0.78,
            "source": "advisor",
            "geo": "US-TX",
            "status": "active",
            "created_by": str(OPERATOR_USER_ID),
        },
        {
            "id": str(PROBLEM_IDS[3]),
            "workspace_id": str(WORKSPACE_ID),
            "title": "Next-gen disengagement threatening $200M family legacy",
            "description": "Third-generation family members declining governance roles. Two siblings in active dispute over philanthropic direction.",
            "wealth_tier": "Dynasty",
            "buyer_type": "Inheritor",
            "life_stage": "Transfer",
            "trigger_event": "Inheritance",
            "pain_category": "Governance",
            "wtp_profile": "ProjectFee",
            "compliance_risk": "Medium",
            "delivery_model": "advisory",
            "lifecycle_stage": "Emerging",
            "urgency_score": 7,
            "wtp_confidence": 0.65,
            "source": "wealth_manager",
            "geo": "US-IL",
            "status": "active",
            "created_by": str(ADMIN_USER_ID),
        },
        {
            "id": str(PROBLEM_IDS[4]),
            "workspace_id": str(WORKSPACE_ID),
            "title": "Insurance gaps across 5-property portfolio worth $45M",
            "description": "Recent storm damage revealed $3M in uninsured improvements. No consolidated property risk view exists.",
            "wealth_tier": "UHNWI",
            "buyer_type": "Principal",
            "life_stage": "Peak",
            "trigger_event": "Exit",
            "pain_category": "Coordination",
            "wtp_profile": "MonthlyRetainer",
            "compliance_risk": "Low",
            "delivery_model": "hybrid",
            "lifecycle_stage": "Accelerating",
            "urgency_score": 8,
            "wtp_confidence": 0.80,
            "source": "insurance_broker",
            "geo": "US-FL",
            "status": "active",
            "created_by": str(OPERATOR_USER_ID),
        },
    ]

    for p in problems:
        existing = db.query(Problem).filter_by(id=p["id"]).first()
        if existing:
            print(f"  Problem '{p['title'][:50]}...' already exists — skipping")
            continue
        db.add(Problem(**p))
        print(f"  Created problem: {p['title'][:60]}")
    db.flush()


def seed_offers(db):
    """Seed 3 sample offers linked to problems."""
    offers = [
        {
            "id": OFFER_IDS[0],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[0],
            "name": "Private Ops Office — Coordination Package",
            "delivery_model": "done_for_you",
            "status": "active",
            "value_stack": [
                "Single point of coordination for all advisors",
                "Deadline tracking and compliance calendar",
                "Monthly operational review",
                "Emergency escalation protocol",
            ],
            "pricing_model": {"type": "MonthlyRetainer", "base": 15000, "premium": 30000},
            "guarantee_framework": {"metric": "HoursSaved", "target": 40, "refund_policy": "prorated"},
            "sop_bundle": {"phases": ["onboarding", "audit", "orchestration", "optimization"]},
            "created_by": ADMIN_USER_ID,
        },
        {
            "id": OFFER_IDS[1],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[1],
            "name": "Family Cyber Command — Threat Response",
            "delivery_model": "done_for_you",
            "status": "active",
            "value_stack": [
                "24/7 threat monitoring",
                "Deepfake detection and alerting",
                "Wire fraud prevention protocol",
                "Quarterly penetration testing",
            ],
            "pricing_model": {"type": "MonthlyRetainer", "base": 10000, "premium": 25000},
            "guarantee_framework": {"metric": "ResponseTime", "target_hours": 1, "sla": "99.9%"},
            "sop_bundle": {"phases": ["threat_assessment", "hardening", "monitoring", "incident_response"]},
            "created_by": ADMIN_USER_ID,
        },
        {
            "id": OFFER_IDS[2],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[2],
            "name": "Footprint Reduction — Executive Privacy",
            "delivery_model": "done_for_you",
            "status": "draft",
            "value_stack": [
                "Full data broker scan and removal",
                "Ongoing suppression monitoring",
                "Social media exposure audit",
                "Address and phone number protection",
            ],
            "pricing_model": {"type": "Subscription", "base": 8000, "premium": 18000},
            "guarantee_framework": {"metric": "ExposureScore", "target_reduction": "80%"},
            "sop_bundle": {"phases": ["scan", "removal_campaign", "monitoring", "ongoing_suppression"]},
            "created_by": OPERATOR_USER_ID,
        },
    ]

    for o in offers:
        existing = db.query(Offer).filter_by(id=o["id"]).first()
        if existing:
            print(f"  Offer '{o['name'][:50]}' already exists — skipping")
            continue
        db.add(Offer(**o))
        print(f"  Created offer: {o['name']}")
    db.flush()


def seed_clients(db):
    """Seed 5 sample clients with varying health scores."""
    clients = [
        {
            "id": CLIENT_IDS[0],
            "workspace_id": WORKSPACE_ID,
            "name": "Harrison Whitfield III",
            "company": "Whitfield Family Office",
            "wealth_tier": "family_office",
            "status": "active",
            "health_score": 92.5,
        },
        {
            "id": CLIENT_IDS[1],
            "workspace_id": WORKSPACE_ID,
            "name": "Sophia Chen-Martinez",
            "company": "Chen Ventures",
            "wealth_tier": "uhnw",
            "status": "active",
            "health_score": 78.0,
        },
        {
            "id": CLIENT_IDS[2],
            "workspace_id": WORKSPACE_ID,
            "name": "Alexander Petrov",
            "company": "Petrov Capital",
            "wealth_tier": "uhnw",
            "status": "onboarding",
            "health_score": 100.0,
        },
        {
            "id": CLIENT_IDS[3],
            "workspace_id": WORKSPACE_ID,
            "name": "Victoria Okafor-Williams",
            "company": None,
            "wealth_tier": "hnw",
            "status": "active",
            "health_score": 55.0,
        },
        {
            "id": CLIENT_IDS[4],
            "workspace_id": WORKSPACE_ID,
            "name": "James Thornton",
            "company": "Thornton Dynasty Trust",
            "wealth_tier": "family_office",
            "status": "prospect",
            "health_score": 100.0,
        },
    ]

    for c in clients:
        existing = db.query(Client).filter_by(id=c["id"]).first()
        if existing:
            print(f"  Client '{c['name']}' already exists — skipping")
            continue
        db.add(Client(**c))
        print(f"  Created client: {c['name']} (health={c['health_score']})")
    db.flush()


def seed_household_graphs(db):
    """Seed 2 sample household graphs with realistic data."""
    graphs = [
        {
            "id": uuid.UUID("00000000-0000-4000-d100-000000000001"),
            "client_id": CLIENT_IDS[0],
            "members": [
                {"name": "Harrison Whitfield III", "role": "principal", "age": 62},
                {"name": "Eleanor Whitfield", "role": "spouse", "age": 59},
                {"name": "Harrison Whitfield IV", "role": "child", "age": 34},
                {"name": "Catherine Whitfield-Park", "role": "child", "age": 31},
                {"name": "Margaret Whitfield", "role": "parent", "age": 87},
            ],
            "properties": [
                {"address": "740 Park Avenue, New York, NY", "type": "primary", "value": 18500000},
                {"address": "1200 Ocean Blvd, Palm Beach, FL", "type": "secondary", "value": 12000000},
                {"address": "Chemin de Ruth 14, Geneva, CH", "type": "international", "value": 8500000},
            ],
            "staff": [
                {"role": "Estate Manager", "name": "Robert Chen", "tenure_years": 8},
                {"role": "Executive Assistant", "name": "Maria Santos", "tenure_years": 5},
                {"role": "Private Chef", "name": "Jean-Pierre Duval", "tenure_years": 3},
                {"role": "Head of Security", "name": "Michael Torres", "tenure_years": 6},
            ],
            "vendors": [
                {"type": "Wealth Manager", "firm": "Goldman Sachs PWM", "contact": "Sarah Kim"},
                {"type": "Tax Attorney", "firm": "Sullivan & Cromwell", "contact": "David Park"},
                {"type": "Insurance Broker", "firm": "Marsh Private Client", "contact": "Lisa Brown"},
            ],
            "entities": [
                {"name": "Whitfield Family Trust", "type": "irrevocable_trust", "jurisdiction": "DE"},
                {"name": "WF Holdings LLC", "type": "llc", "jurisdiction": "WY"},
                {"name": "Whitfield Foundation", "type": "private_foundation", "jurisdiction": "NY"},
            ],
            "risk_exposures": [
                {"type": "key_person", "severity": "high", "description": "No succession plan for family office CIO"},
                {"type": "cyber", "severity": "medium", "description": "3 family members on social media with location sharing"},
            ],
            "jurisdictions": ["US-NY", "US-FL", "CH-GE", "US-DE", "US-WY"],
        },
        {
            "id": uuid.UUID("00000000-0000-4000-d100-000000000002"),
            "client_id": CLIENT_IDS[1],
            "members": [
                {"name": "Sophia Chen-Martinez", "role": "principal", "age": 45},
                {"name": "Carlos Martinez", "role": "spouse", "age": 48},
                {"name": "Lily Martinez", "role": "child", "age": 12},
                {"name": "Diego Martinez", "role": "child", "age": 9},
            ],
            "properties": [
                {"address": "2100 Pacific Heights, San Francisco, CA", "type": "primary", "value": 9500000},
                {"address": "45 Aspen Mountain Rd, Aspen, CO", "type": "secondary", "value": 6200000},
            ],
            "staff": [
                {"role": "Nanny", "name": "Ana Rivera", "tenure_years": 4},
                {"role": "Property Manager", "name": "Tom Walsh", "tenure_years": 2},
            ],
            "vendors": [
                {"type": "Wealth Manager", "firm": "J.P. Morgan Private Bank", "contact": "Kevin Zhao"},
                {"type": "CPA", "firm": "Deloitte Private", "contact": "Rachel Green"},
            ],
            "entities": [
                {"name": "Chen Ventures LLC", "type": "llc", "jurisdiction": "DE"},
                {"name": "CM Family Trust", "type": "revocable_trust", "jurisdiction": "CA"},
            ],
            "risk_exposures": [
                {"type": "privacy", "severity": "high", "description": "Public profile from tech exit; data broker exposure"},
            ],
            "jurisdictions": ["US-CA", "US-CO", "US-DE"],
        },
    ]

    for g in graphs:
        existing = db.query(HouseholdGraph).filter_by(client_id=g["client_id"]).first()
        if existing:
            print(f"  HouseholdGraph for client {g['client_id']} already exists — skipping")
            continue
        db.add(HouseholdGraph(**g))
        print(f"  Created household graph for client {g['client_id']}")
    db.flush()


def seed_evidence(db):
    """Seed 10 sample evidence records with claims."""
    evidence_records = [
        {
            "id": EVIDENCE_IDS[0],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[0],
            "source_url": "https://www.journalofaccountancy.com/issues/2024/coordination-failures-hnw",
            "source_type": "industry_report",
            "publication_date": date(2024, 6, 15),
            "credibility_score": 8.5,
            "extracted_claims": [
                {"claim": "73% of UHNW families report coordination failures among advisors", "category": "statistical"},
                {"claim": "Average family uses 7.3 separate advisory firms with no integration", "category": "statistical"},
            ],
        },
        {
            "id": EVIDENCE_IDS[1],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[0],
            "source_url": "https://www.barrons.com/articles/family-office-operational-risk-2024",
            "source_type": "industry_report",
            "publication_date": date(2024, 8, 22),
            "credibility_score": 7.8,
            "extracted_claims": [
                {"claim": "Missed tax deadlines cost UHNW families an average of $340K annually", "category": "financial"},
            ],
        },
        {
            "id": EVIDENCE_IDS[2],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[1],
            "source_url": "https://www.fbi.gov/news/stories/deepfake-wire-fraud-2024",
            "source_type": "regulatory",
            "publication_date": date(2024, 3, 10),
            "credibility_score": 9.5,
            "extracted_claims": [
                {"claim": "AI-generated voice clone attacks on HNW targets increased 400% in 2023", "category": "statistical"},
                {"claim": "Average wire fraud loss per incident: $4.7M", "category": "financial"},
            ],
        },
        {
            "id": EVIDENCE_IDS[3],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[1],
            "source_url": "https://arxiv.org/abs/2024.deepfake-detection-survey",
            "source_type": "peer_reviewed",
            "publication_date": date(2024, 5, 1),
            "credibility_score": 9.0,
            "extracted_claims": [
                {"claim": "Current deepfake detection tools have 23% false negative rate on voice clones", "category": "statistical"},
            ],
        },
        {
            "id": EVIDENCE_IDS[4],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[2],
            "source_url": "https://www.privacyrights.org/data-broker-exposure-2024",
            "source_type": "industry_report",
            "publication_date": date(2024, 7, 18),
            "credibility_score": 7.5,
            "extracted_claims": [
                {"claim": "Average high-profile individual appears on 93 data broker sites", "category": "statistical"},
                {"claim": "Full removal takes 6-12 months with ongoing suppression required", "category": "factual"},
            ],
        },
        {
            "id": EVIDENCE_IDS[5],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[2],
            "source_url": "https://www.secret-service.gov/investigation/stalking-threat-data-2024",
            "source_type": "regulatory",
            "publication_date": date(2024, 4, 5),
            "credibility_score": 9.2,
            "extracted_claims": [
                {"claim": "62% of stalking cases against HNW individuals began with data broker information", "category": "statistical"},
            ],
        },
        {
            "id": EVIDENCE_IDS[6],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[3],
            "source_url": "https://www.mckinsey.com/industries/financial-services/next-gen-wealth-transfer",
            "source_type": "industry_report",
            "publication_date": date(2024, 9, 1),
            "credibility_score": 8.0,
            "extracted_claims": [
                {"claim": "70% of wealth transfers fail by the second generation", "category": "statistical"},
                {"claim": "Only 22% of wealthy families have a formal governance framework", "category": "statistical"},
            ],
        },
        {
            "id": EVIDENCE_IDS[7],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[3],
            "source_url": "https://www.familywealthalliance.com/succession-report-2024",
            "source_type": "industry_report",
            "publication_date": date(2024, 2, 15),
            "credibility_score": 7.0,
            "extracted_claims": [
                {"claim": "Next-gen engagement drops 45% when family meetings lack structured facilitation", "category": "statistical"},
            ],
        },
        {
            "id": EVIDENCE_IDS[8],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[4],
            "source_url": "https://www.iii.org/fact-statistic/facts-statistics-homeowners-underinsurance",
            "source_type": "industry_report",
            "publication_date": date(2024, 1, 20),
            "credibility_score": 8.2,
            "extracted_claims": [
                {"claim": "60% of luxury properties are underinsured by an average of 27%", "category": "statistical"},
                {"claim": "Post-disaster claims denial rate for UHNW properties is 34%", "category": "statistical"},
            ],
        },
        {
            "id": EVIDENCE_IDS[9],
            "workspace_id": WORKSPACE_ID,
            "problem_id": PROBLEM_IDS[4],
            "source_url": "https://www.marsh.com/us/insights/private-client-property-resilience",
            "source_type": "industry_report",
            "publication_date": date(2024, 10, 8),
            "credibility_score": 7.6,
            "extracted_claims": [
                {"claim": "Multi-property owners face 3.2x higher risk of coverage gaps than single-property owners", "category": "statistical"},
            ],
        },
    ]

    for e in evidence_records:
        existing = db.query(Evidence).filter_by(id=e["id"]).first()
        if existing:
            print(f"  Evidence '{e['source_url'][:60]}' already exists — skipping")
            continue
        db.add(Evidence(**e))
        print(f"  Created evidence: {e['source_type']} — {e['source_url'][:60]}")
    db.flush()


def seed_notifications(db):
    """Seed sample notifications."""
    notifications = [
        {
            "id": NOTIFICATION_IDS[0],
            "user_id": ADMIN_USER_ID,
            "workspace_id": WORKSPACE_ID,
            "type": "info",
            "title": "Welcome to ChamberForge",
            "body": "Your demo workspace is ready. Explore playbooks, problems, and offers to get started.",
            "action_url": "/dashboard",
            "is_read": False,
        },
        {
            "id": NOTIFICATION_IDS[1],
            "user_id": ADMIN_USER_ID,
            "workspace_id": WORKSPACE_ID,
            "type": "warning",
            "title": "Client health score declining",
            "body": "Victoria Okafor-Williams health score dropped to 55.0. Review recommended.",
            "action_url": f"/clients/{CLIENT_IDS[3]}",
            "is_read": False,
        },
        {
            "id": NOTIFICATION_IDS[2],
            "user_id": OPERATOR_USER_ID,
            "workspace_id": WORKSPACE_ID,
            "type": "critical",
            "title": "Deepfake threat detected",
            "body": "AI-generated voice clone targeting Whitfield Family Office principal detected. Immediate action required.",
            "action_url": f"/problems/{PROBLEM_IDS[1]}",
            "is_read": False,
        },
        {
            "id": NOTIFICATION_IDS[3],
            "user_id": ADMIN_USER_ID,
            "workspace_id": WORKSPACE_ID,
            "type": "info",
            "title": "New offer published",
            "body": "Family Cyber Command — Threat Response offer is now active.",
            "action_url": f"/offers/{OFFER_IDS[1]}",
            "is_read": True,
        },
        {
            "id": NOTIFICATION_IDS[4],
            "user_id": OPERATOR_USER_ID,
            "workspace_id": WORKSPACE_ID,
            "type": "info",
            "title": "Evidence graph updated",
            "body": "3 new evidence records ingested for multi-entity coordination problem.",
            "action_url": f"/problems/{PROBLEM_IDS[0]}/evidence",
            "is_read": False,
        },
    ]

    for n in notifications:
        existing = db.query(Notification).filter_by(id=n["id"]).first()
        if existing:
            print(f"  Notification '{n['title'][:50]}' already exists — skipping")
            continue
        db.add(Notification(**n))
        print(f"  Created notification: {n['title']}")
    db.flush()


def main():
    """Run all seed functions."""
    print("=" * 60)
    print("ChamberForge Database Seed")
    print("=" * 60)

    seed_tables()

    db = SessionLocal()
    try:
        print("\n--- Workspace ---")
        seed_workspace(db)

        print("\n--- Users ---")
        seed_users(db)

        print("\n--- Playbooks ---")
        seed_playbooks(db)

        print("\n--- Problems ---")
        seed_problems(db)

        print("\n--- Offers ---")
        seed_offers(db)

        print("\n--- Clients ---")
        seed_clients(db)

        print("\n--- Household Graphs ---")
        seed_household_graphs(db)

        print("\n--- Evidence ---")
        seed_evidence(db)

        print("\n--- Notifications ---")
        seed_notifications(db)

        db.commit()
        print("\n" + "=" * 60)
        print("Seed complete.")
        print("=" * 60)
        print("\nTest credentials:")
        print("  Admin:    admin@chamberforge.dev / changeme123")
        print("  Operator: operator@chamberforge.dev / changeme123")
    except Exception as exc:
        db.rollback()
        print(f"\nSeed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
