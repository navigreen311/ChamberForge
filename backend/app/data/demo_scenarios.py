"""Demo Scenarios — Rich, realistic data for ChamberForge sandbox environments.

Each scenario is a self-contained dict with all ChamberForge primitives:
client, problem, offer, household_graph, evidence, kpis, notifications,
playbook_activations, and health_score.

All IDs use deterministic UUIDs (uuid5 from scenario namespace) so that
cross-references are stable across resets.
"""

import uuid
from datetime import datetime, timedelta, timezone

# Deterministic namespace for reproducible IDs across resets
_NS = uuid.UUID("c4a3b2e1-0000-4000-8000-000000000000")


def _id(label: str) -> str:
    """Generate a deterministic UUID string from a label."""
    return str(uuid.uuid5(_NS, label))


def _ts(days_ago: int = 0, hours_ago: int = 0) -> str:
    """ISO timestamp relative to 'now' (deterministic base: 2026-04-03T12:00Z)."""
    base = datetime(2026, 4, 3, 12, 0, 0, tzinfo=timezone.utc)
    return (base - timedelta(days=days_ago, hours=hours_ago)).isoformat()


# ---------------------------------------------------------------------------
# Scenario 1: Private Ops Office for Tech Founder
# ---------------------------------------------------------------------------

SCENARIO_1 = {
    "id": _id("scenario-1"),
    "name": "Private Ops Office for Tech Founder",
    "client": {
        "id": _id("s1-client"),
        "name": "Sarah Chen",
        "email": "sarah.chen@example.com",
        "tier": "UHNW",
        "net_worth": 45_000_000,
        "background": "Recently exited founder (Series C SaaS company acquired for $120M). "
        "Three properties, eight household staff, two school-age children.",
        "status": "active",
        "created_at": _ts(days_ago=90),
    },
    "problem": {
        "id": _id("s1-problem"),
        "client_id": _id("s1-client"),
        "title": "Coordination Overload — Household & Life Operations",
        "description": (
            "Sarah's post-exit life is operationally complex: missed school "
            "enrollment deadlines, double-booked travel across 3 properties, "
            "vendor invoices falling through the cracks, and no single point "
            "of accountability for her 8-person household staff. She estimates "
            "15+ hours/week lost to coordination overhead."
        ),
        "category": "operations",
        "severity": "high",
        "status": "qualified",
        "created_at": _ts(days_ago=85),
    },
    "offer": {
        "id": _id("s1-offer"),
        "client_id": _id("s1-client"),
        "problem_id": _id("s1-problem"),
        "title": "Private Ops Office",
        "description": (
            "Dedicated operations layer for the Chen household: single point "
            "of contact for all vendors, calendar orchestration across 3 "
            "properties, staff management protocols, and emergency response "
            "playbook. Monthly retainer includes 24/7 on-call support."
        ),
        "price_monthly": 22_000,
        "price_annual": 250_000,
        "status": "active",
        "accepted_at": _ts(days_ago=75),
        "created_at": _ts(days_ago=80),
    },
    "household_graph": {
        "id": _id("s1-household"),
        "client_id": _id("s1-client"),
        "family_members": [
            {"id": _id("s1-fm-sarah"), "name": "Sarah Chen", "role": "Principal", "age": 42},
            {"id": _id("s1-fm-michael"), "name": "Michael Chen", "role": "Spouse", "age": 44},
            {"id": _id("s1-fm-emma"), "name": "Emma Chen", "role": "Child", "age": 14},
            {"id": _id("s1-fm-lucas"), "name": "Lucas Chen", "role": "Child", "age": 11},
        ],
        "properties": [
            {
                "id": _id("s1-prop-nyc"),
                "name": "NYC Penthouse",
                "type": "primary_residence",
                "location": "Upper East Side, New York, NY",
                "value": 12_500_000,
            },
            {
                "id": _id("s1-prop-hamptons"),
                "name": "Hamptons House",
                "type": "vacation",
                "location": "East Hampton, NY",
                "value": 8_200_000,
            },
            {
                "id": _id("s1-prop-aspen"),
                "name": "Aspen Ski Condo",
                "type": "vacation",
                "location": "Aspen, CO",
                "value": 5_800_000,
            },
        ],
        "staff": [
            {"id": _id("s1-staff-1"), "name": "Maria Gonzalez", "role": "House Manager", "property": "NYC Penthouse"},
            {"id": _id("s1-staff-2"), "name": "James Park", "role": "Personal Assistant", "property": "All"},
            {"id": _id("s1-staff-3"), "name": "Elena Ruiz", "role": "Nanny", "property": "NYC Penthouse"},
            {"id": _id("s1-staff-4"), "name": "Tom Wheeler", "role": "Driver", "property": "NYC Penthouse"},
            {"id": _id("s1-staff-5"), "name": "Claire Dubois", "role": "Chef", "property": "NYC Penthouse"},
            {"id": _id("s1-staff-6"), "name": "Ryan Mitchell", "role": "Property Manager", "property": "Hamptons House"},
            {"id": _id("s1-staff-7"), "name": "Ana Silva", "role": "Housekeeper", "property": "Hamptons House"},
            {"id": _id("s1-staff-8"), "name": "Jake Collins", "role": "Caretaker", "property": "Aspen Ski Condo"},
        ],
        "vendors": [
            {"id": _id("s1-vendor-1"), "name": "Gotham Private Security", "category": "security"},
            {"id": _id("s1-vendor-2"), "name": "Artisan Home Systems", "category": "smart_home"},
            {"id": _id("s1-vendor-3"), "name": "Dalton School", "category": "education"},
            {"id": _id("s1-vendor-4"), "name": "NetJets", "category": "travel"},
            {"id": _id("s1-vendor-5"), "name": "Dr. Lauren West (Concierge MD)", "category": "health"},
            {"id": _id("s1-vendor-6"), "name": "Sotheby's Art Advisory", "category": "art"},
            {"id": _id("s1-vendor-7"), "name": "Hamptons Landscaping Co.", "category": "property"},
            {"id": _id("s1-vendor-8"), "name": "Aspen Ski & Snowboard", "category": "recreation"},
            {"id": _id("s1-vendor-9"), "name": "Blue Apron Private Chef Supply", "category": "food"},
            {"id": _id("s1-vendor-10"), "name": "Sterling Insurance Group", "category": "insurance"},
            {"id": _id("s1-vendor-11"), "name": "TechShield Cyber", "category": "cybersecurity"},
            {"id": _id("s1-vendor-12"), "name": "Park Avenue Wealth Advisors", "category": "financial"},
        ],
        "entities": [],
    },
    "evidence": [
        {
            "id": _id("s1-ev-1"),
            "client_id": _id("s1-client"),
            "title": "Harvard Business Review: Time Cost of Household Complexity",
            "source": "Harvard Business Review",
            "type": "research",
            "summary": "HNW individuals with 3+ properties lose an average of 18.5 hours/week "
            "to household coordination. Delegating to a dedicated ops layer recovers "
            "12-15 hours/week within 90 days.",
            "url": "https://hbr.org/2025/09/the-hidden-cost-of-household-complexity",
            "relevance_score": 0.95,
            "created_at": _ts(days_ago=82),
        },
        {
            "id": _id("s1-ev-2"),
            "client_id": _id("s1-client"),
            "title": "FBI Cyber Division: Threat Landscape for High-Net-Worth Individuals",
            "source": "FBI Cyber Division",
            "type": "threat_intelligence",
            "summary": "FBI alert IC3-2026-004: Coordinated social engineering attacks targeting "
            "household staff of UHNW families increased 340% YoY. Recommends centralized "
            "communications protocols.",
            "url": "https://ic3.gov/alerts/2026/ic3-2026-004",
            "relevance_score": 0.88,
            "created_at": _ts(days_ago=78),
        },
        {
            "id": _id("s1-ev-3"),
            "client_id": _id("s1-client"),
            "title": "UBS Global Wealth Report 2026: Lifestyle Services Demand",
            "source": "UBS",
            "type": "market_research",
            "summary": "73% of UHNW individuals ($30M+) now consider dedicated household "
            "operations management a necessity, not a luxury. Average spend on "
            "lifestyle management: $180K-$300K/year.",
            "url": "https://ubs.com/global-wealth-report-2026",
            "relevance_score": 0.91,
            "created_at": _ts(days_ago=76),
        },
    ],
    "kpis": [
        {"name": "Calendar Conflicts", "current": 1, "target": 0, "unit": "per_month", "trend": "improving"},
        {"name": "Vendor Response Time", "current": 3.2, "target": 4.0, "unit": "hours", "trend": "on_target"},
        {"name": "Emergency Protocol Activation", "current": 12, "target": 15, "unit": "minutes", "trend": "on_target"},
        {"name": "Staff Satisfaction Score", "current": 8.7, "target": 8.0, "unit": "out_of_10", "trend": "exceeding"},
        {"name": "Coordination Hours Saved", "current": 13.5, "target": 12.0, "unit": "hours_per_week", "trend": "exceeding"},
    ],
    "notifications": [
        {
            "id": _id("s1-notif-1"),
            "type": "milestone",
            "title": "90-Day Review Approaching",
            "message": "Sarah Chen's Private Ops Office engagement hits 90 days on April 15. "
            "Schedule quarterly review.",
            "priority": "medium",
            "read": False,
            "created_at": _ts(days_ago=2),
        },
        {
            "id": _id("s1-notif-2"),
            "type": "success",
            "title": "Zero Calendar Conflicts This Month",
            "message": "March 2026 closed with zero scheduling conflicts across all 3 properties.",
            "priority": "low",
            "read": True,
            "created_at": _ts(days_ago=5),
        },
    ],
    "playbook_activations": [
        {
            "id": _id("s1-pb-1"),
            "playbook_name": "Private Ops Office",
            "client_id": _id("s1-client"),
            "status": "active",
            "step": "ongoing_delivery",
            "started_at": _ts(days_ago=75),
            "milestones_completed": [
                "discovery_call",
                "household_audit",
                "staff_onboarding",
                "vendor_consolidation",
                "protocol_deployment",
            ],
        },
    ],
    "health_score": {
        "score": 87,
        "label": "Strong Engagement",
        "factors": {
            "engagement_frequency": 92,
            "kpi_performance": 90,
            "payment_consistency": 100,
            "nps_score": 72,
            "support_ticket_volume": 85,
        },
        "risk_level": "low",
        "last_updated": _ts(days_ago=1),
    },
}


