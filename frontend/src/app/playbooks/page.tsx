'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────
type Tier = 'HNW' | 'UHNW'
type Lifecycle = 'Emerging' | 'Accelerating' | 'Proven'
type DeliveryModel = 'Orchestrated' | 'Team' | 'Tech-Assisted' | 'Solo'
type RedTeamStatus = 'Passed' | 'Failed' | 'Not audited'
type Category = 'Security' | 'Coordination' | 'Governance' | 'Privacy' | 'Medical' | 'Travel' | 'Property'
type FilterTab = 'all' | 'templates' | 'active' | 'custom' | 'composites' | 'redteam'
type ViewMode = 'cards' | 'list'

interface Playbook {
  id: number
  slug: string
  name: string
  price: string
  pricingModel: string
  tier: Tier
  lifecycle: Lifecycle
  deliveryModel: DeliveryModel
  redTeam: RedTeamStatus
  activeClients: number
  evidence: number
  wtp: number
  activationTime: string
  kpisDefined: string
  readiness: number
  integrations: { vf: boolean; va: boolean; dd: boolean; tp: boolean }
  category: Category
  accentColor: string
  buyer: string
  pain: string
  isCustom: boolean
  isComposite: boolean
  included: { label: string; done: boolean }[]
  citations: { source: string; credibility: number }[]
  compatible: string[]
}

// ─── Inline Data ─────────────────────────────────────────────
const PLAYBOOKS: Playbook[] = [
  {
    id: 1, slug: 'private-ops-office', name: 'Private Ops Office',
    price: '$15-30K/mo', pricingModel: 'Monthly retainer', tier: 'HNW', lifecycle: 'Accelerating',
    deliveryModel: 'Orchestrated', redTeam: 'Passed', activeClients: 3,
    evidence: 8.2, wtp: 7.9, activationTime: '38min', kpisDefined: '4/4', readiness: 95,
    integrations: { vf: true, va: true, dd: true, tp: true },
    category: 'Coordination', accentColor: 'bg-teal-500',
    buyer: 'Newly wealthy founders & executives', pain: 'Coordination overload across vendors, advisors, and household staff',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Dedicated ops coordinator', done: true }, { label: 'Vendor management portal', done: true },
      { label: 'Weekly status briefings', done: true }, { label: 'Crisis escalation protocol', done: true },
      { label: 'Calendar orchestration', done: true }, { label: 'Expense tracking dashboard', done: true },
      { label: 'Staff vetting pipeline', done: true }, { label: 'Document vault access', done: true },
      { label: 'Travel coordination add-on', done: false }, { label: 'Medical liaison service', done: false },
    ],
    citations: [
      { source: 'McKinsey Family Office Report 2024', credibility: 92 },
      { source: 'UBS Global Wealth Survey', credibility: 88 },
      { source: 'ChamberForge Client Interviews (n=15)', credibility: 85 },
    ],
    compatible: ['Ecosystem Orchestrator', 'Household Workforce', 'Travel Reliability'],
  },
  {
    id: 2, slug: 'ecosystem-orchestrator', name: 'Ecosystem Orchestrator',
    price: '$20-40K/mo', pricingModel: 'Monthly retainer', tier: 'UHNW', lifecycle: 'Proven',
    deliveryModel: 'Orchestrated', redTeam: 'Passed', activeClients: 2,
    evidence: 8.5, wtp: 8.1, activationTime: '45min', kpisDefined: '4/4', readiness: 100,
    integrations: { vf: true, va: true, dd: true, tp: true },
    category: 'Coordination', accentColor: 'bg-teal-500',
    buyer: 'Multi-residence UHNW families', pain: 'Fragmented vendor stack across geographies and properties',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Multi-property coordination hub', done: true }, { label: 'Vendor scoring & selection', done: true },
      { label: 'Cross-geography compliance', done: true }, { label: 'Quarterly strategic reviews', done: true },
      { label: 'Real-time vendor dashboards', done: true }, { label: 'SLA enforcement engine', done: true },
      { label: 'Budget consolidation reports', done: true }, { label: 'Emergency response network', done: true },
      { label: 'Insurance coordination layer', done: true }, { label: 'Next-gen onboarding module', done: true },
    ],
    citations: [
      { source: 'Deloitte Family Enterprise Survey 2024', credibility: 94 },
      { source: 'Campden Wealth Global Report', credibility: 91 },
      { source: 'ChamberForge Pilot Data (n=8)', credibility: 82 },
    ],
    compatible: ['Private Ops Office', 'Family Risk Council', 'Property Resilience'],
  },
  {
    id: 3, slug: 'family-cyber-command', name: 'Family Cyber Command',
    price: '$10-25K/mo', pricingModel: 'Monthly retainer', tier: 'UHNW', lifecycle: 'Emerging',
    deliveryModel: 'Team', redTeam: 'Failed', activeClients: 1,
    evidence: 9.0, wtp: 8.7, activationTime: '52min', kpisDefined: '3/4', readiness: 72,
    integrations: { vf: true, va: false, dd: true, tp: false },
    category: 'Security', accentColor: 'bg-red-500',
    buyer: 'Family offices & public-facing executives', pain: 'AI voice cloning, wire fraud, impersonation attacks',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Threat monitoring dashboard', done: true }, { label: 'AI impersonation detection', done: true },
      { label: 'Wire fraud prevention protocol', done: true }, { label: 'Family device hardening', done: true },
      { label: 'Dark web scanning', done: true }, { label: 'Incident response team', done: true },
      { label: 'Staff security training', done: true }, { label: 'Penetration testing quarterly', done: false },
      { label: 'Insurance claims support', done: false }, { label: 'Legal liaison for breaches', done: false },
    ],
    citations: [
      { source: 'FBI IC3 Annual Report 2024', credibility: 97 },
      { source: 'Mandiant Threat Intelligence Brief', credibility: 93 },
      { source: 'Aon Cyber Risk Survey (UHNW)', credibility: 89 },
    ],
    compatible: ['Footprint Reduction', 'Family Risk Council'],
  },
  {
    id: 4, slug: 'footprint-reduction', name: 'Footprint Reduction',
    price: '$8-18K/mo', pricingModel: 'Monthly retainer', tier: 'UHNW', lifecycle: 'Proven',
    deliveryModel: 'Tech-Assisted', redTeam: 'Passed', activeClients: 0,
    evidence: 7.8, wtp: 7.2, activationTime: '30min', kpisDefined: '4/4', readiness: 88,
    integrations: { vf: false, va: true, dd: true, tp: true },
    category: 'Privacy', accentColor: 'bg-amber-500',
    buyer: 'Public-facing executives & celebrities', pain: 'Data broker exposure, doxxing risk, open-source intel vulnerability',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Data broker removal service', done: true }, { label: 'OSINT vulnerability audit', done: true },
      { label: 'Social media hygiene review', done: true }, { label: 'Property record obscuration', done: true },
      { label: 'Ongoing monitoring dashboard', done: true }, { label: 'Family member scan', done: true },
      { label: 'Court record sealing support', done: true }, { label: 'Digital alias management', done: true },
      { label: 'VPN & encrypted comms setup', done: true }, { label: 'Annual re-assessment', done: false },
    ],
    citations: [
      { source: 'FTC Data Broker Report 2024', credibility: 95 },
      { source: 'Privacy Rights Clearinghouse Study', credibility: 87 },
      { source: 'ChamberForge Internal Analysis', credibility: 80 },
    ],
    compatible: ['Family Cyber Command', 'Travel Reliability'],
  },
  {
    id: 5, slug: 'household-workforce', name: 'Household Workforce',
    price: '$12-22K/mo', pricingModel: 'Monthly retainer', tier: 'HNW', lifecycle: 'Accelerating',
    deliveryModel: 'Team', redTeam: 'Not audited', activeClients: 0,
    evidence: 7.1, wtp: 6.8, activationTime: '40min', kpisDefined: '2/4', readiness: 65,
    integrations: { vf: false, va: false, dd: true, tp: false },
    category: 'Coordination', accentColor: 'bg-teal-500',
    buyer: 'Principals with 5+ household staff', pain: 'Insider risk, vetting gaps, staff turnover, compliance blind spots',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Staff vetting & background checks', done: true }, { label: 'NDA & contract management', done: true },
      { label: 'Performance review framework', done: true }, { label: 'Payroll compliance audit', done: true },
      { label: 'Training program design', done: true }, { label: 'Exit protocol & asset recovery', done: false },
      { label: 'Workers comp management', done: false }, { label: 'Succession planning for roles', done: false },
      { label: 'Cultural sensitivity training', done: false }, { label: 'Holiday & absence tracking', done: false },
    ],
    citations: [
      { source: 'Housekeeper.com Industry Report', credibility: 72 },
      { source: 'Staffing Industry Analysts (SIA)', credibility: 78 },
      { source: 'ChamberForge Client Survey (n=6)', credibility: 68 },
    ],
    compatible: ['Private Ops Office', 'Ecosystem Orchestrator'],
  },
  {
    id: 6, slug: 'family-risk-council', name: 'Family Risk Council',
    price: '$15-35K/qtr', pricingModel: 'Quarterly engagement', tier: 'UHNW', lifecycle: 'Accelerating',
    deliveryModel: 'Orchestrated', redTeam: 'Passed', activeClients: 1,
    evidence: 8.0, wtp: 7.5, activationTime: '55min', kpisDefined: '4/4', readiness: 90,
    integrations: { vf: true, va: true, dd: true, tp: true },
    category: 'Governance', accentColor: 'bg-purple-500',
    buyer: 'Investment-focused family offices', pain: 'Non-investment risk underbuilt — reputation, cyber, physical, legal',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Quarterly risk assessment', done: true }, { label: 'Board-ready risk report', done: true },
      { label: 'Cross-domain risk matrix', done: true }, { label: 'Scenario planning sessions', done: true },
      { label: 'Regulatory change monitoring', done: true }, { label: 'Insurance gap analysis', done: true },
      { label: 'Vendor risk scoring', done: true }, { label: 'Succession risk mapping', done: true },
      { label: 'Geopolitical exposure brief', done: true }, { label: 'Annual strategic risk offsite', done: false },
    ],
    citations: [
      { source: 'EY Global Family Office Report', credibility: 93 },
      { source: 'WEF Global Risks Report 2025', credibility: 96 },
      { source: 'Institute for Family Governance', credibility: 84 },
    ],
    compatible: ['Family Cyber Command', 'Ecosystem Orchestrator', 'Next-Gen Studio'],
  },
  {
    id: 7, slug: 'next-gen-studio', name: 'Next-Gen Studio',
    price: '$25-60K', pricingModel: 'Project-based', tier: 'UHNW', lifecycle: 'Emerging',
    deliveryModel: 'Orchestrated', redTeam: 'Not audited', activeClients: 0,
    evidence: 7.5, wtp: 7.0, activationTime: '60min', kpisDefined: '1/4', readiness: 55,
    integrations: { vf: false, va: true, dd: false, tp: false },
    category: 'Governance', accentColor: 'bg-purple-500',
    buyer: 'Multigenerational wealth families', pain: 'Succession conflict, next-gen disengagement, values misalignment',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Next-gen readiness assessment', done: true }, { label: 'Family governance workshop', done: true },
      { label: 'Values alignment session', done: true }, { label: 'Leadership development plan', done: false },
      { label: 'Mentorship matching program', done: false }, { label: 'Communication framework', done: false },
      { label: 'Decision-rights mapping', done: false }, { label: 'Philanthropy strategy module', done: false },
      { label: 'Family constitution draft', done: false }, { label: 'Annual family assembly plan', done: false },
    ],
    citations: [
      { source: 'Merrill Lynch Wealth Transfer Study', credibility: 90 },
      { source: 'Williams Group Generational Wealth', credibility: 86 },
      { source: 'Family Business Review Journal', credibility: 83 },
    ],
    compatible: ['Family Risk Council', 'Ecosystem Orchestrator'],
  },
  {
    id: 8, slug: 'medical-navigation', name: 'Medical Navigation',
    price: '$8-20K/mo', pricingModel: 'Monthly retainer', tier: 'HNW', lifecycle: 'Emerging',
    deliveryModel: 'Solo', redTeam: 'Passed', activeClients: 0,
    evidence: 6.5, wtp: 6.2, activationTime: '25min', kpisDefined: '3/4', readiness: 80,
    integrations: { vf: false, va: false, dd: true, tp: true },
    category: 'Medical', accentColor: 'bg-green-500',
    buyer: 'UHNW health-focused individuals & families', pain: 'Fragmented medical records, second-opinion logistics, global care coordination',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Medical records consolidation', done: true }, { label: 'Second opinion coordination', done: true },
      { label: 'Global specialist network', done: true }, { label: 'Emergency medical protocol', done: true },
      { label: 'Family health dashboard', done: true }, { label: 'Preventive care scheduling', done: true },
      { label: 'Insurance claims advocacy', done: true }, { label: 'Mental health resource network', done: false },
      { label: 'Medical travel coordination', done: false }, { label: 'End-of-life planning support', done: false },
    ],
    citations: [
      { source: 'WHO Global Health Observatory', credibility: 91 },
      { source: 'Concierge Medicine Today Report', credibility: 79 },
      { source: 'ChamberForge Pilot Feedback (n=4)', credibility: 71 },
    ],
    compatible: ['Travel Reliability', 'Private Ops Office'],
  },
  {
    id: 9, slug: 'property-resilience', name: 'Property Resilience',
    price: '$10-20K/yr', pricingModel: 'Annual subscription', tier: 'HNW', lifecycle: 'Proven',
    deliveryModel: 'Solo', redTeam: 'Passed', activeClients: 1,
    evidence: 7.2, wtp: 6.8, activationTime: '20min', kpisDefined: '4/4', readiness: 92,
    integrations: { vf: false, va: false, dd: true, tp: true },
    category: 'Property', accentColor: 'bg-orange-500',
    buyer: 'High-value property owners (3+ residences)', pain: 'Insurance gaps, climate exposure, maintenance blind spots',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Multi-property risk audit', done: true }, { label: 'Insurance coverage gap analysis', done: true },
      { label: 'Climate exposure assessment', done: true }, { label: 'Maintenance scheduling system', done: true },
      { label: 'Vendor coordination per property', done: true }, { label: 'Smart home security review', done: true },
      { label: 'Property value tracking', done: true }, { label: 'Emergency response playbook', done: true },
      { label: 'Renovation project oversight', done: true }, { label: 'Art & collectibles protection', done: false },
    ],
    citations: [
      { source: 'Swiss Re Climate Risk Report', credibility: 94 },
      { source: 'Knight Frank Wealth Report 2024', credibility: 90 },
      { source: 'AIG Private Client Group Data', credibility: 87 },
    ],
    compatible: ['Ecosystem Orchestrator', 'Family Risk Council'],
  },
  {
    id: 10, slug: 'travel-reliability', name: 'Travel Reliability',
    price: '$6-15K/mo', pricingModel: 'Monthly retainer', tier: 'HNW', lifecycle: 'Accelerating',
    deliveryModel: 'Solo', redTeam: 'Failed', activeClients: 0,
    evidence: 6.8, wtp: 6.5, activationTime: '22min', kpisDefined: '2/4', readiness: 60,
    integrations: { vf: false, va: false, dd: false, tp: false },
    category: 'Travel', accentColor: 'bg-blue-500',
    buyer: 'Frequent multi-generational travelers', pain: 'Disruption, logistics gaps, medical emergencies abroad, security threats',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Itinerary risk assessment', done: true }, { label: 'Real-time travel monitoring', done: true },
      { label: 'Emergency evacuation protocol', done: true }, { label: 'Medical support abroad', done: true },
      { label: 'Security advance work', done: false }, { label: 'Private aviation coordination', done: false },
      { label: 'Destination intelligence briefs', done: false }, { label: 'Family tracking dashboard', done: false },
      { label: 'Insurance claims while traveling', done: false }, { label: 'Multi-timezone scheduling', done: false },
    ],
    citations: [
      { source: 'ISOS Travel Risk Report 2024', credibility: 88 },
      { source: 'Global Rescue Incident Data', credibility: 84 },
      { source: 'ChamberForge Market Interviews (n=10)', credibility: 76 },
    ],
    compatible: ['Private Ops Office', 'Footprint Reduction', 'Medical Navigation'],
  },
]

