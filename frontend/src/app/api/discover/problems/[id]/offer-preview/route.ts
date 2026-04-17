import { NextResponse } from 'next/server'

// Problem & Offer Deep Dive — offer-side content.
// Written so an operator reading this knows EXACTLY what they would do if they built this service.
type TimeBreakdownItem = { task: string; hours_per_week: number }
type TimeBreakdown = { weekly_hours: number; breakdown: TimeBreakdownItem[]; note: string }
type ToolNeeded = { tool: string; cost: string; purpose: string }
type PhaseBlock = { phase: string; actions: string[] }
type RichDeliverable = { name: string; description: string; frequency: string }
type RichAction = { step_number: number; action: string; detail: string; time_required: string }
type RichWeekItem = { day: string; task: string }

type RichOffer = {
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
  timeToFirstClient: string
  licenseRequired: string
  pitchOpener: string
  beginnerFriendly: boolean
  competitionLabel: string
  competitionColor: string
  what_you_actually_do: RichAction[]
  typical_week: RichWeekItem[]
  deliverables_rich: RichDeliverable[]
  time_breakdown: TimeBreakdown
  tools_needed: ToolNeeded[]
  first_90_days: PhaseBlock[]
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const offers: Record<string, RichOffer> = {
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
      startupCost: '$200-500',
      timeToFirstClient: '4-8 wks',
      licenseRequired: 'None',
      pitchOpener: 'Have any of your clients mentioned concerns about AI voice scams lately? We\'ve seen a huge spike.',
      beginnerFriendly: true,
      competitionLabel: 'Blue ocean',
      competitionColor: '#1D9E75',
      what_you_actually_do: [
        {
          step_number: 1,
          action: 'Run the 90-minute household communications audit',
          detail:
            'You map every device, email account, messaging app, and vendor portal touched by the principal, spouse, adult children, and top 5 household staff. You document every external party with financial authorization (private banker, CPA, trust attorney, property manager, insurance broker, travel concierge) and classify them into 3 verification tiers: Tier 1 (callback to a pre-registered number), Tier 2 (shared passphrase rotated quarterly), Tier 3 (dual authorization from two named principals). You produce a laminated 1-page authorization matrix posted above every wire-originating desk.',
          time_required: 'One-time (90 min) + quarterly refresh (~30 min)',
        },
        {
          step_number: 2,
          action: 'Deploy deepfake detection on the wire-originating line',
          detail:
            'You install Pindrop or Reality Defender on the office phone line that handles transfer authorizations. You run a baseline against 10 samples of the principal\'s real voice and 10 synthetic clones generated from public audio, tuning the threshold until false positives drop below 2%. You integrate alerting into the monitored inbox so every flagged call triggers a 15-minute human review before any authorization is accepted.',
          time_required: '~3 hours initial setup + 30 min/week tuning',
        },
        {
          step_number: 3,
          action: 'Run the quarterly tabletop deepfake drill',
          detail:
            'You write and execute a 45-minute live scenario where you (with written consent) call the EA, bookkeeper, and principal\'s spouse using a licensed voice clone. You score response time to invoke callback protocol, whether anyone escalated, and whether the passphrase was requested. You publish a 2-page after-action naming who followed the protocol and who didn\'t, and you re-train anyone who failed.',
          time_required: '~4 hours per quarter (prep + exec + write-up)',
        },
        {
          step_number: 4,
          action: 'Monitor and respond 24/7 with a 15-minute SLA',
          detail:
            'You stand up a shared inbox and monitored phone line covered by two named analysts on rotating shifts. You contract a 15-minute acknowledgment SLA and a 2-hour containment SLA. When an incident fires, you execute the pre-written runbook: freeze the target account with the private bank, preserve call logs for forensics, notify the principal via the designated non-phone channel, and file the IC3 report within 24 hours.',
          time_required: '~2 hours/week average + on-demand for incidents',
        },
      ],
      typical_week: [
        { day: 'Monday', task: 'Pull the weekend threat intel from Recorded Future and Cyfirma (15 min) and produce the 2-page Weekly Security Brief covering new AI-impersonation campaigns, peer incidents, and 3 specific actions for the principal. Delivered by 9 AM.' },
        { day: 'Tuesday', task: 'Spot-check 3 random staff members on passphrase compliance and authorization matrix currency (30 min). Log results in the compliance tracker.' },
        { day: 'Wednesday', task: 'Test deepfake detection with 5 new synthetic voice samples generated from this week\'s public audio. Open a tuning ticket if false-negative rate creeps above 3% (~45 min).' },
        { day: 'Thursday', task: '20-minute 1:1 security touchpoint with one member of the principal\'s inner circle on a rotating schedule — EA, CFO, spouse\'s assistant, house manager. Walk through one real peer-family incident from this week.' },
        { day: 'Friday', task: 'Deliver the Friday Principal Brief — a 1-page summary of the week\'s activity, near-misses caught by detection, staff compliance, and the single most important weekend action. Sent by 3 PM.' },
        { day: 'Monthly', task: 'Produce the 6-page Monthly Threat Posture Report and walk the principal through it live (30 min). Attempted-attack count, compliance scorecard, detection performance, peer incident review, 90-day roadmap.' },
      ],
      deliverables_rich: [
        { name: 'Household Authorization Matrix (1 page, laminated)', description: 'Lists every external party with financial authority, their verification tier, callback number, and current passphrase. Posted above every wire-originating desk. Rotated quarterly with a new passphrase and redistributed.', frequency: 'Quarterly refresh' },
        { name: 'Weekly Security Brief (2 pages)', description: 'This week\'s AI-impersonation campaigns, peer-family incidents, and 3 specific actions for the principal. Written in plain English — readable in 90 seconds.', frequency: 'Weekly (Mondays 9 AM)' },
        { name: 'Tabletop Drill After-Action (2 pages)', description: 'Documents results of the quarterly live simulated deepfake attack. Names who invoked callback protocol and who didn\'t. Assigns remedial training.', frequency: 'Quarterly' },
        { name: 'Monthly Threat Posture Report (6 pages)', description: 'Flagship monthly: attempted-attack count, compliance scorecard, detection performance, peer incident debriefs, rolling 90-day roadmap. Reviewed live in 30-minute call.', frequency: 'Monthly (5th of each month)' },
        { name: 'Incident Response Runbook (~40 pages, customized)', description: 'Binder the family office pulls out when something happens. 12 attack scenarios, named contacts, containment steps, 72-hour communication templates.', frequency: 'One-time build + annual refresh' },
        { name: 'Annual Security Posture Assessment (25 pages)', description: 'Year-in-review benchmarked against 18 peer family offices. Attack-surface heatmap, YoY incident trend, insurance gap analysis, next-year budget recommendation.', frequency: 'Annual (Q4, for next-year budget)' },
      ],
      time_breakdown: {
        weekly_hours: 8,
        breakdown: [
          { task: 'Weekly Security Brief (Mon)', hours_per_week: 1.5 },
          { task: 'Staff compliance spot-checks', hours_per_week: 0.5 },
          { task: 'Deepfake detection tuning', hours_per_week: 0.75 },
          { task: 'Security touchpoint 1:1s', hours_per_week: 0.5 },
          { task: 'Friday Principal Brief', hours_per_week: 1 },
          { task: '24/7 monitoring (shared inbox)', hours_per_week: 2 },
          { task: 'Monthly report prep (amortized)', hours_per_week: 1 },
          { task: 'Ad-hoc incident response (avg)', hours_per_week: 0.75 },
        ],
        note: 'Monitoring rota (~2h/week) and compliance spot-checks (~0.5h) can be delegated to a vetted VA with security training once protocols are documented. Incident response and principal-facing briefs should remain with the named operator.',
      },
      tools_needed: [
        { tool: 'Pindrop or Reality Defender', cost: '$500-1,200/mo', purpose: 'Deepfake audio detection on wire-authorization phone lines' },
        { tool: 'Recorded Future or Cyfirma', cost: '$800-1,500/mo', purpose: 'Threat intelligence feed for weekly security brief' },
        { tool: '1Password Teams', cost: '$8/user/mo', purpose: 'Shared passphrase vault for authorization matrix' },
        { tool: 'Twilio (monitored line)', cost: '$50-150/mo', purpose: '24/7 incident hotline with call recording' },
        { tool: 'Notion or Airtable', cost: '$20-50/mo', purpose: 'Runbook, compliance tracker, and client deliverable library' },
        { tool: 'DocuSign', cost: '$25/user/mo', purpose: 'Engagement letters and tabletop drill consent forms' },
      ],
      first_90_days: [
        {
          phase: 'Days 1-30: Setup & baseline',
          actions: [
            'Sign engagement letter, NDA, and data-processing agreement with the family office',
            'Run the 90-minute household communications audit with the principal and FO head',
            'Install Pindrop/Reality Defender on the wire-authorization phone line and run detection baseline',
            'Print and distribute the v1 Household Authorization Matrix with initial passphrase',
            'Subscribe to Recorded Future/Cyfirma and configure the weekly brief template',
            'Set up the monitored inbox, on-call rotation, and Twilio incident hotline',
          ],
        },
        {
          phase: 'Days 31-60: First delivery cadence',
          actions: [
            'Ship the first 4 Weekly Security Briefs (Mondays at 9 AM)',
            'Run first round of staff compliance spot-checks and publish scorecard',
            'Draft and deliver the first Monthly Threat Posture Report',
            'Build the customized 40-page Incident Response Runbook with the FO CEO',
            'Identify 2-3 peer family offices for benchmarking in the Q1 report',
          ],
        },
        {
          phase: 'Days 61-90: Proof of value',
          actions: [
            'Execute the first live tabletop deepfake drill and publish after-action',
            'Deliver the second Monthly Threat Posture Report with baseline-to-now trend',
            'Present first-quarter ROI memo: attempts detected, near-misses stopped, compliance lift',
            'Run joint review with the family\'s private banker to integrate callback protocols',
            'Commit to the next 90-day roadmap with the principal',
          ],
        },
      ],
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
      startupCost: '$500-1000',
      timeToFirstClient: '6-10 wks',
      licenseRequired: 'None',
      pitchOpener: 'How are your newly exited founders handling the lifestyle complexity? We keep hearing about dropped balls.',
      beginnerFriendly: false,
      competitionLabel: 'Low competition',
      competitionColor: '#85B7EB',
      what_you_actually_do: [
        {
          step_number: 1,
          action: 'Map the advisory ecosystem in a 3-hour session',
          detail:
            'You sit with the principal and family office head for 3 hours. You document every advisor (name, firm, discipline, billing arrangement, primary contact), every entity they serve, every recurring meeting, and every standing decision right they hold. You produce a one-page "family cap table for decisions" showing who can do what without further approval. Most families have never seen this picture on a single page before.',
          time_required: 'One-time (3 hours) + quarterly refresh (~45 min)',
        },
        {
          step_number: 2,
          action: 'Stand up the monthly Advisory Council cadence',
          detail:
            'You schedule a recurring 60-minute video call the first Tuesday of each month with all 7 advisors plus the principal. You chair it. You circulate a 2-page agenda 72 hours in advance with three sections: decisions needed this month, upcoming deadlines inside 90 days, cross-advisor conflicts flagged since last session. You publish minutes within 24 hours with owner-assigned action items.',
          time_required: '~3 hours/month (prep + chair + minutes)',
        },
        {
          step_number: 3,
          action: 'Maintain the Decision Log of record',
          detail:
            'You run a single Notion or Airtable database tracking every material family decision: who proposed it, who was consulted, what was decided, and what the outcome was 12 months later. This becomes the institutional memory. When the principal dies or steps back, their successor has a 10-year searchable history instead of a drawer full of PDFs.',
          time_required: '~2 hours/week for ongoing entries',
        },
        {
          step_number: 4,
          action: 'Facilitate the quarterly Alignment Summit',
          detail:
            'Once a quarter you host a 3-hour live (or Zoom) summit with all advisors, the principal, and the next generation. You facilitate scenario planning on 3 live topics: e.g., "what happens if Dad dies next year," "the 2026 exemption sunset timeline," "a $50M liquidity event next spring." Every advisor commits to specific pre-work and you publish a 5-page summary within 72 hours.',
          time_required: '~8 hours/quarter (prep + facilitate + summary)',
        },
      ],
      typical_week: [
        { day: 'Monday', task: 'Review the Decision Log for any item open >14 days without movement (10 min). Email the accountable advisor with a single-question escalation: "What is blocking closure?" Log response by EOD.' },
        { day: 'Tuesday', task: 'Draft the weekly Family Coordination Digest — 1 page, 3 sections (past week, pending principal input, next 14 days). Delivered by 5 PM.' },
        { day: 'Wednesday', task: '30-minute 1:1 with one advisor on a rotating 7-week schedule. Ask one standing question: "What is the family doing — or not doing — that is making your job harder?" Document verbatim.' },
        { day: 'Thursday', task: 'Update the 90-day deadline calendar (tax elections, trust fundings, insurance renewals, RMDs). Email any advisor with a deadline inside 30 days.' },
        { day: 'Friday', task: 'Principal Briefing (2 pages) summarizing the week, any pending approvals, single weekend action item. Delivered by 3 PM so the principal is not reading it Sunday night.' },
        { day: 'Monthly', task: 'Chair the 60-minute Advisory Council call the first Tuesday. Publish minutes within 24 hours. Track action items in the Decision Log with owners and due dates.' },
        { day: 'Quarterly', task: 'Facilitate the 3-hour Alignment Summit. Publish the 5-page summary within 72 hours. Schedule the next summit before adjourning.' },
      ],
      deliverables_rich: [
        { name: 'Family Decision Cap Table (1 page)', description: 'Map of who can decide what without further approval. Every FO CEO describes it as "the document I didn\'t know I needed." Used to onboard new advisors and resolve authority disputes in under 60 seconds.', frequency: 'Quarterly refresh' },
        { name: 'Weekly Family Coordination Digest (1 page)', description: 'Delivered every Tuesday by 5 PM. Three sections — what happened this week, what\'s pending principal input, what\'s coming in next 14 days. Readable in under 3 minutes.', frequency: 'Weekly (Tuesdays 5 PM)' },
        { name: 'Monthly Advisory Council Minutes (3 pages)', description: 'Published within 24 hours of the first-Tuesday council call. Names every decision made, every owner assigned, every deadline committed. The fiduciary-duty audit trail.', frequency: 'Monthly' },
        { name: 'Decision Log (living database)', description: 'Searchable record of every material family decision. Each entry has proposer, consulted parties, decision, rationale, 12-month outcome. The most valuable single artifact for the next generation.', frequency: 'Continuously updated' },
        { name: 'Quarterly Alignment Summit Summary (5 pages)', description: 'Produced within 72 hours of the live summit. Captures 3 scenarios walked through, every advisor\'s commitments, cross-discipline action plan for the next quarter.', frequency: 'Quarterly' },
        { name: 'Annual State-of-the-Family Report (20 pages)', description: 'Delivered every December. Year-in-review of decisions, money saved or spent due to coordination, advisor performance scorecard, coordination agenda for next year. Used as the governance document at family meetings.', frequency: 'Annual (December)' },
      ],
      time_breakdown: {
        weekly_hours: 12,
        breakdown: [
          { task: 'Decision Log maintenance + escalations', hours_per_week: 2 },
          { task: 'Weekly Coordination Digest (Tue)', hours_per_week: 1.5 },
          { task: '1:1 advisor rotation (Wed)', hours_per_week: 0.75 },
          { task: '90-day deadline calendar upkeep', hours_per_week: 0.5 },
          { task: 'Friday Principal Briefing', hours_per_week: 1.25 },
          { task: 'Monthly Advisory Council (amortized)', hours_per_week: 0.75 },
          { task: 'Quarterly Summit prep (amortized)', hours_per_week: 1.5 },
          { task: 'Ad-hoc coordination (advisor emails, conflicts)', hours_per_week: 3.75 },
        ],
        note: 'Deadline-calendar maintenance and Decision Log entry can be delegated to a vetted paralegal or executive assistant once templates are in place (~3h/week reclaimed). Advisor-facing communication and summit facilitation should stay with the named operator to preserve credibility.',
      },
      tools_needed: [
        { tool: 'Notion or Airtable (Pro tier)', cost: '$10-24/user/mo', purpose: 'Decision Log, deadline calendar, action-item tracker' },
        { tool: 'Calendly Teams', cost: '$12/user/mo', purpose: 'Multi-advisor scheduling for council calls and summits' },
        { tool: 'Zoom Workplace (Pro)', cost: '$16/user/mo', purpose: 'Recorded advisory council calls and quarterly summits' },
        { tool: 'Otter.ai Business', cost: '$20/user/mo', purpose: 'Transcription of advisor 1:1s and council minutes' },
        { tool: 'Loom', cost: '$15/user/mo', purpose: 'Async video briefings for principals who prefer video over written' },
        { tool: 'Dropbox Business', cost: '$20/user/mo', purpose: 'Secure document repository for cross-advisor artifacts' },
      ],
      first_90_days: [
        {
          phase: 'Days 1-30: Discovery & baseline',
          actions: [
            'Sign engagement letter with explicit non-advisor disclaimer language',
            'Conduct the 3-hour advisory ecosystem mapping session with principal and FO head',
            'Interview all 7 advisors individually (30 min each) — discipline, pain points, expectations',
            'Build the v1 Family Decision Cap Table and circulate for validation',
            'Stand up the Decision Log in Notion/Airtable with first 20 back-historical entries',
            'Schedule the first Advisory Council call (first Tuesday of month 2)',
          ],
        },
        {
          phase: 'Days 31-60: First full cadence',
          actions: [
            'Ship 4 Weekly Coordination Digests (Tuesdays 5 PM)',
            'Chair the first Advisory Council call and publish minutes within 24 hours',
            'Complete the first full 7-week advisor 1:1 rotation',
            'Deliver the first Monthly Coordination Report',
            'Build the 90-day deadline calendar and pressure-test against all 7 advisors',
          ],
        },
        {
          phase: 'Days 61-90: Proof of value',
          actions: [
            'Facilitate the first Quarterly Alignment Summit (3 hours live)',
            'Publish the 5-page summit summary within 72 hours',
            'Document the first coordinated cross-advisor save with a dollar-value attached',
            'Present first-quarter ROI memo: decisions closed faster, conflicts avoided, deadlines met',
            'Commit with principal to the next 90-day priorities',
          ],
        },
      ],
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
      startupCost: '$100-300',
      timeToFirstClient: '3-6 wks',
      licenseRequired: 'None',
      pitchOpener: 'Have you seen the FTC actions on data brokers? Some of your clients may be more exposed than they realize.',
      beginnerFriendly: true,
      competitionLabel: 'Competitive',
      competitionColor: '#BA7517',
      what_you_actually_do: [
        {
          step_number: 1,
          action: 'Run the 2-week comprehensive exposure baseline',
          detail:
            'You conduct a baseline scan across 4,000+ data brokers, 14 specialty wealth databases (WealthEngine, iWave, RelSci, WealthX), county assessor records in every state of ownership, SEC EDGAR, IRS Form 990s, and 6 dark-web marketplaces via a licensed TI vendor (Flashpoint or Recorded Future). You produce a 25-page exposure report enumerating every finding with source, date, and severity.',
          time_required: 'One-time (2 weeks, ~40 hours)',
        },
        {
          step_number: 2,
          action: 'Execute the 6-month removal campaign',
          detail:
            'You run systematic opt-outs across all 4,000+ brokers using Optery Enterprise plus manual submissions for brokers requiring ID verification. You issue legal takedown letters for dark-web and specialty-database listings. You file CCPA/GDPR requests for any broker with CA/EU nexus. Every submission tracked in a single database with status, confirmation date, and re-verification schedule.',
          time_required: '~3 hours/week for 6 months, then ~1.5 hours/week ongoing',
        },
        {
          step_number: 3,
          action: 'Harden the public-record exposure',
          detail:
            'You work with the family\'s real estate attorney to retitle properties into privacy-preserving entities (Wyoming LLC, Delaware statutory trust, land trust depending on state). You submit address-suppression requests under state Address Confidentiality Programs (30+ states). You coach the philanthropic advisor on DAF structures that maintain giving without naming the family on 990s.',
          time_required: '~6 hours in month 1, ~1 hour/month ongoing',
        },
        {
          step_number: 4,
          action: 'Continuous monitoring and quarterly re-verification',
          detail:
            'You run weekly automated re-scans across the full broker population plus specialty databases. You do a monthly manual audit of the top 50 highest-risk brokers (the ones that re-list most aggressively). You run a quarterly dark-web credentialed sweep via the TI vendor. You deliver a monthly 4-page Privacy Posture Report and a quarterly 10-page deep-dive.',
          time_required: '~1.5 hours/week + 3 hours/month + 6 hours/quarter',
        },
      ],
      typical_week: [
        { day: 'Monday', task: 'Process weekend automated scan results (45 min). Triage new listings: auto-remove, manual-submit, or escalate-to-legal. File auto-removes by 11 AM.' },
        { day: 'Tuesday', task: 'Execute manual opt-out submissions for brokers requiring ID verification or paper forms (2 hours). Follow up on 30+ day stalled opt-outs. File CCPA/GDPR requests against non-responsive brokers.' },
        { day: 'Wednesday', task: 'Weekly dark-web sweep via TI vendor portal (45 min). Open an incident ticket for any finding above 6/10 severity and notify the family\'s security contact within 2 hours.' },
        { day: 'Thursday', task: 'Review social media and public records exposure across principal, spouse, adult children, and top 5 household staff (1 hour). Send a 5-bullet coaching email to any flagged person.' },
        { day: 'Friday', task: 'Update the Family Privacy Dashboard with the week\'s removals, new listings, and net exposure delta. Deliver the Friday Privacy Brief (1 page) to the principal.' },
        { day: 'Monthly', task: 'Deliver the 4-page Monthly Privacy Posture Report and walk the FO head through it in a 30-minute call.' },
        { day: 'Quarterly', task: 'Deliver the 10-page deep-dive report with peer benchmarking, dark-web incident summary, removal success rates by broker, and the refreshed 90-day plan.' },
      ],
      deliverables_rich: [
        { name: 'Initial Exposure Report (25 pages)', description: 'Baseline deliverable from the first 2 weeks. Every finding across 4,000+ brokers, 14 specialty wealth databases, county records, SEC filings, Form 990s, and 6 dark-web marketplaces. Each finding has source, date, severity, removal path.', frequency: 'One-time (onboarding)' },
        { name: 'Family Privacy Dashboard (live)', description: 'Continuously updated portal showing current exposure by source, trend over time, active removal requests, and dark-web monitoring status. FO head checks weekly; principal checks monthly.', frequency: 'Continuously updated' },
        { name: 'Monthly Privacy Posture Report (4 pages)', description: 'Delivered by the 5th of each month. Last month\'s removals, new listings, net exposure change, active TI findings, top 3 recommendations for the next 30 days.', frequency: 'Monthly' },
        { name: 'Quarterly Deep-Dive (10 pages)', description: 'Comprehensive review with peer benchmarking, dark-web incident summary, removal success rates by broker, refreshed 90-day plan. Shared with security advisor and estate attorney.', frequency: 'Quarterly' },
        { name: 'Incident Alert Protocol', description: 'Playbook and contact tree activated when a dark-web listing, credential leak, or threat-forum mention fires above 7/10 severity. 2-hour acknowledgment SLA, 12-hour containment SLA, full escalation tree to physical security.', frequency: 'Always-on (invoked on incidents)' },
        { name: 'Annual Digital Estate Review (20 pages)', description: 'Full annual audit of family digital assets, accounts, privacy infrastructure, and successor-access planning. Doubles as governance document for family meetings and documentation for cyber-insurance renewals.', frequency: 'Annual' },
      ],
      time_breakdown: {
        weekly_hours: 6,
        breakdown: [
          { task: 'Monday scan triage and auto-removes', hours_per_week: 0.75 },
          { task: 'Tuesday manual opt-out submissions', hours_per_week: 2 },
          { task: 'Wednesday dark-web sweep', hours_per_week: 0.75 },
          { task: 'Thursday social + public records review', hours_per_week: 1 },
          { task: 'Friday dashboard update + principal brief', hours_per_week: 0.75 },
          { task: 'Monthly/quarterly reporting (amortized)', hours_per_week: 0.75 },
        ],
        note: 'Manual opt-out submissions (~2h/week) are the single largest bucket and can be substantially delegated to a trained VA using a documented playbook. Dark-web sweep interpretation and incident triage should remain with the named operator — judgment on severity drives the 2-hour SLA.',
      },
      tools_needed: [
        { tool: 'Optery Enterprise', cost: '$350-500/mo', purpose: 'Automated opt-out submissions across mainstream broker population' },
        { tool: 'Flashpoint or Recorded Future', cost: '$1,200-2,500/mo', purpose: 'Licensed dark-web and threat-intelligence monitoring' },
        { tool: 'WealthEngine / iWave (read-only)', cost: '$300-800/mo', purpose: 'Verify specialty-database listings and track removal' },
        { tool: 'Airtable Pro', cost: '$20/user/mo', purpose: 'Track every opt-out submission, status, and re-verification schedule' },
        { tool: 'Proton Mail + Proton Drive (Business)', cost: '$13/user/mo', purpose: 'End-to-end encrypted channel for sensitive family communications' },
        { tool: 'Tableau or Looker Studio', cost: '$70-85/user/mo (or free)', purpose: 'Family Privacy Dashboard front-end' },
      ],
      first_90_days: [
        {
          phase: 'Days 1-30: Baseline & immediate removals',
          actions: [
            'Sign engagement letter, DPA, and family-member written authorizations for identity-verified submissions',
            'Run the 2-week comprehensive exposure scan across brokers, specialty databases, public records, and dark web',
            'Deliver the 25-page Initial Exposure Report and walk the principal through it',
            'Submit opt-outs to the top 200 highest-exposure brokers using Optery Enterprise',
            'File CCPA/GDPR requests against the 50 most aggressive brokers',
            'Stand up the Family Privacy Dashboard with real-time status',
          ],
        },
        {
          phase: 'Days 31-60: Deep removal push & hardening',
          actions: [
            'Complete opt-outs across the full 4,000+ broker population',
            'Issue legal takedown letters for specialty-database and dark-web listings',
            'Coordinate with the real estate attorney on retitling highest-exposure properties',
            'Submit state Address Confidentiality Program requests where eligible',
            'Deliver the first Monthly Privacy Posture Report',
            'Begin staff privacy training with household employees',
          ],
        },
        {
          phase: 'Days 61-90: Proof of value',
          actions: [
            'Measure and report net exposure reduction (typical: 75-85% of baseline removed)',
            'Deliver the second Monthly Privacy Posture Report with trend data',
            'Complete the first Quarterly Deep-Dive with peer benchmarking',
            'Present the first-quarter ROI memo: exposure removed, phishing/scam reduction, near-miss threats caught',
            'Commit with principal to the next-quarter priorities',
          ],
        },
      ],
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
      startupCost: '$300-600',
      timeToFirstClient: '8-12 wks',
      licenseRequired: 'State-dependent',
      pitchOpener: 'When was the last time your family office clients stress-tested anything besides their investments?',
      beginnerFriendly: false,
      competitionLabel: 'Moderate',
      competitionColor: '#85B7EB',
      what_you_actually_do: [
        {
          step_number: 1,
          action: 'Score governance maturity across 8 domains',
          detail:
            'You score the family office against a 50-item rubric spanning 8 domains: strategy, operations, investment, legal/fiduciary, tax, technology/cyber, HR/talent, external relationships. You benchmark against anonymized data from 18 peer family offices in the same AUM band. You produce a 30-page Governance Maturity Report with a single-page scorecard and a prioritized 12-month roadmap.',
          time_required: 'One-time (4 weeks, ~60 hours)',
        },
        {
          step_number: 2,
          action: 'Stand up the Family Office Risk Committee',
          detail:
            'You draft the Risk Committee charter, nominate composition (typically principal or designee, FO CEO, one outside advisor, and you as secretary), set the quarterly cadence, and chair the first 3 meetings. You deliver a standing 12-page pre-read 7 days ahead of each meeting: risk register updates, loss events since last meeting, regulatory calendar, and the quarter\'s deep-dive topic.',
          time_required: '~15 hours/quarter (prep + chair + minutes)',
        },
        {
          step_number: 3,
          action: 'Build and operate the risk register',
          detail:
            'You run a single risk register (LogicGate, Resolver, or structured Airtable) with every risk scored on likelihood × impact, an owner, control status, and next-review date. You review weekly and escalate any risk whose residual score exceeds the committee\'s tolerance threshold within 48 hours. The register becomes the audit trail for every insurance renewal and any regulatory inquiry.',
          time_required: '~2.5 hours/week ongoing',
        },
        {
          step_number: 4,
          action: 'Run the annual independent governance review',
          detail:
            'Once a year, you conduct an independent review against the prior-year roadmap. You interview every committee member, audit the register for quality and completeness, test 5 random controls end-to-end, and benchmark progress against the peer data set. You deliver a 40-page report with an unvarnished maturity-movement score and the following year\'s priorities.',
          time_required: '~50 hours annually (concentrated in Q4)',
        },
      ],
      typical_week: [
        { day: 'Monday', task: 'Review the risk register for any item whose residual score has moved since last Monday (30 min). Email the assigned owner for any degraded risk. Log weekend incident reports.' },
        { day: 'Tuesday', task: '30-minute control-testing session with one functional area on a rotating schedule (cyber, tax, payroll, banking, investor reporting, insurance, vendor mgmt, HR). Test one control end-to-end and document the result.' },
        { day: 'Wednesday', task: 'Update the 90-day regulatory calendar (CTA filings, SEC forms, state registrations, Form 5500, K-2/K-3 deadlines). Email accountable owners for any filing inside 14 days.' },
        { day: 'Thursday', task: 'Audit key-person risk — identify single points of failure for any process above $500K impact. Flag any new single-points created by staffing changes in the prior week.' },
        { day: 'Friday', task: 'Deliver the 2-page Friday Governance Brief to FO CEO and principal: register changes, control-testing results, regulatory updates, single most important action for next week.' },
        { day: 'Monthly', task: 'Deliver the 8-page Monthly Risk Report with full register update, loss events, regulatory activity, control-testing results. Review live with FO CEO in 45-minute call.' },
        { day: 'Quarterly', task: 'Chair the Risk Committee meeting. Deliver the 12-page pre-read 7 days prior. Publish minutes within 48 hours with owner-assigned action items.' },
      ],
      deliverables_rich: [
        { name: 'Governance Maturity Report (30 pages)', description: 'The baseline. Scores the family office across 8 domains on a 50-item rubric, benchmarks against 18 peer offices, delivers prioritized 12-month roadmap. The Year-1 playbook and comparison point for the annual review.', frequency: 'One-time (onboarding)' },
        { name: 'Risk Register (living database)', description: 'The core operational artifact. Every identified risk scored on likelihood × impact, assigned owner, linked to mitigating controls, scheduled for re-review. Used in every weekly review, committee meeting, insurance renewal, and audit.', frequency: 'Continuously updated' },
        { name: 'Monthly Risk Report (8 pages)', description: 'Delivered by the 5th of each month. Register updates, loss events, regulatory changes, control-testing results, top-3 actions for the coming month. Reviewed live with FO CEO in 45-minute call.', frequency: 'Monthly' },
        { name: 'Quarterly Risk Committee Package (12-page pre-read + minutes)', description: '12-page pre-read distributed 7 days before each committee meeting, plus formal minutes within 48 hours. The audit trail demonstrating fiduciary oversight — used in insurance renewals and any regulatory inquiry.', frequency: 'Quarterly' },
        { name: 'Business Continuity Plan (~60 pages, customized)', description: 'Tested playbook for 15 disruption scenarios including key-person loss, cyber incident, bank relationship failure, tax-return restatement, principal incapacity. Live-tested annually via tabletop.', frequency: 'Built in Year 1, refreshed annually' },
        { name: 'Annual Governance Review (40 pages)', description: 'The unvarnished year-in-review. Maturity-movement score, peer benchmarking, control-testing summary, regulatory compliance verification, insurance gap analysis, next-year roadmap. Reviewed live with principal and Risk Committee.', frequency: 'Annual (Q4)' },
      ],
      time_breakdown: {
        weekly_hours: 10,
        breakdown: [
          { task: 'Risk register review + escalations', hours_per_week: 2.5 },
          { task: 'Control testing (rotating area)', hours_per_week: 1 },
          { task: 'Regulatory calendar maintenance', hours_per_week: 1 },
          { task: 'Key-person risk audit', hours_per_week: 0.75 },
          { task: 'Friday Governance Brief', hours_per_week: 1.25 },
          { task: 'Monthly Risk Report (amortized)', hours_per_week: 1.5 },
          { task: 'Quarterly Risk Committee (amortized)', hours_per_week: 1.25 },
          { task: 'Ad-hoc incident + insurance liaison', hours_per_week: 0.75 },
        ],
        note: 'Control-testing execution and regulatory calendar upkeep can be delegated to a trained paralegal or governance analyst once templates and rubrics are documented (~2h/week reclaimed). The risk register, committee chairmanship, and principal-facing briefs must stay with the named lead operator.',
      },
      tools_needed: [
        { tool: 'LogicGate or Resolver', cost: '$1,200-2,500/mo', purpose: 'Enterprise GRC platform for risk register, control-testing, and audit trail' },
        { tool: 'Compliance.ai or Thomson Reuters Regulatory Intelligence', cost: '$500-1,200/mo', purpose: 'Automated regulatory calendar for CTA, SEC, state filings' },
        { tool: 'ADP or Gusto (audit module)', cost: '$50-150/mo', purpose: 'Payroll control attestation for key-person risk documentation' },
        { tool: 'Google Workspace Enterprise or M365 E5', cost: '$22-57/user/mo', purpose: 'Secure document repository with eDiscovery for governance artifacts' },
        { tool: 'Notion or Confluence', cost: '$8-20/user/mo', purpose: 'Policy library, Business Continuity Plan, runbooks' },
        { tool: 'Onboarding — BDO or Grant Thornton governance benchmarking subscription', cost: '$800-1,500/mo', purpose: 'Peer benchmarking data for annual review' },
      ],
      first_90_days: [
        {
          phase: 'Days 1-30: Baseline maturity assessment',
          actions: [
            'Sign engagement letter and confidentiality agreement with every committee member named',
            'Interview every FO staff member, outside advisor, and key vendor (24 interviews average)',
            'Collect and review all existing policies, insurance declarations, vendor contracts, and org charts',
            'Score the 50-item rubric and assemble peer-benchmark comparison',
            'Draft the 30-page Governance Maturity Report with scorecard and 12-month roadmap',
          ],
        },
        {
          phase: 'Days 31-60: Stand up the operating cadence',
          actions: [
            'Present the Governance Maturity Report to principal and FO CEO',
            'Draft and adopt the Risk Committee charter; schedule the first meeting',
            'Deploy LogicGate/Resolver and load the initial risk register (typically 40-70 risks)',
            'Build the 90-day regulatory calendar with owners and deadlines',
            'Ship the first Monthly Risk Report',
          ],
        },
        {
          phase: 'Days 61-90: First committee cycle and proof of value',
          actions: [
            'Chair the first Risk Committee meeting; publish minutes within 48 hours',
            'Complete the first full 8-week control-testing rotation',
            'Identify and document the first 2-3 key-person risk mitigations implemented',
            'Deliver the first-quarter governance memo to the principal with a single narrative: what got safer',
            'Commit to the next 90-day roadmap with the committee',
          ],
        },
      ],
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
      startupCost: '$200-400',
      timeToFirstClient: '4-6 wks',
      licenseRequired: 'Must partner with physicians',
      pitchOpener: 'Are any of your clients frustrated by fragmented healthcare — too many specialists, nobody connecting the dots?',
      beginnerFriendly: true,
      competitionLabel: 'Low competition',
      competitionColor: '#1D9E75',
      what_you_actually_do: [
        {
          step_number: 1,
          action: 'Build the unified family health record',
          detail:
            'You collect records from every provider for every family member — typically 7+ systems per adult, 3+ per child. You load them into a HIPAA-compliant unified record platform (PicnicHealth, Commure, or a custom secure-by-default stack) with full audit logging. You produce a 1-page "medical passport" per family member: active diagnoses, current medications, allergies, key dates, specialist contacts, advance directives. Each passport lives on the principal\'s phone and is refreshed quarterly.',
          time_required: 'One-time (first 30 days, ~40 hours)',
        },
        {
          step_number: 2,
          action: 'Serve as clinical quarterback on active cases',
          detail:
            'When a case is active, you are the single point of contact across all providers. You attend (virtually) every specialist appointment with consent, take structured notes, push each specialist\'s notes back to the primary and any other relevant specialist within 24 hours, track every pending order and result, and run a 24-hour SLA on flagging drug interactions. You manage information flow so every doctor has the full picture before they opine.',
          time_required: '~4 hours/week average (higher during active cases)',
        },
        {
          step_number: 3,
          action: 'Run the rapid second-opinion and clinical-trial process',
          detail:
            'When a serious diagnosis arrives, you execute the pre-built second-opinion protocol: within 72 hours you have records at 2-3 centers of excellence (MSK, Cleveland Clinic, Mayo, Johns Hopkins, MD Anderson, Dana-Farber depending on condition), the family has a virtual consult scheduled, and you have run a clinical trials search. You present a 4-page decision memo laying out options, expected outcomes, and recommended path.',
          time_required: '~20 hours per major case (rare but high-stakes)',
        },
        {
          step_number: 4,
          action: 'Manage the preventive and legacy program',
          detail:
            'You design and run an annual executive physical program (Human Longevity, Fountain Life, or a custom AMC protocol), coordinate genetic counseling and hereditary risk management, manage the long-term care insurance strategy, and maintain the family health legacy roadmap — a 20-year preventive program for every family member and every known hereditary risk. Reviewed annually.',
          time_required: '~2 hours/week average + concentrated 20 hours in Q1',
        },
      ],
      typical_week: [
        { day: 'Monday', task: 'Pull weekend inbound results across all active cases (30 min). Triage into routine / time-sensitive / urgent. File record-transfer requests by 11 AM.' },
        { day: 'Tuesday', task: 'Attend (virtually) specialist appointments for any active case on the schedule. Produce structured notes within 2 hours. Push to all relevant providers with a 24-hour SLA.' },
        { day: 'Wednesday', task: 'Weekly medication reconciliation across all active family members (1 hour). Check every current prescription against every other for interactions. Flag to prescribing physician and primary by EOD.' },
        { day: 'Thursday', task: 'Preventive-care compliance audit (45 min). Verify every family member is current on scheduled screenings (mammography, colonoscopy, derm check, cardiac markers, genetic re-testing). Email accountable family member for any overdue screening.' },
        { day: 'Friday', task: 'Deliver the 2-page Weekly Health Coordination Brief to the designated family contact covering active cases, pending results, upcoming appointments, action items. Sent by 3 PM.' },
        { day: 'Monthly', task: 'Produce the 6-page Monthly Health Coordination Report. Walk the principal or family contact through it in a 30-minute call.' },
        { day: 'Quarterly', task: 'Refresh each family member\'s 1-page medical passport. Update advance directives if anything has changed. Audit the unified health record for completeness.' },
      ],
      deliverables_rich: [
        { name: 'Unified Family Health Record (live platform)', description: 'Secure, HIPAA-compliant platform with records from every provider for every family member. Full audit logging. Accessible to the family member and named clinicians on explicit permission. The single source of medical truth the family has never had before.', frequency: 'Continuously updated' },
        { name: 'Family Medical Passport (1 page per member)', description: 'Printable and phone-resident summary for each family member: diagnoses, medications, allergies, specialist contacts, advance directives. Saves lives in the ER when the patient cannot speak for themselves.', frequency: 'Quarterly refresh' },
        { name: 'Weekly Health Coordination Brief (2 pages)', description: 'Delivered every Friday by 3 PM to the designated family contact. Active cases, pending results, upcoming appointments, action items. Readable in 3 minutes over a coffee.', frequency: 'Weekly (Fridays 3 PM)' },
        { name: 'Second-Opinion Decision Memo (4 pages, per major case)', description: 'The 72-hour deliverable when a serious diagnosis requires a decision. Lays out 2-3 centers-of-excellence opinions, matched clinical trials, expected outcomes, recommended path. The document the family uses to make the call.', frequency: 'Per major case (typically 2-6/year)' },
        { name: 'Monthly Health Coordination Report (6 pages)', description: 'Delivered by the 5th of each month. All active cases, preventive-care status, medication reconciliation findings, top-3 actions for the coming month. Reviewed live in a 30-minute call.', frequency: 'Monthly' },
        { name: 'Annual Family Health Legacy Plan (30 pages)', description: 'Annual governance document. Hereditary risk map, multi-generational preventive program, LTC insurance strategy, advance directive status, 20-year roadmap. Reviewed live with principal and next generation as they come of age.', frequency: 'Annual (Q1)' },
      ],
      time_breakdown: {
        weekly_hours: 10,
        breakdown: [
          { task: 'Active case quarterbacking', hours_per_week: 4 },
          { task: 'Weekly medication reconciliation', hours_per_week: 1 },
          { task: 'Preventive-care compliance audit', hours_per_week: 0.75 },
          { task: 'Friday Health Coordination Brief', hours_per_week: 1.25 },
          { task: 'Monthly report (amortized)', hours_per_week: 1 },
          { task: 'Annual legacy plan (amortized)', hours_per_week: 0.5 },
          { task: 'Ad-hoc urgent triage', hours_per_week: 1.5 },
        ],
        note: 'Record transfer logistics and appointment-note ingestion (~2h/week) can be delegated to a HIPAA-trained medical admin. Clinical quarterbacking, second-opinion coordination, and medication reconciliation must stay with a clinically-credentialed navigator (RN or equivalent) — judgment is the product.',
      },
      tools_needed: [
        { tool: 'PicnicHealth or Commure (HIPAA BAA)', cost: '$250-700/mo/family', purpose: 'Unified secure health record with full audit logging' },
        { tool: 'Doximity Dialer', cost: '$15-30/user/mo', purpose: 'HIPAA-compliant calls and messaging with specialist network' },
        { tool: 'Signal or ProtonMail (Business)', cost: '$10-15/user/mo', purpose: 'Encrypted channel for sensitive family communications' },
        { tool: 'ClinicalTrials.gov + TrialNet or Antidote', cost: 'Free - $500/mo', purpose: 'Clinical trial matching against active family diagnoses' },
        { tool: 'Airtable Pro', cost: '$20/user/mo', purpose: 'Case tracker, medication reconciliation log, preventive-care calendar' },
        { tool: 'International SOS or Global Rescue (annual)', cost: '$800-3,000/yr/family', purpose: 'Global emergency medical evacuation and on-the-ground advocacy' },
      ],
      first_90_days: [
        {
          phase: 'Days 1-30: Build the foundation',
          actions: [
            'Sign engagement letter, HIPAA BAAs with all platform vendors, and per-member medical authorizations',
            'Collect records from every provider for every family member (~7 systems per adult, 3+ per child)',
            'Stand up PicnicHealth/Commure with full audit logging',
            'Produce the first Family Medical Passports (1 page per member)',
            'Document current medications and run the first interaction reconciliation',
            'Establish the designated family contact and communication protocol',
          ],
        },
        {
          phase: 'Days 31-60: Operating cadence',
          actions: [
            'Deliver the first 4 Weekly Health Coordination Briefs (Fridays 3 PM)',
            'Run first preventive-care compliance audit and schedule overdue screenings',
            'Document the care team for every family member and establish clinician permissions',
            'Deliver the first Monthly Health Coordination Report',
            'Set up the annual executive physical program for the principal and spouse',
          ],
        },
        {
          phase: 'Days 61-90: Demonstrated value',
          actions: [
            'Demonstrate concrete coordination saves (e.g., caught drug interaction, accelerated specialist access)',
            'Deliver the second Monthly Report with trend: records consolidated, appointments coordinated, incidents prevented',
            'Complete the first quarterly medical passport refresh for all family members',
            'Begin the Annual Family Health Legacy Plan with hereditary risk map and 20-year preventive roadmap',
            'Present first-quarter ROI memo: time saved for the family, diagnostic-error reduction, preventive wins',
          ],
        },
      ],
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
