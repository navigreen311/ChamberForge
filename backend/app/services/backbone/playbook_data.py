"""Complete playbook template data for 10 premium-service verticals.

Each playbook contains rich, realistic content for the HNW/UHNW market including
ICP profiles, pain triggers, SOP skeletons, pricing models, KPI stacks,
trust concerns, objection handling, and asset references.
"""

PLAYBOOK_TEMPLATES: list[dict] = [
    # ──────────────────────────────────────────────────────────────────────
    # 1. Private Ops Office
    # ──────────────────────────────────────────────────────────────────────
    {
        "slug": "private-ops-office",
        "name": "Private Ops Office",
        "target_buyer": "Newly wealthy founders",
        "price_range_min": 15000.0,
        "price_range_max": 30000.0,
        "core_pain": "Coordination overload across household, staff, and personal operations",
        "icp": {
            "wealth_tier": "HNWI",
            "life_stage": "Accumulation",
            "buyer_type": "Founder",
            "typical_profile": "Tech founder post-Series B or exit, 2-4 properties, 5-15 staff, board roles",
            "net_worth_range": "$10M-$100M",
            "decision_speed": "Fast — used to startup pace",
            "trust_model": "Proof-of-competence first, then loyalty",
        },
        "pain_triggers": [
            "Missed school enrollment deadline for child",
            "Double-booked travel across time zones",
            "Vendor invoice confusion causing overpayment",
            "Emergency with no protocol — scrambled response",
            "Staff turnover leaving operational gaps",
            "Tax filing surprise due to missed K-1 deadline",
        ],
        "pricing_model": {
            "type": "monthly_retainer",
            "base_fee": 15000,
            "premium_tier": 30000,
            "setup_fee": 5000,
            "billing_cycle": "monthly",
            "contract_term": "12 months with 90-day out clause",
            "included_hours": "Unlimited within scope",
            "overage_rate": None,
        },
        "sop_skeleton": [
            {
                "name": "Intake & Onboarding",
                "steps": [
                    "Household audit — inventory all staff, vendors, properties, vehicles",
                    "Vendor inventory — catalog all active service providers with contracts",
                    "Calendar sync — integrate all family calendars into unified view",
                    "Emergency protocol setup — define chain of command and contact trees",
                    "Document vault setup — centralize critical documents with access controls",
                ],
            },
            {
                "name": "Weekly Operations Review",
                "steps": [
                    "Pull agenda from all household calendars",
                    "Review upcoming travel, events, and deadlines",
                    "Check vendor invoice queue and flag anomalies",
                    "Staff task completion review",
                    "Issue escalation triage",
                ],
            },
            {
                "name": "Travel Protocol",
                "steps": [
                    "Advance request intake — destinations, dates, party size, preferences",
                    "Itinerary build with backup options for weather/disruption",
                    "Ground transport coordination and confirmation",
                    "Property prep at destination — stock, clean, staff brief",
                    "Post-travel debrief — capture feedback, update preference file",
                ],
            },
            {
                "name": "Emergency Response",
                "steps": [
                    "Activate contact tree within 5 minutes",
                    "Assess severity and assign lead coordinator",
                    "Brief principal with situation summary and options",
                    "Execute chosen response path",
                    "Post-incident review and protocol update",
                ],
            },
        ],
        "trust_concerns": [
            "Will my private information stay private? NDAs and data handling policies provided upfront.",
            "Can you handle the complexity of my life? Demonstrate with a 30-day pilot scope.",
            "What if my EA/chief of staff feels threatened? Position as augmentation, not replacement.",
            "How do you handle staff who report to me directly? Clear RACI matrix from day one.",
        ],
        "objection_handling": [
            {
                "objection": "I already have an EA who handles this",
                "response": "We augment your EA with systems, SOPs, and backup coverage they can't provide alone. Most clients see their EA become 3x more effective.",
            },
            {
                "objection": "This seems expensive for coordination work",
                "response": "One missed deadline or emergency fumble costs more than a year of retainer. We eliminate those risks entirely.",
            },
            {
                "objection": "I don't want more people in my life",
                "response": "We're invisible infrastructure. You interact with one point of contact; we manage the complexity behind the scenes.",
            },
            {
                "objection": "How do I know this will actually work?",
                "response": "30-day pilot with defined KPIs. If we don't hit targets, you walk with zero obligation.",
            },
            {
                "objection": "My situation is too unique for a standardized approach",
                "response": "Every playbook is customized during activation. The framework ensures nothing falls through cracks; the details are 100% yours.",
            },
        ],
        "kpi_stack": [
            {"kpi": "Calendar conflicts eliminated", "target": "Zero per month", "measurement": "Weekly calendar audit"},
            {"kpi": "Vendor response time", "target": "<4 hours", "measurement": "Ticket timestamp tracking"},
            {"kpi": "Emergency protocol response", "target": "<15 minutes to activation", "measurement": "Incident log timestamps"},
            {"kpi": "Document retrieval time", "target": "<2 minutes for any critical doc", "measurement": "Random retrieval tests"},
            {"kpi": "Principal satisfaction score", "target": "9+/10 monthly", "measurement": "Monthly pulse survey"},
        ],
        "voiceforge_assets": [
            "onboarding_welcome_call_script",
            "weekly_review_briefing_template",
            "emergency_notification_script",
            "vendor_negotiation_talking_points",
            "principal_quarterly_review_deck_narration",
        ],
        "visionaudio_assets": [
            "household_ops_dashboard_walkthrough_video",
            "emergency_protocol_training_module",
            "vendor_management_system_demo",
            "onboarding_experience_overview_animation",
        ],
    },

    # ──────────────────────────────────────────────────────────────────────
    # 2. Ecosystem Orchestrator
    # ──────────────────────────────────────────────────────────────────────
    {
        "slug": "ecosystem-orchestrator",
        "name": "Ecosystem Orchestrator",
        "target_buyer": "Multi-residence UHNW families",
        "price_range_min": 20000.0,
        "price_range_max": 40000.0,
        "core_pain": "Fragmented advisor ecosystem with no single point of accountability",
        "icp": {
            "wealth_tier": "UHNWI",
            "life_stage": "Preservation & Growth",
            "buyer_type": "Family Principal or Family Office Director",
            "typical_profile": "3-7 residences across jurisdictions, 20+ advisors (legal, tax, investment, insurance), $100M+ net worth",
            "net_worth_range": "$100M-$500M",
            "decision_speed": "Deliberate — consensus among family stakeholders",
            "trust_model": "Referral-based entry, earned through discretion over time",
        },
        "pain_triggers": [
            "Tax advisor and estate attorney gave contradictory advice costing $500K+",
            "Insurance gap discovered after a property loss event",
            "Investment advisor made allocation without consulting estate plan",
            "New residence purchase created unexpected multi-jurisdiction tax exposure",
            "Family member received conflicting guidance from two different advisors",
        ],
        "pricing_model": {
            "type": "monthly_retainer",
            "base_fee": 20000,
            "premium_tier": 40000,
            "setup_fee": 15000,
            "billing_cycle": "monthly",
            "contract_term": "12 months minimum",
            "included_hours": "Full-scope orchestration",
            "overage_rate": None,
        },
        "sop_skeleton": [
            {
                "name": "Advisor Ecosystem Mapping",
                "steps": [
                    "Catalog all advisors — name, firm, role, engagement terms, last review date",
                    "Map advisor interdependencies and communication flows",
                    "Identify gaps and overlaps in advisory coverage",
                    "Create unified advisor directory with contact protocols",
                    "Schedule inaugural ecosystem alignment meeting",
                ],
            },
            {
                "name": "Cross-Advisor Coordination Protocol",
                "steps": [
                    "Establish quarterly advisor summit cadence",
                    "Create shared decision log accessible to relevant advisors",
                    "Implement change-notification system for cross-impact decisions",
                    "Run scenario planning exercises across advisor domains",
                ],
            },
            {
                "name": "Multi-Jurisdiction Compliance Sync",
                "steps": [
                    "Map all jurisdictions where family has presence or exposure",
                    "Create filing calendar across all jurisdictions",
                    "Assign ownership for each filing to specific advisor",
                    "Quarterly compliance status review with exception reporting",
                ],
            },
        ],
        "trust_concerns": [
            "Will you try to replace our existing advisors? No — we orchestrate, not compete.",
            "How do you handle advisor conflicts of interest? Transparent escalation to principal with documented options.",
            "What about confidentiality across advisors? Information compartmentalization protocols.",
            "Can you handle international complexity? Multi-jurisdiction experience is core to our model.",
        ],
        "objection_handling": [
            {
                "objection": "Our family office already coordinates advisors",
                "response": "We give your FO a force multiplier — systematic coordination protocols, gap analysis, and accountability tracking they likely don't have time for.",
            },
            {
                "objection": "Our advisors won't want another layer",
                "response": "Top advisors welcome coordination because it protects their recommendations. We position this as serving them, not policing them.",
            },
            {
                "objection": "We've tried this before and it didn't work",
                "response": "Most coordination efforts fail because they lack systems. We bring SOPs, technology, and dedicated orchestration — not just good intentions.",
            },
            {
                "objection": "The cost seems high on top of existing advisor fees",
                "response": "One prevented advisor misalignment — like the tax/estate contradiction scenario — saves multiples of the annual retainer.",
            },
        ],
        "kpi_stack": [
            {"kpi": "Advisor alignment score", "target": "95%+ decisions with cross-advisor review", "measurement": "Decision log audit"},
            {"kpi": "Filing deadline compliance", "target": "100% on-time across jurisdictions", "measurement": "Calendar tracking"},
            {"kpi": "Gap identification rate", "target": "All coverage gaps flagged within 30 days", "measurement": "Quarterly gap analysis"},
            {"kpi": "Advisor summit completion", "target": "4 per year minimum", "measurement": "Meeting records"},
            {"kpi": "Cross-advisor conflict resolution time", "target": "<72 hours to resolution", "measurement": "Issue tracker"},
        ],
        "voiceforge_assets": [
            "advisor_onboarding_introduction_script",
            "quarterly_summit_facilitation_guide",
            "principal_briefing_template",
            "conflict_resolution_mediation_script",
        ],
        "visionaudio_assets": [
            "ecosystem_map_interactive_visualization",
            "advisor_coordination_platform_demo",
            "compliance_calendar_dashboard_video",
            "quarterly_review_presentation_template",
        ],
    },

    # ──────────────────────────────────────────────────────────────────────
    # 3. Family Cyber Command
    # ──────────────────────────────────────────────────────────────────────
    {
        "slug": "family-cyber-command",
        "name": "Family Cyber Command",
        "target_buyer": "Family offices with digital exposure",
        "price_range_min": 10000.0,
        "price_range_max": 25000.0,
        "core_pain": "AI impersonation, wire fraud, and digital identity threats targeting family members",
        "icp": {
            "wealth_tier": "UHNWI",
            "life_stage": "Preservation",
            "buyer_type": "Family Office CTO or Principal",
            "typical_profile": "Family office managing $50M+, 3-10 family members with public profiles, prior incident or near-miss with fraud",
            "net_worth_range": "$50M-$500M",
            "decision_speed": "Urgent after incident, slow otherwise",
            "trust_model": "Technical credibility + confidentiality guarantees",
        },
        "pain_triggers": [
            "Deepfake voice call impersonating principal to authorize wire transfer",
            "Family member's social media data used for spear-phishing attack",
            "Compromised email account used to redirect vendor payments",
            "Child's identity stolen via school data breach",
            "Household staff member's device compromised with malware",
        ],
        "pricing_model": {
            "type": "monthly_retainer",
            "base_fee": 10000,
            "premium_tier": 25000,
            "setup_fee": 8000,
            "billing_cycle": "monthly",
            "contract_term": "12 months with incident response SLA",
            "included_hours": "Continuous monitoring + quarterly assessments",
            "overage_rate": "$500/hr for incident response beyond SLA",
        },
        "sop_skeleton": [
            {
                "name": "Digital Footprint Assessment",
                "steps": [
                    "Scan all family members' digital presence — social media, public records, data brokers",
                    "Inventory all devices, accounts, and cloud services",
                    "Assess current security posture — passwords, MFA, encryption",
                    "Identify high-risk vectors — public Wi-Fi habits, travel patterns, shared accounts",
                    "Deliver threat briefing with prioritized remediation plan",
                ],
            },
            {
                "name": "Identity Protection Protocol",
                "steps": [
                    "Implement hardware security keys for all critical accounts",
                    "Set up dark web monitoring for family PII",
                    "Establish voice/video authentication codes for wire authorizations",
                    "Create impersonation detection playbook for staff",
                    "Deploy AI-powered email filtering for spear-phishing",
                ],
            },
            {
                "name": "Incident Response Playbook",
                "steps": [
                    "Detection — automated alerts + human triage within 15 minutes",
                    "Containment — isolate affected systems and accounts",
                    "Communication — notify principal and affected parties via secure channel",
                    "Remediation — restore access, patch vulnerability, update credentials",
                    "Post-incident review — root cause analysis and protocol update",
                ],
            },
            {
                "name": "Quarterly Cyber Health Check",
                "steps": [
                    "Penetration test of family's digital perimeter",
                    "Social engineering simulation (phishing test for staff)",
                    "Device compliance audit",
                    "New threat landscape briefing",
                    "Update security protocols based on findings",
                ],
            },
        ],
        "trust_concerns": [
            "You'll have access to our most sensitive systems — how do we trust you? Background checks, insurance, and air-gapped audit trails.",
            "Will this be disruptive to family members' daily lives? Minimal friction — we design security to be invisible.",
            "What if your systems get breached? Our infrastructure is separate from yours with zero-knowledge architecture.",
            "How do you handle staff who resist security protocols? Training + gamification, not punishment. Compliance rates above 95%.",
        ],
        "objection_handling": [
            {
                "objection": "We already have IT support",
                "response": "IT support manages devices. We manage threats. The attack surface for a wealthy family extends far beyond IT — social engineering, deepfakes, physical-digital crossover.",
            },
            {
                "objection": "Nothing has happened to us yet",
                "response": "67% of UHNW families have experienced a cyber attack. Most don't know until the wire is gone. Prevention costs 1/100th of recovery.",
            },
            {
                "objection": "My family won't follow security rules",
                "response": "We design protocols around behavior, not against it. Invisible security layers protect even non-compliant family members.",
            },
            {
                "objection": "This feels like corporate security — too heavy",
                "response": "Our approach is concierge-grade — white-glove, personal, and adapted to lifestyle. Not a corporate IT department.",
            },
        ],
        "kpi_stack": [
            {"kpi": "Threat detection time", "target": "<15 minutes", "measurement": "Alert-to-triage timestamp"},
            {"kpi": "Phishing simulation pass rate", "target": ">90% family + staff", "measurement": "Quarterly simulation results"},
            {"kpi": "MFA adoption rate", "target": "100% critical accounts", "measurement": "Account audit"},
            {"kpi": "Incident response time", "target": "<1 hour to containment", "measurement": "Incident log"},
            {"kpi": "Dark web exposure items", "target": "Zero new exposures per quarter", "measurement": "Monitoring dashboard"},
        ],
        "voiceforge_assets": [
            "threat_briefing_presentation_script",
            "family_security_awareness_training_narration",
            "incident_notification_call_script",
            "quarterly_review_executive_summary_voiceover",
        ],
        "visionaudio_assets": [
            "cyber_threat_landscape_briefing_video",
            "phishing_awareness_interactive_training",
            "incident_response_simulation_walkthrough",
            "security_dashboard_demo_video",
        ],
    },

    # ──────────────────────────────────────────────────────────────────────
    # 4. Footprint Reduction
    # ──────────────────────────────────────────────────────────────────────
    {
        "slug": "footprint-reduction",
        "name": "Footprint Reduction",
        "target_buyer": "Public-facing executives and celebrities",
        "price_range_min": 8000.0,
        "price_range_max": 18000.0,
        "core_pain": "Excessive personal data exposure via data brokers, public records, and social media",
        "icp": {
            "wealth_tier": "HNWI",
            "life_stage": "Preservation",
            "buyer_type": "Executive or Public Figure",
            "typical_profile": "CEO, celebrity, or political figure with >10K social followers, prior stalking/doxxing incident, or active threat assessment",
            "net_worth_range": "$5M-$200M",
            "decision_speed": "Fast after triggering event",
            "trust_model": "Reputation-based, NDA-first",
        },
        "pain_triggers": [
            "Home address found and shared on social media by hostile actor",
            "Data broker sites listing personal phone, email, and family members",
            "Journalist or activist using public records for targeted investigation",
            "Stalker using aggregated online data to track movements",
            "Children's school information discoverable via parent's public profile",
        ],
        "pricing_model": {
            "type": "monthly_retainer",
            "base_fee": 8000,
            "premium_tier": 18000,
            "setup_fee": 5000,
            "billing_cycle": "monthly",
            "contract_term": "6 months minimum with ongoing monitoring",
            "included_hours": "Full removal campaign + monthly monitoring",
            "overage_rate": "$350/hr for legal escalation support",
        },
        "sop_skeleton": [
            {
                "name": "Exposure Audit",
                "steps": [
                    "Scan 200+ data broker sites for client and family member records",
                    "Audit public records — property, court, business filings",
                    "Social media OSINT sweep — geotagged posts, tagged photos, metadata",
                    "Google dorking for exposed documents, PDFs, and cached pages",
                    "Deliver exposure report with risk scoring per data point",
                ],
            },
            {
                "name": "Data Removal Campaign",
                "steps": [
                    "Submit opt-out requests to all identified data brokers",
                    "File GDPR/CCPA deletion requests where applicable",
                    "Request search engine de-indexing for sensitive cached pages",
                    "Coordinate with attorneys for legal takedowns where needed",
                    "Track removal confirmation and re-check at 30/60/90 days",
                ],
            },
            {
                "name": "Ongoing Monitoring & Prevention",
                "steps": [
                    "Automated alerts for new data broker listings",
                    "Monthly re-scan of top 50 broker sites",
                    "Social media privacy hardening coaching for family members",
                    "New account and registration hygiene protocol",
                ],
            },
        ],
        "trust_concerns": [
            "You'll know exactly what's exposed about me — that's sensitive. All findings are encrypted and access-controlled.",
            "Will removal actually stick? We monitor continuously and re-submit as needed. Data brokers re-list — we re-remove.",
            "Can you handle international data laws? We work across GDPR, CCPA, and other privacy frameworks globally.",
            "What about information I can't remove (court records, etc.)? We suppress visibility and create obfuscation layers.",
        ],
        "objection_handling": [
            {
                "objection": "I can do this myself with online opt-out forms",
                "response": "There are 400+ data brokers, and they re-list every 60-90 days. Our system is automated, persistent, and covers sources you'll never find manually.",
            },
            {
                "objection": "I'm not that well-known — is this really necessary?",
                "response": "Wealth itself is the risk factor. You don't need fame — just assets. Criminals use data brokers to identify and target affluent individuals.",
            },
            {
                "objection": "My security team should handle this",
                "response": "Physical security protects your body. Footprint reduction protects your data. Most security teams lack the OSINT and privacy-law expertise for this work.",
            },
            {
                "objection": "What's the ROI on privacy?",
                "response": "One prevented stalking incident, doxxing event, or social engineering attack justifies years of service. Privacy is the new insurance.",
            },
        ],
        "kpi_stack": [
            {"kpi": "Data broker listings removed", "target": ">95% within 90 days", "measurement": "Removal confirmation tracking"},
            {"kpi": "Re-listing prevention rate", "target": ">90% stay removed", "measurement": "Monthly re-scan results"},
            {"kpi": "Exposure score reduction", "target": "80%+ reduction from baseline", "measurement": "Quarterly exposure audit"},
            {"kpi": "New exposure detection time", "target": "<48 hours", "measurement": "Automated monitoring alerts"},
        ],
        "voiceforge_assets": [
            "exposure_report_presentation_script",
            "family_privacy_coaching_session_guide",
            "legal_escalation_briefing_template",
            "quarterly_status_review_narration",
        ],
        "visionaudio_assets": [
            "exposure_audit_results_visualization",
            "data_broker_removal_process_explainer",
            "privacy_hygiene_training_video",
            "monitoring_dashboard_walkthrough",
        ],
    },

    # ──────────────────────────────────────────────────────────────────────
    # 5. Household Workforce
    # ──────────────────────────────────────────────────────────────────────
    {
        "slug": "household-workforce",
        "name": "Household Workforce",
        "target_buyer": "Principals with large domestic staff",
        "price_range_min": 12000.0,
        "price_range_max": 22000.0,
        "core_pain": "Staff management chaos, insider risk, and high turnover in domestic workforce",
        "icp": {
            "wealth_tier": "UHNWI",
            "life_stage": "Preservation",
            "buyer_type": "Principal or House Manager",
            "typical_profile": "Family with 8-25 household staff across multiple properties, history of staff drama or turnover, no formal HR infrastructure",
            "net_worth_range": "$50M-$300M",
            "decision_speed": "Moderate — needs spouse/partner buy-in",
            "trust_model": "Discretion above all, then competence demonstration",
        },
        "pain_triggers": [
            "Nanny quit without notice leaving family scrambling for childcare",
            "Chef and house manager in ongoing conflict affecting household morale",
            "Discovered housekeeper sharing family details on social media",
            "No background check process — hired driver turned out to have record",
            "Staff compensation wildly inconsistent with no market benchmarking",
            "Workers comp claim from estate maintenance without proper documentation",
        ],
        "pricing_model": {
            "type": "monthly_retainer",
            "base_fee": 12000,
            "premium_tier": 22000,
            "setup_fee": 10000,
            "billing_cycle": "monthly",
            "contract_term": "12 months",
            "included_hours": "Full workforce management scope",
            "overage_rate": "$400/hr for emergency placement",
        },
        "sop_skeleton": [
            {
                "name": "Staff Audit & Compliance",
                "steps": [
                    "Inventory all household staff — roles, compensation, tenure, contracts",
                    "Verify employment eligibility and background check status",
                    "Audit compliance — payroll taxes, workers comp, employment agreements",
                    "Benchmark compensation against market rates by region and role",
                    "Deliver gap report with prioritized remediation timeline",
                ],
            },
            {
                "name": "Hiring & Onboarding Protocol",
                "steps": [
                    "Define role requirements with principal input",
                    "Background screening — criminal, credit, reference verification",
                    "NDA and confidentiality agreement execution",
                    "Structured onboarding — house rules, reporting lines, emergency protocols",
                    "90-day performance review cadence",
                ],
            },
            {
                "name": "Performance Management",
                "steps": [
                    "Establish KPIs by role (quantitative where possible)",
                    "Monthly check-ins between staff and house manager",
                    "Quarterly performance reviews with documented feedback",
                    "Annual compensation review with market benchmarking",
                    "Performance improvement plans for underperformers",
                ],
            },
            {
                "name": "Insider Risk Mitigation",
                "steps": [
                    "Social media monitoring for staff posting about family",
                    "Access control review — who has keys, codes, credentials",
                    "Exit protocol — immediate credential revocation, exit interview, NDA reminder",
                    "Periodic re-screening for sensitive-access staff",
                ],
            },
        ],
        "trust_concerns": [
            "Will staff feel like they're being policed? We frame this as professional development and clarity, not surveillance.",
            "What if a staff member discovers they're being monitored? Policies are disclosed upfront in employment agreements.",
            "How do you handle delicate terminations? White-glove, legally compliant, and with dignity. We've done hundreds.",
            "Can you handle staff across multiple states/countries? Yes — multi-jurisdiction employment law is our specialty.",
        ],
        "objection_handling": [
            {
                "objection": "We treat our staff like family — we don't need HR",
                "response": "That's exactly when things go wrong. Family treatment without professional structure leads to boundary violations, liability, and painful separations.",
            },
            {
                "objection": "Our house manager handles all of this",
                "response": "We give your house manager the tools, templates, and expert backup they need. Most house managers are operational, not HR-trained.",
            },
            {
                "objection": "Staff turnover is just part of this world",
                "response": "Average household staff tenure is 18 months. Our clients average 3.5 years. Structure and fair treatment reduce turnover dramatically.",
            },
            {
                "objection": "We've never had an insider incident",
                "response": "That you know of. 40% of household theft goes undetected. Proactive controls cost a fraction of reactive damage control.",
            },
        ],
        "kpi_stack": [
            {"kpi": "Staff retention rate", "target": ">85% annual", "measurement": "Turnover tracking by role"},
            {"kpi": "Time to fill open position", "target": "<21 days", "measurement": "Recruiting pipeline metrics"},
            {"kpi": "Compliance score", "target": "100% across all staff", "measurement": "Quarterly compliance audit"},
            {"kpi": "Staff satisfaction score", "target": ">4.2/5.0", "measurement": "Anonymous quarterly survey"},
            {"kpi": "Insider incident rate", "target": "Zero per year", "measurement": "Incident log + exit interview analysis"},
        ],
        "voiceforge_assets": [
            "staff_onboarding_welcome_script",
            "performance_review_facilitation_guide",
            "termination_conversation_script",
            "principal_quarterly_workforce_briefing",
        ],
        "visionaudio_assets": [
            "household_hr_platform_demo_video",
            "staff_onboarding_orientation_module",
            "compliance_training_series",
            "insider_risk_awareness_training",
        ],
    },

    # ──────────────────────────────────────────────────────────────────────
    # 6. Family Risk Council
    # ──────────────────────────────────────────────────────────────────────
    {
        "slug": "family-risk-council",
        "name": "Family Risk Council",
        "target_buyer": "Investment-focused family offices",
        "price_range_min": 15000.0,
        "price_range_max": 35000.0,
        "core_pain": "Fragmented risk visibility across investments, operations, and family governance",
        "icp": {
            "wealth_tier": "UHNWI",
            "life_stage": "Preservation & Transition",
            "buyer_type": "Family Office CIO or Principal",
            "typical_profile": "Single or multi-family office managing $200M+, 5+ asset classes, regulatory exposure across jurisdictions",
            "net_worth_range": "$200M-$1B+",
            "decision_speed": "Committee-driven — quarterly decision cycles",
            "trust_model": "Institutional-grade due diligence, references from peer families",
        },
        "pain_triggers": [
            "Concentrated position in single asset class discovered too late during downturn",
            "Key-person risk — CIO departure leaving investment strategy undocumented",
            "Regulatory inquiry revealing gaps in compliance documentation",
            "Family dispute over risk tolerance spilling into investment decisions",
            "Cybersecurity breach at portfolio company affecting family office reputation",
        ],
        "pricing_model": {
            "type": "quarterly_engagement",
            "base_fee": 15000,
            "premium_tier": 35000,
            "setup_fee": 20000,
            "billing_cycle": "quarterly",
            "contract_term": "Annual with quarterly deliverables",
            "included_hours": "Quarterly deep-dive + ongoing monitoring",
            "overage_rate": "$600/hr for ad-hoc advisory",
        },
        "sop_skeleton": [
            {
                "name": "Risk Universe Mapping",
                "steps": [
                    "Catalog all risk domains — investment, operational, cyber, reputational, family governance",
                    "Map risk ownership — who monitors and decides for each domain",
                    "Assess current risk management maturity by domain",
                    "Identify blind spots and concentration risks",
                    "Deliver risk universe map with heat scoring",
                ],
            },
            {
                "name": "Quarterly Risk Review",
                "steps": [
                    "Update risk register with new and changed risks",
                    "Stress test portfolio under 3 macro scenarios",
                    "Review insurance coverage adequacy",
                    "Assess operational risks — vendor, technology, staffing",
                    "Present findings to family risk committee",
                ],
            },
            {
                "name": "Governance Risk Framework",
                "steps": [
                    "Document family decision-making structure",
                    "Map voting rights, veto powers, and escalation paths",
                    "Create succession plan for all key roles",
                    "Establish conflict resolution protocol",
                    "Annual governance health assessment",
                ],
            },
        ],
        "trust_concerns": [
            "You'll see our complete financial picture — extreme confidentiality required. Multi-layer NDAs and air-gapped data handling.",
            "Our existing advisors may resist external risk oversight. We position as additive intelligence, not audit.",
            "Family governance is deeply personal. Our approach is facilitative, not prescriptive.",
            "How do you handle disagreements within the family? Structured facilitation with documented options, not taking sides.",
        ],
        "objection_handling": [
            {
                "objection": "Our CIO already manages risk",
                "response": "CIOs manage investment risk. A Risk Council covers operational, cyber, reputational, and governance risk — the full threat landscape.",
            },
            {
                "objection": "We have insurance for that",
                "response": "Insurance transfers risk financially. We prevent and mitigate risk operationally. Most policies have exclusions families don't discover until claim time.",
            },
            {
                "objection": "Risk management feels too corporate for our family",
                "response": "We adapt corporate best practices into family-friendly formats. No jargon, no bureaucracy — just clear visibility and better decisions.",
            },
            {
                "objection": "We review risk annually — that's sufficient",
                "response": "Annual reviews miss emerging risks. Our quarterly cadence catches threats early when they're cheap to address, not after they've become crises.",
            },
        ],
        "kpi_stack": [
            {"kpi": "Risk register completeness", "target": "100% domains covered", "measurement": "Quarterly risk register audit"},
            {"kpi": "Stress test coverage", "target": "3+ scenarios per quarter", "measurement": "Scenario documentation"},
            {"kpi": "Insurance gap closure rate", "target": "100% identified gaps addressed within 90 days", "measurement": "Gap tracking log"},
            {"kpi": "Key-person succession readiness", "target": "All critical roles have documented succession", "measurement": "Annual succession review"},
            {"kpi": "Risk committee meeting cadence", "target": "4 per year minimum", "measurement": "Meeting records"},
        ],
        "voiceforge_assets": [
            "risk_committee_presentation_script",
            "family_governance_facilitation_guide",
            "quarterly_risk_briefing_narration",
            "scenario_planning_workshop_script",
        ],
        "visionaudio_assets": [
            "risk_dashboard_interactive_demo",
            "stress_test_results_visualization",
            "governance_framework_overview_video",
            "risk_universe_map_animation",
        ],
    },

    # ──────────────────────────────────────────────────────────────────────
    # 7. Next-Gen Studio
    # ──────────────────────────────────────────────────────────────────────
    {
        "slug": "next-gen-studio",
        "name": "Next-Gen Studio",
        "target_buyer": "Multigenerational wealth families",
        "price_range_min": 25000.0,
        "price_range_max": 60000.0,
        "core_pain": "Succession planning failure and next-generation unpreparedness for wealth stewardship",
        "icp": {
            "wealth_tier": "UHNWI",
            "life_stage": "Transition",
            "buyer_type": "G1/G2 Principal or Family Office Director",
            "typical_profile": "G1 founder or G2 steward, 2-5 next-gen members aged 16-35, concerned about entitlement/competence, $100M+ legacy at stake",
            "net_worth_range": "$100M-$1B+",
            "decision_speed": "Slow — generational decisions take years",
            "trust_model": "Deep relationship over multiple engagements, family therapist-level trust",
        },
        "pain_triggers": [
            "Next-gen member made poor investment losing $2M+ with no oversight",
            "Family meeting devolved into argument about inheritance fairness",
            "G3 member has no interest in family business but depends on distributions",
            "Patriarch/matriarch health event accelerating succession timeline",
            "Next-gen member publicly embarrassed family brand on social media",
            "No formal education program — next-gen learning wealth management by osmosis",
        ],
        "pricing_model": {
            "type": "project_based",
            "base_fee": 25000,
            "premium_tier": 60000,
            "setup_fee": 10000,
            "billing_cycle": "milestone-based",
            "contract_term": "6-18 month engagement",
            "included_hours": "Full program design and facilitation",
            "overage_rate": "$750/hr for extended coaching",
        },
        "sop_skeleton": [
            {
                "name": "Next-Gen Assessment",
                "steps": [
                    "Individual assessments — financial literacy, leadership style, interests, values",
                    "Family dynamics mapping — relationships, alliances, tensions",
                    "Readiness scoring for each next-gen member across 8 competency areas",
                    "Confidential interviews with each family member",
                    "Deliver family readiness report with development roadmap",
                ],
            },
            {
                "name": "Education & Development Program",
                "steps": [
                    "Design custom curriculum per next-gen member based on gaps",
                    "Financial literacy bootcamp — investments, tax, estate, philanthropy",
                    "Leadership development — mentorship pairing with external leaders",
                    "Real-world projects — manage a sub-portfolio or philanthropic initiative",
                    "Quarterly progress reviews with family governance committee",
                ],
            },
            {
                "name": "Succession Architecture",
                "steps": [
                    "Define roles and responsibilities for each generation",
                    "Create governance structure — family council, voting, decision rights",
                    "Design transition timeline with milestones and checkpoints",
                    "Establish family constitution or mission statement",
                    "Simulate succession scenarios and stress-test governance",
                ],
            },
        ],
        "trust_concerns": [
            "This is deeply personal family territory. Our facilitators are trained in family systems, not just finance.",
            "What if next-gen members resist participation? We design programs around their interests and goals — engagement, not compliance.",
            "Will this create conflict between generations? We facilitate dialogue that reduces conflict through structure and shared vision.",
            "How do you maintain confidentiality within the family? Individual sessions are confidential; shared sessions have agreed ground rules.",
        ],
        "objection_handling": [
            {
                "objection": "Our kids will learn by being involved in the business",
                "response": "Osmosis-based learning has a 70% failure rate by G3. Structured development accelerates readiness and prevents costly mistakes.",
            },
            {
                "objection": "We have a family therapist for relationship issues",
                "response": "Therapy addresses emotional dynamics. Next-Gen Studio addresses competency, governance, and operational readiness — the business side of family.",
            },
            {
                "objection": "Our succession plan is already in the estate documents",
                "response": "Estate plans transfer assets. Next-Gen Studio transfers capability. The best-drafted trust is useless if beneficiaries can't steward the wealth.",
            },
            {
                "objection": "This timeline is too long — we need results now",
                "response": "We design quick wins within 90 days while building the long-term program. Succession is a journey, but the first steps are immediate.",
            },
        ],
        "kpi_stack": [
            {"kpi": "Next-gen financial literacy score", "target": "80%+ on assessment", "measurement": "Pre/post assessment testing"},
            {"kpi": "Development plan completion rate", "target": ">90% milestones hit", "measurement": "Quarterly progress review"},
            {"kpi": "Family meeting effectiveness", "target": "4.5+/5.0 participant rating", "measurement": "Post-meeting survey"},
            {"kpi": "Succession readiness score", "target": "Green status for all designated successors", "measurement": "Annual readiness assessment"},
            {"kpi": "Real-world project completion", "target": "Each next-gen completes 1+ project", "measurement": "Project portfolio review"},
        ],
        "voiceforge_assets": [
            "family_meeting_facilitation_script",
            "next_gen_coaching_session_template",
            "succession_planning_workshop_guide",
            "financial_literacy_course_narration",
            "family_constitution_drafting_facilitation",
        ],
        "visionaudio_assets": [
            "next_gen_assessment_results_presentation",
            "succession_roadmap_visualization",
            "financial_literacy_training_video_series",
            "family_governance_structure_animation",
        ],
    },

    # ──────────────────────────────────────────────────────────────────────
    # 8. Medical Navigation
    # ──────────────────────────────────────────────────────────────────────
    {
        "slug": "medical-navigation",
        "name": "Medical Navigation",
        "target_buyer": "UHNW health-focused individuals and families",
        "price_range_min": 8000.0,
        "price_range_max": 20000.0,
        "core_pain": "Fragmented healthcare experience despite unlimited resources — no single navigator ensuring optimal outcomes",
        "icp": {
            "wealth_tier": "UHNWI",
            "life_stage": "Preservation",
            "buyer_type": "Principal or Spouse/Partner",
            "typical_profile": "Individual or family with complex health needs, 3+ specialists, proactive longevity mindset, or managing parent/elder care",
            "net_worth_range": "$30M-$500M",
            "decision_speed": "Fast for health crises, deliberate for preventive programs",
            "trust_model": "Medical credential verification + patient testimonials",
        },
        "pain_triggers": [
            "Specialist gave treatment recommendation without consulting other providers",
            "Waited 3 weeks for appointment with top specialist despite willingness to pay any amount",
            "Medication interaction missed because providers use different EHR systems",
            "Elderly parent in another city with no coordinated care team",
            "Executive health screening missed early-stage condition caught later at higher risk",
            "Medical records scattered across 6 different provider systems",
        ],
        "pricing_model": {
            "type": "monthly_retainer",
            "base_fee": 8000,
            "premium_tier": 20000,
            "setup_fee": 5000,
            "billing_cycle": "monthly",
            "contract_term": "12 months",
            "included_hours": "Ongoing navigation + 24/7 medical concierge line",
            "overage_rate": "$300/hr for international medical coordination",
        },
        "sop_skeleton": [
            {
                "name": "Medical Profile Assembly",
                "steps": [
                    "Collect and digitize complete medical history for each family member",
                    "Catalog all current providers, medications, and treatment plans",
                    "Identify gaps in preventive screening schedule",
                    "Create unified health record accessible to all authorized providers",
                    "Establish medical power of attorney and advance directive documentation",
                ],
            },
            {
                "name": "Provider Network Curation",
                "steps": [
                    "Identify top-tier specialists for each family member's needs",
                    "Establish VIP access protocols with key providers and hospitals",
                    "Negotiate direct-access arrangements bypassing standard scheduling",
                    "Maintain backup provider roster for travel and emergencies",
                ],
            },
            {
                "name": "Care Coordination Protocol",
                "steps": [
                    "Pre-appointment briefing — ensure specialist has complete relevant history",
                    "Attend appointments (virtually or in-person) to capture recommendations",
                    "Post-appointment summary with action items and cross-provider implications",
                    "Medication reconciliation after any treatment change",
                    "Quarterly care plan review across all providers",
                ],
            },
            {
                "name": "Medical Emergency Protocol",
                "steps": [
                    "24/7 medical concierge hotline staffed by RN",
                    "Rapid specialist triage and hospital coordination",
                    "Medical records transmission to receiving facility within 30 minutes",
                    "Family notification and travel coordination if needed",
                    "Post-emergency follow-up and care plan update",
                ],
            },
        ],
        "trust_concerns": [
            "Medical information is the most sensitive data we have. HIPAA-compliant systems with additional encryption layers.",
            "Will you override our doctors' recommendations? Never — we coordinate and ensure completeness, not second-guess clinicians.",
            "How do you handle family members who want privacy from each other? Individual profiles with configurable sharing permissions.",
            "What if we're traveling internationally and need care? We maintain global provider networks and medical evacuation partnerships.",
        ],
        "objection_handling": [
            {
                "objection": "We already have a concierge doctor",
                "response": "Concierge doctors provide primary care. We coordinate across all specialists, manage records, and navigate the system — especially during complex or multi-provider situations.",
            },
            {
                "objection": "We can get appointments anywhere with our resources",
                "response": "Access isn't the bottleneck — coordination is. Having 5 top specialists who don't talk to each other creates risk that money can't solve.",
            },
            {
                "objection": "Our family is healthy — we don't need this",
                "response": "The best outcomes come from proactive navigation. Our longevity screening protocols catch issues 2-5 years before symptomatic detection.",
            },
            {
                "objection": "This feels like a luxury we don't need",
                "response": "For a family managing $100M+, a missed diagnosis or medication interaction has consequences far beyond health. This is risk management for your most important asset.",
            },
        ],
        "kpi_stack": [
            {"kpi": "Specialist appointment lead time", "target": "<72 hours for non-emergency", "measurement": "Scheduling log"},
            {"kpi": "Medical record completeness", "target": "100% unified across providers", "measurement": "Quarterly record audit"},
            {"kpi": "Preventive screening compliance", "target": "100% on schedule", "measurement": "Screening calendar tracking"},
            {"kpi": "Emergency response time", "target": "<30 minutes to specialist triage", "measurement": "Incident log"},
            {"kpi": "Care coordination satisfaction", "target": "9+/10", "measurement": "Quarterly satisfaction survey"},
        ],
        "voiceforge_assets": [
            "onboarding_health_intake_script",
            "provider_introduction_briefing",
            "emergency_protocol_activation_script",
            "quarterly_health_review_presentation",
        ],
        "visionaudio_assets": [
            "health_dashboard_walkthrough_video",
            "care_coordination_platform_demo",
            "emergency_protocol_training_module",
            "longevity_screening_program_overview",
        ],
    },

    # ──────────────────────────────────────────────────────────────────────
    # 9. Property Resilience
    # ──────────────────────────────────────────────────────────────────────
    {
        "slug": "property-resilience",
        "name": "Property Resilience",
        "target_buyer": "High-value property owners",
        "price_range_min": 10000.0,
        "price_range_max": 20000.0,
        "core_pain": "Reactive property management with no proactive risk mitigation for high-value estates",
        "icp": {
            "wealth_tier": "UHNWI",
            "life_stage": "Preservation",
            "buyer_type": "Property Owner or Estate Manager",
            "typical_profile": "Owner of 3-10 properties valued at $5M+, including vacation homes, estates, or historic properties with complex maintenance needs",
            "net_worth_range": "$50M-$500M",
            "decision_speed": "Moderate — property decisions involve due diligence",
            "trust_model": "Track record with similar properties, insurance partner validation",
        },
        "pain_triggers": [
            "Burst pipe in unoccupied vacation home caused $500K in damage over 3 weeks",
            "Insurance claim denied due to lapsed maintenance documentation",
            "Wildfire evacuation with no pre-positioned plan for art and valuables",
            "Property manager embezzling through inflated vendor invoices",
            "Hurricane season approaching with inadequate storm preparation protocols",
            "Historic property deteriorating due to neglected preventive maintenance",
        ],
        "pricing_model": {
            "type": "annual_retainer",
            "base_fee": 10000,
            "premium_tier": 20000,
            "setup_fee": 8000,
            "billing_cycle": "annually",
            "contract_term": "Annual with per-property pricing",
            "included_hours": "Full resilience program per property",
            "overage_rate": "$250/hr for emergency response coordination",
        },
        "sop_skeleton": [
            {
                "name": "Property Resilience Assessment",
                "steps": [
                    "Physical inspection — structural, mechanical, electrical systems",
                    "Environmental risk assessment — flood, fire, earthquake, hurricane exposure",
                    "Security audit — access control, surveillance, alarm systems",
                    "Insurance coverage review — policy terms vs. actual replacement values",
                    "Deliver resilience scorecard with prioritized improvement plan",
                ],
            },
            {
                "name": "Preventive Maintenance Protocol",
                "steps": [
                    "Create maintenance calendar for each property by system",
                    "Establish vendor relationships for all maintenance categories",
                    "Implement IoT monitoring — water sensors, temperature, humidity, security",
                    "Monthly remote check-in protocol for unoccupied properties",
                    "Annual comprehensive inspection with documentation",
                ],
            },
            {
                "name": "Disaster Preparedness",
                "steps": [
                    "Valuables inventory with photo documentation and appraisals",
                    "Evacuation plan for art, documents, and irreplaceable items",
                    "Storm/disaster preparation checklist by property and hazard type",
                    "Emergency vendor contact list — restoration, board-up, water mitigation",
                    "Insurance claims preparation — pre-loss documentation package",
                ],
            },
        ],
        "trust_concerns": [
            "You'll have access to our properties and security details. Bonded, insured, and background-checked team with access controls.",
            "Will this conflict with our existing property managers? We augment and audit — adding the resilience layer they don't provide.",
            "How do you handle properties in different countries? Multi-jurisdiction experience with local partner networks.",
            "What about liability if something goes wrong during your service? $10M+ professional liability coverage on every engagement.",
        ],
        "objection_handling": [
            {
                "objection": "We have property managers for each location",
                "response": "Property managers handle day-to-day. We handle resilience — risk assessment, disaster prep, insurance optimization, and cross-property coordination they can't do in isolation.",
            },
            {
                "objection": "Our insurance covers property damage",
                "response": "Insurance pays after damage. We prevent damage or minimize it. Plus, proper documentation doubles successful claim rates and speeds payouts by 60%.",
            },
            {
                "objection": "We've owned these properties for years without issues",
                "response": "Climate risk is accelerating. Properties that were safe 10 years ago face new flood, fire, and storm exposure. Proactive resilience is the new standard.",
            },
            {
                "objection": "IoT monitoring seems excessive",
                "response": "A $200 water sensor saved one client $1.2M in damage by detecting a slow leak in an unoccupied home. ROI is immediate.",
            },
        ],
        "kpi_stack": [
            {"kpi": "Preventive maintenance compliance", "target": "100% on schedule", "measurement": "Maintenance calendar tracking"},
            {"kpi": "Unplanned repair incidents", "target": "<2 per property per year", "measurement": "Incident log"},
            {"kpi": "Insurance coverage adequacy", "target": "100% properties at replacement value", "measurement": "Annual insurance review"},
            {"kpi": "Emergency response readiness", "target": "All properties have current disaster plan", "measurement": "Quarterly plan review"},
            {"kpi": "IoT alert response time", "target": "<1 hour for critical alerts", "measurement": "Alert log analysis"},
        ],
        "voiceforge_assets": [
            "property_assessment_report_narration",
            "disaster_preparedness_briefing_script",
            "insurance_optimization_presentation",
            "property_manager_coordination_guide",
        ],
        "visionaudio_assets": [
            "property_resilience_dashboard_demo",
            "iot_monitoring_system_walkthrough",
            "disaster_preparation_checklist_video",
            "insurance_documentation_best_practices",
        ],
    },

    # ──────────────────────────────────────────────────────────────────────
    # 10. Travel Reliability
    # ──────────────────────────────────────────────────────────────────────
    {
        "slug": "travel-reliability",
        "name": "Travel Reliability",
        "target_buyer": "Frequent multi-generational travelers",
        "price_range_min": 6000.0,
        "price_range_max": 15000.0,
        "core_pain": "Travel disruptions cascading into chaos for complex multi-generational itineraries",
        "icp": {
            "wealth_tier": "HNWI/UHNWI",
            "life_stage": "Any",
            "buyer_type": "Principal or Family Travel Coordinator",
            "typical_profile": "Family taking 8-15 trips/year, 4-12 travelers including elderly and children, mix of private and commercial travel, 3+ international trips annually",
            "net_worth_range": "$10M-$300M",
            "decision_speed": "Fast — travel decisions are time-sensitive",
            "trust_model": "Demonstrated competence through first trip, then ongoing trust",
        },
        "pain_triggers": [
            "Flight cancellation stranding elderly parent and grandchildren in different airports",
            "Hotel lost reservation for 8-person family trip during peak season",
            "Medical emergency abroad with no local provider relationships",
            "Visa issue discovered at airport causing family member to miss trip",
            "Private jet mechanical issue with no backup aircraft arranged",
            "Dietary and allergy requirements not communicated to resort staff",
        ],
        "pricing_model": {
            "type": "monthly_retainer",
            "base_fee": 6000,
            "premium_tier": 15000,
            "setup_fee": 3000,
            "billing_cycle": "monthly",
            "contract_term": "12 months",
            "included_hours": "Unlimited trip planning and real-time support",
            "overage_rate": "$200/hr for on-ground escort services",
        },
        "sop_skeleton": [
            {
                "name": "Travel Profile Setup",
                "steps": [
                    "Compile preferences for each family member — seating, dietary, hotels, activities",
                    "Document medical needs, medications, and emergency contacts",
                    "Catalog passport/visa status with expiration alerts",
                    "Map loyalty programs, memberships, and VIP access",
                    "Create allergy/dietary master list for all venues",
                ],
            },
            {
                "name": "Trip Planning Protocol",
                "steps": [
                    "Intake — destination, dates, party composition, purpose, special requirements",
                    "Build primary itinerary with all bookings confirmed",
                    "Create contingency plan — backup flights, hotels, and activities",
                    "Pre-trip briefing — weather, safety, cultural notes, emergency contacts",
                    "Final confirmation sweep 48 hours before departure",
                ],
            },
            {
                "name": "Real-Time Travel Support",
                "steps": [
                    "24/7 travel desk staffed during all active trips",
                    "Flight monitoring with proactive rebooking on disruptions",
                    "Ground transport confirmation and live tracking",
                    "Restaurant and activity changes accommodated in real-time",
                    "Daily itinerary push to all travelers with next-day preview",
                ],
            },
            {
                "name": "Post-Trip Review",
                "steps": [
                    "Collect feedback from all family members",
                    "Update preference profiles based on experience",
                    "Vendor performance scoring for future reference",
                    "Expense reconciliation and receipt organization",
                    "Loyalty point optimization and status tracking",
                ],
            },
        ],
        "trust_concerns": [
            "We've had bad experiences with travel agents who don't listen. Our process starts with deep preference profiling and iterates.",
            "What happens when things go wrong mid-trip? 24/7 live desk with authority to make immediate rebookings and changes.",
            "How do you handle elderly family members' special needs? Dedicated medical and accessibility protocols for every trip.",
            "Can you work with our existing travel advisors and memberships? We integrate with any existing relationships and optimize them.",
        ],
        "objection_handling": [
            {
                "objection": "We use a luxury travel agency already",
                "response": "Travel agencies plan trips. We ensure reliability — contingency planning, real-time disruption management, and multi-generational logistics that agencies don't cover.",
            },
            {
                "objection": "We mostly fly private — disruptions aren't an issue",
                "response": "Private aviation has a 15% disruption rate from mechanical, weather, and crew issues. Plus, ground logistics, hotels, and activities still need contingency planning.",
            },
            {
                "objection": "Our assistant handles travel",
                "response": "Assistants plan travel on top of everything else. We provide dedicated, 24/7 travel reliability — including real-time support your assistant can't provide at 2 AM in a different time zone.",
            },
            {
                "objection": "We don't travel enough to justify a retainer",
                "response": "At 8+ trips per year with multi-generational logistics, one prevented disruption — especially involving elderly or children — justifies the entire annual retainer.",
            },
        ],
        "kpi_stack": [
            {"kpi": "Trip disruption recovery time", "target": "<2 hours to full resolution", "measurement": "Incident log timestamps"},
            {"kpi": "Booking accuracy rate", "target": "100% — zero reservation errors", "measurement": "Trip audit"},
            {"kpi": "Traveler satisfaction score", "target": "9+/10 per trip", "measurement": "Post-trip survey"},
            {"kpi": "Contingency plan coverage", "target": "100% trips have backup options", "measurement": "Pre-trip checklist audit"},
            {"kpi": "Preference compliance rate", "target": ">98% preferences met", "measurement": "Post-trip preference match review"},
        ],
        "voiceforge_assets": [
            "pre_trip_briefing_script",
            "real_time_disruption_notification_template",
            "post_trip_review_facilitation_guide",
            "traveler_preference_intake_script",
        ],
        "visionaudio_assets": [
            "travel_dashboard_demo_video",
            "disruption_management_process_animation",
            "preference_profile_setup_walkthrough",
            "trip_planning_platform_overview",
        ],
    },
]