// Plain-language descriptions for deliverables shown in the DetailPanel.
const INCLUDED_DESCRIPTIONS: Record<string, string> = {
  'Dedicated ops coordinator': 'A named person owning daily coordination across vendors, staff, and advisors — your single point of accountability.',
  'Vendor management portal': 'Centralized dashboard for all vendor relationships, SLAs, performance scores, and payment status.',
  'Weekly status briefings': 'A written brief every Friday summarizing the week — open items, risks, and decisions needed from you.',
  'Crisis escalation protocol': 'A pre-agreed chain of command for urgent events (medical, security, staff, financial) with contact tree and response times.',
  'Calendar orchestration': 'Coordinated calendar across principals, household, and advisors — conflict detection and priority routing.',
  'Expense tracking dashboard': 'Real-time view of household, staff, and vendor spending with monthly variance reports.',
  'Staff vetting pipeline': 'Structured background, reference, and credentialing flow before anyone gains household access.',
  'Document vault access': 'Encrypted shared workspace for contracts, NDAs, and sensitive documents with audit log.',
  'Travel coordination add-on': 'Optional add-on — trip logistics, security advance work, and destination intelligence briefs.',
  'Medical liaison service': 'Optional add-on — coordinates second opinions, specialist referrals, and emergency medical response.',
  'Multi-property coordination hub': 'Single operations view across every residence — staff, vendors, maintenance, and budget by property.',
  'Vendor scoring & selection': 'Structured scoring against cost, reliability, discretion, and SLA adherence — with quarterly re-bids.',
  'Cross-geography compliance': 'Tracks labor, tax, and privacy rules per jurisdiction; flags gaps before they become violations.',
  'Quarterly strategic reviews': 'A 2-hour working session per quarter to realign priorities with the principal and chief of staff.',
  'Real-time vendor dashboards': 'Live status panel per vendor — next scheduled visit, last incident, SLA posture.',
  'SLA enforcement engine': 'Automated tracking of promised response times; generates credit memos on breach.',
  'Budget consolidation reports': 'Roll-up of property, staff, and vendor costs across the portfolio with peer benchmarks.',
  'Emergency response network': 'Pre-qualified responders (security, medical, legal, PR) on retainer across each geography.',
  'Insurance coordination layer': 'Single-broker view of all household policies with gap analysis and claim advocacy.',
  'Next-gen onboarding module': 'Structured program bringing adult children into the family office with clear roles and timelines.',
  'Threat monitoring dashboard': 'A real-time dashboard showing all detected threats, monitoring status, and incident history. Shared with client weekly via portal.',
  'AI impersonation detection': 'Automated monitoring for deepfake audio/video targeting the client\'s household. Alerts within 15 minutes of detection.',
  'Wire fraud prevention protocol': 'A written verification protocol for all financial requests, including passphrase system and dual-authorization procedures.',
  'Family device hardening': 'Secure configuration of phones, laptops, and home networks for every family member with quarterly re-hardening.',
  'Dark web scanning': 'Continuous monitoring of leaks, credential dumps, and criminal forums for references to the household.',
  'Incident response team': 'Named responder on 24/7 standby — triage, containment, and post-incident documentation.',
  'Staff security training': 'Quarterly training for household and office staff on phishing, wire requests, and impersonation tactics.',
  'Penetration testing quarterly': 'Simulated intrusion tests (digital and physical) to surface gaps before real attackers do.',
  'Insurance claims support': 'Assistance preparing and filing cyber insurance claims with documentation chain of custody.',
  'Legal liaison for breaches': 'Pre-negotiated breach counsel on retainer with defined notification and disclosure playbooks.',
  'Data broker removal service': 'Systematic opt-out and suppression across 200+ data broker sites, tracked monthly.',
  'OSINT vulnerability audit': 'A written audit of what can be learned about the principal and family from public sources.',
  'Social media hygiene review': 'Review of all household members\' public social profiles with recommendations and hardening.',
  'Property record obscuration': 'Trust and LLC structures to remove principal names from deed and tax records where legal.',
  'Ongoing monitoring dashboard': 'Live view of where the principal\'s footprint is growing and which mitigations are in place.',
  'Family member scan': 'Per-person privacy assessments for spouse and adult children with tailored mitigation plans.',
  'Court record sealing support': 'Where legal, petitions to seal or redact court filings that surface personal information.',
  'Digital alias management': 'Burner emails, aliases, and mail forwarding setups for high-exposure activities (bookings, subscriptions).',
  'VPN & encrypted comms setup': 'Installed and maintained encrypted communications stack across household devices.',
  'Annual re-assessment': 'A complete privacy re-audit every 12 months — new exposure surfaces, new mitigations.',
  'Staff vetting & background checks': 'Structured background, reference, and credentialing flow before anyone gains household access.',
  'NDA & contract management': 'Current, signed, jurisdiction-appropriate NDAs and employment agreements for every staff member.',
  'Performance review framework': 'Quarterly review cadence with documented feedback, raise bands, and performance improvement plans.',
  'Payroll compliance audit': 'Workers comp, tax withholding, and labor law compliance audit per jurisdiction.',
  'Training program design': 'Role-specific onboarding curriculum and ongoing skills development.',
  'Exit protocol & asset recovery': 'Documented off-boarding with asset return, credential revocation, and exit interview.',
  'Workers comp management': 'Active management of workers compensation coverage, claims, and cost control across staff.',
  'Succession planning for roles': 'Named backup for every key role — ready to step in if the primary leaves.',
  'Cultural sensitivity training': 'Training across cultural, religious, and dietary considerations for multi-national households.',
  'Holiday & absence tracking': 'Centralized PTO, sick day, and holiday coverage planning to avoid gaps.',
  'Quarterly risk assessment': 'A structured review across cyber, physical, legal, reputational, and financial risk — each quarter.',
  'Board-ready risk report': 'Board-formatted quarterly risk brief — heat map, trending risks, mitigation status.',
  'Cross-domain risk matrix': 'Maps interdependencies between risks (e.g. cyber → reputation → regulatory) so you see cascade paths.',
  'Scenario planning sessions': 'Two workshops per year stress-testing the household against named adverse scenarios.',
  'Regulatory change monitoring': 'Active tracking of rules impacting UHNW families — 13f, CCPA, state tax, corporate transparency.',
  'Insurance gap analysis': 'Policy-by-policy review identifying coverage gaps and over-insurance.',
  'Vendor risk scoring': 'Risk scores per vendor based on data access, dependency, and replaceability.',
  'Succession risk mapping': 'Identifies single points of failure in succession — roles, relationships, documents, access.',
  'Geopolitical exposure brief': 'Quarterly brief on geopolitical exposure for assets, residences, and travel patterns.',
  'Annual strategic risk offsite': 'Full-day offsite bringing family decision-makers and outside experts together annually.',
  'Next-gen readiness assessment': 'Structured evaluation of each next-gen family member\'s readiness for expanding responsibility.',
  'Family governance workshop': 'Facilitated 2-day workshop producing a shared governance framework and decision rights.',
  'Values alignment session': 'Structured exercise to surface and document the family\'s shared values and non-negotiables.',
  'Leadership development plan': 'Individualized development plan for each next-gen member — 12-24 month horizon.',
  'Mentorship matching program': 'External mentors (not parents) matched to next-gen members based on goals and gaps.',
  'Communication framework': 'Documented norms for how decisions get made, how conflict gets raised, how meetings run.',
  'Decision-rights mapping': 'Explicit map of who decides what — operator decisions vs family decisions vs advisor input.',
  'Philanthropy strategy module': 'Structured approach to giving — mission, criteria, governance, and impact measurement.',
  'Family constitution draft': 'A living document codifying family values, governance, and conflict resolution — facilitated draft.',
  'Annual family assembly plan': 'Pre-planned annual gathering agenda covering governance, performance, and relationship-building.',
  'Medical records consolidation': 'Consolidated digital medical record per family member — accessible 24/7 in any emergency.',
  'Second opinion coordination': 'On request: coordinated second or third opinions from world-class specialists within 72 hours.',
  'Global specialist network': 'Access to a vetted network of specialists across the top 20 major health centers worldwide.',
  'Emergency medical protocol': 'Documented per-person protocol covering meds, allergies, conditions, and preferred hospitals.',
  'Family health dashboard': 'Private dashboard tracking preventive care, specialist follow-ups, and health metrics per family member.',
  'Preventive care scheduling': 'Proactive scheduling of annual physicals, screenings, and age-appropriate preventive care.',
  'Insurance claims advocacy': 'Assistance filing, appealing, and negotiating medical claims with insurers.',
  'Mental health resource network': 'Confidential referrals to vetted psychiatrists, therapists, and specialized programs.',
  'Medical travel coordination': 'Logistics for medical travel including accommodation, local support, and continuity of care.',
  'End-of-life planning support': 'Structured conversations and documentation covering medical directives, palliative preferences, and family alignment.',
  'Multi-property risk audit': 'Per-property audit of physical, climate, insurance, and security risk with prioritized remediation list.',
  'Insurance coverage gap analysis': 'Line-by-line review of every policy across residences with gap and overlap identification.',
  'Climate exposure assessment': 'Exposure modeling for wildfire, hurricane, flood, and subsidence per property with 10-year outlook.',
  'Maintenance scheduling system': 'Calendar-based preventive maintenance per property with vendor routing and budget tracking.',
  'Vendor coordination per property': 'Single coordinator per residence managing every local vendor — not 15 relationships per home.',
  'Smart home security review': 'Audit of IoT devices, network segmentation, and physical access systems across properties.',
  'Property value tracking': 'Quarterly AVM and appraisal tracking with tax assessment appeals where warranted.',
  'Emergency response playbook': 'Per-property emergency plan covering evacuation, communications, and continuity of care.',
  'Renovation project oversight': 'Project management for renovations — vendor vetting, budget control, scope adherence.',
  'Art & collectibles protection': 'Specialized coverage and monitoring for art, wine, and collectibles including provenance documentation.',
  'Itinerary risk assessment': 'Pre-trip risk review covering security, health, climate, political, and logistical factors.',
  'Real-time travel monitoring': 'Active monitoring of principal\'s location, itinerary changes, and local events during travel.',
  'Emergency evacuation protocol': 'Pre-arranged evacuation plans per destination — ground, air, and medical evacuation partners on standby.',
  'Medical support abroad': 'Access to quality medical care in any destination via ISOS and regional medical providers.',
  'Security advance work': 'Optional advance team reviewing hotels, routes, and venues before high-profile travel.',
  'Private aviation coordination': 'Charter vetting, operator scoring, and real-time flight tracking with weather and disruption alerts.',
  'Destination intelligence briefs': 'Pre-trip brief per destination covering current political, health, security, and logistical conditions.',
  'Family tracking dashboard': 'Opt-in location visibility for traveling family members with emergency ping-and-confirm system.',
  'Insurance claims while traveling': 'Hands-on claim filing support for medical, baggage, and trip-interruption claims.',
  'Multi-timezone scheduling': 'Scheduling across multiple family members and time zones with auto-adjusting calendars.',
}