# ---------------------------------------------------------------------------
# Scenario 2: Family Cyber Command for Family Office
# ---------------------------------------------------------------------------

SCENARIO_2 = {
    "id": _id("scenario-2"),
    "name": "Family Cyber Command for Family Office",
    "client": {
        "id": _id("s2-client"),
        "name": "The Wellington Family Trust",
        "email": "ops@wellingtonfamilyoffice.com",
        "tier": "UHNW",
        "net_worth": 180_000_000,
        "background": "Multi-generational family office managing $180M AUM. Four-person "
        "office team. Recently experienced an AI-powered impersonation attack "
        "targeting the CFO — a $2.3M wire fraud was stopped at the last minute.",
        "status": "active",
        "created_at": _ts(days_ago=45),
    },
    "problem": {
        "id": _id("s2-problem"),
        "client_id": _id("s2-client"),
        "title": "AI Impersonation Attack — Cybersecurity Gaps in Family Office",
        "description": (
            "A deepfake voice call impersonating patriarch Robert Wellington "
            "instructed CFO Margaret Torres to initiate a $2.3M wire transfer "
            "to a Hong Kong account. Torres caught the fraud only because the "
            "caller used an outdated family code phrase. The family office has "
            "no formal cybersecurity protocols, no MFA on financial systems, "
            "and no incident response plan."
        ),
        "category": "cybersecurity",
        "severity": "critical",
        "status": "qualified",
        "created_at": _ts(days_ago=42),
    },
    "offer": {
        "id": _id("s2-offer"),
        "client_id": _id("s2-client"),
        "problem_id": _id("s2-problem"),
        "title": "Family Cyber Command",
        "description": (
            "Comprehensive cybersecurity layer for the Wellington Family Office: "
            "24/7 threat monitoring, deepfake detection protocols, MFA deployment "
            "across all financial systems, staff security training, incident "
            "response playbook, and quarterly penetration testing."
        ),
        "price_monthly": 18_000,
        "price_annual": 200_000,
        "status": "active",
        "accepted_at": _ts(days_ago=35),
        "created_at": _ts(days_ago=40),
    },
    "household_graph": {
        "id": _id("s2-household"),
        "client_id": _id("s2-client"),
        "family_members": [
            {"id": _id("s2-fm-robert"), "name": "Robert Wellington", "role": "Patriarch", "age": 71},
            {"id": _id("s2-fm-elizabeth"), "name": "Elizabeth Wellington", "role": "Matriarch", "age": 68},
            {"id": _id("s2-fm-james"), "name": "James Wellington", "role": "Son / CEO", "age": 45},
            {"id": _id("s2-fm-catherine"), "name": "Catherine Wellington-Park", "role": "Daughter", "age": 42},
            {"id": _id("s2-fm-oliver"), "name": "Oliver Wellington", "role": "Grandson", "age": 19},
            {"id": _id("s2-fm-sophia"), "name": "Sophia Wellington", "role": "Granddaughter", "age": 16},
        ],
        "properties": [
            {
                "id": _id("s2-prop-greenwich"),
                "name": "Greenwich Estate",
                "type": "primary_residence",
                "location": "Greenwich, CT",
                "value": 18_500_000,
            },
            {
                "id": _id("s2-prop-palm"),
                "name": "Palm Beach Residence",
                "type": "vacation",
                "location": "Palm Beach, FL",
                "value": 9_200_000,
            },
        ],
        "staff": [
            {"id": _id("s2-staff-1"), "name": "Margaret Torres", "role": "CFO", "property": "Family Office"},
            {"id": _id("s2-staff-2"), "name": "David Kim", "role": "COO", "property": "Family Office"},
            {"id": _id("s2-staff-3"), "name": "Lisa Brennan", "role": "Executive Assistant", "property": "Family Office"},
            {"id": _id("s2-staff-4"), "name": "Carlos Mendez", "role": "Investment Analyst", "property": "Family Office"},
        ],
        "vendors": [
            {"id": _id("s2-vendor-1"), "name": "JPMorgan Private Bank", "category": "banking"},
            {"id": _id("s2-vendor-2"), "name": "Sullivan & Cromwell LLP", "category": "legal"},
            {"id": _id("s2-vendor-3"), "name": "PwC Family Office Services", "category": "accounting"},
            {"id": _id("s2-vendor-4"), "name": "Marsh Private Client", "category": "insurance"},
            {"id": _id("s2-vendor-5"), "name": "CrowdStrike", "category": "cybersecurity"},
            {"id": _id("s2-vendor-6"), "name": "Bessemer Trust", "category": "investment"},
            {"id": _id("s2-vendor-7"), "name": "Northern Trust", "category": "custody"},
            {"id": _id("s2-vendor-8"), "name": "Kroll", "category": "investigations"},
        ],
        "entities": [
            {"id": _id("s2-entity-1"), "name": "Wellington Family Trust", "type": "trust", "jurisdiction": "Delaware"},
            {"id": _id("s2-entity-2"), "name": "Wellington Holdings LLC", "type": "llc", "jurisdiction": "Delaware"},
            {"id": _id("s2-entity-3"), "name": "Wellington Philanthropy Foundation", "type": "foundation", "jurisdiction": "Connecticut"},
        ],
    },
    "evidence": [
        {
            "id": _id("s2-ev-1"),
            "client_id": _id("s2-client"),
            "title": "FBI Alert: AI-Powered Impersonation Targeting Family Offices",
            "source": "FBI Cyber Division",
            "type": "threat_intelligence",
            "summary": "FBI PSA I-030526-PSA: AI-generated voice and video deepfakes used "
            "in 67 confirmed attacks on family offices in Q1 2026, with $340M in "
            "attempted fraud. Average loss per successful attack: $4.7M.",
            "url": "https://ic3.gov/PSA/2026/PSA-I-030526",
            "relevance_score": 0.98,
            "created_at": _ts(days_ago=38),
        },
        {
            "id": _id("s2-ev-2"),
            "client_id": _id("s2-client"),
            "title": "Deloitte: Family Office Cybersecurity Readiness Report 2026",
            "source": "Deloitte",
            "type": "market_research",
            "summary": "Only 23% of family offices have a formal incident response plan. "
            "61% lack MFA on wire transfer systems. Average time to detect a "
            "breach: 197 days. Recommended annual cybersecurity spend: 2-4% of AUM.",
            "url": "https://deloitte.com/fo-cyber-readiness-2026",
            "relevance_score": 0.94,
            "created_at": _ts(days_ago=36),
        },
    ],
    "kpis": [
        {"name": "MFA Coverage", "current": 85, "target": 100, "unit": "percent", "trend": "improving"},
        {"name": "Phishing Simulation Pass Rate", "current": 72, "target": 95, "unit": "percent", "trend": "improving"},
        {"name": "Incident Response Time", "current": 22, "target": 15, "unit": "minutes", "trend": "improving"},
        {"name": "Security Training Completion", "current": 100, "target": 100, "unit": "percent", "trend": "on_target"},
        {"name": "Vulnerability Scan Frequency", "current": 2, "target": 4, "unit": "per_month", "trend": "behind"},
    ],
    "crisis_incident": {
        "id": _id("s2-crisis"),
        "client_id": _id("s2-client"),
        "title": "AI Voice Deepfake Wire Fraud Attempt",
        "severity": "critical",
        "status": "resolved",
        "description": (
            "At 2:47 PM EST on Feb 18, 2026, CFO Margaret Torres received a phone "
            "call that appeared to be from Robert Wellington's personal mobile. The "
            "AI-generated voice instructed her to wire $2.3M to a Hong Kong account "
            "for an 'urgent real estate acquisition.' Torres initiated the transfer "
            "but paused when the caller used the outdated family verification phrase "
            "'blue horizon' instead of the current 'silver gate.' She terminated the "
            "call and contacted Robert directly, confirming the fraud."
        ),
        "timeline": [
            {"time": "2026-02-18T14:47:00Z", "event": "Fraudulent call received by CFO"},
            {"time": "2026-02-18T14:52:00Z", "event": "Wire transfer initiated ($2.3M)"},
            {"time": "2026-02-18T14:55:00Z", "event": "CFO detects outdated verification phrase"},
            {"time": "2026-02-18T14:56:00Z", "event": "Call terminated, transfer halted"},
            {"time": "2026-02-18T15:02:00Z", "event": "Robert Wellington confirms he did not call"},
            {"time": "2026-02-18T15:15:00Z", "event": "Bank notified, transfer reversed"},
            {"time": "2026-02-18T16:00:00Z", "event": "FBI IC3 report filed"},
            {"time": "2026-02-19T09:00:00Z", "event": "ChamberForge engagement initiated"},
        ],
        "financial_impact_prevented": 2_300_000,
        "created_at": "2026-02-18T14:47:00Z",
        "resolved_at": "2026-02-18T16:00:00Z",
    },
    "notifications": [
        {
            "id": _id("s2-notif-1"),
            "type": "alert",
            "title": "MFA Rollout Incomplete — 3 Systems Remaining",
            "message": "Wellington Family Office: MFA still not enabled on Bessemer Trust portal, "
            "Northern Trust custody, and internal SharePoint. Deadline: April 10.",
            "priority": "high",
            "read": False,
            "created_at": _ts(days_ago=1),
        },
        {
            "id": _id("s2-notif-2"),
            "type": "warning",
            "title": "Phishing Simulation — 2 Staff Members Failed",
            "message": "Q1 phishing simulation: Lisa Brennan and Carlos Mendez clicked on "
            "the test phishing link. Remedial training scheduled.",
            "priority": "medium",
            "read": False,
            "created_at": _ts(days_ago=3),
        },
        {
            "id": _id("s2-notif-3"),
            "type": "info",
            "title": "Quarterly Pen Test Scheduled",
            "message": "CrowdStrike penetration test for Wellington FO scheduled for April 15-17.",
            "priority": "low",
            "read": True,
            "created_at": _ts(days_ago=7),
        },
    ],
    "playbook_activations": [
        {
            "id": _id("s2-pb-1"),
            "playbook_name": "Family Cyber Command",
            "client_id": _id("s2-client"),
            "status": "active",
            "step": "hardening_phase",
            "started_at": _ts(days_ago=35),
            "milestones_completed": [
                "emergency_triage",
                "threat_assessment",
                "mfa_deployment_phase1",
                "staff_training_round1",
                "incident_response_plan_drafted",
            ],
        },
    ],
    "health_score": {
        "score": 72,
        "label": "At Risk — Recent Incident",
        "factors": {
            "engagement_frequency": 95,
            "kpi_performance": 62,
            "payment_consistency": 100,
            "nps_score": 55,
            "support_ticket_volume": 50,
        },
        "risk_level": "medium",
        "churn_risk": "elevated",
        "churn_reason": "Client confidence shaken by near-miss fraud. KPIs still below target.",
        "last_updated": _ts(days_ago=1),
    },
}


