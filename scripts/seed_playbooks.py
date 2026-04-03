"""Seed 10 ChamberForge playbooks into the database."""
import sys
import os

# Allow running from repo root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import SessionLocal
from app.models.playbook import Playbook

PLAYBOOKS = [
    {
        "slug": "private-ops-office",
        "name": "Private Ops Office",
        "target_buyer": "Newly wealthy founders post-exit",
        "price_range_min": 15000,
        "price_range_max": 30000,
        "core_pain": "Coordination overload across a multi-entity life",
        "icp": {
            "wealth_tier": "UHNWI",
            "buyer_type": "Founder",
            "life_stage": "Peak",
            "net_worth_range": "$30M-$200M",
            "typical_entities": 5,
            "household_size": "3-6",
        },
        "pain_triggers": [
            "Recent exit or liquidity event",
            "Three or more advisors with no coordination layer",
            "Missed deadlines on tax, insurance, or legal filings",
            "Spouse or family frustrated by operational chaos",
        ],
        "pricing_model": {
            "type": "MonthlyRetainer",
            "base": 15000,
            "premium": 30000,
            "billing_cycle": "monthly",
        },
        "sop_skeleton": {
            "phases": ["onboarding", "audit", "orchestration", "optimization"],
            "onboarding_weeks": 4,
            "review_cadence": "biweekly",
        },
        "trust_concerns": [
            "Who else has access to my data?",
            "How do you handle confidentiality with my advisors?",
            "What happens if I want to leave?",
        ],
        "kpi_stack": [
            {"metric": "HoursSaved", "target": 40, "unit": "hours/month"},
            {"metric": "ResponseTime", "target": 2, "unit": "hours"},
            {"metric": "RenewalRate", "target": 92, "unit": "percent"},
        ],
    },
    {
        "slug": "ecosystem-orchestrator",
        "name": "Ecosystem Orchestrator",
        "target_buyer": "Multi-residence UHNW families",
        "price_range_min": 20000,
        "price_range_max": 40000,
        "core_pain": "Fragmented vendor stack with no single point of accountability",
        "icp": {
            "wealth_tier": "UHNWI",
            "buyer_type": "Principal",
            "life_stage": "Peak",
            "residences": "3+",
            "vendor_count": "15-40",
            "jurisdictions": "2+",
        },
        "pain_triggers": [
            "Vendor conflict or service failure across properties",
            "No single dashboard for household operations",
            "Insurance gap discovered after incident",
            "Staff turnover causing knowledge loss",
        ],
        "pricing_model": {
            "type": "MonthlyRetainer",
            "base": 20000,
            "premium": 40000,
            "billing_cycle": "monthly",
        },
        "sop_skeleton": {
            "phases": ["vendor_audit", "consolidation", "platform_build", "ongoing_mgmt"],
            "onboarding_weeks": 6,
            "review_cadence": "weekly",
        },
        "trust_concerns": [
            "Will you replace my existing advisors?",
            "How do you handle vendor kickbacks?",
            "Can I see all vendor contracts in one place?",
        ],
        "kpi_stack": [
            {"metric": "HoursSaved", "target": 60, "unit": "hours/month"},
            {"metric": "ExposureScore", "target": 15, "unit": "percent_reduction"},
            {"metric": "RenewalRate", "target": 95, "unit": "percent"},
        ],
    },
    {
        "slug": "family-cyber-command",
        "name": "Family Cyber Command",
        "target_buyer": "Family offices with digital exposure",
        "price_range_min": 10000,
        "price_range_max": 25000,
        "core_pain": "AI-powered impersonation, wire fraud, and digital attack surface",
        "icp": {
            "wealth_tier": "FamilyOffice",
            "buyer_type": "Principal",
            "life_stage": "Peak",
            "digital_footprint": "high",
            "family_members_online": "4+",
        },
        "pain_triggers": [
            "Deepfake impersonation attempt",
            "Wire fraud near-miss or loss",
            "Family member social media exposure incident",
            "Advisor email compromise",
        ],
        "pricing_model": {
            "type": "MonthlyRetainer",
            "base": 10000,
            "premium": 25000,
            "billing_cycle": "monthly",
        },
        "sop_skeleton": {
            "phases": ["threat_assessment", "hardening", "monitoring", "incident_response"],
            "onboarding_weeks": 3,
            "review_cadence": "weekly",
        },
        "trust_concerns": [
            "Do you store our passwords or credentials?",
            "What is your breach notification policy?",
            "How do you vet your own staff?",
        ],
        "kpi_stack": [
            {"metric": "ExposureScore", "target": 30, "unit": "percent_reduction"},
            {"metric": "ResponseTime", "target": 1, "unit": "hours"},
            {"metric": "RenewalRate", "target": 90, "unit": "percent"},
        ],
    },
    {
        "slug": "footprint-reduction",
        "name": "Footprint Reduction",
        "target_buyer": "Public-facing executives and celebrities",
        "price_range_min": 8000,
        "price_range_max": 18000,
        "core_pain": "Data broker exposure creating physical and reputational risk",
        "icp": {
            "wealth_tier": "HNWI",
            "buyer_type": "Executive",
            "life_stage": "Peak",
            "public_profile": "high",
            "data_broker_listings": "50+",
        },
        "pain_triggers": [
            "Home address found on data broker sites",
            "Stalking or harassment incident",
            "Doxxing event or threat",
            "New public role increasing visibility",
        ],
        "pricing_model": {
            "type": "Subscription",
            "base": 8000,
            "premium": 18000,
            "billing_cycle": "monthly",
        },
        "sop_skeleton": {
            "phases": ["scan", "removal_campaign", "monitoring", "ongoing_suppression"],
            "onboarding_weeks": 2,
            "review_cadence": "monthly",
        },
        "trust_concerns": [
            "How do you verify removals actually happened?",
            "What data do you collect about me in the process?",
            "Can my adversaries find out I hired you?",
        ],
        "kpi_stack": [
            {"metric": "ExposureScore", "target": 80, "unit": "percent_reduction"},
            {"metric": "ResponseTime", "target": 24, "unit": "hours"},
            {"metric": "RenewalRate", "target": 88, "unit": "percent"},
        ],
    },
    {
        "slug": "household-workforce",
        "name": "Household Workforce",
        "target_buyer": "Principals with 5+ household staff",
        "price_range_min": 12000,
        "price_range_max": 22000,
        "core_pain": "Insider risk, vetting gaps, and HR compliance for private staff",
        "icp": {
            "wealth_tier": "UHNWI",
            "buyer_type": "Principal",
            "life_stage": "Peak",
            "staff_count": "5-25",
            "properties": "2+",
        },
        "pain_triggers": [
            "Staff theft or misconduct discovery",
            "Failed background check surfaced late",
            "Nanny or estate manager turnover",
            "Payroll compliance issues across jurisdictions",
        ],
        "pricing_model": {
            "type": "MonthlyRetainer",
            "base": 12000,
            "premium": 22000,
            "billing_cycle": "monthly",
        },
        "sop_skeleton": {
            "phases": ["staff_audit", "vetting_protocol", "policy_build", "ongoing_hr"],
            "onboarding_weeks": 4,
            "review_cadence": "biweekly",
        },
        "trust_concerns": [
            "Will my staff know they are being vetted?",
            "How do you handle terminations?",
            "What liability do I carry vs. you?",
        ],
        "kpi_stack": [
            {"metric": "HoursSaved", "target": 30, "unit": "hours/month"},
            {"metric": "ExposureScore", "target": 40, "unit": "percent_reduction"},
            {"metric": "RenewalRate", "target": 91, "unit": "percent"},
        ],
    },
    {
        "slug": "family-risk-council",
        "name": "Family Risk Council",
        "target_buyer": "Investment-focused family offices",
        "price_range_min": 15000,
        "price_range_max": 35000,
        "core_pain": "Non-investment risk is underbuilt while portfolio risk is over-managed",
        "icp": {
            "wealth_tier": "FamilyOffice",
            "buyer_type": "Principal",
            "life_stage": "Transfer",
            "aum": "$100M+",
            "family_members": "6+",
        },
        "pain_triggers": [
            "Lawsuit or regulatory inquiry",
            "Key-person risk event (health, death)",
            "Reputational crisis in media",
            "Generational conflict over governance",
        ],
        "pricing_model": {
            "type": "MonthlyRetainer",
            "base": 15000,
            "premium": 35000,
            "billing_cycle": "monthly",
        },
        "sop_skeleton": {
            "phases": ["risk_audit", "council_formation", "framework_build", "quarterly_review"],
            "onboarding_weeks": 8,
            "review_cadence": "quarterly",
        },
        "trust_concerns": [
            "Who sits on the risk council?",
            "How do you handle conflicts with our existing advisors?",
            "Is our family data shared across your other clients?",
        ],
        "kpi_stack": [
            {"metric": "ExposureScore", "target": 25, "unit": "percent_reduction"},
            {"metric": "ResponseTime", "target": 4, "unit": "hours"},
            {"metric": "RenewalRate", "target": 94, "unit": "percent"},
        ],
    },
    {
        "slug": "next-gen-studio",
        "name": "Next-Gen Studio",
        "target_buyer": "Multigenerational dynastic wealth families",
        "price_range_min": 25000,
        "price_range_max": 60000,
        "core_pain": "Succession conflict and next-gen disengagement",
        "icp": {
            "wealth_tier": "Dynasty",
            "buyer_type": "Inheritor",
            "life_stage": "Transfer",
            "generations": "3+",
            "family_members": "10+",
        },
        "pain_triggers": [
            "Next-gen refusing family business roles",
            "Sibling conflict over inheritance",
            "Failed family meeting or governance breakdown",
            "Philanthropic vision misalignment",
        ],
        "pricing_model": {
            "type": "ProjectFee",
            "base": 25000,
            "premium": 60000,
            "billing_cycle": "monthly",
        },
        "sop_skeleton": {
            "phases": ["family_assessment", "next_gen_interviews", "program_design", "facilitation"],
            "onboarding_weeks": 6,
            "review_cadence": "monthly",
        },
        "trust_concerns": [
            "Will you take sides in family disputes?",
            "How do you maintain confidentiality within the family?",
            "What if a family member refuses to participate?",
        ],
        "kpi_stack": [
            {"metric": "HoursSaved", "target": 20, "unit": "hours/month"},
            {"metric": "RenewalRate", "target": 85, "unit": "percent"},
            {"metric": "ResponseTime", "target": 8, "unit": "hours"},
        ],
    },
    {
        "slug": "medical-navigation",
        "name": "Medical Navigation",
        "target_buyer": "UHNW health-focused executives and aging principals",
        "price_range_min": 8000,
        "price_range_max": 20000,
        "core_pain": "Fragmented medical records and no coordinated care advocacy",
        "icp": {
            "wealth_tier": "UHNWI",
            "buyer_type": "Executive",
            "life_stage": "Peak",
            "health_complexity": "high",
            "providers": "5+",
        },
        "pain_triggers": [
            "Misdiagnosis or delayed diagnosis",
            "Conflicting specialist recommendations",
            "Medical emergency while traveling",
            "Aging parent with complex care needs",
        ],
        "pricing_model": {
            "type": "MonthlyRetainer",
            "base": 8000,
            "premium": 20000,
            "billing_cycle": "monthly",
        },
        "sop_skeleton": {
            "phases": ["records_consolidation", "provider_mapping", "care_plan", "ongoing_advocacy"],
            "onboarding_weeks": 3,
            "review_cadence": "monthly",
        },
        "trust_concerns": [
            "Who has access to my medical records?",
            "Are you HIPAA compliant?",
            "Can you coordinate with my existing doctors?",
        ],
        "kpi_stack": [
            {"metric": "ResponseTime", "target": 1, "unit": "hours"},
            {"metric": "HoursSaved", "target": 15, "unit": "hours/month"},
            {"metric": "RenewalRate", "target": 93, "unit": "percent"},
        ],
    },
    {
        "slug": "property-resilience",
        "name": "Property Resilience",
        "target_buyer": "High-value property owners with 3+ residences",
        "price_range_min": 10000,
        "price_range_max": 20000,
        "core_pain": "Insurance gaps, maintenance blind spots, and disaster readiness",
        "icp": {
            "wealth_tier": "UHNWI",
            "buyer_type": "Principal",
            "life_stage": "Peak",
            "properties": "3+",
            "total_property_value": "$20M+",
        },
        "pain_triggers": [
            "Insurance claim denied or underpaid",
            "Natural disaster damage to uninsured improvements",
            "Property manager negligence discovery",
            "Art or collectible damage during transit",
        ],
        "pricing_model": {
            "type": "MonthlyRetainer",
            "base": 10000,
            "premium": 20000,
            "billing_cycle": "monthly",
        },
        "sop_skeleton": {
            "phases": ["property_audit", "insurance_review", "resilience_plan", "ongoing_monitoring"],
            "onboarding_weeks": 4,
            "review_cadence": "quarterly",
        },
        "trust_concerns": [
            "Do you receive commissions from insurers?",
            "How do you handle claims advocacy?",
            "What access do you need to my properties?",
        ],
        "kpi_stack": [
            {"metric": "ExposureScore", "target": 50, "unit": "percent_reduction"},
            {"metric": "HoursSaved", "target": 20, "unit": "hours/month"},
            {"metric": "RenewalRate", "target": 90, "unit": "percent"},
        ],
    },
    {
        "slug": "travel-reliability",
        "name": "Travel Reliability Desk",
        "target_buyer": "Frequent multi-generational travelers",
        "price_range_min": 6000,
        "price_range_max": 15000,
        "core_pain": "Disruption logistics gaps across complex itineraries",
        "icp": {
            "wealth_tier": "HNWI",
            "buyer_type": "Principal",
            "life_stage": "Peak",
            "trips_per_year": "12+",
            "family_travelers": "4+",
        },
        "pain_triggers": [
            "Flight cancellation with no backup plan",
            "Medical emergency abroad with no local contacts",
            "Visa or documentation issue at border",
            "Security incident at destination",
        ],
        "pricing_model": {
            "type": "Subscription",
            "base": 6000,
            "premium": 15000,
            "billing_cycle": "monthly",
        },
        "sop_skeleton": {
            "phases": ["travel_profile", "risk_mapping", "protocol_build", "24_7_desk"],
            "onboarding_weeks": 2,
            "review_cadence": "per_trip",
        },
        "trust_concerns": [
            "Do you have 24/7 coverage?",
            "How do you handle medical evacuations?",
            "Can you coordinate with our security team?",
        ],
        "kpi_stack": [
            {"metric": "ResponseTime", "target": 0.5, "unit": "hours"},
            {"metric": "HoursSaved", "target": 25, "unit": "hours/month"},
            {"metric": "RenewalRate", "target": 89, "unit": "percent"},
        ],
    },
]


def seed():
    """Insert all playbooks into the database."""
    db = SessionLocal()
    try:
        existing_slugs = {p.slug for p in db.query(Playbook.slug).all()}
        inserted = 0
        for data in PLAYBOOKS:
            if data["slug"] not in existing_slugs:
                db.add(Playbook(**data))
                inserted += 1
        db.commit()
        print(f"Seeded {inserted} playbooks ({len(PLAYBOOKS) - inserted} already existed)")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