// Plain-language summaries of the key finding or stat each source contributes.
const EVIDENCE_KEY_FINDINGS: Record<string, string> = {
  'McKinsey Family Office Report 2024': '62% of family offices report coordination overload as the #1 unmet need across advisor, vendor, and staff layers.',
  'UBS Global Wealth Survey': 'UHNW principals spend an average of 11 hours/week on coordination tasks that a skilled operator could absorb.',
  'ChamberForge Client Interviews (n=15)': 'All 15 interviewed principals described the same pattern: "too many people reporting to me, not enough reporting to someone who reports to me".',
  'Deloitte Family Enterprise Survey 2024': '71% of multi-residence families cite fragmented vendor networks as the largest operational pain.',
  'Campden Wealth Global Report': 'Single-point-of-accountability operating models correlate with 3x higher principal satisfaction scores.',
  'ChamberForge Pilot Data (n=8)': 'All 8 pilot families reduced advisor meeting hours by >40% within the first quarter of engagement.',
  'FBI IC3 Annual Report 2024': 'UHNW households report 4.2x the median loss per cyber incident vs. broader HNW — $2.4M median.',
  'Mandiant Threat Intelligence Brief': 'AI-enabled impersonation (voice + video) grew 420% YoY targeting private banking and family office flows.',
  'Aon Cyber Risk Survey (UHNW)': 'Only 18% of UHNW households have a documented incident response plan — yet 73% have been targeted.',
  'FTC Data Broker Report 2024': '4,000+ data brokers sell personally identifiable information in the US. Removal requires systematic, ongoing effort.',
  'Privacy Rights Clearinghouse Study': 'Median time to clear a footprint across major data brokers without a professional service: 18 months.',
  'ChamberForge Internal Analysis': 'Principals who completed a full footprint reduction reported a 67% drop in unsolicited fraud contact attempts.',
  'Housekeeper.com Industry Report': 'Turnover in household staff averages 38% annually, driven by unclear expectations and compensation gaps.',
  'Staffing Industry Analysts (SIA)': 'Average replacement cost for a senior household staff role is $42K — 45% of annual salary.',
  'ChamberForge Client Survey (n=6)': 'Five of six clients surveyed had at least one workers-comp or payroll compliance gap within the prior 12 months.',
  'EY Global Family Office Report': 'Only 34% of family offices have a formal non-investment risk governance body — despite 91% rating it a priority.',
  'WEF Global Risks Report 2025': 'Family enterprise risk landscape shifted materially in 2024 — cyber, geopolitical, and climate now top concerns.',
  'Institute for Family Governance': 'Families with documented risk councils report 2.8x faster incident resolution than those without.',
  'Merrill Lynch Wealth Transfer Study': '70% of generational wealth transfers fail within two generations — almost always for non-financial reasons.',
  'Williams Group Generational Wealth': 'Communication and trust, not tax or estate structure, account for 85% of wealth-transfer failures.',
  'Family Business Review Journal': 'Families with documented governance frameworks are 5x more likely to preserve wealth across 3+ generations.',
  'WHO Global Health Observatory': 'Coordinated multi-specialist care improves outcomes by 32% in complex cases vs. fragmented care.',
  'Concierge Medicine Today Report': 'Principal-level concierge care reduces inappropriate ER visits by 58% and improves preventive-screening adherence.',
  'ChamberForge Pilot Feedback (n=4)': 'All 4 pilot families cited centralized records access as the single most impactful feature within 90 days.',
  'Swiss Re Climate Risk Report': '62% of HNW primary residences sit within regions with elevated climate risk per 10-year outlook — most are under-insured.',
  'Knight Frank Wealth Report 2024': 'Multi-residence HNW families carry an average 18% insurance gap across their portfolio by replacement value.',
  'AIG Private Client Group Data': 'Households with a coordinator managing all residences file 31% fewer claims and receive 24% faster settlements.',
  'ISOS Travel Risk Report 2024': 'Medical evacuations from outside the US exceed $50K on average; most household policies do not adequately cover.',
  'Global Rescue Incident Data': 'Political/civil unrest now affects 40+ countries annually — itinerary exposure changes week to week.',
  'ChamberForge Market Interviews (n=10)': 'Seven of ten frequent-traveler principals had experienced at least one trip disruption requiring professional intervention in the past 24 months.',
}

