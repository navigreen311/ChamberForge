import { NextResponse } from 'next/server'

// TODO: Replace with dynamic offer matching from playbook engine
// TODO: Add pricing personalization based on client wealth tier
// TODO: Implement A/B testing for offer presentation variants
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const offers: Record<
    string,
    {
      offerName: string
      tagline: string
      priceMin: number
      priceMax: number
      pricingModel: string
      deliveryModel: string
      whatYouDo: { action: string; detail: string }[]
      weeklySchedule: { day: string; task: string }[]
      deliverables: { name: string; description: string }[]
      clientProfile: {
        whoTheyAre: string
        triggerEvent: string
        howYouReachThem: string
        buyingQuestion: string
        roiProof: string
      }
      matchedPlaybookId: string
      firstClientPath: string[]
      objections: { objection: string; response: string }[]
      currentSolutions: { approach: string; whyItFails: string }[]
      complianceRisk: string
      complianceRiskNote: string
      trendData: number[]
      competitorCount: number
      userFitScore: number
      weeklyHours: number
      startupCost: string
    }
  > = {
    'ai-voice-fraud': {
      offerName: 'Family Cybersecurity & Identity Command Center',
      tagline: '24/7 protection for your family\'s digital identity',
      priceMin: 10000,
      priceMax: 25000,
      pricingModel: 'Monthly retainer',
      deliveryModel: 'Team',
      whatYouDo: [
        { action: 'Set up verification protocols', detail: 'Create unique passphrases and multi-factor voice verification for all wire authorizations across family and staff' },
        { action: 'Deploy AI detection tools', detail: 'Install deepfake audio detection on all family office phone systems and communication channels' },
        { action: 'Train household and staff', detail: 'Quarterly tabletop exercises simulating AI voice attacks with personalized scenarios' },
        { action: 'Monitor and respond 24/7', detail: 'Continuous monitoring of impersonation attempts with 15-minute incident response SLA' },
      ],
      weeklySchedule: [
        { day: 'Monday', task: 'Review threat intelligence feed and update family risk dashboard' },
        { day: 'Tuesday', task: 'Verify all communication protocol compliance across staff' },
        { day: 'Wednesday', task: 'Test deepfake detection systems with new AI-generated samples' },
        { day: 'Thursday', task: 'Conduct mini security awareness touchpoint with key staff' },
        { day: 'Friday', task: 'Weekly threat summary briefing to principal or family office head' },
      ],
      deliverables: [
        { name: 'Monthly threat briefing', description: 'Executive summary of attempted attacks, near-misses, and emerging threat vectors targeting the family' },
        { name: 'Voice verification protocol manual', description: 'Custom playbook for every authorization scenario with escalation trees' },
        { name: 'Quarterly penetration test report', description: 'Red team social engineering assessment with scored results and remediation plan' },
        { name: 'Staff security scorecard', description: 'Individual security compliance ratings for all household and office staff' },
        { name: 'Incident response runbook', description: 'Step-by-step procedures for 12 attack scenarios with contact trees and containment steps' },
        { name: 'Annual security posture assessment', description: 'Comprehensive review of family attack surface with year-over-year trend analysis' },
        { name: 'Dark web monitoring report', description: 'Monthly scan results for family PII, credentials, and mentions on dark web forums' },
      ],
      clientProfile: {
        whoTheyAre: 'Family offices managing $500M+ with distributed staff and multiple principals',
        triggerEvent: 'Near-miss incident or peer\'s publicized security breach',
        howYouReachThem: 'Estate attorney or family office network referral',
        buyingQuestion: 'How do we know our staff won\'t fall for the next call?',
        roiProof: 'One prevented wire fraud pays for 2+ years of fees',
      },
      matchedPlaybookId: 'family-cyber-command',
      firstClientPath: [
        "Contact 3 estate attorneys or private bankers you already know. Ask: 'Any clients nervous about AI scams lately?'",
        "Offer a free 30-minute 'Household Security Assessment' — no pitch, just show them their gaps",
        "After the assessment, present the retainer with the ROI argument: one prevented fraud covers 2 years of fees",
      ],
      objections: [
        { objection: 'We already have IT support', response: 'IT handles your company infrastructure. This handles your family — different people, different risks, different protocols.' },
        { objection: 'We have cyber insurance', response: 'Insurance pays after a loss. This prevents the loss — and the embarrassment, legal exposure, and months of recovery.' },
        { objection: 'How do we know you\'re trustworthy?', response: 'We provide full background checks, client references, NDA before any engagement, and work only through referrals from attorneys and bankers you already trust.' },
      ],
      currentSolutions: [
        { approach: 'IT managed service provider', whyItFails: 'Handles corporate infrastructure, not family. Doesn\'t train household staff or verify personal calls.' },
        { approach: 'Consumer-grade password managers', whyItFails: 'Solves one vector but not voice cloning, SIM swaps, or social engineering of family members.' },
        { approach: 'Ad hoc training sessions', whyItFails: 'One-time awareness sessions don\'t build lasting habits. Staff turnover means constant re-training.' },
      ],
      complianceRisk: 'none',
      complianceRiskNote: '',
      trendData: [12, 15, 18, 22, 28, 35, 42, 50, 58, 65, 72, 80],
      competitorCount: 3,
      userFitScore: 75,
      weeklyHours: 8,
      startupCost: '$200-500 in tools and setup',
    },
    'coordination-overload': {
      offerName: 'Wealth Coordination Hub',
      tagline: 'One command center for your entire advisory ecosystem',
      priceMin: 8000,
      priceMax: 20000,
      pricingModel: 'Monthly retainer',
      deliveryModel: 'Team',
      whatYouDo: [
        { action: 'Map the advisory ecosystem', detail: 'Catalog all advisors, their mandates, communication preferences, and interdependencies' },
        { action: 'Establish coordination protocols', detail: 'Create structured touchpoints, shared calendars, and cross-advisor briefing templates' },
        { action: 'Run quarterly alignment summits', detail: 'Facilitate cross-advisor strategy sessions to eliminate blind spots and conflicts' },
        { action: 'Maintain the decision log', detail: 'Track all advisory recommendations, decisions, and outcomes in a single auditable system' },
      ],
      weeklySchedule: [
        { day: 'Monday', task: 'Review open action items across all advisory relationships' },
        { day: 'Tuesday', task: 'Circulate weekly coordination digest to advisory team' },
        { day: 'Wednesday', task: 'Conduct 1:1 check-in with priority advisor (rotating)' },
        { day: 'Thursday', task: 'Update family decision dashboard and flag conflicts' },
        { day: 'Friday', task: 'Principal briefing with consolidated advisory summary' },
      ],
      deliverables: [
        { name: 'Advisory ecosystem map', description: 'Visual representation of all advisor relationships, mandates, and communication flows' },
        { name: 'Monthly coordination report', description: 'Cross-advisor activity summary with conflict flags and resolution status' },
        { name: 'Quarterly alignment scorecard', description: 'Metrics on advisory overlap, gaps, and collaboration effectiveness' },
        { name: 'Decision audit trail', description: 'Complete log of who recommended what, when, and the outcome' },
        { name: 'Annual advisory review', description: 'Performance evaluation of each advisor with optimization recommendations' },
        { name: 'Conflict resolution log', description: 'Documentation of conflicting advice instances and how they were resolved' },
      ],
      clientProfile: {
        whoTheyAre: 'HNW families with 5+ professional advisors across multiple domains',
        triggerEvent: 'Missed deadline or conflicting advice from two advisors',
        howYouReachThem: 'Primary wealth advisor or family attorney',
        buyingQuestion: 'Who is making sure all our advisors are actually working together?',
        roiProof: 'Families report 15-30% reduction in advisory friction costs within first year',
      },
      matchedPlaybookId: 'wealth-coordination-hub',
      firstClientPath: [
        "Reach out to 3 wealth managers or multi-family office heads you know. Ask: 'Do your clients ever complain about advisor coordination?'",
        "Offer a free 'Household Advisory Audit' — map their entire advisory ecosystem and show the gaps",
        "After the audit, present the retainer with the value argument: eliminating advisory friction saves 15-30% in hidden costs",
      ],
      objections: [
        { objection: 'I have an assistant who handles that', response: 'Assistants manage calendars and logistics. This is strategic coordination — making sure your tax attorney, estate planner, and investment manager aren\'t working at cross purposes.' },
        { objection: 'This seems expensive', response: 'One missed coordination — a tax strategy that conflicts with an estate plan — can cost 10x our annual fee. This pays for itself with the first prevented conflict.' },
        { objection: 'How is this different from a concierge service?', response: 'Concierge services handle lifestyle logistics. We handle advisory strategy — ensuring every professional serving your family is aligned on goals, timing, and execution.' },
      ],
      currentSolutions: [
        { approach: 'Executive assistants', whyItFails: 'Great at scheduling and logistics but lack the financial and legal expertise to spot advisory conflicts or strategic gaps.' },
        { approach: 'House managers', whyItFails: 'Handle property and household operations, not the complex interplay between investment, tax, estate, and insurance advisors.' },
        { approach: 'Informal tribal knowledge', whyItFails: 'Key coordination details live in one person\'s head. When they leave or get busy, things fall through the cracks.' },
      ],
      complianceRisk: 'none',
      complianceRiskNote: '',
      trendData: [20, 24, 28, 33, 38, 44, 50, 55, 60, 66, 71, 78],
      competitorCount: 5,
      userFitScore: 80,
      weeklyHours: 12,
      startupCost: '$500-1,000 in software and onboarding',
    },
    'data-broker-exposure': {
      offerName: 'Digital Privacy & Data Shield Program',
      tagline: 'Erase your family\'s digital footprint before threats find it',
      priceMin: 5000,
      priceMax: 15000,
      pricingModel: 'Monthly retainer',
      deliveryModel: 'Specialist',
      whatYouDo: [
        { action: 'Conduct data exposure audit', detail: 'Comprehensive scan across 4,000+ data brokers, people-search sites, and dark web sources' },
        { action: 'Execute removal campaigns', detail: 'Systematic opt-out requests and legal takedowns across all identified broker networks' },
        { action: 'Harden digital presence', detail: 'Secure social media, update privacy settings, and create separation between public and private identities' },
        { action: 'Monitor continuously', detail: 'Automated re-scanning to catch re-listings and new exposure vectors monthly' },
      ],
      weeklySchedule: [
        { day: 'Monday', task: 'Review automated scan results for new data broker listings' },
        { day: 'Tuesday', task: 'Process pending opt-out confirmations and escalate non-compliant brokers' },
        { day: 'Wednesday', task: 'Dark web monitoring sweep for family PII and credential leaks' },
        { day: 'Thursday', task: 'Social media and public records review for new exposure' },
        { day: 'Friday', task: 'Update family privacy dashboard and flag action items' },
      ],
      deliverables: [
        { name: 'Initial exposure report', description: 'Comprehensive baseline of all discovered data broker listings, public records, and dark web mentions' },
        { name: 'Monthly removal progress report', description: 'Status of all active removal requests with success rates and re-listing alerts' },
        { name: 'Quarterly privacy posture assessment', description: 'Trend analysis of family digital footprint with risk scoring' },
        { name: 'Staff privacy training', description: 'Guidelines for household employees on data hygiene and social media protocols' },
        { name: 'Incident alert notifications', description: 'Real-time alerts for critical exposure events (credential leaks, doxxing attempts)' },
        { name: 'Annual digital estate review', description: 'Full audit of family digital assets, accounts, and privacy infrastructure' },
      ],
      clientProfile: {
        whoTheyAre: 'HNW individuals and families with public profiles or recent liquidity events',
        triggerEvent: 'Unexpected solicitation using private information or a physical security scare',
        howYouReachThem: 'Physical security consultant or wealth advisor',
        buyingQuestion: 'What do people find when they search for us online?',
        roiProof: 'Comprehensive data removal reduces social engineering attempts by 60% within 90 days',
      },
      matchedPlaybookId: 'digital-privacy-shield',
      firstClientPath: [
        "Connect with 3 physical security consultants or family office advisors. Ask: 'Have any clients been surprised by what\'s findable about them online?'",
        "Offer a free 'Digital Exposure Snapshot' — run a quick scan and show them what data brokers already have",
        "After the snapshot, present the retainer: comprehensive removal and ongoing monitoring to keep them invisible",
      ],
      objections: [
        { objection: 'I\'m not famous, nobody is looking for me', response: 'Data brokers don\'t care about fame — they collect everyone. Your net worth makes you a premium target for social engineering, kidnap-for-ransom research, and investment scams.' },
        { objection: 'Can\'t I just do this myself?', response: 'You can submit opt-outs one by one across 4,000+ brokers. Most re-list you within 90 days. We automate the process and ensure it sticks.' },
        { objection: 'We already use a privacy service', response: 'Consumer privacy tools cover the basics. We handle dark web monitoring, public records suppression, social media hardening, and staff data hygiene — the full attack surface.' },
      ],
      currentSolutions: [
        { approach: 'Consumer privacy tools (DeleteMe, etc.)', whyItFails: 'Cover mainstream data brokers but miss niche people-search sites, public records, and dark web exposure.' },
        { approach: 'Google alerts on your name', whyItFails: 'Only catches indexed public mentions. Misses data broker listings, dark web sales, and social engineering reconnaissance.' },
        { approach: 'Ignoring the problem', whyItFails: 'Exposed data compounds over time. Each new breach adds to your profile, making targeting easier and more precise.' },
      ],
      complianceRisk: 'low',
      complianceRiskNote: 'Some jurisdictions have specific data removal request requirements under GDPR/CCPA that must be followed precisely.',
      trendData: [25, 30, 35, 40, 46, 52, 58, 63, 68, 74, 79, 85],
      competitorCount: 8,
      userFitScore: 70,
      weeklyHours: 6,
      startupCost: '$300-800 in scanning tools and subscriptions',
    },
    'risk-governance-gaps': {
      offerName: 'Family Office Risk & Governance Framework',
      tagline: 'Enterprise-grade governance tailored for family office culture',
      priceMin: 12000,
      priceMax: 30000,
      pricingModel: 'Monthly retainer',
      deliveryModel: 'Team',
      whatYouDo: [
        { action: 'Assess current governance maturity', detail: 'Benchmark against 50-point family office governance framework with peer comparison' },
        { action: 'Design risk governance structure', detail: 'Create risk committee charter, reporting lines, and escalation protocols suited to family dynamics' },
        { action: 'Implement risk register and controls', detail: 'Deploy operational risk register with automated monitoring and quarterly board reporting' },
        { action: 'Run annual governance review', detail: 'Independent assessment of governance effectiveness with regulatory compliance check' },
      ],
      weeklySchedule: [
        { day: 'Monday', task: 'Review risk register updates and new incident reports' },
        { day: 'Tuesday', task: 'Compliance monitoring -- check regulatory deadlines and filing status' },
        { day: 'Wednesday', task: 'Operational controls testing (rotating focus area)' },
        { day: 'Thursday', task: 'Key-person risk and succession plan status check' },
        { day: 'Friday', task: 'Weekly governance pulse report to family office head' },
      ],
      deliverables: [
        { name: 'Governance maturity assessment', description: 'Baseline scoring across 8 governance domains with peer benchmarking' },
        { name: 'Risk register', description: 'Living document cataloging all identified risks with owners, controls, and residual risk ratings' },
        { name: 'Quarterly board risk report', description: 'Executive dashboard of risk posture, incidents, near-misses, and emerging threats' },
        { name: 'Policy library', description: 'Custom policies for investment, operations, cyber, HR, and regulatory compliance' },
        { name: 'Business continuity plan', description: 'Tested procedures for 15 disruption scenarios including key-person loss' },
        { name: 'Annual governance review', description: 'Independent assessment with regulatory compliance verification and improvement roadmap' },
        { name: 'Insurance optimization report', description: 'Gap analysis of current coverage against identified risk register items' },
      ],
      clientProfile: {
        whoTheyAre: 'Family offices managing $100M+ with growing operational complexity',
        triggerEvent: 'Regulatory inquiry, insurance audit, or key staff departure',
        howYouReachThem: 'Family office network or insurance broker',
        buyingQuestion: 'What happens if our key person gets hit by a bus tomorrow?',
        roiProof: 'Formal risk governance reduces operational loss incidents by 45% and cuts insurance premiums 20-30%',
      },
      matchedPlaybookId: 'fo-risk-governance',
      firstClientPath: [
        "Talk to 3 family office network contacts or insurance brokers. Ask: 'Any clients struggling to pass an operational audit or worried about key-person risk?'",
        "Offer a free 'Governance Maturity Snapshot' — score them across 8 domains and show where they rank vs. peers",
        "After the snapshot, present the retainer: full governance buildout that protects the family and satisfies regulators and insurers",
      ],
      objections: [
        { objection: 'We\'re a family, not a corporation — we don\'t need governance', response: 'Governance isn\'t bureaucracy. It\'s knowing who makes decisions, how risks are tracked, and what happens when key people are unavailable. Families with $100M+ have corporate-level complexity.' },
        { objection: 'Our attorney handles compliance', response: 'Attorneys handle legal compliance. This covers operational risk — cybersecurity, key-person dependency, vendor management, and insurance gaps that attorneys don\'t monitor day-to-day.' },
        { objection: 'We\'ve operated fine without this for years', response: 'Most families say that until a key person leaves, a regulator asks questions, or an insurance claim gets denied. This is about being proactive, not reactive.' },
      ],
      currentSolutions: [
        { approach: 'Relying on the family office head for everything', whyItFails: 'Creates single point of failure. If that person is unavailable, no one knows the full picture of risks, vendors, or protocols.' },
        { approach: 'Annual attorney review', whyItFails: 'Covers legal compliance but not operational risks like cybersecurity, staff dependencies, or insurance adequacy.' },
        { approach: 'Ad hoc risk discussions at family meetings', whyItFails: 'No systematic tracking, no risk register, no follow-through. Issues get discussed but not resolved or monitored.' },
      ],
      complianceRisk: 'medium',
      complianceRiskNote: 'Family offices with investment advisory activities may fall under SEC/state regulatory requirements. Governance frameworks must align with applicable fiduciary standards.',
      trendData: [18, 22, 25, 30, 34, 39, 44, 48, 53, 58, 62, 68],
      competitorCount: 6,
      userFitScore: 72,
      weeklyHours: 10,
      startupCost: '$1,000-2,500 in assessment tools and templates',
    },
    'healthcare-navigation': {
      offerName: 'Elite Health Navigation & Advocacy Program',
      tagline: 'A personal medical chief of staff for your family',
      priceMin: 6000,
      priceMax: 18000,
      pricingModel: 'Monthly retainer',
      deliveryModel: 'Specialist',
      whatYouDo: [
        { action: 'Build comprehensive health profiles', detail: 'Consolidate all family medical records, genetic data, and specialist relationships into a secure unified platform' },
        { action: 'Coordinate specialist care', detail: 'Serve as clinical quarterback across all providers, ensuring information flow and eliminating redundant tests' },
        { action: 'Facilitate second opinions', detail: 'Rapid access to top-5 specialists globally for any diagnosis within 48 hours' },
        { action: 'Manage preventive care programs', detail: 'Personalized screening schedules, executive health programs, and longevity planning for each family member' },
      ],
      weeklySchedule: [
        { day: 'Monday', task: 'Review upcoming appointments and ensure all providers have current records' },
        { day: 'Tuesday', task: 'Follow up on outstanding test results and specialist referrals' },
        { day: 'Wednesday', task: 'Clinical trial and new treatment scanning for active family health priorities' },
        { day: 'Thursday', task: 'Preventive care compliance check across all family members' },
        { day: 'Friday', task: 'Weekly health coordination summary to designated family contact' },
      ],
      deliverables: [
        { name: 'Unified health dashboard', description: 'Secure portal with consolidated records, upcoming appointments, and care team directory for each family member' },
        { name: 'Monthly health coordination report', description: 'Summary of all medical activities, outstanding actions, and care plan updates' },
        { name: 'Second opinion coordination package', description: 'End-to-end management of specialist consultations including records transfer and summary' },
        { name: 'Annual executive health review', description: 'Comprehensive preventive screening program with personalized risk assessment and longevity plan' },
        { name: 'Emergency medical protocol', description: 'Travel medical kit, global emergency contacts, and medical evacuation procedures for each family member' },
        { name: 'Family health legacy plan', description: 'Genetic counseling coordination and multi-generational preventive care roadmap' },
      ],
      clientProfile: {
        whoTheyAre: 'HNW families with aging parents, complex medical histories, or global lifestyles',
        triggerEvent: 'New diagnosis, aging parent health crisis, or dissatisfaction with current concierge medicine',
        howYouReachThem: 'Concierge physician or family office advisor',
        buyingQuestion: 'Who is making sure we\'re seeing the right doctors and not missing anything?',
        roiProof: 'Navigated patients report 35% faster specialist access and 28% reduction in diagnostic errors',
      },
      matchedPlaybookId: 'elite-health-navigation',
      firstClientPath: [
        "Reach out to 3 concierge physicians or family office advisors. Ask: 'Do any of your clients struggle coordinating care across multiple specialists?'",
        "Offer a free 'Care Coordination Assessment' — map their current provider ecosystem and identify gaps in communication",
        "After the assessment, present the retainer: a personal medical chief of staff who ensures nothing falls through the cracks",
      ],
      objections: [
        { objection: 'We already have a concierge doctor', response: 'Concierge doctors provide excellent primary care, but they don\'t coordinate across your cardiologist, orthopedist, dermatologist, and aging parent\'s specialists. That\'s what we do.' },
        { objection: 'We can just call the doctor ourselves', response: 'You can — but are you tracking medication interactions across providers, ensuring test results reach every specialist, and monitoring clinical trial opportunities? Care coordination is a full-time function.' },
        { objection: 'How do you handle medical privacy?', response: 'We operate under strict HIPAA-compliant protocols, use encrypted platforms, and every team member signs confidentiality agreements. Your family\'s health data is treated with the same rigor as financial data.' },
      ],
      currentSolutions: [
        { approach: 'Concierge medicine memberships', whyItFails: 'Provides primary care access but doesn\'t coordinate across specialists, manage second opinions, or track preventive care compliance for the whole family.' },
        { approach: 'Family members managing their own care', whyItFails: 'Each person navigates independently, leading to missed follow-ups, unshared test results between providers, and no unified health strategy.' },
        { approach: 'Insurance-provided nurse lines', whyItFails: 'Generic triage services with no knowledge of your family\'s history, providers, or preferences. No proactive coordination or advocacy.' },
      ],
      complianceRisk: 'medium',
      complianceRiskNote: 'Health navigation services must comply with HIPAA privacy and security rules. Any handling of protected health information requires BAA agreements with all technology vendors.',
      trendData: [15, 19, 23, 28, 33, 39, 45, 51, 56, 62, 68, 75],
      competitorCount: 4,
      userFitScore: 78,
      weeklyHours: 10,
      startupCost: '$500-1,500 in HIPAA-compliant tools and setup',
    },
  }

  const offer = offers[id]

  if (!offer) {
    return NextResponse.json(
      { error: 'Problem not found', problem_id: id },
      { status: 404 }
    )
  }

  return NextResponse.json(offer)
}