# ---------------------------------------------------------------------------
# Scenario 3: Ecosystem Orchestrator for UHNW Dynasty
# ---------------------------------------------------------------------------

SCENARIO_3 = {
    "id": _id("scenario-3"),
    "name": "Ecosystem Orchestrator for UHNW Dynasty",
    "client": {
        "id": _id("s3-client"),
        "name": "The Harrington Family",
        "email": "familyoffice@harringtondynasty.com",
        "tier": "UHNW",
        "net_worth": 500_000_000,
        "background": "Third-generation dynasty wealth. 12 family members across 3 generations, "
        "7 properties globally, 23 vendors with $4.2M annual services spend, "
        "and no single point of accountability.",
        "status": "active",
        "created_at": _ts(days_ago=365),
    },
    "problem": {
        "id": _id("s3-problem"),
        "client_id": _id("s3-client"),
        "title": "Vendor Sprawl — 23 Vendors, No Accountability, $4.2M Annual Spend",
        "description": (
            "The Harrington family manages 23 vendors across 7 properties with no "
            "centralized oversight. Duplicate services discovered ($380K/yr waste), "
            "conflicting maintenance schedules causing property damage, and three "
            "separate insurance brokers with overlapping coverage gaps. Annual "
            "services spend of $4.2M has grown 18% YoY with no corresponding "
            "improvement in service quality."
        ),
        "category": "operations",
        "severity": "high",
        "status": "qualified",
        "created_at": _ts(days_ago=360),
    },
    "offer": {
        "id": _id("s3-offer"),
        "client_id": _id("s3-client"),
        "problem_id": _id("s3-problem"),
        "title": "Ecosystem Orchestrator + Footprint Reduction Bundle",
        "description": (
            "Full-spectrum vendor management and digital footprint reduction: "
            "consolidated vendor contracts, unified SLA framework, quarterly "
            "vendor performance reviews, spend optimization targeting 15% "
            "reduction, plus comprehensive digital footprint audit and ongoing "
            "data broker removal for all 12 family members."
        ),
        "price_monthly": 35_000,
        "price_annual": 390_000,
        "status": "active",
        "accepted_at": _ts(days_ago=350),
        "created_at": _ts(days_ago=355),
    },
    "household_graph": {
        "id": _id("s3-household"),
        "client_id": _id("s3-client"),
        "family_members": [
            # Generation 1
            {"id": _id("s3-fm-charles"), "name": "Charles Harrington Sr.", "role": "Patriarch", "age": 78, "generation": 1},
            {"id": _id("s3-fm-margaret"), "name": "Margaret Harrington", "role": "Matriarch", "age": 75, "generation": 1},
            # Generation 2
            {"id": _id("s3-fm-charles-jr"), "name": "Charles Harrington Jr.", "role": "Son / Family Office CEO", "age": 52, "generation": 2},
            {"id": _id("s3-fm-victoria"), "name": "Victoria Harrington", "role": "Daughter-in-law", "age": 49, "generation": 2},
            {"id": _id("s3-fm-elizabeth"), "name": "Elizabeth Harrington-Moore", "role": "Daughter", "age": 48, "generation": 2},
            {"id": _id("s3-fm-richard"), "name": "Richard Moore", "role": "Son-in-law", "age": 50, "generation": 2},
            # Generation 3
            {"id": _id("s3-fm-alexander"), "name": "Alexander Harrington", "role": "Grandson", "age": 26, "generation": 3},
            {"id": _id("s3-fm-isabella"), "name": "Isabella Harrington", "role": "Granddaughter", "age": 23, "generation": 3},
            {"id": _id("s3-fm-william"), "name": "William Moore", "role": "Grandson", "age": 21, "generation": 3},
            {"id": _id("s3-fm-charlotte"), "name": "Charlotte Moore", "role": "Granddaughter", "age": 18, "generation": 3},
            {"id": _id("s3-fm-henry"), "name": "Henry Harrington", "role": "Grandson", "age": 16, "generation": 3},
            {"id": _id("s3-fm-grace"), "name": "Grace Harrington", "role": "Granddaughter", "age": 14, "generation": 3},
        ],
        "properties": [
            {
                "id": _id("s3-prop-nyc"),
                "name": "Manhattan Townhouse",
                "type": "primary_residence",
                "location": "Upper East Side, New York, NY",
                "value": 28_000_000,
            },
            {
                "id": _id("s3-prop-greenwich"),
                "name": "Greenwich Compound",
                "type": "primary_residence",
                "location": "Greenwich, CT",
                "value": 22_000_000,
            },
            {
                "id": _id("s3-prop-palm"),
                "name": "Palm Beach Estate",
                "type": "vacation",
                "location": "Palm Beach, FL",
                "value": 15_500_000,
            },
            {
                "id": _id("s3-prop-london"),
                "name": "London Flat",
                "type": "pied_a_terre",
                "location": "Mayfair, London, UK",
                "value": 12_000_000,
            },
            {
                "id": _id("s3-prop-st-barts"),
                "name": "St. Barts Villa",
                "type": "vacation",
                "location": "St. Barthelemy, FWI",
                "value": 18_000_000,
            },
            {
                "id": _id("s3-prop-montana"),
                "name": "Montana Ranch",
                "type": "vacation",
                "location": "Big Sky, MT",
                "value": 9_500_000,
            },
            {
                "id": _id("s3-prop-napa"),
                "name": "Napa Vineyard Estate",
                "type": "investment",
                "location": "St. Helena, CA",
                "value": 14_000_000,
            },
        ],
        "staff": [
            {"id": _id("s3-staff-1"), "name": "Robert Ainsworth", "role": "Chief of Staff", "property": "All"},
            {"id": _id("s3-staff-2"), "name": "Patricia Dunn", "role": "Family Office Director", "property": "Greenwich Compound"},
            {"id": _id("s3-staff-3"), "name": "Henri Beaumont", "role": "Estate Manager", "property": "Manhattan Townhouse"},
            {"id": _id("s3-staff-4"), "name": "Sarah Thompson", "role": "Executive Assistant", "property": "Greenwich Compound"},
            {"id": _id("s3-staff-5"), "name": "Marco Ricci", "role": "Chef", "property": "Manhattan Townhouse"},
            {"id": _id("s3-staff-6"), "name": "Jean-Pierre Moreau", "role": "Chef", "property": "St. Barts Villa"},
            {"id": _id("s3-staff-7"), "name": "Maria Santos", "role": "Nanny / Tutor", "property": "Greenwich Compound"},
            {"id": _id("s3-staff-8"), "name": "James Crawford", "role": "Security Director", "property": "All"},
            {"id": _id("s3-staff-9"), "name": "Linda Park", "role": "Property Manager", "property": "Palm Beach Estate"},
            {"id": _id("s3-staff-10"), "name": "Thomas Webb", "role": "Ranch Manager", "property": "Montana Ranch"},
            {"id": _id("s3-staff-11"), "name": "Giovanni Rossi", "role": "Vineyard Manager", "property": "Napa Vineyard Estate"},
            {"id": _id("s3-staff-12"), "name": "Claire Bennett", "role": "Art Curator", "property": "All"},
            {"id": _id("s3-staff-13"), "name": "Andrew Foster", "role": "Driver / Logistics", "property": "Manhattan Townhouse"},
            {"id": _id("s3-staff-14"), "name": "Emma Williams", "role": "Housekeeper", "property": "London Flat"},
            {"id": _id("s3-staff-15"), "name": "Daniel O'Brien", "role": "IT Manager", "property": "All"},
        ],
        "vendors": [
            {"id": _id("s3-vendor-1"), "name": "Goldman Sachs Private Wealth", "category": "banking"},
            {"id": _id("s3-vendor-2"), "name": "Morgan Stanley Family Office", "category": "investment"},
            {"id": _id("s3-vendor-3"), "name": "Wachtell Lipton", "category": "legal"},
            {"id": _id("s3-vendor-4"), "name": "Davis Polk", "category": "legal"},
            {"id": _id("s3-vendor-5"), "name": "EY Private Client", "category": "accounting"},
            {"id": _id("s3-vendor-6"), "name": "AIG Private Client Group", "category": "insurance"},
            {"id": _id("s3-vendor-7"), "name": "Chubb Personal Risk", "category": "insurance"},
            {"id": _id("s3-vendor-8"), "name": "Christie's Private Sales", "category": "art"},
            {"id": _id("s3-vendor-9"), "name": "Sotheby's Concierge Auctions", "category": "real_estate"},
            {"id": _id("s3-vendor-10"), "name": "Quintessentially", "category": "lifestyle"},
            {"id": _id("s3-vendor-11"), "name": "Pinkerton", "category": "security"},
            {"id": _id("s3-vendor-12"), "name": "Knight Frank", "category": "property_management"},
            {"id": _id("s3-vendor-13"), "name": "Savills", "category": "property_management"},
            {"id": _id("s3-vendor-14"), "name": "NetJets", "category": "aviation"},
            {"id": _id("s3-vendor-15"), "name": "VistaJet", "category": "aviation"},
            {"id": _id("s3-vendor-16"), "name": "Burgess Yachts", "category": "marine"},
            {"id": _id("s3-vendor-17"), "name": "Mayo Clinic Executive Health", "category": "health"},
            {"id": _id("s3-vendor-18"), "name": "K2 Integrity", "category": "investigations"},
            {"id": _id("s3-vendor-19"), "name": "Mandiant (Google)", "category": "cybersecurity"},
            {"id": _id("s3-vendor-20"), "name": "Opus Pallidum Wine Advisors", "category": "wine"},
            {"id": _id("s3-vendor-21"), "name": "Rothschild & Co", "category": "advisory"},
            {"id": _id("s3-vendor-22"), "name": "DeleteMe", "category": "privacy"},
            {"id": _id("s3-vendor-23"), "name": "ReputationDefender", "category": "privacy"},
        ],
        "entities": [
            {"id": _id("s3-entity-1"), "name": "Harrington Dynasty Trust", "type": "dynasty_trust", "jurisdiction": "South Dakota"},
            {"id": _id("s3-entity-2"), "name": "Harrington Holdings LLC", "type": "llc", "jurisdiction": "Delaware"},
            {"id": _id("s3-entity-3"), "name": "Harrington Philanthropic Foundation", "type": "foundation", "jurisdiction": "New York"},
            {"id": _id("s3-entity-4"), "name": "Harrington Vineyard LLC", "type": "llc", "jurisdiction": "California"},
            {"id": _id("s3-entity-5"), "name": "Harrington Art Collection Trust", "type": "trust", "jurisdiction": "Delaware"},
            {"id": _id("s3-entity-6"), "name": "H-Gen3 Education Trust", "type": "trust", "jurisdiction": "South Dakota"},
            {"id": _id("s3-entity-7"), "name": "Harrington Family LP", "type": "limited_partnership", "jurisdiction": "Delaware"},
            {"id": _id("s3-entity-8"), "name": "Mayfair Flat Ltd", "type": "ltd", "jurisdiction": "United Kingdom"},
        ],
    },
    "evidence": [
        {
            "id": _id("s3-ev-1"),
            "client_id": _id("s3-client"),
            "title": "Capgemini World Wealth Report 2026: Vendor Management Gap",
            "source": "Capgemini",
            "type": "market_research",
            "summary": "UHNW families with 20+ vendors report 34% cost overrun vs. those "
            "with centralized orchestration. Consolidated vendor management "
            "reduces annual spend by 12-22% while improving service quality scores.",
            "url": "https://capgemini.com/world-wealth-report-2026",
            "relevance_score": 0.93,
            "created_at": _ts(days_ago=350),
        },
        {
            "id": _id("s3-ev-2"),
            "client_id": _id("s3-client"),
            "title": "FTC Enforcement Action: Data Broker Exposure of Wealthy Families",
            "source": "Federal Trade Commission",
            "type": "regulatory",
            "summary": "FTC fined three major data brokers $12M total for exposing personal "
            "data of 4,200+ UHNW individuals. Family addresses, travel patterns, "
            "and staff details were available for purchase. FTC recommends proactive "
            "data broker removal.",
            "url": "https://ftc.gov/enforcement/cases/2026-data-broker-sweep",
            "relevance_score": 0.89,
            "created_at": _ts(days_ago=340),
        },
    ],
    "kpis": [
        {"name": "Annual Vendor Spend", "current": 3_560_000, "target": 3_570_000, "unit": "usd", "trend": "on_target"},
        {"name": "Vendor Spend Reduction", "current": 15.2, "target": 15.0, "unit": "percent", "trend": "exceeding"},
        {"name": "Vendor SLA Compliance", "current": 94, "target": 90, "unit": "percent", "trend": "exceeding"},
        {"name": "Data Broker Listings Removed", "current": 847, "target": 500, "unit": "listings", "trend": "exceeding"},
        {"name": "Duplicate Services Eliminated", "current": 7, "target": 5, "unit": "services", "trend": "exceeding"},
        {"name": "Vendor Consolidation", "current": 23, "target": 18, "unit": "vendors", "trend": "improving"},
    ],
    "notifications": [
        {
            "id": _id("s3-notif-1"),
            "type": "success",
            "title": "Annual Vendor Review Complete — $640K Savings Identified",
            "message": "Q1 2026 vendor review complete. Identified $640K in savings through "
            "contract renegotiation and consolidation of 3 overlapping services.",
            "priority": "medium",
            "read": True,
            "created_at": _ts(days_ago=10),
        },
        {
            "id": _id("s3-notif-2"),
            "type": "info",
            "title": "Generation 3 Digital Footprint Audit Complete",
            "message": "Footprint audit for Alexander, Isabella, William, Charlotte, Henry, "
            "and Grace complete. 847 data broker listings removed. 12 social media "
            "privacy settings updated.",
            "priority": "low",
            "read": True,
            "created_at": _ts(days_ago=15),
        },
        {
            "id": _id("s3-notif-3"),
            "type": "milestone",
            "title": "1-Year Anniversary — Engagement Renewal Due",
            "message": "Harrington Family engagement reaches 1 year on April 18. Renewal "
            "proposal with updated scope and pricing due by April 10.",
            "priority": "high",
            "read": False,
            "created_at": _ts(days_ago=3),
        },
    ],
    "playbook_activations": [
        {
            "id": _id("s3-pb-1"),
            "playbook_name": "Ecosystem Orchestrator",
            "client_id": _id("s3-client"),
            "status": "active",
            "step": "ongoing_optimization",
            "started_at": _ts(days_ago=350),
            "milestones_completed": [
                "vendor_audit",
                "contract_consolidation",
                "sla_framework_deployed",
                "quarterly_review_q1",
                "quarterly_review_q2",
                "quarterly_review_q3",
                "quarterly_review_q4",
                "annual_renegotiation",
            ],
        },
        {
            "id": _id("s3-pb-2"),
            "playbook_name": "Footprint Reduction",
            "client_id": _id("s3-client"),
            "status": "active",
            "step": "ongoing_monitoring",
            "started_at": _ts(days_ago=340),
            "milestones_completed": [
                "initial_scan",
                "data_broker_removal_wave1",
                "social_media_audit",
                "data_broker_removal_wave2",
                "gen3_audit",
            ],
        },
    ],
    "health_score": {
        "score": 94,
        "label": "Excellent — Long-Term Client",
        "factors": {
            "engagement_frequency": 96,
            "kpi_performance": 97,
            "payment_consistency": 100,
            "nps_score": 88,
            "support_ticket_volume": 92,
        },
        "risk_level": "low",
        "last_updated": _ts(days_ago=1),
    },
}