const CLIENT_MATCHES_BY_ID: Record<number, { id: string; name: string; matchReason: string }[]> = {
  // Private Ops Office — 3 active
  1: [
    { id: 'c-001', name: 'Jonathan Wellington III', matchReason: 'Coordination pain · UHNW' },
    { id: 'c-002', name: 'Hiroshi Nakamura', matchReason: 'Cross-border · multi-vendor' },
    { id: 'c-003', name: 'Elena Rivera', matchReason: 'Philanthropy ops load' },
  ],
  // Ecosystem Orchestrator — 2 active
  2: [
    { id: 'c-001', name: 'Jonathan Wellington III', matchReason: 'Multi-property' },
    { id: 'c-007', name: 'Robert Kingsley', matchReason: 'Alternative investments ecosystem' },
  ],
  // Family Cyber Command — 1 active
  3: [
    { id: 'c-001', name: 'Jonathan Wellington III', matchReason: 'Household cyber surface' },
  ],
  // Family Risk Council — 1 active
  6: [
    { id: 'c-003', name: 'Elena Rivera', matchReason: 'Foundation governance · regulatory' },
  ],
  // Property Resilience — 1 active
  9: [
    { id: 'c-001', name: 'Jonathan Wellington III', matchReason: 'Multi-residence portfolio' },
  ],
}

const CATEGORY_COLORS: Record<Category, string> = {
  Security: 'bg-red-500', Coordination: 'bg-teal-500', Governance: 'bg-purple-500',
  Privacy: 'bg-amber-500', Medical: 'bg-green-500', Travel: 'bg-blue-500', Property: 'bg-orange-500',
}

const LIFECYCLE_COLORS: Record<Lifecycle, string> = {
  Emerging: 'bg-blue-900/50 text-blue-400 border-blue-700',
  Accelerating: 'bg-green-900/50 text-green-400 border-green-700',
  Proven: 'bg-purple-900/50 text-purple-400 border-purple-700',
}

const NAV_TABS = [
  ['Dashboard', '/dashboard'], ['Discover', '/discover'], ['Offers', '/offers'],
  ['Clients', '/clients'], ['Playbooks', '/playbooks'], ['Deliver', '/deliver'],
]

const FILTER_TABS: { key: FilterTab; label: string; count: number; badge?: string }[] = [
  { key: 'all', label: 'All', count: 12 },
  { key: 'templates', label: 'Templates', count: 10 },
  { key: 'active', label: 'Active', count: 5 },
  { key: 'custom', label: 'Custom', count: 2 },
  { key: 'composites', label: 'Composites', count: 1 },
  { key: 'redteam', label: 'Red-team Needed', count: 2, badge: 'red' },
]

const SORT_OPTIONS = ['Name A-Z', 'Name Z-A', 'Readiness High', 'Readiness Low', 'Evidence High', 'Active Clients']
const CATEGORY_OPTIONS: Category[] = ['Security', 'Coordination', 'Governance', 'Privacy', 'Medical', 'Travel', 'Property']

const KPIS = [
  { label: 'TOTAL PLAYBOOKS', value: '12', sub: '10 templates + 2 custom' },
  { label: 'ACTIVE DEPLOYMENTS', value: '5', sub: 'across 4 clients' },
  { label: 'REVENUE GENERATED', value: '$75K/mo', sub: 'from active playbooks' },
  { label: 'MOST USED', value: 'Private Ops Office', sub: '3 active deployments', gold: true },
  { label: 'AVG ACTIVATION', value: '42 min', sub: 'template to live offer' },
]

const READINESS_CHECKLIST = [
  { label: 'Credentials verified', done: true },
  { label: 'Network & partnerships', done: true },
  { label: 'Delivery capacity confirmed', done: true },
  { label: 'Compliance review', done: false },
  { label: 'Evidence review completed', done: true },
]

// ─── Audit types ─────────────────────────────────────────────
type AuditSeverity = 'critical' | 'warning'
interface AuditIssue {
  category: string
  severity: AuditSeverity
  description: string
  recommendation: string
}
interface AuditResult {
  passed: boolean
  score: number
  issues: AuditIssue[]
  ranAt: string
}

