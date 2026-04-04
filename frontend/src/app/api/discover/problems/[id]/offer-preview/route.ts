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