# ---------------------------------------------------------------------------
# All scenarios as a list for easy iteration
# ---------------------------------------------------------------------------

ALL_SCENARIOS = [SCENARIO_1, SCENARIO_2, SCENARIO_3]


def get_scenario_by_name(name: str) -> dict | None:
    """Lookup a scenario by its name (case-insensitive partial match)."""
    name_lower = name.lower()
    for s in ALL_SCENARIOS:
        if name_lower in s["name"].lower():
            return s
    return None


def get_all_clients() -> list[dict]:
    """Extract client records from all scenarios."""
    return [s["client"] for s in ALL_SCENARIOS]


def get_all_problems() -> list[dict]:
    """Extract problem records from all scenarios."""
    return [s["problem"] for s in ALL_SCENARIOS]


def get_all_offers() -> list[dict]:
    """Extract offer records from all scenarios."""
    return [s["offer"] for s in ALL_SCENARIOS]


def get_all_household_graphs() -> list[dict]:
    """Extract household graph records from all scenarios."""
    return [s["household_graph"] for s in ALL_SCENARIOS]


def get_all_evidence() -> list[dict]:
    """Extract all evidence records from all scenarios."""
    evidence = []
    for s in ALL_SCENARIOS:
        evidence.extend(s["evidence"])
    return evidence


def get_all_notifications() -> list[dict]:
    """Extract all notification records from all scenarios."""
    notifications = []
    for s in ALL_SCENARIOS:
        notifications.extend(s["notifications"])
    return notifications


def get_all_playbook_activations() -> list[dict]:
    """Extract all playbook activation records from all scenarios."""
    activations = []
    for s in ALL_SCENARIOS:
        activations.extend(s["playbook_activations"])
    return activations