// Fallback issues used when opening Fix drawer before the first audit runs.
const FALLBACK_ISSUES: AuditIssue[] = [
  {
    category: 'Compliance risk',
    severity: 'critical',
    description: 'Scope may require jurisdiction-specific licensing. Two target markets lack a compliance gap review.',
    recommendation: 'Add a jurisdiction matrix and secure a partnered license holder where needed before activation.',
  },
  {
    category: 'Delivery fragility',
    severity: 'warning',
    description: 'Delivery depends on a single operator and two unbackstopped partner vendors.',
    recommendation: 'Secure LOIs from one backup operator and one alternate vendor per critical deliverable.',
  },
  {
    category: 'Margin stress',
    severity: 'warning',
    description: 'At the low end of the price band, unit margin compresses below 45% beyond 4 clients.',
    recommendation: 'Lift the floor price by 12-15% or cap cohort size until a new capacity tier is built.',
  },
  {
    category: 'Competitive vulnerability',
    severity: 'critical',
    description: 'Incumbents could replicate 80% of the stack at a 30-40% discount within 6 months.',
    recommendation: 'Lead pitch assets with proprietary evidence chain and named-operator relationships.',
  },
  {
    category: 'Reputation risk',
    severity: 'warning',
    description: 'Outcome language implies guarantees. A public failure would be picked up by trade press.',
    recommendation: 'Swap guarantee language for best-effort commitments and add an incident comms playbook.',
  },
]

const ACTION_FOR_DIMENSION: Record<string, { label: string; href: string | null }> = {
  'Compliance risk': { label: 'Review compliance guide →', href: '/risk-queue' },
  'Delivery fragility': { label: 'Add backup partner →', href: '/partners' },
  'Margin stress': { label: 'Adjust pricing →', href: null },
  'Competitive vulnerability': { label: 'Differentiate offer →', href: null },
  'Reputation risk': { label: 'Add guarantee clause →', href: null },
}

// ─── Page Component ──────────────────────────────────────────
export default function PlaybooksPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Name A-Z')
  const [tierFilter, setTierFilter] = useState<'All' | 'HNW' | 'UHNW'>('All')
  const [categoryFilter, setCategoryFilter] = useState<'All' | Category>('All')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null)
  const [showReadinessModal, setShowReadinessModal] = useState(false)
  const [activatingPlaybook, setActivatingPlaybook] = useState<Playbook | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [composerSelections, setComposerSelections] = useState<Set<number>>(new Set())
  const [composerDone, setComposerDone] = useState(false)
  const [auditLoading, setAuditLoading] = useState<string | null>(null)
  const [auditResults, setAuditResults] = useState<Record<string, AuditResult>>({})
  const [fixIssuesPlaybook, setFixIssuesPlaybook] = useState<Playbook | null>(null)
  const [fixResolved, setFixResolved] = useState<Record<string, Set<string>>>({})
  const [fixToast, setFixToast] = useState<string | null>(null)

  const runRedTeamAudit = async (playbookSlug: string) => {
    setAuditLoading(playbookSlug)
    try {
      const res = await fetch(`/api/playbooks/${playbookSlug}/red-team`, { method: 'POST' })
      const data: AuditResult = await res.json()
      setAuditResults(prev => ({ ...prev, [playbookSlug]: data }))
    } catch {
      setAuditResults(prev => ({
        ...prev,
        [playbookSlug]: {
          passed: false,
          score: 0,
          issues: [
            {
              category: 'Audit service unreachable',
              severity: 'warning',
              description: 'The red-team audit service did not respond. Results below are a local fallback.',
              recommendation: 'Retry once the audit API is online.',
            },
          ],
          ranAt: new Date().toISOString(),
        },
      }))
    } finally {
      setAuditLoading(null)
    }
  }

  const toggleComposerSelection = (id: number) => {
    const next = new Set(composerSelections)
    if (next.has(id)) { next.delete(id) } else if (next.size < 3) { next.add(id) }
    setComposerSelections(next)
  }

  const filtered = useMemo(() => {
    let list = [...PLAYBOOKS]
    // Tab filter
    if (activeTab === 'templates') list = list.filter(p => !p.isCustom)
    else if (activeTab === 'active') list = list.filter(p => p.activeClients > 0)
    else if (activeTab === 'custom') list = list.filter(p => p.isCustom)
    else if (activeTab === 'composites') list = list.filter(p => p.isComposite)
    else if (activeTab === 'redteam') list = list.filter(p => p.redTeam === 'Failed' || p.redTeam === 'Not audited')
    // Tier
    if (tierFilter !== 'All') list = list.filter(p => p.tier === tierFilter)
    // Category
    if (categoryFilter !== 'All') list = list.filter(p => p.category === categoryFilter)
    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.buyer.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    }
    // Sort
    switch (sort) {
      case 'Name A-Z': list.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'Name Z-A': list.sort((a, b) => b.name.localeCompare(a.name)); break
      case 'Readiness High': list.sort((a, b) => b.readiness - a.readiness); break
      case 'Readiness Low': list.sort((a, b) => a.readiness - b.readiness); break
      case 'Evidence High': list.sort((a, b) => b.evidence - a.evidence); break
      case 'Active Clients': list.sort((a, b) => b.activeClients - a.activeClients); break
    }
    return list
  }, [activeTab, tierFilter, categoryFilter, search, sort])

  const handleActivate = (p: Playbook) => {
    setActivatingPlaybook(p)
    setShowReadinessModal(true)
  }

  const readinessColor = (r: number) => r >= 100 ? 'bg-emerald-500' : r >= 80 ? 'bg-[#C9A84C]' : 'bg-amber-500'
  const readinessTextColor = (r: number) => r >= 100 ? 'text-emerald-400' : r >= 80 ? 'text-[#C9A84C]' : 'text-amber-400'

  const composerPlaybooks = PLAYBOOKS.filter(p => composerSelections.has(p.id))
  const composerCombinedName = composerPlaybooks.map(p => p.name).join(' + ')

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* ─── Top Bar ───────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-6 bg-[#111827] border-b border-[#1e2a3a]">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-[#C9A84C] font-bold tracking-widest text-lg">CHAMBERFORGE</Link>
          <nav className="flex gap-1">
            {NAV_TABS.map(([t, h]) => (
              <Link key={t} href={h} className={`px-3 py-4 text-sm ${t === 'Playbooks' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>{t}</Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ─── KPI Strip ─────────────────────────────────── */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-5 gap-4">
          {KPIS.map(k => (
            <div key={k.label} className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-4 py-3">
              <p className="text-[10px] text-gray-500 tracking-wider">{k.label}</p>
              <p className={`text-lg font-bold mt-1 ${k.gold ? 'text-[#C9A84C]' : 'text-white'}`}>{k.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Filter Tabs ───────────────────────────────── */}
      <div className="px-6 flex gap-1 border-b border-[#1e2a3a]">
        {FILTER_TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition ${activeTab === t.key ? 'text-[#C9A84C] border-[#C9A84C]' : 'text-gray-400 border-transparent hover:text-white'}`}>
            {t.label}
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${t.badge === 'red' ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-400'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ─── Toolbar ───────────────────────────────────── */}
      <div className="px-6 py-3 flex items-center gap-3 border-b border-[#1e2a3a]">
        <div className="relative flex-1 max-w-xs">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search playbooks..."
            className="w-full bg-[#111827] border border-[#1e2a3a] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#C9A84C] focus:outline-none" />
          <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value as typeof tierFilter)}
          className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-[#C9A84C] focus:outline-none">
          <option value="All">All Tiers</option><option value="HNW">HNW</option><option value="UHNW">UHNW</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as typeof categoryFilter)}
          className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-[#C9A84C] focus:outline-none">
          <option value="All">All Categories</option>
          {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-[#C9A84C] focus:outline-none">
          {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex border border-[#1e2a3a] rounded-lg overflow-hidden ml-auto">
          <button onClick={() => setViewMode('cards')} className={`px-3 py-2 text-xs ${viewMode === 'cards' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-[#111827] text-gray-400'}`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-xs ${viewMode === 'list' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-[#111827] text-gray-400'}`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </div>

      {/* ─── Main Content ──────────────────────────────── */}
      <div className="flex px-6 py-4 gap-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
        {/* Left: Cards Grid */}
        <div className="flex-1">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map(p => (
                <div key={p.id}>
                  <PlaybookCard playbook={p}
                    selected={selectedPlaybook?.id === p.id}
                    onSelect={() => setSelectedPlaybook(p)}
                    onActivate={() => handleActivate(p)}
                    composerMode={showComposer}
                    composerSelected={composerSelections.has(p.id)}
                    onComposerToggle={() => toggleComposerSelection(p.id)}
                    auditLoading={auditLoading === p.slug}
                    auditResult={auditResults[p.slug]}
                    onRunAudit={() => runRedTeamAudit(p.slug)}
                    onFixIssues={() => setFixIssuesPlaybook(p)} />
                  {auditResults[p.slug] && (
                    <AuditResultCard result={auditResults[p.slug]} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(p => (
                <div key={p.id}>
                  <PlaybookListItem playbook={p}
                    selected={selectedPlaybook?.id === p.id}
                    onSelect={() => setSelectedPlaybook(p)}
                    onActivate={() => handleActivate(p)}
                    onFixIssues={() => setFixIssuesPlaybook(p)} />
                  {auditResults[p.slug] && (
                    <AuditResultCard result={auditResults[p.slug]} />
                  )}
                </div>
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">No playbooks match your filters</p>
              <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Right: Detail Panel */}
        <div className="w-[300px] flex-shrink-0">
          {selectedPlaybook ? (
            <DetailPanel
              playbook={selectedPlaybook}
              onActivate={() => handleActivate(selectedPlaybook)}
              auditLoading={auditLoading === selectedPlaybook.slug}
              auditResult={auditResults[selectedPlaybook.slug]}
              onRunAudit={() => runRedTeamAudit(selectedPlaybook.slug)}
              onFixIssues={() => setFixIssuesPlaybook(selectedPlaybook)}
            />
          ) : (
            <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#1e2a3a] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-gray-400 text-sm">Select a playbook to see details</p>
              <p className="text-gray-600 text-xs mt-1">Click any card to view inclusions, evidence, and compatibility</p>
              <button onClick={() => { setShowComposer(true); setComposerDone(false); setComposerSelections(new Set()) }}
                className="mt-6 w-full bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#C9A84C] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#C9A84C]/20 transition">
                Cross-Playbook Composer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Fix Issues Drawer ─────────────────────────── */}
      {fixIssuesPlaybook && (() => {
        const p = fixIssuesPlaybook
        const result = auditResults[p.slug]
        const issues = result?.issues ?? FALLBACK_ISSUES
        const resolved = fixResolved[p.slug] ?? new Set<string>()
        const allResolved = issues.length > 0 && issues.every(i => resolved.has(i.category))
        const score = result?.score ?? (p.redTeam === 'Failed' ? 58 : 75)
        return (
          <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setFixIssuesPlaybook(null)} />
            <div className="fixed top-0 right-0 h-full w-[480px] bg-[#0D1117] border-l border-[#1e2a3a] z-50 overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-[#0D1117] border-b border-[#1e2a3a] px-5 py-4 flex items-start justify-between z-10">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-red-400 font-medium">Fix red-team issues</div>
                  <div className="text-[15px] font-semibold text-white">{p.name}</div>
                </div>
                <button onClick={() => setFixIssuesPlaybook(null)} className="text-gray-500 hover:text-white text-xl" aria-label="Close">✕</button>
              </div>

              <div className="px-5 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-[11px]">
                    <span className="text-gray-500">Score</span>{' '}
                    <span className="font-bold text-red-400">{score}/100</span>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {issues.length} {issues.length === 1 ? 'issue' : 'issues'} to resolve
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  {issues.map(issue => {
                    const key = issue.category
                    const isResolved = resolved.has(key)
                    const action = ACTION_FOR_DIMENSION[issue.category] ?? { label: 'Review recommendation →', href: null }
                    return (
                      <div key={key} className={`rounded-lg border p-3 ${isResolved ? 'bg-[#0F2E1A] border-[#1D9E75]/30' : 'bg-[#111827] border-[#1e2a3a]'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[12px] font-semibold text-[#e2e8f0]">{issue.category}</div>
                          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${issue.severity === 'critical' ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/50 text-amber-400'}`}>
                            {issue.severity}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 leading-relaxed mt-1.5">{issue.description}</div>
                        <div className="text-[11px] text-[#C9A84C] leading-relaxed mt-2">
                          <span className="text-gray-500">Fix: </span>{issue.recommendation}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1e2a3a]/70">
                          {action.href ? (
                            <button
                              onClick={() => { window.location.href = action.href! }}
                              className="text-[11px] text-[#C9A84C] hover:underline"
                            >
                              {action.label}
                            </button>
                          ) : (
                            <button
                              className="text-[11px] text-[#C9A84C] hover:underline"
                              onClick={() => setFixToast(`Inline editor not yet wired — follow the fix recommendation above.`)}
                            >
                              {action.label}
                            </button>
                          )}
                          <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isResolved}
                              onChange={() => {
                                setFixResolved(prev => {
                                  const next = new Set(prev[p.slug] ?? [])
                                  if (isResolved) next.delete(key)
                                  else next.add(key)
                                  return { ...prev, [p.slug]: next }
                                })
                              }}
                              className="accent-[#1D9E75]"
                            />
                            I've addressed this
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{resolved.size} of {issues.length} resolved</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-[#1D9E75] h-2 rounded-full transition-all" style={{ width: issues.length === 0 ? '0%' : `${(resolved.size / issues.length) * 100}%` }} />
                  </div>
                </div>

                <button
                  disabled={!allResolved || auditLoading === p.slug}
                  onClick={async () => {
                    await runRedTeamAudit(p.slug)
                    const latest = await fetch(`/api/playbooks/${p.slug}/red-team`, { method: 'POST' })
                      .then(r => r.ok ? r.json() as Promise<AuditResult> : null)
                      .catch(() => null)
                    if (latest?.passed) {
                      setFixIssuesPlaybook(null)
                      setFixToast('Red-team passed — playbook ready to activate')
                      setTimeout(() => setFixToast(null), 4000)
                    }
                  }}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${allResolved && auditLoading !== p.slug ? 'bg-[#C9A84C] text-[#0D1117] hover:bg-[#C9A84C]/90' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                >
                  {auditLoading === p.slug ? 'Re-running audit…' : 'Re-run audit'}
                </button>
              </div>
            </div>
          </>
        )
      })()}

      {/* ─── Success toast (post-fix re-run) ─────────────── */}
      {fixToast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-[#0F2E1A] border border-[#1D9E75]/40 text-[#1D9E75] px-4 py-3 rounded-lg shadow-2xl text-[12px]">
          {fixToast}
        </div>
      )}

      {/* ─── Readiness Modal ───────────────────────────── */}
      {showReadinessModal && activatingPlaybook && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowReadinessModal(false)}>
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl w-[480px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Founder Readiness Gate</h3>
                <p className="text-xs text-gray-500 mt-1">Activating: {activatingPlaybook.name}</p>
              </div>
              <button onClick={() => setShowReadinessModal(false)} className="text-gray-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {READINESS_CHECKLIST.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#0D1117] rounded-lg px-4 py-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                    {item.done ? <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      : <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-gray-300' : 'text-red-400'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#0D1117] rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Readiness Score</span>
                <span className="text-lg font-bold text-[#C9A84C]">80/100</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-[#C9A84C] h-2 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReadinessModal(false)}
                className="flex-1 border border-gray-600 text-gray-300 py-2.5 rounded-lg text-sm hover:border-gray-400 transition">
                Activate anyway
              </button>
              <button onClick={() => setShowReadinessModal(false)}
                className="flex-1 bg-[#C9A84C] text-[#0D1117] font-medium py-2.5 rounded-lg text-sm hover:bg-[#C9A84C]/90 transition">
                Complete gaps first
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Composer Modal ────────────────────────────── */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setShowComposer(false); setComposerDone(false); setComposerSelections(new Set()) }}>
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl w-[600px] max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Cross-Playbook Composer</h3>
                <p className="text-xs text-gray-500 mt-1">Select up to 3 playbooks to compose into a bundled offer</p>
              </div>
              <button onClick={() => { setShowComposer(false); setComposerDone(false); setComposerSelections(new Set()) }} className="text-gray-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {!composerDone ? (
              <>
                {/* Step 1: Selection */}
                <div className="space-y-2 mb-4">
                  {PLAYBOOKS.map(p => (
                    <label key={p.id} className={`flex items-center gap-3 bg-[#0D1117] rounded-lg px-4 py-3 cursor-pointer border transition ${composerSelections.has(p.id) ? 'border-[#C9A84C]' : 'border-transparent hover:border-[#1e2a3a]'}`}>
                      <input type="checkbox" checked={composerSelections.has(p.id)} onChange={() => toggleComposerSelection(p.id)}
                        disabled={!composerSelections.has(p.id) && composerSelections.size >= 3}
                        className="accent-[#C9A84C] w-4 h-4" />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{p.price}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${p.tier === 'UHNW' ? 'text-[#C9A84C] border-[#C9A84C]/40' : 'text-blue-400 border-blue-700'}`}>{p.tier}</span>
                    </label>
                  ))}
                </div>
                {composerSelections.size > 0 && (
                  <div className="bg-[#0D1117] rounded-lg p-4 mb-4 border border-[#1e2a3a]">
                    <p className="text-xs text-gray-500 mb-1">Combined Playbook</p>
                    <p className="text-sm font-semibold text-[#C9A84C]">{composerCombinedName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Merged range: {composerPlaybooks.map(p => p.price).join(' + ')}
                    </p>
                  </div>
                )}
                <button onClick={() => setComposerDone(true)} disabled={composerSelections.size < 2}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${composerSelections.size >= 2 ? 'bg-[#C9A84C] text-[#0D1117] hover:bg-[#C9A84C]/90' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
                  Compose ({composerSelections.size}/3 selected)
                </button>
              </>
            ) : (
              <>
                {/* Step 2: Composed Preview */}
                <div className="bg-[#0D1117] rounded-lg p-4 mb-4 border border-[#C9A84C]/30">
                  <p className="text-xs text-[#C9A84C] font-medium mb-2">COMPOSED PLAYBOOK</p>
                  <p className="text-base font-semibold">{composerCombinedName}</p>
                  <p className="text-xs text-gray-400 mt-1">Combined price range: {composerPlaybooks.map(p => p.price).join(' + ')}</p>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium">COMBINED VALUE STACK</p>
                  <div className="space-y-1">
                    {composerPlaybooks.flatMap(p => p.included.filter(i => i.done).slice(0, 3).map(i => (
                      <div key={`${p.id}-${i.label}`} className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="text-emerald-400">&#10003;</span>
                        <span>{i.label}</span>
                        <span className="text-gray-600 ml-auto">{p.name}</span>
                      </div>
                    )))}
                  </div>
                </div>
                <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-400 font-medium mb-1">Conflict Warnings</p>
                  <p className="text-xs text-amber-300/80">Overlapping vendor management scope detected across selected playbooks. Review delivery model compatibility before finalizing.</p>
                  {composerPlaybooks.some(p => p.redTeam === 'Failed') && (
                    <p className="text-xs text-red-400 mt-1">One or more selected playbooks have failed red-team review.</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setComposerDone(false)} className="flex-1 border border-gray-600 text-gray-300 py-2.5 rounded-lg text-sm hover:border-gray-400">Back</button>
                  <button onClick={() => { setShowComposer(false); setComposerDone(false); setComposerSelections(new Set()) }}
                    className="flex-1 bg-[#C9A84C] text-[#0D1117] font-medium py-2.5 rounded-lg text-sm hover:bg-[#C9A84C]/90">
                    Create Composite Offer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Playbook Card Component ─────────────────────────────────
function PlaybookCard({ playbook: p, selected, onSelect, onActivate, composerMode, composerSelected, onComposerToggle, auditLoading, auditResult, onRunAudit, onFixIssues }: {
  playbook: Playbook; selected: boolean; onSelect: () => void; onActivate: () => void
  composerMode: boolean; composerSelected: boolean; onComposerToggle: () => void
  auditLoading: boolean; auditResult?: AuditResult; onRunAudit: () => void
  onFixIssues: () => void
}) {
  const redTeamBg = p.redTeam === 'Passed' ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700' : p.redTeam === 'Failed' ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-gray-800 text-gray-400 border-gray-700'
  const readinessColor = p.readiness >= 100 ? 'bg-emerald-500' : p.readiness >= 80 ? 'bg-[#C9A84C]' : 'bg-amber-500'
  const readinessText = p.readiness >= 100 ? 'text-emerald-400' : p.readiness >= 80 ? 'text-[#C9A84C]' : 'text-amber-400'

  return (
    <div onClick={onSelect}
      className={`bg-[#111827] rounded-lg border overflow-hidden cursor-pointer transition group ${selected ? 'border-[#C9A84C]' : 'border-[#1e2a3a] hover:border-[#1e2a3a]/80'}`}>
      {/* Accent bar */}
      <div className={`h-[3px] ${CATEGORY_COLORS[p.category]}`} />
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {composerMode && (
              <input type="checkbox" checked={composerSelected} onChange={e => { e.stopPropagation(); onComposerToggle() }}
                onClick={e => e.stopPropagation()} className="accent-[#C9A84C] w-4 h-4" />
            )}
            <h3 className="text-sm font-semibold group-hover:text-[#C9A84C] transition">{p.name}</h3>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-[#C9A84C]">{p.price}</span>
            <p className="text-[10px] text-gray-500">{p.pricingModel}</p>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${p.tier === 'UHNW' ? 'text-[#C9A84C] border-[#C9A84C]/40 bg-[#C9A84C]/10' : 'text-blue-400 border-blue-700 bg-blue-900/30'}`}>{p.tier}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${LIFECYCLE_COLORS[p.lifecycle]}`}>{p.lifecycle}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-800 text-gray-400">{p.deliveryModel}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${redTeamBg}`}>{p.redTeam === 'Not audited' ? 'Not audited' : `Red-team: ${p.redTeam}`}</span>
          {p.activeClients > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/40 font-medium">{p.activeClients} active</span>
          )}
        </div>

        {/* Target + Pain */}
        <p className="text-[11px] text-gray-400 mb-1"><span className="text-gray-500">Target:</span> {p.buyer}</p>
        <p className="text-[11px] text-gray-400 mb-3"><span className="text-gray-500">Pain:</span> {p.pain}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 bg-[#0D1117] rounded-lg p-2.5 mb-3">
          <div className="text-center">
            <p className="text-[9px] text-gray-500">Evidence</p>
            <p className="text-xs font-semibold text-white">{p.evidence}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500">WTP</p>
            <p className="text-xs font-semibold text-white">{p.wtp}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500">Activation</p>
            <p className="text-xs font-semibold text-white">{p.activationTime}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500">KPIs</p>
            <p className="text-xs font-semibold text-white">{p.kpisDefined}</p>
          </div>
        </div>

        {/* Readiness bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-gray-500">Readiness</span>
            <span className={`text-[10px] font-medium ${readinessText}`}>{p.readiness}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div className={`${readinessColor} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(p.readiness, 100)}%` }} />
          </div>
        </div>

        {/* Integration badges */}
        <div className="flex gap-1.5 mb-3">
          <IntBadge label="VoiceForge" active={p.integrations.vf} color="purple" />
          <IntBadge label="VisionAudio" active={p.integrations.va} color="teal" />
          <IntBadge label="Deal Desk" active={p.integrations.dd} color="blue" />
          <IntBadge label="Trust Pack" active={p.integrations.tp} color="amber" />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {p.redTeam === 'Failed' || (auditResult && !auditResult.passed) ? (
            <button onClick={e => { e.stopPropagation(); onFixIssues() }} className="text-[11px] bg-red-900/50 text-red-400 border border-red-700 font-medium px-3 py-1.5 rounded hover:bg-red-900/70 transition">Fix issues</button>
          ) : (
            <button onClick={e => { e.stopPropagation(); onActivate() }} className="text-[11px] bg-[#C9A84C] text-[#0D1117] font-medium px-3 py-1.5 rounded hover:bg-[#C9A84C]/90 transition">Activate</button>
          )}
          <button onClick={e => { e.stopPropagation(); onSelect() }} className="text-[11px] border border-gray-600 text-gray-300 px-3 py-1.5 rounded hover:border-gray-400 transition">View details</button>
          <button onClick={e => { e.stopPropagation(); window.location.href = `/playbooks/${p.slug}/customize` }} className="text-[11px] border border-[#C9A84C]/40 text-[#C9A84C] px-3 py-1.5 rounded hover:bg-[#C9A84C]/10 transition">Customize</button>
          <button
            disabled={auditLoading}
            onClick={e => { e.stopPropagation(); onRunAudit() }}
            className="text-[11px] border border-purple-700 text-purple-400 px-3 py-1.5 rounded hover:bg-purple-900/30 transition disabled:opacity-60 flex items-center gap-1.5"
          >
            {auditLoading ? (
              <><Spinner /> Running audit…</>
            ) : auditResult ? (
              'Re-run audit'
            ) : (
              'Red-team'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Small spinner ───────────────────────────────────────────
function Spinner() {
  return (
    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ─── Audit result card (appears beneath playbook card) ───────
function AuditResultCard({ result }: { result: AuditResult }) {
  return (
    <div className={`mt-3 rounded-lg p-4 border ${result.passed ? 'bg-[#0F2E1A] border-[#1D9E75]/30' : 'bg-[#1f0d0d] border-[#E24B4A]/30'}`}>
      <div className={`text-[11px] font-semibold mb-3 ${result.passed ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>
        Red-team audit: {result.passed ? 'Passed' : 'Failed'} · Score: {result.score}/100
      </div>
      {result.issues.map((issue, i) => (
        <div key={i} className="flex gap-2 mb-2 last:mb-0">
          <span className={issue.severity === 'critical' ? 'text-[#E24B4A]' : 'text-[#BA7517]'}>
            {issue.severity === 'critical' ? '✗' : '!'}
          </span>
          <div>
            <div className="text-[11px] font-medium text-[#e2e8f0]">{issue.category}</div>
            <div className="text-[10px] text-[#8892a4] leading-relaxed">{issue.description}</div>
            <div className="text-[10px] text-[#C9A84C] mt-0.5">Fix: {issue.recommendation}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── List Item Component ─────────────────────────────────────
function PlaybookListItem({ playbook: p, selected, onSelect, onActivate, onFixIssues }: {
  playbook: Playbook; selected: boolean; onSelect: () => void; onActivate: () => void
  onFixIssues: () => void
}) {
  const redTeamBg = p.redTeam === 'Passed' ? 'text-emerald-400' : p.redTeam === 'Failed' ? 'text-red-400' : 'text-gray-400'
  const readinessColor = p.readiness >= 100 ? 'bg-emerald-500' : p.readiness >= 80 ? 'bg-[#C9A84C]' : 'bg-amber-500'

  return (
    <div onClick={onSelect}
      className={`bg-[#111827] rounded-lg border overflow-hidden cursor-pointer transition flex items-center gap-4 px-4 py-3 ${selected ? 'border-[#C9A84C]' : 'border-[#1e2a3a] hover:border-[#1e2a3a]/80'}`}>
      <div className={`w-1 h-10 rounded-full ${CATEGORY_COLORS[p.category]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate">{p.name}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${p.tier === 'UHNW' ? 'text-[#C9A84C] border-[#C9A84C]/40' : 'text-blue-400 border-blue-700'}`}>{p.tier}</span>
          <span className={`text-[10px] ${redTeamBg}`}>{p.redTeam}</span>
        </div>
        <p className="text-[10px] text-gray-500 truncate">{p.buyer} — {p.pain}</p>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
        <span>{p.evidence} ev</span>
        <span>{p.wtp} wtp</span>
        <span>{p.activationTime}</span>
        <div className="w-16">
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div className={`${readinessColor} h-1.5 rounded-full`} style={{ width: `${Math.min(p.readiness, 100)}%` }} />
          </div>
        </div>
        <span className="text-[#C9A84C] font-semibold">{p.price}</span>
        {p.activeClients > 0 && <span className="text-[#C9A84C] text-[10px]">{p.activeClients} active</span>}
        {p.redTeam === 'Failed' ? (
          <button onClick={e => { e.stopPropagation(); onFixIssues() }} className="text-[10px] bg-red-900/50 text-red-400 border border-red-700 px-2 py-1 rounded">Fix</button>
        ) : (
          <button onClick={e => { e.stopPropagation(); onActivate() }} className="text-[10px] bg-[#C9A84C] text-[#0D1117] font-medium px-2 py-1 rounded">Activate</button>
        )}
      </div>
    </div>
  )
}

// ─── Integration Badge ───────────────────────────────────────
function IntBadge({ label, active, color }: { label: string; active: boolean; color: string }) {
  const activeClasses: Record<string, string> = {
    purple: 'bg-purple-900/40 text-purple-400 border-purple-700',
    teal: 'bg-teal-900/40 text-teal-400 border-teal-700',
    blue: 'bg-blue-900/40 text-blue-400 border-blue-700',
    amber: 'bg-amber-900/40 text-amber-400 border-amber-700',
  }
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${active ? activeClasses[color] : 'bg-gray-800/50 text-gray-600 border-gray-800'}`}>
      {label}
    </span>
  )
}

// ─── Detail Panel ────────────────────────────────────────────
function DetailPanel({ playbook: p, onActivate, auditLoading, auditResult, onRunAudit, onFixIssues }: { playbook: Playbook; onActivate: () => void; auditLoading: boolean; auditResult?: AuditResult; onRunAudit: () => void; onFixIssues: () => void }) {
  const readinessColor = p.readiness >= 100 ? 'bg-emerald-500' : p.readiness >= 80 ? 'bg-[#C9A84C]' : 'bg-amber-500'
  const readinessText = p.readiness >= 100 ? 'text-emerald-400' : p.readiness >= 80 ? 'text-[#C9A84C]' : 'text-amber-400'

  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`h-[3px] ${CATEGORY_COLORS[p.category]}`} />
      <div className="p-4">
        <h3 className="text-base font-semibold mb-1">{p.name}</h3>
        <p className="text-sm text-[#C9A84C] font-medium mb-3">{p.price}</p>
        <div className="flex items-center gap-1 mb-4">
          <span className="text-[10px] text-gray-500">Readiness:</span>
          <span className={`text-[10px] font-medium ${readinessText}`}>{p.readiness}%</span>
          <div className="flex-1 bg-gray-800 rounded-full h-1 ml-1">
            <div className={`${readinessColor} h-1 rounded-full`} style={{ width: `${Math.min(p.readiness, 100)}%` }} />
          </div>
        </div>

        {/* What's Included */}
        <div className="mb-4">
          <p className="text-[10px] text-gray-500 font-medium tracking-wider mb-2">WHAT&apos;S INCLUDED</p>
          <div>
            {p.included.map((item, i) => (
              <div key={i} className="py-2.5 border-b border-[#1e2a3a] last:border-0">
                <div className="flex gap-2 mb-1">
                  {item.done ? (
                    <span className="text-[#1D9E75] text-[11px] flex-shrink-0">&#10003;</span>
                  ) : (
                    <span className="text-gray-600 text-[11px] flex-shrink-0">&#10007;</span>
                  )}
                  <span className={`text-[11px] font-medium ${item.done ? 'text-[#e2e8f0]' : 'text-gray-600'}`}>{item.label}</span>
                </div>
                <div className="text-[10px] text-[#4a5568] leading-relaxed pl-4">
                  {INCLUDED_DESCRIPTIONS[item.label] ?? 'Detailed deliverable included in the playbook scope.'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Citations */}
        <div className="mb-4">
          <p className="text-[10px] text-gray-500 font-medium tracking-wider mb-2">TOP EVIDENCE</p>
          <div>
            {p.citations.map((c, i) => (
              <div key={i} className="mb-3 pb-3 border-b border-[#1e2a3a] last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-semibold text-[#e2e8f0]">{c.source}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-16 bg-[#1e2a3a] rounded-full">
                      <div className="h-1 rounded-full bg-[#1D9E75]" style={{ width: `${c.credibility}%` }} />
                    </div>
                    <span className="text-[9px] text-[#1D9E75] font-semibold">{c.credibility}%</span>
                  </div>
                </div>
                <div className="text-[9px] text-[#4a5568] mb-1.5">
                  Credibility score — {c.credibility}% means this source is {c.credibility >= 85 ? 'a government or peer-reviewed study with high reliability' : c.credibility >= 70 ? 'an industry report from a credible institution' : 'a secondary source requiring corroboration'}
                </div>
                {EVIDENCE_KEY_FINDINGS[c.source] && (
                  <div className="text-[10px] text-[#8892a4] leading-relaxed italic">
                    &quot;{EVIDENCE_KEY_FINDINGS[c.source]}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Matches your clients */}
        {CLIENT_MATCHES_BY_ID[p.id]?.length > 0 && (
          <div className="bg-[#0F2E1A] border border-[#1D9E75]/20 rounded-lg p-3 mb-4">
            <div className="text-[9px] font-semibold text-[#1D9E75] uppercase tracking-wider mb-2">
              Matches your clients
            </div>
            {CLIENT_MATCHES_BY_ID[p.id].map((c) => (
              <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-[#1D9E75]/10 last:border-0">
                <span className="text-[10px] text-[#5DCAA5]">{c.name}</span>
                <span className="text-[9px] text-[#0F6E56]">{c.matchReason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Compatible Playbooks */}
        <div className="mb-4">
          <p className="text-[10px] text-gray-500 font-medium tracking-wider mb-2">COMPATIBLE FOR COMPOSITION</p>
          <div className="flex flex-wrap gap-1">
            {p.compatible.map(name => (
              <span key={name} className="text-[10px] px-2 py-1 rounded bg-[#0D1117] border border-[#1e2a3a] text-gray-400">{name}</span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {p.redTeam === 'Failed' || (auditResult && !auditResult.passed) ? (
            <button onClick={onFixIssues} className="w-full text-xs bg-red-900/50 text-red-400 border border-red-700 font-medium py-2 rounded-lg hover:bg-red-900/70 transition">Fix Red-team Issues</button>
          ) : (
            <button onClick={onActivate} className="w-full text-xs bg-[#C9A84C] text-[#0D1117] font-medium py-2 rounded-lg hover:bg-[#C9A84C]/90 transition">Activate Playbook</button>
          )}
          <button onClick={() => window.location.href = `/playbooks/${p.slug}/customize`} className="w-full text-xs border border-[#C9A84C]/40 text-[#C9A84C] py-2 rounded-lg hover:bg-[#C9A84C]/10 transition">Customize</button>
          <button
            onClick={onRunAudit}
            disabled={auditLoading}
            className="w-full text-xs border border-purple-700 text-purple-400 py-2 rounded-lg hover:bg-purple-900/30 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {auditLoading ? (
              <><Spinner /> Running audit…</>
            ) : auditResult ? (
              'Re-run Red-team Audit'
            ) : (
              'Run Red-team Audit'
            )}
          </button>
          {auditResult && (
            <div className={`mt-2 rounded-lg p-3 border text-[11px] ${auditResult.passed ? 'bg-[#0F2E1A] border-[#1D9E75]/30 text-[#1D9E75]' : 'bg-[#1f0d0d] border-[#E24B4A]/30 text-[#E24B4A]'}`}>
              {auditResult.passed ? 'Passed' : 'Failed'} · Score {auditResult.score}/100 · {auditResult.issues.length} issues
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
