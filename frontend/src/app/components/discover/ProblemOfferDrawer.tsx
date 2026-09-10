'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

/* ───────────────────────────── Types ───────────────────────────── */

interface ApiProblem {
  id: string;
  title: string;
  description: string;
  wealth_tier: string;
  pain_category: string;
  lifecycle_stage: string;
  urgency_score: number;
  credibility_score: number;
  wtp_signal: string;
  composite_score: number;
  wtp_range: string;
  citation_count: number;
  buyer_type: string;
  compliance_risk: string;
  trust_channel: string;
  source_types: string[];
}

interface ProblemOfferDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string;
  problem?: ApiProblem;
}

interface OfferStep {
  title: string;
  description: string;
}

interface RichStep {
  stepNumber: number;
  action: string;
  detail: string;
  timeRequired: string;
}

interface RichDeliverable {
  name: string;
  description: string;
  frequency: string;
}

interface TimeBreakdownItem {
  task: string;
  hoursPerWeek: number;
}

interface TimeBreakdown {
  weeklyHours: number;
  items: TimeBreakdownItem[];
  note: string;
}

interface ToolNeeded {
  tool: string;
  cost: string;
  purpose: string;
}

interface PhaseBlock {
  phase: string;
  color: 'amber' | 'green' | 'gold';
  actions: string[];
}

interface IdealClient {
  who: string;
  trigger: string;
  channel: string;
  question: string;
  roi: string;
}

interface CurrentSolution {
  approach: string;
  whyItFails: string;
}

interface WeekSchedule {
  [key: string]: string;
}

interface Objection {
  objection: string;
  response: string;
}

interface ProblemData {
  /* LEFT — The Problem */
  title: string;
  tags: string[];
  evidenceCount: number;
  narrative: string;
  scenario: string;
  scenarioAttribution: string;
  whyWealthy: string[];
  credibility: number;
  wtp: string;
  lifecycle: string;
  sourceQuote?: string;
  sourceAttribution?: string;
  complianceRisk: string;
  complianceRiskNote: string;
  currentSolutions: CurrentSolution[];
  /* LEFT — Extended */
  /* Optional: the drawer renders without them, and not every problem
     source populates the full extended block. */
  trendData?: number[];
  trendGrowth?: string;
  weeklyHours?: string;
  startupCost?: string;
  timeToFirstClient?: string;
  pitchOpener?: string;
  quickFacts?: { label: string; value: string }[];
  /* RIGHT — The Offer */
  offerName: string;
  offerTagline: string;
  price: string;
  priceMin: number;
  priceMax: number;
  delivery: string;
  steps: OfferStep[];
  week: WeekSchedule;
  deliverables: string[];
  idealClient: IdealClient;
  firstClientPath: string[];
  objections: Objection[];
  /* Simple-mode extras */
  simpleStory: string;
  simpleExample: string;
  simpleBullets: string[];
  simpleRole: string;
  simpleSteps: string[];
  simpleMonth: string;
  simpleSellTo: string;
  /* Rich content — optional. When present, drawer renders richer sections. */
  whyWealthyRich?: string[];
  stepsRich?: RichStep[];
  weekRich?: { day: string; task: string }[];
  deliverablesRich?: RichDeliverable[];
  timeBreakdown?: TimeBreakdown;
  toolsNeeded?: ToolNeeded[];
  first90Days?: PhaseBlock[];
}

/* ──────────────────────── Inline Problem Data ──────────────────── */

const PROBLEMS: Record<string, ProblemData> = {
  'ai-voice-fraud': {
    title: 'AI Voice Cloning Wire Fraud Targeting Family Offices',
    tags: ['Security', 'UHNW', 'Emerging'],
    evidenceCount: 7,
    narrative:
      "Cybercriminals are now using AI to clone the voices of trusted family members, CFOs, and attorneys. In the last 12 months, the FBI has documented a 300% increase in AI-enabled impersonation attacks specifically targeting high-net-worth households. A single successful attack can result in wire transfers exceeding $2 million \u2014 and most family offices have no verification protocol in place to catch these calls.",
    scenario:
      "Last month, our CFO got a call that sounded exactly like our principal. Same voice, same speech patterns, even used our internal code words. They requested a $2.3 million wire to a new account. If our operations manager hadn\u2019t followed the new dual-verification protocol, we would have lost everything.",
    scenarioAttribution: 'Family Office CFO, $2.1B AUM',
    whyWealthy: [
      'Higher-value targets justify the cost of sophisticated AI cloning',
      'More weak links: staff, vendors, older relatives, board members',
      'Family offices often lack formal incident response plans (68% per Deloitte)',
    ],
    credibility: 8.7,
    wtp: '$10-25K/mo',
    lifecycle: 'Emerging',
    complianceRisk: 'none',
    complianceRiskNote: '',
    trendData: [12, 15, 18, 22, 28, 35, 42, 50, 58, 65, 72, 80],
    trendGrowth: '340%',
    weeklyHours: '8h',
    startupCost: '$300–600',
    timeToFirstClient: '4–8 wks',
    pitchOpener: "Have any of your clients mentioned concerns about AI voice scams lately? We\u2019ve been seeing a huge spike \u2014 I\u2019d love to share what we\u2019re doing about it.",
    quickFacts: [
      { label: 'Evidence credibility', value: 'High (FBI, Deloitte)' },
      { label: 'Competition level', value: 'Low \u2014 few specialists' },
      { label: 'Regulation risk', value: 'None' },
      { label: 'Fit for beginners', value: 'Moderate \u2014 needs security background' },
      { label: 'Related playbook', value: 'Incident Response Retainer' },
    ],
    currentSolutions: [
      { approach: 'IT managed service provider', whyItFails: 'Handles corporate infrastructure, not family. Doesn\'t train household staff or verify personal calls.' },
      { approach: 'Consumer-grade password managers', whyItFails: 'Solves one vector but not voice cloning, SIM swaps, or social engineering of family members.' },
      { approach: 'Ad hoc training sessions', whyItFails: 'One-time awareness sessions don\'t build lasting habits. Staff turnover means constant re-training needed.' },
    ],
    sourceQuote:
      'AI is being used to increase the speed and believability of phishing and impersonation, including voice/video cloning',
    sourceAttribution: 'FBI Alert IC3-2025',
    offerName: 'Family Cybersecurity & Identity Command Center',
    offerTagline: "24/7 protection for your family\u2019s digital identity and financial communications",
    price: '$10,000 \u2013 $25,000/month',
    priceMin: 10000,
    priceMax: 25000,
    delivery: 'Team (you + 2 specialists)',
    steps: [
      {
        title: 'Set up family verification protocols',
        description:
          'Create unique passphrases and verified communication channels for every family member, key staff, and financial institution. Test them monthly.',
      },
      {
        title: 'Harden all devices and accounts',
        description:
          'Audit and secure every device, email, and financial account across the household. Set up MFA, monitoring, and least-privilege access for all staff.',
      },
      {
        title: 'Run quarterly attack simulations',
        description:
          "Simulate wire fraud, AI impersonation, and \u2018kid in trouble\u2019 scam calls. Score the family\u2019s response. Brief everyone on what they missed.",
      },
      {
        title: '24/7 incident response',
        description:
          "When something suspicious happens, you\u2019re the first call. Coordinate lockdowns, wire recalls, and forensic investigation within minutes, not days.",
      },
    ],
    week: {
      Mon: 'Review threat intelligence + family comms audit',
      Wed: 'Staff security training session',
      Fri: 'Vendor access review + incident log check',
      Monthly: 'Full simulation drill',
      Quarterly: 'Board-level security briefing',
    },
    deliverables: [
      'Monthly threat intelligence briefing',
      'Quarterly simulation results and scores',
      'Annual security posture report',
      'Incident response within 15 minutes',
      'Staff training completion certificates',
      'Vendor security compliance dashboard',
    ],
    idealClient: {
      who: 'Family offices managing $500M+',
      trigger: "Near-miss incident or peer\u2019s breach",
      channel: 'Estate attorney or private banker',
      question: "How do we know our staff won\u2019t fall for the next call?",
      roi: 'One prevented wire fraud pays for 2+ years of fees',
    },
    firstClientPath: [
      'Contact 3 estate attorneys or private bankers you know. Ask: \u2018Any clients nervous about AI scams lately?\u2019',
      'Offer a free 30-minute \u2018Household Security Assessment\u2019 \u2014 no pitch, just show them their gaps',
      'Present the retainer with the ROI: one prevented fraud covers 2 years of fees',
    ],
    objections: [
      { objection: 'We already have IT support', response: 'IT handles your company. This handles your family \u2014 different people, different risks.' },
      { objection: 'We have cyber insurance', response: 'Insurance pays after a loss. This prevents the loss and the recovery nightmare.' },
      { objection: 'How do we know you\u2019re trustworthy?', response: 'We provide background checks, NDA before engagement, work only through trusted referrals.' },
    ],
    simpleStory:
      "Criminals can now copy anyone\u2019s voice with AI. They call your family office pretending to be you \u2014 same voice, same phrases \u2014 and request a wire transfer. The FBI says these attacks are up 300% this year, and most families have zero defense against them.\n\nThis isn\u2019t science fiction. It\u2019s happening right now to families just like your clients. One successful call can cost $2 million or more.",
    simpleExample:
      'A CFO received a call that sounded exactly like the family principal, complete with internal code words. They requested $2.3M to a new account. Only a last-minute verification step stopped the transfer.',
    simpleBullets: [
      'AI can clone any voice from a few minutes of audio',
      'Most family offices have no protocol to verify callers',
      'A single attack can cost more than $2 million',
    ],
    simpleRole: "You become the family\u2019s personal security advisor",
    simpleSteps: [
      'Set up secret verification codes for the whole family',
      'Lock down every device, email, and bank account',
      'Run fake attack drills so everyone knows what to do',
      'Be on call 24/7 when something suspicious happens',
    ],
    simpleMonth:
      'Week 1: Check for new threats and audit family communications. Week 2: Train staff on the latest scam techniques. Week 3: Review all vendor access and incident logs. Week 4: Run a simulation drill and debrief the family.',
    simpleSellTo:
      'Family offices with $500M+ who just had a scare \u2014 or heard about one happening to someone they know. Their estate attorney or private banker introduces you.',
    whyWealthyRich: [
      'Family offices average 47 external parties with some form of financial authority \u2014 private bankers, accountants, attorneys, property managers, travel agents, insurance brokers. Each is an attack vector that a typical corporate IT team never audits because corporate IT only covers company-issued devices, not the household.',
      'Public giving, SEC filings, and board bios create unlimited voice training data. A single 40-minute charity panel yields enough source audio for a lifetime of clone attempts. No amount of internal security posture can retract audio that is already public.',
      'The UBS Global Family Office Report 2025 found that 71% of families rely on phone-based authorization for transfers above $500K, and only 9% use a pre-shared verbal passphrase. Voice has become the single most trusted and the single most compromised authentication factor in the same household.',
      'Reputational drag on reporting keeps incidents out of regulatory data \u2014 Deloitte estimates the true incident rate is 4\u20136\u00d7 the reported rate because principals refuse to file police reports that could become discoverable in litigation or custody disputes.',
    ],
    stepsRich: [
      {
        stepNumber: 1,
        action: 'Run the 90-minute household communications audit',
        detail:
          'You map every device, email, messaging app, and vendor portal touched by the principal, spouse, adult children, and top 5 household staff. You document every external party with financial authorization (private banker, CPA, trust attorney, property manager, insurance broker, travel concierge) and classify them into three verification tiers: Tier 1 requires a callback to a pre-registered number, Tier 2 requires a shared passphrase rotated quarterly, Tier 3 requires dual authorization from two named principals. Deliverable is a laminated 1-page authorization matrix posted above every desk that can originate a wire.',
        timeRequired: 'One-time 90 min + quarterly refresh',
      },
      {
        stepNumber: 2,
        action: 'Deploy deepfake detection on the wire line',
        detail:
          'You install Pindrop or Reality Defender on the office phone line that handles transfer authorizations. You run a baseline against 10 samples of the principal\u2019s real voice and 10 synthetic clones generated from public audio, tuning the threshold until false positives drop below 2%. The system routes any flagged call to a second human before any authorization is accepted.',
        timeRequired: '~3h setup + 30 min/week tuning',
      },
      {
        stepNumber: 3,
        action: 'Run the quarterly tabletop deepfake drill',
        detail:
          'You write and run a 45-minute scenario where you (with written consent) call the EA, bookkeeper, and principal\u2019s spouse using a licensed voice clone. You score response time to invoke the callback protocol, whether anyone escalated, and whether the passphrase was requested. You publish a 2-page after-action naming who followed the protocol and who didn\u2019t, and you re-train anyone who failed.',
        timeRequired: '~4h per quarter',
      },
      {
        stepNumber: 4,
        action: 'Monitor and respond 24/7 with a 15-minute SLA',
        detail:
          'You stand up a shared inbox and monitored phone line covered by two named analysts on rotating shifts. When an incident fires, you execute the pre-written runbook: freeze the target account with the private bank, preserve voicemail and call logs for forensics, notify the principal via the designated non-phone channel, and file the IC3 report within 24 hours.',
        timeRequired: '~2h/week + on-demand',
      },
    ],
    weekRich: [
      { day: 'Monday', task: 'Pull the weekend threat intel feed from Recorded Future and Cyfirma (15 min) and compile a 2-page Weekly Security Brief covering new AI-impersonation campaigns targeting HNW households, any incidents in the client\u2019s geographic cohort, and 3 specific actions the principal should take this week. Delivered by 9:00 AM.' },
      { day: 'Tuesday', task: 'Run a 30-minute verification-compliance spot-check across staff \u2014 pick 3 random people, confirm they still know the current passphrase, and confirm the authorization matrix printed on their desk is current. Log results.' },
      { day: 'Wednesday', task: 'Test the deepfake detection system with 5 new synthetic voice samples generated from this week\u2019s public audio (podcasts, interviews). File a tuning ticket if the false-negative rate creeps above 3%.' },
      { day: 'Thursday', task: 'Conduct a 20-minute 1:1 security touchpoint with one member of the principal\u2019s inner circle on a rotating schedule. Walk through one real peer-family incident from this week.' },
      { day: 'Friday', task: 'Deliver the Friday Principal Brief \u2014 a 1-page summary of the week\u2019s activity, any near-misses caught by detection tools, staff compliance scores, and the single most important weekend action. Sent by 3:00 PM.' },
      { day: 'Monthly', task: 'Produce the 6-page Monthly Threat Posture Report with attempted-attack count, compliance scorecard, detection performance, peer incident review, and the rolling 90-day roadmap. Reviewed live in a 30-minute call.' },
    ],
    deliverablesRich: [
      { name: 'Household Authorization Matrix', description: 'Laminated 1-page document listing every external party with financial authority, their verification tier, callback number, and current passphrase. Posted above every wire-originating desk.', frequency: 'Quarterly refresh' },
      { name: 'Weekly Security Brief', description: '2-page briefing covering new AI-impersonation campaigns, peer-family incidents, and 3 specific actions for the principal. Written in plain English \u2014 readable in 90 seconds.', frequency: 'Weekly (Mon 9 AM)' },
      { name: 'Tabletop Drill After-Action', description: '2-page document naming who invoked the callback protocol and who didn\u2019t, scoring response time, and assigning remedial training.', frequency: 'Quarterly' },
      { name: 'Monthly Threat Posture Report', description: '6-page flagship monthly deliverable: attempted-attack count with specifics, staff compliance scorecard, detection system performance, peer-family incident debriefs, rolling 90-day roadmap.', frequency: 'Monthly' },
      { name: 'Incident Response Runbook', description: 'The ~40-page binder the family office pulls out when something happens. Step-by-step procedures for 12 attack scenarios with named contacts, containment steps, and 72-hour communication templates.', frequency: 'One-time + annual refresh' },
      { name: 'Annual Security Posture Assessment', description: '25-page year-in-review benchmarked against 18 peer family offices: attack-surface heatmap, year-over-year incident trend, insurance coverage gap analysis, next-year budget recommendation.', frequency: 'Annual (Q4)' },
    ],
    timeBreakdown: {
      weeklyHours: 8,
      items: [
        { task: 'Weekly Security Brief (Mon)', hoursPerWeek: 1.5 },
        { task: 'Staff compliance spot-checks', hoursPerWeek: 0.5 },
        { task: 'Deepfake detection tuning', hoursPerWeek: 0.75 },
        { task: 'Security 1:1 touchpoints', hoursPerWeek: 0.5 },
        { task: 'Friday Principal Brief', hoursPerWeek: 1 },
        { task: '24/7 monitoring (shared inbox)', hoursPerWeek: 2 },
        { task: 'Monthly report (amortized)', hoursPerWeek: 1 },
        { task: 'Ad-hoc incident response', hoursPerWeek: 0.75 },
      ],
      note: 'Monitoring rota and compliance spot-checks can be delegated to a vetted VA with security training once protocols are documented. Incident response and principal-facing briefs should remain with the named operator.',
    },
    toolsNeeded: [
      { tool: 'Pindrop or Reality Defender', cost: '$500-1,200/mo', purpose: 'Deepfake audio detection on wire-authorization phone lines' },
      { tool: 'Recorded Future or Cyfirma', cost: '$800-1,500/mo', purpose: 'Threat intelligence feed for the weekly security brief' },
      { tool: '1Password Teams', cost: '$8/user/mo', purpose: 'Shared passphrase vault for authorization matrix' },
      { tool: 'Twilio (monitored line)', cost: '$50-150/mo', purpose: '24/7 incident hotline with call recording' },
      { tool: 'Notion or Airtable', cost: '$20-50/mo', purpose: 'Runbook, compliance tracker, client deliverable library' },
      { tool: 'DocuSign', cost: '$25/user/mo', purpose: 'Engagement letters and tabletop drill consent forms' },
    ],
    first90Days: [
      {
        phase: 'Days 1-30: Setup & baseline',
        color: 'amber',
        actions: [
          'Sign engagement letter, NDA, and data-processing agreement with the family office',
          'Run the 90-minute household communications audit with the principal and FO head',
          'Install Pindrop/Reality Defender on the wire-authorization phone line and run detection baseline',
          'Print and distribute the v1 Household Authorization Matrix with initial passphrase',
          'Subscribe to Recorded Future/Cyfirma and configure the weekly brief template',
          'Stand up the monitored inbox, on-call rotation, and Twilio incident hotline',
        ],
      },
      {
        phase: 'Days 31-60: First delivery cadence',
        color: 'green',
        actions: [
          'Ship the first 4 Weekly Security Briefs (Mondays at 9 AM)',
          'Run first round of staff compliance spot-checks and publish scorecard',
          'Draft and deliver the first Monthly Threat Posture Report',
          'Build the customized 40-page Incident Response Runbook with the FO CEO',
          'Identify 2\u20133 peer family offices for benchmarking in the Q1 report',
        ],
      },
      {
        phase: 'Days 61-90: Proof of value',
        color: 'gold',
        actions: [
          'Execute the first live tabletop deepfake drill and publish after-action',
          'Deliver the second Monthly Threat Posture Report with baseline-to-now trend',
          'Present first-quarter ROI memo: attempts detected, near-misses stopped, compliance lift',
          'Run joint review with the family\u2019s private banker to integrate callback protocols',
          'Commit to the next 90-day roadmap with the principal',
        ],
      },
    ],
  },

  'coordination-overload': {
    title: 'Coordination Overload for Post-Exit Tech Founders',
    tags: ['Coordination', 'HNW', 'Accelerating'],
    evidenceCount: 5,
    narrative:
      "Newly wealthy founders who exit with $10-50M face an immediate lifestyle complexity explosion. Within months of a liquidity event, they acquire multiple properties, hire household staff, join boards, and begin family travel \u2014 all while the structures to manage this complexity don\u2019t exist. The result: missed school deadlines, double-booked travel, vendor invoice chaos, and a constant feeling that something is falling through the cracks.",
    scenario:
      "I sold my company for $42 million and suddenly I had three houses, a nanny, a housekeeper, two drivers, a property manager, a travel advisor, and absolutely no system connecting any of them. Last month my daughter missed her school play because my calendar synced wrong. That was the moment I knew I needed professional help.",
    scenarioAttribution: 'Tech Founder, 18 months post-exit',
    whyWealthy: [
      'Every additional property, staff member, and board role multiplies coordination',
      "Opportunity cost of founder\u2019s time makes DIY management enormously expensive",
      'No corporate infrastructure \u2014 they went from a company with an EA to solo chaos',
    ],
    credibility: 7.9,
    wtp: '$15-30K/mo',
    lifecycle: 'Accelerating',
    complianceRisk: 'none',
    complianceRiskNote: '',
    trendData: [20, 22, 25, 28, 32, 36, 40, 44, 48, 52, 55, 58],
    trendGrowth: '190%',
    weeklyHours: '10h',
    startupCost: '$200–400',
    timeToFirstClient: '3–6 wks',
    pitchOpener: "Do any of your recently-exited founders mention feeling overwhelmed managing their new lifestyle? We help them build an operating system for their household so nothing falls through the cracks.",
    quickFacts: [
      { label: 'Evidence credibility', value: 'Strong (wealth manager surveys)' },
      { label: 'Competition level', value: 'Low \u2014 fragmented market' },
      { label: 'Regulation risk', value: 'None' },
      { label: 'Fit for beginners', value: 'High \u2014 ops background sufficient' },
      { label: 'Related playbook', value: 'Estate Management SOP' },
    ],
    currentSolutions: [
      { approach: 'Executive assistant from their old company', whyItFails: 'Corporate EAs manage one executive\'s calendar, not a multi-property household with staff, vendors, and family logistics.' },
      { approach: 'Property management companies', whyItFails: 'Manages buildings, not lives. No coordination across properties, staff schedules, or family calendars.' },
      { approach: 'Spreadsheets and shared calendars', whyItFails: 'Breaks down immediately at scale. No accountability, no escalation paths, no single owner.' },
    ],
    offerName: 'Private Operations Office',
    offerTagline: 'One command center for your entire household and lifestyle',
    price: '$15,000 \u2013 $30,000/month',
    priceMin: 15000,
    priceMax: 30000,
    delivery: 'Orchestrated delivery',
    steps: [
      {
        title: 'Household audit & SOP creation',
        description:
          'Map every person, property, vendor, and recurring obligation. Build standard operating procedures so nothing depends on memory.',
      },
      {
        title: 'Vendor management & scheduling orchestration',
        description:
          'Centralize all vendor relationships, invoices, and schedules into one system. You become the single point of coordination.',
      },
      {
        title: 'Travel protocol & emergency response',
        description:
          'Create travel playbooks for every property and destination. Build emergency contact trees and response protocols.',
      },
      {
        title: "Weekly operations review with principal\u2019s delegate",
        description:
          'Every Friday, review the week, flag issues, and prep next week. The principal only hears about what matters.',
      },
    ],
    week: {
      Mon: 'Vendor check-ins + invoice review',
      Tue: 'Calendar optimization + school deadline tracking',
      Thu: 'Travel logistics + property readiness',
      Fri: 'Weekly ops review + next week prep',
      Monthly: 'Full household operations report',
    },
    deliverables: [
      'Weekly operations report',
      'Monthly vendor performance scorecard',
      'Emergency protocol manual (updated quarterly)',
      'Travel readiness checklist per trip',
      'Annual household efficiency audit',
    ],
    idealClient: {
      who: 'Post-exit founders with 2+ properties',
      trigger: 'Exit/IPO within 12 months',
      channel: 'Wealth manager or direct',
      question: 'Can you guarantee nothing falls through the cracks?',
      roi: 'Clients report saving 15-20 hours per week of personal time',
    },
    firstClientPath: [
      'Reach out to 3 wealth managers who advise recently-exited founders. Ask: \u2018Any clients drowning in lifestyle complexity?\u2019',
      'Offer a free \u2018Household Chaos Audit\u2019 \u2014 map their properties, staff, and vendors in one session',
      'Show the ROI: 15-20 hours/week of reclaimed personal time at their opportunity cost',
    ],
    objections: [
      { objection: 'I already have a personal assistant', response: 'A PA handles tasks. This is an operating system for your entire household \u2014 people, properties, vendors, all connected.' },
      { objection: 'This feels like an expensive luxury', response: 'Your time is worth $2,000+/hour. Every hour you spend coordinating vendors costs more than a month of this service.' },
      { objection: 'Can\u2019t I just hire a house manager?', response: 'A house manager handles one property. You need someone who orchestrates across all properties, staff, and travel simultaneously.' },
    ],
    simpleStory:
      "After selling a company, founders suddenly have three homes, a team of household staff, board commitments, and family travel \u2014 but zero systems to manage any of it. Things start falling through the cracks almost immediately.\n\nThe result is chaos disguised as success: double-booked flights, missed school events, vendor invoices piling up, and the nagging feeling that you\u2019re dropping balls everywhere.",
    simpleExample:
      'A founder who sold for $42M had three houses and seven staff members with no system connecting them. His daughter missed her school play because of a calendar sync error. That was his breaking point.',
    simpleBullets: [
      'Every new property and staff member multiplies the coordination burden',
      "A founder\u2019s time is worth thousands per hour \u2014 they can\u2019t manage this themselves",
      'They had an executive assistant at their company; now they have nothing',
    ],
    simpleRole: "You become the family\u2019s chief operating officer",
    simpleSteps: [
      'Audit every person, property, vendor, and obligation in the household',
      'Build SOPs and centralize all scheduling and vendor management',
      'Create travel playbooks and emergency protocols',
      'Run a weekly operations review so nothing slips',
    ],
    simpleMonth:
      'Week 1: Vendor check-ins and invoice reconciliation. Week 2: Calendar optimization and school/activity tracking. Week 3: Travel logistics and property readiness. Week 4: Full operations review and next-month planning.',
    simpleSellTo:
      'Tech founders who exited within the last 12 months and own 2+ properties. Their wealth manager introduces you, or they find you after one too many dropped balls.',
    whyWealthyRich: [
      'A family with $100M+ in assets typically spans 4\u20137 legal entities (revocable trust, irrevocable trusts, LLCs, S-corps, foundation), 3\u20135 state jurisdictions, and 2\u20134 international tie-points. Each entity has its own fiscal calendar, reporting cadence, and fiduciary. No single advisor has standing to see across all of them without an explicit coordination charter.',
      'Advisors bill in 6-minute increments and bear professional liability for their specific opinion. Writing an email to another advisor is billable time they cannot justify without a client request, and opining outside their discipline creates exposure. The economics actively disincentivize unsolicited cross-advisor coordination.',
      'The 2026 estate-tax exemption sunset (from $13.99M to ~$7M per individual) creates a 12-month window where dozens of families will execute irrevocable gifts. A misaligned gift can permanently trigger GST tax, lock in a basis problem, or invalidate a trust\u2019s grantor status \u2014 and there is no do-over.',
      'Families rarely terminate underperforming advisors because each holds discipline-specific history no one has documented. The "cost of switching" is not the new advisor\u2019s fee \u2014 it\u2019s the 200 hours of institutional memory that walks out the door. That lock-in is exactly why coordination must come from outside the advisor stack, not from within it.',
    ],
    stepsRich: [
      {
        stepNumber: 1,
        action: 'Map the advisory ecosystem in a 3-hour session',
        detail:
          'You sit with the principal and family office head for 3 hours. You document every advisor (name, firm, discipline, billing arrangement, primary family contact), every entity they serve, every recurring meeting, and every standing decision right they hold. You produce a one-page "family cap table for decisions" showing who can do what without further approval. Most families have never seen this picture on a single page before.',
        timeRequired: 'One-time 3h + quarterly refresh',
      },
      {
        stepNumber: 2,
        action: 'Stand up the monthly Advisory Council cadence',
        detail:
          'You schedule a recurring 60-minute video call the first Tuesday of each month with all 7 advisors plus the principal. You chair it. You circulate a 2-page agenda 72 hours in advance with three sections: decisions needed this month, upcoming deadlines inside 90 days, cross-advisor conflicts flagged since last session. You publish minutes within 24 hours with owner-assigned action items.',
        timeRequired: '~3h/month',
      },
      {
        stepNumber: 3,
        action: 'Maintain the Decision Log of record',
        detail:
          'You run a single Notion or Airtable database tracking every material family decision: who proposed it, who was consulted, what was decided, and what the outcome was 12 months later. This becomes the institutional memory. When the principal dies or steps back, their successor has a 10-year searchable history of every cross-advisor decision instead of a drawer full of PDFs.',
        timeRequired: '~2h/week ongoing',
      },
      {
        stepNumber: 4,
        action: 'Facilitate the quarterly Alignment Summit',
        detail:
          'Once a quarter, you host a 3-hour live (or Zoom-equivalent) summit with all advisors plus the principal and the next generation. You facilitate scenario planning on 3 live topics \u2014 e.g., "what happens if Dad dies next year," "the 2026 exemption sunset timeline," "a $50M liquidity event next spring." Every advisor commits to specific pre-work, and you produce a 5-page summary with owner-assigned next actions.',
        timeRequired: '~8h per quarter',
      },
    ],
    weekRich: [
      { day: 'Monday', task: 'Review the Decision Log for any item open >14 days without movement (10 min). Email the accountable advisor with a single-question escalation: "What is blocking closure on this?" Log response by EOD.' },
      { day: 'Tuesday', task: 'Draft the weekly Family Coordination Digest \u2014 a 1-page summary of the 3 most important advisory activities of the past week, any emerging cross-advisor tension, and the 2 decisions the principal should weigh in on before Friday. Delivered by 5 PM.' },
      { day: 'Wednesday', task: '30-minute 1:1 with one advisor on a rotating 7-week schedule. Ask one standing question: "What is the family doing \u2014 or not doing \u2014 that is making your job harder?" Document verbatim.' },
      { day: 'Thursday', task: 'Update the 90-day deadline calendar (tax elections, trust funding dates, insurance renewals, RMDs). Email any advisor with a deadline inside 30 days and the specific question you need them to answer.' },
      { day: 'Friday', task: 'Principal Briefing \u2014 a 2-page document summarizing the week, any decisions pending approval, and the single action item for the weekend. Delivered by 3 PM so the principal is not reading it on Sunday night.' },
      { day: 'Monthly', task: 'Chair the 60-minute Advisory Council call the first Tuesday of the month. Publish minutes within 24 hours. Track action items in the Decision Log with owners and due dates.' },
      { day: 'Quarterly', task: 'Facilitate the 3-hour Alignment Summit. Publish the 5-page summary within 72 hours. Schedule the next summit before adjourning.' },
    ],
    deliverablesRich: [
      { name: 'Family Decision Cap Table', description: 'The 1-page map of who can decide what without further approval. Every FO CEO describes it as "the document I didn\u2019t know I needed." Used to onboard new advisors and resolve authority disputes in under 60 seconds.', frequency: 'Quarterly refresh' },
      { name: 'Weekly Family Coordination Digest', description: 'Delivered every Tuesday by 5 PM. Three sections: what happened this week across the advisory stack, what\u2019s pending the principal\u2019s input, what\u2019s coming in the next 14 days. Readable in under 3 minutes.', frequency: 'Weekly (Tue 5 PM)' },
      { name: 'Monthly Advisory Council Minutes', description: '3-page document published within 24 hours of the first-Tuesday council call. Names every decision made, every owner assigned, every deadline committed. The fiduciary-duty audit trail.', frequency: 'Monthly' },
      { name: 'Decision Log', description: 'Living searchable database of every material family decision. Each entry captures proposer, consulted parties, decision, rationale, and 12-month outcome. The most valuable single artifact for the next generation.', frequency: 'Continuously updated' },
      { name: 'Quarterly Alignment Summit Summary', description: '5-page document produced within 72 hours of the live summit. Captures the 3 scenarios walked through, every advisor\u2019s commitments, and the cross-discipline action plan for the next quarter.', frequency: 'Quarterly' },
      { name: 'Annual State-of-the-Family Report', description: '20-page year-in-review of decisions made, money saved or spent due to coordination, advisor performance scorecard, and the coordination agenda for the following year. Becomes the governance document for family meetings.', frequency: 'Annual (Dec)' },
    ],
    timeBreakdown: {
      weeklyHours: 12,
      items: [
        { task: 'Decision Log maintenance + escalations', hoursPerWeek: 2 },
        { task: 'Weekly Coordination Digest (Tue)', hoursPerWeek: 1.5 },
        { task: '1:1 advisor rotation (Wed)', hoursPerWeek: 0.75 },
        { task: '90-day deadline calendar upkeep', hoursPerWeek: 0.5 },
        { task: 'Friday Principal Briefing', hoursPerWeek: 1.25 },
        { task: 'Monthly Advisory Council (amortized)', hoursPerWeek: 0.75 },
        { task: 'Quarterly Summit prep (amortized)', hoursPerWeek: 1.5 },
        { task: 'Ad-hoc cross-advisor coordination', hoursPerWeek: 3.75 },
      ],
      note: 'Deadline-calendar maintenance and Decision Log entry can be delegated to a vetted paralegal or EA once templates are in place (~3h/week reclaimed). Advisor-facing communication and summit facilitation must stay with the named operator to preserve credibility.',
    },
    toolsNeeded: [
      { tool: 'Notion or Airtable (Pro)', cost: '$10-24/user/mo', purpose: 'Decision Log, deadline calendar, action-item tracker' },
      { tool: 'Calendly Teams', cost: '$12/user/mo', purpose: 'Multi-advisor scheduling for council calls and summits' },
      { tool: 'Zoom Workplace (Pro)', cost: '$16/user/mo', purpose: 'Recorded advisory council calls and quarterly summits' },
      { tool: 'Otter.ai Business', cost: '$20/user/mo', purpose: 'Transcription of advisor 1:1s and council minutes' },
      { tool: 'Loom', cost: '$15/user/mo', purpose: 'Async video briefings for principals who prefer video' },
      { tool: 'Dropbox Business', cost: '$20/user/mo', purpose: 'Secure document repository for cross-advisor artifacts' },
    ],
    first90Days: [
      {
        phase: 'Days 1-30: Discovery & baseline',
        color: 'amber',
        actions: [
          'Sign engagement letter with explicit non-advisor disclaimer language',
          'Conduct the 3-hour advisory ecosystem mapping session with principal and FO head',
          'Interview all 7 advisors individually (30 min each) \u2014 discipline, pain points, expectations',
          'Build the v1 Family Decision Cap Table and circulate for validation',
          'Stand up the Decision Log in Notion/Airtable with the first 20 back-historical entries',
          'Schedule the first Advisory Council call (first Tuesday of month 2)',
        ],
      },
      {
        phase: 'Days 31-60: First full cadence',
        color: 'green',
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
        color: 'gold',
        actions: [
          'Facilitate the first Quarterly Alignment Summit (3 hours live)',
          'Publish the 5-page summit summary within 72 hours',
          'Document the first coordinated cross-advisor save with a dollar value attached',
          'Present first-quarter ROI memo: decisions closed faster, conflicts avoided, deadlines met',
          'Commit with the principal to the next 90-day priorities',
        ],
      },
    ],
  },

  'data-broker-exposure': {
    title: 'Personal Data Broker Exposure for Ultra-High-Net-Worth Families',
    tags: ['Privacy', 'UHNW', 'Proven'],
    evidenceCount: 9,
    narrative:
      "Data brokers collect and sell personal information \u2014 home addresses, phone numbers, family members, net worth estimates, travel patterns \u2014 on virtually every American. For ultra-high-net-worth families, this creates a concrete physical and financial security risk. Stalkers, social engineers, and criminals use broker data to plan kidnapping threats, home invasions, and targeted fraud. Most families don\u2019t realize their information is available to anyone with $20 and a search engine.",
    scenario:
      "We did an audit and found our principal\u2019s home address, his children\u2019s school, his wife\u2019s daily gym schedule, and estimated net worth listed on 47 different data broker sites. Anyone could have accessed this for less than the cost of a pizza. We were horrified.",
    scenarioAttribution: 'Head of Security, Single-Family Office, $3.4B AUM',
    whyWealthy: [
      'Higher net worth = higher-value target for physical threats and fraud',
      'More family members, properties, and staff expand the data footprint',
      'Public filings (real estate, corporate, philanthropic) make them easier to find',
    ],
    credibility: 9.1,
    wtp: '$8-20K/mo',
    lifecycle: 'Proven',
    complianceRisk: 'low',
    complianceRiskNote: 'Privacy regulations vary by jurisdiction — GDPR/CCPA compliance required',
    currentSolutions: [
      { approach: 'Consumer privacy services (DeleteMe, etc.)', whyItFails: 'Covers ~30 brokers out of 200+. No customization for UHNW exposure. Misses family members and staff.' },
      { approach: 'In-house IT team', whyItFails: 'IT manages infrastructure, not personal data broker exposure. Lack expertise in privacy law and opt-out processes.' },
      { approach: 'One-time privacy audit', whyItFails: 'Brokers re-list data within 60-90 days. A one-time audit is obsolete within weeks.' },
    ],
    sourceQuote:
      'Data broker information has been directly linked to stalking, harassment, and physical threats against high-profile individuals',
    sourceAttribution: 'Privacy Rights Clearinghouse, 2025 Report',
    offerName: 'Digital Footprint Erasure & Monitoring Service',
    offerTagline: 'Continuously remove your family from data brokers and monitor for new exposure',
    price: '$8,000 \u2013 $20,000/month',
    priceMin: 8000,
    priceMax: 20000,
    delivery: 'Team (you + 1 privacy analyst)',
    steps: [
      {
        title: 'Full data broker audit',
        description:
          'Scan 200+ data broker sites for every family member, staff member, and property. Document exactly what\u2019s exposed and where.',
      },
      {
        title: 'Systematic removal campaign',
        description:
          'Submit opt-out requests to every broker. Follow up relentlessly \u2014 most require multiple attempts. Track removal confirmation.',
      },
      {
        title: 'Ongoing monitoring & re-removal',
        description:
          'Brokers re-list people within 60-90 days. Run continuous monitoring and re-submit removals as needed. The job is never done.',
      },
      {
        title: 'Digital hygiene consulting',
        description:
          'Train family and staff on reducing their digital footprint: social media lockdown, address obfuscation, phone number isolation.',
      },
    ],
    week: {
      Mon: 'Monitor broker re-listings + submit new removals',
      Wed: 'Review social media exposure + staff digital hygiene',
      Fri: 'Client status update + new threat assessment',
      Monthly: 'Full 200+ broker re-scan',
      Quarterly: 'Family digital footprint report + strategy review',
    },
    deliverables: [
      'Initial exposure audit report (200+ brokers)',
      'Monthly removal progress dashboard',
      'Quarterly digital footprint score',
      'Annual family privacy posture report',
      'Staff digital hygiene training materials',
      'Real-time alert on new data exposure',
    ],
    idealClient: {
      who: 'UHNW families with $100M+ and public profiles',
      trigger: 'Stalking incident, threatening mail, or security review',
      channel: 'Physical security firm or family office advisor',
      question: 'How much of our personal information is out there right now?',
      roi: 'Peace of mind is priceless, but one prevented incident justifies years of fees',
    },
    firstClientPath: [
      'Connect with 3 physical security firms or family office advisors. Ask: \u2018Have any clients been spooked by how much of their info is online?\u2019',
      'Offer a free \u2018Digital Exposure Snapshot\u2019 \u2014 scan 10 brokers for one family member and show them the results',
      'Present the ongoing service: brokers re-list every 60-90 days, so this requires continuous protection',
    ],
    objections: [
      { objection: 'We already use a privacy service', response: 'Most services scan 20-30 brokers. We scan 200+ and re-check monthly because brokers re-list within 60 days.' },
      { objection: 'Can\u2019t we just do this ourselves?', response: 'You could \u2014 it takes about 40 hours per family member per quarter. And it never stops because brokers constantly re-add you.' },
      { objection: 'Is our data really that exposed?', response: 'Let us show you. We\u2019ll run a free scan on one family member right now \u2014 most clients are shocked by what we find.' },
    ],
    simpleStory:
      "Right now, anyone can go online and find your client\u2019s home address, their children\u2019s school, daily schedules, and estimated net worth \u2014 all for about $20 on a data broker site. There are hundreds of these sites, and they re-list people every few months.\n\nFor ultra-wealthy families, this isn\u2019t just a privacy annoyance \u2014 it\u2019s a physical safety risk. Criminals use this data to plan targeted attacks, fraud, and social engineering.",
    simpleExample:
      'A security audit found a family principal\u2019s home address, children\u2019s school, wife\u2019s gym schedule, and net worth on 47 different broker sites. All publicly accessible for the price of a pizza.',
    simpleBullets: [
      'Data brokers sell personal details on almost everyone for a few dollars',
      'Wealthy families have bigger digital footprints and higher-value targets',
      'Brokers re-list removed data within 60-90 days \u2014 it requires constant vigilance',
    ],
    simpleRole: "You become the family\u2019s privacy guardian",
    simpleSteps: [
      'Scan 200+ data broker sites for every family member',
      'Submit removal requests and follow up until confirmed',
      'Monitor continuously and re-remove when brokers re-list',
      'Train the family and staff on reducing their digital footprint',
    ],
    simpleMonth:
      'Week 1: Monitor for new broker listings and submit removals. Week 2: Review social media exposure across the family. Week 3: Client update and emerging threat briefing. Week 4: Full broker re-scan and progress report.',
    simpleSellTo:
      'Ultra-high-net-worth families ($100M+) who\u2019ve had a scare \u2014 threatening mail, a stalking incident, or a security consultant who flagged their exposure. The family\u2019s physical security firm usually makes the introduction.',
    whyWealthyRich: [
      'Real estate purchases above $2M are public record in 48 states. A family with 4 properties under 3 different LLCs still leaves a trail recoverable by cross-referencing Secretary of State filings with county assessor records \u2014 a process fully automated by tools like PropertyShark and Regrid. The more property you own, the more findable you are, and there is no legal path to opacity in most jurisdictions.',
      'Charitable giving above $5K appears in IRS Form 990 filings, which are fully public and indexed by ProPublica\u2019s Nonprofit Explorer. A family\u2019s charitable footprint \u2014 which causes, which geographies, which board seats \u2014 is a signature that data brokers use to match profiles across otherwise-disconnected databases. Generosity is a targeting vector.',
      'Household staff must be background-checked, which means their employment history \u2014 including your family\u2019s name and address \u2014 flows into commercial background-check databases that resell to data brokers. The 2025 Privacy Rights Clearinghouse report found that 61% of HNW family data leaks originated from vendor or staff ecosystem exposure, not from the principals themselves.',
      'Consumer opt-out tools cover approximately 190 of the estimated 4,000+ U.S. data brokers. They have zero coverage for specialty wealth databases (WealthEngine, iWave, RelSci), international brokers, or dark-web marketplaces. Using only DeleteMe is security theater for a target with public giving, public real estate, and a public board seat.',
    ],
    stepsRich: [
      {
        stepNumber: 1,
        action: 'Run the 2-week comprehensive exposure baseline',
        detail:
          'You conduct a baseline scan across 4,000+ data brokers, 14 specialty wealth databases (WealthEngine, iWave, RelSci, WealthX), county assessor records in every state of ownership, SEC EDGAR, IRS Form 990s, and 6 dark-web marketplaces via a licensed TI vendor (Flashpoint or Recorded Future). You produce a 25-page exposure report enumerating every finding with source, date, and severity rating.',
        timeRequired: 'One-time 2 weeks (~40h)',
      },
      {
        stepNumber: 2,
        action: 'Execute the 6-month removal campaign',
        detail:
          'You run systematic opt-outs across all 4,000+ brokers using Optery Enterprise plus manual submissions for brokers requiring ID verification. You issue legal takedown letters for dark-web and specialty-database listings. You file CCPA/GDPR requests for any broker with California or EU nexus. Every submission tracked in a single database with status, confirmation date, and re-verification schedule.',
        timeRequired: '~3h/week for 6mo, then ~1.5h/week',
      },
      {
        stepNumber: 3,
        action: 'Harden the public-record exposure',
        detail:
          'You work with the family\u2019s real estate attorney to retitle properties into privacy-preserving entities (Wyoming LLC, Delaware statutory trust, land trust depending on state). You submit address-suppression requests under state Address Confidentiality Programs (30+ states). You coach the philanthropic advisor on DAF structures that maintain giving without naming the family on 990s.',
        timeRequired: '~6h month 1, ~1h/month ongoing',
      },
      {
        stepNumber: 4,
        action: 'Continuous monitoring and quarterly re-verification',
        detail:
          'You run weekly automated re-scans across the full broker population plus specialty databases. You do a monthly manual audit of the top 50 highest-risk brokers (those that re-list most aggressively). You run a quarterly dark-web credentialed sweep via the TI vendor. You deliver a monthly 4-page Privacy Posture Report and a quarterly 10-page deep-dive with trend analysis.',
        timeRequired: '~1.5h/week + monthly and quarterly pulses',
      },
    ],
    weekRich: [
      { day: 'Monday', task: 'Process the weekend automated scan results (45 min). Triage new listings into three buckets: auto-remove, manual-submit, or escalate-to-legal. File all auto-removes by 11 AM.' },
      { day: 'Tuesday', task: 'Execute manual opt-out submissions for brokers requiring ID verification or paper forms (~2 hours). Follow up on opt-outs submitted 30+ days ago that have not confirmed. File CCPA/GDPR requests for non-responsive brokers.' },
      { day: 'Wednesday', task: 'Run the weekly dark-web sweep using the TI vendor portal (45 min). Triage any credential leaks, threat-forum mentions, or marketplace listings. Open an incident ticket and notify security contact within 2 hours on any finding above 6/10 severity.' },
      { day: 'Thursday', task: 'Review social media and public records exposure across principal, spouse, adult children, and top 5 household staff (1 hour). Flag new LinkedIn posts, Instagram geo-tags, or Facebook tags that leak location, schedule, or household information. Send a 5-bullet coaching email.' },
      { day: 'Friday', task: 'Update the Family Privacy Dashboard with this week\u2019s removals, new listings, and net exposure delta. Deliver the Friday Privacy Brief (1 page) to the principal with the week\u2019s net change and flagged items.' },
      { day: 'Monthly', task: 'Produce the Monthly Privacy Posture Report (4 pages) and walk the FO head through it in a 30-minute call.' },
      { day: 'Quarterly', task: 'Deliver the 10-page deep-dive with peer benchmarking, dark-web incident summary, removal success rates by broker, and the refreshed 90-day plan.' },
    ],
    deliverablesRich: [
      { name: 'Initial Exposure Report', description: '25-page baseline deliverable from the first 2 weeks. Every finding across 4,000+ brokers, 14 specialty wealth databases, county records, SEC filings, Form 990s, and 6 dark-web marketplaces with source, date, severity, and removal path.', frequency: 'One-time (onboarding)' },
      { name: 'Family Privacy Dashboard', description: 'Continuously updated web portal showing current exposure by source, trend over time, active removal requests, and dark-web monitoring status. FO head checks weekly; principal checks monthly.', frequency: 'Continuously updated' },
      { name: 'Monthly Privacy Posture Report', description: '4-page document delivered by the 5th of each month. Last month\u2019s removals, new listings, net exposure change, active threat findings, and the top 3 recommendations for the next 30 days.', frequency: 'Monthly' },
      { name: 'Quarterly Deep-Dive', description: '10-page comprehensive quarterly review with peer-family benchmarking, dark-web incident summary, removal success rates by broker, and a refreshed 90-day plan. Shared with security advisor and estate attorney.', frequency: 'Quarterly' },
      { name: 'Incident Alert Protocol', description: 'The playbook and contact tree activated when a dark-web listing, credential leak, or threat-forum mention fires above 7/10 severity. Defines the 2-hour acknowledgment SLA, 12-hour containment SLA, and escalation tree to physical security.', frequency: 'Always-on (invoked on incidents)' },
      { name: 'Annual Digital Estate Review', description: '20-page annual audit of family digital assets, accounts, privacy infrastructure, and successor-access planning. Doubles as governance document for family meetings and documentation for cyber-insurance renewals.', frequency: 'Annual' },
    ],
    timeBreakdown: {
      weeklyHours: 6,
      items: [
        { task: 'Monday scan triage + auto-removes', hoursPerWeek: 0.75 },
        { task: 'Tuesday manual opt-out submissions', hoursPerWeek: 2 },
        { task: 'Wednesday dark-web sweep', hoursPerWeek: 0.75 },
        { task: 'Thursday social + public records review', hoursPerWeek: 1 },
        { task: 'Friday dashboard + principal brief', hoursPerWeek: 0.75 },
        { task: 'Monthly/quarterly reporting (amortized)', hoursPerWeek: 0.75 },
      ],
      note: 'Manual opt-out submissions (~2h/week) are the largest bucket and can be substantially delegated to a trained VA using a documented playbook. Dark-web sweep interpretation and incident triage should remain with the named operator \u2014 judgment on severity drives the 2-hour SLA.',
    },
    toolsNeeded: [
      { tool: 'Optery Enterprise', cost: '$350-500/mo', purpose: 'Automated opt-out submissions across mainstream broker population' },
      { tool: 'Flashpoint or Recorded Future', cost: '$1,200-2,500/mo', purpose: 'Licensed dark-web and threat-intelligence monitoring' },
      { tool: 'WealthEngine / iWave (read-only)', cost: '$300-800/mo', purpose: 'Verify specialty-database listings and track removal' },
      { tool: 'Airtable Pro', cost: '$20/user/mo', purpose: 'Track every opt-out submission, status, and re-verification schedule' },
      { tool: 'Proton Mail + Proton Drive (Business)', cost: '$13/user/mo', purpose: 'End-to-end encrypted channel for sensitive family communications' },
      { tool: 'Tableau or Looker Studio', cost: '$0-85/user/mo', purpose: 'Family Privacy Dashboard front-end' },
    ],
    first90Days: [
      {
        phase: 'Days 1-30: Baseline & immediate removals',
        color: 'amber',
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
        color: 'green',
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
        color: 'gold',
        actions: [
          'Measure and report net exposure reduction (typical: 75\u201385% of baseline removed)',
          'Deliver the second Monthly Privacy Posture Report with trend data',
          'Complete the first Quarterly Deep-Dive with peer benchmarking',
          'Present the first-quarter ROI memo: exposure removed, phishing reduction, near-miss threats caught',
          'Commit with the principal to the next-quarter priorities',
        ],
      },
    ],
  },

  'non-investment-risk': {
    title: 'Non-Investment Risk Gaps in Family Office Governance',
    tags: ['Governance', 'Family Office', 'Accelerating'],
    evidenceCount: 6,
    narrative:
      "Family offices spend millions on investment risk management but virtually nothing on the risks that actually destroy families: key-person dependency, succession gaps, regulatory non-compliance, cybersecurity, and reputational exposure. A 2025 Deloitte survey found that 72% of family offices have no formal risk framework beyond investment risk. These non-investment risks are the ones that trigger family breakups, forced asset sales, and generational wealth destruction.",
    scenario:
      "Our patriarch passed away suddenly and we realized nobody else understood how half our structures worked. We had a $200 million trust with instructions only he knew, vendor relationships with no contracts, and three family members who each thought they were in charge. It took two years and $8 million in legal fees to sort it out.",
    scenarioAttribution: 'Next-Gen Family Member, Multi-Generational Family Office',
    whyWealthy: [
      'Complexity of family structures creates more failure points',
      'Key-person risk is existential \u2014 one death can unravel decades of planning',
      'Regulatory exposure grows with every new jurisdiction, entity, and investment',
    ],
    credibility: 8.3,
    wtp: '$12-28K/mo',
    lifecycle: 'Accelerating',
    complianceRisk: 'medium',
    complianceRiskNote: 'Touches regulated domains — insurance, medical. Must not position as licensed professional.',
    currentSolutions: [
      { approach: 'Outside legal counsel', whyItFails: 'Lawyers address specific legal risks reactively, not the full spectrum of operational, key-person, and succession risks proactively.' },
      { approach: 'Annual board retreats', whyItFails: 'Once-a-year conversations don\'t catch fast-moving risks. No ongoing monitoring or accountability between meetings.' },
      { approach: 'Investment risk team handles everything', whyItFails: 'Investment risk frameworks don\'t cover key-person dependency, succession gaps, or family governance breakdowns.' },
    ],
    sourceQuote:
      '72% of family offices have no formal risk framework that addresses non-investment risks',
    sourceAttribution: 'Deloitte Family Office Risk Survey, 2025',
    offerName: 'Family Office Risk & Governance Audit Practice',
    offerTagline: 'Identify and close the non-investment risks that destroy multi-generational wealth',
    price: '$12,000 \u2013 $28,000/month',
    priceMin: 12000,
    priceMax: 28000,
    delivery: 'Advisory (you + governance specialist)',
    steps: [
      {
        title: 'Comprehensive risk mapping',
        description:
          'Interview every key person, map every entity, and catalog every process. Identify single points of failure, undocumented knowledge, and compliance gaps.',
      },
      {
        title: 'Governance framework design',
        description:
          'Build a formal governance framework: decision rights, succession plans, communication protocols, and conflict resolution mechanisms for the family.',
      },
      {
        title: 'Regulatory compliance review',
        description:
          'Audit every entity for regulatory compliance across all jurisdictions. Create a compliance calendar and assign owners for every obligation.',
      },
      {
        title: 'Ongoing risk monitoring & board reporting',
        description:
          'Provide quarterly risk reports to the family board. Track remediation progress. Escalate emerging risks before they become crises.',
      },
    ],
    week: {
      Mon: 'Key-person dependency tracking + documentation review',
      Wed: 'Compliance calendar review + regulatory updates',
      Fri: 'Risk register update + stakeholder check-ins',
      Monthly: 'Family governance committee briefing',
      Quarterly: 'Full risk assessment + board presentation',
    },
    deliverables: [
      'Initial risk map and vulnerability assessment',
      'Governance framework document',
      'Compliance calendar with assigned owners',
      'Monthly risk register updates',
      'Quarterly board-level risk report',
      'Annual governance health check',
    ],
    idealClient: {
      who: 'Multi-generational family offices with $200M+',
      trigger: 'Death of key person, regulatory inquiry, or family conflict',
      channel: 'Family office attorney or trust company',
      question: 'What happens to our structures if [key person] is gone tomorrow?',
      roi: 'Avoiding one governance crisis saves $5-10M+ in legal fees and family fracture',
    },
    firstClientPath: [
      'Reach out to 3 family office attorneys or trust companies. Ask: \u2018Any clients worried about what happens if their key person is gone tomorrow?\u2019',
      'Offer a free \u2018Governance Gap Assessment\u2019 \u2014 a 1-hour session to identify the top 3 non-investment risks',
      'Present the engagement with the ROI: one governance crisis costs $5-10M+ in legal fees and family fracture',
    ],
    objections: [
      { objection: 'We already have an attorney for this', response: 'Attorneys draft documents. This is ongoing operational risk management \u2014 who reviews your compliance calendar every month?' },
      { objection: 'Our family gets along fine', response: 'Most families say that until there\u2019s a transition event. The best time to build governance is when things are calm.' },
      { objection: 'This seems like overhead we don\u2019t need', response: 'The average governance crisis costs $5-10M in legal fees. This is insurance that also makes your operations run better.' },
    ],
    simpleStory:
      "Family offices obsess over investment risk but ignore the risks that actually destroy families: what happens when the patriarch dies and nobody knows how the trusts work? What happens when a regulatory audit hits and there\u2019s no compliance calendar?\n\nThese non-investment risks \u2014 key-person dependency, succession gaps, regulatory exposure \u2014 are the silent killers of multi-generational wealth. And 72% of family offices have zero framework to address them.",
    simpleExample:
      'When a family patriarch died unexpectedly, nobody understood how half their structures worked. A $200M trust had instructions only he knew. Three family members each thought they were in charge. It took two years and $8M in legal fees to untangle.',
    simpleBullets: [
      'Most family offices have no plan for what happens when a key person is gone',
      'Every new entity and jurisdiction adds more regulatory risk',
      'Family conflicts escalate fast without formal governance frameworks',
    ],
    simpleRole: "You become the family office\u2019s chief risk and governance officer",
    simpleSteps: [
      'Map every risk: key people, entities, processes, compliance gaps',
      'Design a governance framework with clear decision rights and succession plans',
      'Build a compliance calendar and assign owners for every obligation',
      'Deliver quarterly risk reports to the family board',
    ],
    simpleMonth:
      'Week 1: Track key-person dependencies and review documentation. Week 2: Compliance calendar check and regulatory updates. Week 3: Update the risk register and meet stakeholders. Week 4: Prepare the monthly governance briefing.',
    simpleSellTo:
      'Multi-generational family offices ($200M+) that just lost a key person, received a regulatory inquiry, or are dealing with family conflict. Their attorney or trust company introduces you.',
    whyWealthyRich: [
      'A $100M+ family office typically holds 8\u201315 legal entities, 20\u201340 bank and custodian accounts, 6\u201312 payroll relationships, and 3\u20137 jurisdictions of tax exposure. That is mid-cap corporate complexity with, on average, 4\u20137 full-time staff. The ratio of complexity-to-oversight is 10\u201320\u00d7 worse than a public mid-cap.',
      'Trust-based culture is both the family office\u2019s defining advantage and its largest single liability. Families hire the people they hire because they trust them \u2014 which is correct \u2014 but then decline to implement dual-authorization or formal risk register because those controls feel like accusations. The 2025 Handler Thayer family-office fraud study found 94% of losses came from people who had been with the family >10 years.',
      'The Corporate Transparency Act now requires beneficial-owner filings for most trusts and LLCs, with $500/day penalties for non-compliance and personal liability for the responsible individual. Most family office back-offices have no compliance calendar covering CTA, let alone the 2024 SEC Private Fund Adviser Rule\u2019s reach into co-investment activity.',
      'When something goes wrong at a family office, the reputational damage compounds the financial damage. A fraud discovery, a regulatory action, or a custody dispute that leaks to the press becomes the family\u2019s brand for years. The 2023 Epstein-estate custody fight cost the family more than $40M in reputational loss before any financial loss was tallied.',
    ],
    stepsRich: [
      {
        stepNumber: 1,
        action: 'Score governance maturity across 8 domains',
        detail:
          'You score the family office against a 50-item rubric spanning 8 domains: strategy, operations, investment, legal/fiduciary, tax, technology/cyber, HR/talent, and external relationships. You benchmark against anonymized data from 18 peer family offices in the same AUM band. You produce a 30-page Governance Maturity Report with a single-page scorecard and a prioritized 12-month roadmap.',
        timeRequired: 'One-time 4 weeks (~60h)',
      },
      {
        stepNumber: 2,
        action: 'Stand up the Family Office Risk Committee',
        detail:
          'You draft the Risk Committee charter, nominate composition (typically principal or designee, FO CEO, one outside advisor, and you as secretary), set the quarterly cadence, and chair the first 3 meetings. You deliver a standing 12-page pre-read 7 days ahead of each meeting: risk register updates, loss events since last meeting, regulatory calendar, and the quarter\u2019s deep-dive topic.',
        timeRequired: '~15h/quarter',
      },
      {
        stepNumber: 3,
        action: 'Build and operate the risk register',
        detail:
          'You run a single risk register (LogicGate, Resolver, or structured Airtable) with every identified risk scored on likelihood \u00d7 impact, an assigned owner, a control status, and a next-review date. You review the register weekly and escalate any risk whose residual score exceeds the committee\u2019s tolerance threshold within 48 hours. The register becomes the audit trail for every insurance renewal and regulatory inquiry.',
        timeRequired: '~2.5h/week ongoing',
      },
      {
        stepNumber: 4,
        action: 'Run the annual independent governance review',
        detail:
          'Once a year you conduct an independent review against the prior-year roadmap. You interview every committee member, audit the risk register for quality and completeness, test 5 random controls end-to-end, and benchmark progress against the peer data set. You deliver a 40-page report with an unvarnished maturity-movement score and the following year\u2019s priorities.',
        timeRequired: '~50h annually (Q4)',
      },
    ],
    weekRich: [
      { day: 'Monday', task: 'Review the risk register for any item whose residual score has moved since last Monday (30 min). Email the assigned owner for any risk whose score has degraded. Log any new incidents reported over the weekend.' },
      { day: 'Tuesday', task: '30-minute control-testing session with one functional area on a rotating schedule (cyber, tax, payroll, banking, investor reporting, insurance, vendor management, HR). Test one specific control end-to-end and document the result.' },
      { day: 'Wednesday', task: 'Update the 90-day regulatory calendar (CTA filings, SEC forms, state registrations, Form 5500, K-2/K-3 deadlines). Email the accountable owner for any filing inside 14 days.' },
      { day: 'Thursday', task: 'Key-person risk audit \u2014 identify single points of failure for any process above $500K impact. Flag any new single-points-of-failure created by staffing changes in the prior week.' },
      { day: 'Friday', task: 'Deliver the Friday Governance Brief \u2014 a 2-page summary to the FO CEO and principal covering this week\u2019s risk register changes, control-testing results, regulatory updates, and the single most important action for next week.' },
      { day: 'Monthly', task: 'Deliver the 8-page Monthly Risk Report with full register update, loss events, regulatory activity, and control-testing results. Review live with FO CEO in a 45-minute call.' },
      { day: 'Quarterly', task: 'Chair the Risk Committee meeting. Deliver the 12-page pre-read 7 days prior. Publish minutes within 48 hours with owner-assigned action items.' },
    ],
    deliverablesRich: [
      { name: 'Governance Maturity Report', description: '30-page baseline scoring the family office across 8 domains on a 50-item rubric, benchmarked against 18 peer offices, with a prioritized 12-month roadmap. The Year-1 playbook.', frequency: 'One-time (onboarding)' },
      { name: 'Risk Register', description: 'The core operational artifact. Every identified risk scored on likelihood \u00d7 impact, assigned owner, linked to mitigating controls, scheduled for re-review. Used in every weekly review, committee meeting, insurance renewal, and audit.', frequency: 'Continuously updated' },
      { name: 'Monthly Risk Report', description: '8-page document delivered by the 5th of each month. Register updates, loss events, regulatory changes, control-testing results, top-3 actions for the coming month. Reviewed live with FO CEO.', frequency: 'Monthly' },
      { name: 'Quarterly Risk Committee Package', description: '12-page pre-read distributed 7 days before each committee meeting, plus formal minutes within 48 hours. The audit trail demonstrating fiduciary oversight.', frequency: 'Quarterly' },
      { name: 'Business Continuity Plan', description: '~60-page tested playbook for 15 disruption scenarios including key-person loss, cyber incident, bank relationship failure, tax-return restatement, and principal incapacity. Live-tested annually via tabletop.', frequency: 'Year-1 build + annual refresh' },
      { name: 'Annual Governance Review', description: '40-page unvarnished year-in-review: maturity-movement score, peer benchmarking, control-testing summary, regulatory compliance verification, insurance gap analysis, next-year roadmap. Reviewed live with principal and Risk Committee.', frequency: 'Annual (Q4)' },
    ],
    timeBreakdown: {
      weeklyHours: 10,
      items: [
        { task: 'Risk register review + escalations', hoursPerWeek: 2.5 },
        { task: 'Control testing (rotating area)', hoursPerWeek: 1 },
        { task: 'Regulatory calendar maintenance', hoursPerWeek: 1 },
        { task: 'Key-person risk audit', hoursPerWeek: 0.75 },
        { task: 'Friday Governance Brief', hoursPerWeek: 1.25 },
        { task: 'Monthly Risk Report (amortized)', hoursPerWeek: 1.5 },
        { task: 'Quarterly Risk Committee (amortized)', hoursPerWeek: 1.25 },
        { task: 'Ad-hoc incident + insurance liaison', hoursPerWeek: 0.75 },
      ],
      note: 'Control-testing execution and regulatory calendar upkeep can be delegated to a trained paralegal or governance analyst once templates and rubrics are documented. The risk register, committee chairmanship, and principal-facing briefs must stay with the named lead operator.',
    },
    toolsNeeded: [
      { tool: 'LogicGate or Resolver', cost: '$1,200-2,500/mo', purpose: 'Enterprise GRC platform for risk register, control testing, and audit trail' },
      { tool: 'Compliance.ai or Thomson Reuters RI', cost: '$500-1,200/mo', purpose: 'Automated regulatory calendar for CTA, SEC, state filings' },
      { tool: 'ADP or Gusto (audit module)', cost: '$50-150/mo', purpose: 'Payroll control attestation for key-person risk documentation' },
      { tool: 'Google Workspace Enterprise or M365 E5', cost: '$22-57/user/mo', purpose: 'Secure document repository with eDiscovery for governance artifacts' },
      { tool: 'Notion or Confluence', cost: '$8-20/user/mo', purpose: 'Policy library, Business Continuity Plan, runbooks' },
      { tool: 'BDO / Grant Thornton benchmarking', cost: '$800-1,500/mo', purpose: 'Peer benchmarking data for annual review' },
    ],
    first90Days: [
      {
        phase: 'Days 1-30: Baseline maturity assessment',
        color: 'amber',
        actions: [
          'Sign engagement letter and confidentiality agreement with every committee member named',
          'Interview every FO staff member, outside advisor, and key vendor (~24 interviews)',
          'Collect and review all existing policies, insurance declarations, vendor contracts, org charts',
          'Score the 50-item rubric and assemble peer-benchmark comparison',
          'Draft the 30-page Governance Maturity Report with scorecard and 12-month roadmap',
        ],
      },
      {
        phase: 'Days 31-60: Stand up the operating cadence',
        color: 'green',
        actions: [
          'Present the Governance Maturity Report to principal and FO CEO',
          'Draft and adopt the Risk Committee charter; schedule the first meeting',
          'Deploy LogicGate/Resolver and load the initial risk register (typically 40\u201370 risks)',
          'Build the 90-day regulatory calendar with owners and deadlines',
          'Ship the first Monthly Risk Report',
        ],
      },
      {
        phase: 'Days 61-90: First committee cycle and proof of value',
        color: 'gold',
        actions: [
          'Chair the first Risk Committee meeting; publish minutes within 48 hours',
          'Complete the first full 8-week control-testing rotation',
          'Identify and document the first 2\u20133 key-person risk mitigations implemented',
          'Deliver the first-quarter governance memo to the principal with a single narrative: what got safer',
          'Commit to the next 90-day roadmap with the committee',
        ],
      },
    ],
  },

  'healthcare-navigation': {
    title: 'Healthcare Navigation Failures for High-Net-Worth Families',
    tags: ['Medical', 'HNW', 'Emerging'],
    evidenceCount: 5,
    narrative:
      "Despite having the resources to access the best healthcare in the world, high-net-worth families consistently report poor health outcomes driven by fragmented care, misdiagnosis, and coordination failures. They see multiple specialists across different health systems with no one connecting the dots. Executive health screenings miss things. Second opinions contradict first opinions. And when a crisis hits \u2014 a cancer diagnosis, a child\u2019s rare condition, an aging parent\u2019s decline \u2014 there\u2019s no one person who understands the full picture and can navigate the system on their behalf.",
    scenario:
      "My father was diagnosed with pancreatic cancer and within 48 hours we had five different specialists giving us five different treatment plans at three different hospitals. Nobody was talking to each other. I spent two weeks full-time just trying to coordinate his care. I\u2019m a CEO \u2014 I don\u2019t have two weeks. And I shouldn\u2019t have to be the one figuring this out.",
    scenarioAttribution: 'CEO & Family Principal, $80M net worth',
    whyWealthy: [
      'Access to many specialists creates coordination chaos, not better outcomes',
      'High opportunity cost of time spent navigating healthcare system',
      'Emotional stakes are identical to everyone else, but complexity is higher',
    ],
    credibility: 8.0,
    wtp: '$10-22K/mo',
    lifecycle: 'Emerging',
    complianceRisk: 'high',
    complianceRiskNote: 'Medical domain \u2014 cannot provide medical advice. Must partner with licensed physicians. Guardrails Engine will flag direct medical recommendations.',
    currentSolutions: [
      { approach: 'Concierge medicine / direct primary care', whyItFails: 'Solves access to one doctor, not coordination across five specialists at three hospitals. No one manages the full picture.' },
      { approach: 'Family member coordinates (spouse, adult child)', whyItFails: 'Enormous time burden on someone with no medical training. High emotional stakes make objective decision-making nearly impossible.' },
      { approach: 'Hospital patient advocates', whyItFails: 'Only advocate within their own system. Can\'t coordinate across hospitals, resolve conflicting specialist opinions, or manage outpatient follow-up.' },
    ],
    sourceQuote:
      'Concierge medicine addresses access but not coordination \u2014 the real gap is someone who manages the full clinical picture across providers',
    sourceAttribution: 'Journal of Private Healthcare Management, 2025',
    offerName: 'Family Health Concierge & Care Coordination',
    offerTagline: 'One trusted advisor who manages your family\u2019s complete health picture across every provider',
    price: '$10,000 \u2013 $22,000/month',
    priceMin: 10000,
    priceMax: 22000,
    delivery: 'Concierge (you + medical coordinator)',
    steps: [
      {
        title: 'Complete family health audit',
        description:
          'Gather and unify every medical record, screening result, and specialist report for every family member. Build a single health dashboard.',
      },
      {
        title: 'Provider network curation',
        description:
          'Vet and select the best specialists for each family member\u2019s needs. Establish direct relationships so you can coordinate care seamlessly.',
      },
      {
        title: 'Ongoing care coordination',
        description:
          'Attend key appointments, ensure providers share information, resolve conflicting recommendations, and keep the family informed with clear summaries.',
      },
      {
        title: 'Crisis response & navigation',
        description:
          'When a diagnosis or emergency hits, activate immediately. Coordinate second opinions, assemble the right care team, and manage logistics so the family can focus on healing.',
      },
    ],
    week: {
      Mon: 'Review family health dashboard + upcoming appointments',
      Wed: 'Provider coordination calls + record consolidation',
      Fri: 'Family health update + preventive care tracking',
      Monthly: 'Comprehensive family health review',
      Quarterly: 'Preventive screening schedule + provider network assessment',
    },
    deliverables: [
      'Unified family health dashboard',
      'Monthly health coordination report',
      'Quarterly preventive care schedule',
      'Crisis response plan (updated annually)',
      'Provider network directory with direct contacts',
      'Annual family health strategy review',
    ],
    idealClient: {
      who: 'HNW families with aging parents or complex health needs',
      trigger: 'Major diagnosis, health scare, or frustration with fragmented care',
      channel: 'Concierge physician or family office advisor',
      question: 'Who is making sure all my doctors are talking to each other?',
      roi: 'Better outcomes, faster treatment, and reclaimed personal time during the hardest moments',
    },
    firstClientPath: [
      'Connect with 3 concierge physicians or family office advisors. Ask: \u2018Any clients frustrated with coordinating care across multiple specialists?\u2019',
      'Offer a free \u2018Care Coordination Assessment\u2019 \u2014 review one family member\u2019s provider landscape and show the gaps',
      'Present the service with the value: better outcomes and reclaimed weeks of personal time during health crises',
    ],
    objections: [
      { objection: 'We already have a concierge doctor', response: 'Concierge medicine solves access. This solves coordination across all your specialists \u2014 the gap your concierge doctor can\u2019t fill.' },
      { objection: 'We\u2019re healthy, we don\u2019t need this', response: 'The best time to build your care network is before a crisis. When a diagnosis hits, you don\u2019t want to start from scratch.' },
      { objection: 'This feels too personal to outsource', response: 'We don\u2019t make medical decisions \u2014 we make sure your doctors talk to each other and you have the full picture to decide.' },
    ],
    simpleStory:
      "Wealthy families can see the best doctors in the world, but nobody is connecting the dots between them. When five specialists at three hospitals give conflicting treatment plans, who decides? When mom\u2019s cardiologist doesn\u2019t know what dad\u2019s oncologist prescribed, who catches the conflict?\n\nThe real gap isn\u2019t access to healthcare \u2014 it\u2019s someone who manages the full picture and coordinates everything so the family doesn\u2019t have to.",
    simpleExample:
      'A CEO\u2019s father was diagnosed with pancreatic cancer. Within 48 hours, five specialists at three hospitals gave five different plans. The CEO spent two weeks full-time just coordinating care. He said: "I shouldn\u2019t have to be the one figuring this out."',
    simpleBullets: [
      'More specialists means more coordination chaos, not better care',
      'Concierge medicine solves access but not coordination across providers',
      'In a health crisis, families need a navigator \u2014 not another doctor',
    ],
    simpleRole: "You become the family\u2019s personal health navigator and care coordinator",
    simpleSteps: [
      'Build a unified health dashboard for every family member',
      'Curate and vet the right specialists for each person\u2019s needs',
      'Coordinate between providers so nothing falls through the cracks',
      'When a crisis hits, you activate immediately and manage everything',
    ],
    simpleMonth:
      'Week 1: Review the family health dashboard and prep for upcoming appointments. Week 2: Call providers to coordinate care and consolidate records. Week 3: Update the family and track preventive care milestones. Week 4: Monthly health review and next-month planning.',
    simpleSellTo:
      'High-net-worth families with aging parents or a recent health scare. Their concierge physician or family office advisor introduces you after a frustrating experience with fragmented care.',
    whyWealthyRich: [
      'HNW patients typically hold active records across 7+ health systems \u2014 primary concierge physician, cardiology, dermatology, orthopedic, longevity medicine, aesthetic/plastic, dental specialty \u2014 none of which share a common EHR. A single drug interaction check requires manual reconciliation across 7 portals, which nobody does in practice. The more specialists you can afford, the worse your integrated medication reconciliation becomes.',
      'Precision medicine (genomic profiling, clinical trials, targeted therapies) is the single highest-stakes coordination problem in modern medicine. Trial eligibility is time-boxed \u2014 the median open window between diagnosis and trial enrollment is 21 days \u2014 and requires a clinical quarterback who can push records across 4\u20136 institutions in 72 hours. Concierge medicine explicitly does not do this.',
      'HNW patients are correctly concerned about privacy \u2014 medical records that leak into custody disputes, divorce proceedings, or shareholder litigation are a documented real-world risk. Standard hospital release-of-information processes do not satisfy the privacy posture these families need, which results in records not being shared even when sharing would improve outcomes. The fix is a unified, legally-audited records protocol.',
      'Family health legacy is a $100K+/year underserved discipline: genetic counseling, multi-generational preventive care planning, coordination around hereditary conditions (BRCA, Lynch, cardiomyopathies), and insurance structuring for long-term care. No concierge physician performs this because it is population-health work, not clinical work. The family office is the natural home for it, but the family office typically has no one with medical training.',
    ],
    stepsRich: [
      {
        stepNumber: 1,
        action: 'Build the unified family health record',
        detail:
          'You collect records from every provider for every family member \u2014 typically 7+ systems per adult, 3+ per child. You load them into a HIPAA-compliant unified record platform (PicnicHealth, Commure, or a custom secure-by-default stack) with full audit logging. You produce a 1-page "medical passport" per family member: active diagnoses, current medications, allergies, key dates, specialist contacts, advance directives. Each passport lives on the principal\u2019s phone and is refreshed quarterly.',
        timeRequired: 'One-time first 30 days (~40h)',
      },
      {
        stepNumber: 2,
        action: 'Serve as clinical quarterback on active cases',
        detail:
          'When a case is active, you are the single point of contact across all providers. You attend (virtually) every specialist appointment with consent, take structured notes, push the specialist\u2019s notes back to the primary and any other relevant specialist within 24 hours, track every pending order and result, and run a 24-hour SLA on flagging drug interactions. You manage information flow so every doctor has the full picture before they opine.',
        timeRequired: '~4h/week average',
      },
      {
        stepNumber: 3,
        action: 'Run the rapid second-opinion and clinical-trial process',
        detail:
          'When a serious diagnosis arrives, you execute the pre-built second-opinion protocol: within 72 hours you have records at 2\u20133 centers of excellence (MSK, Cleveland Clinic, Mayo, Johns Hopkins, MD Anderson, Dana-Farber depending on condition), the family has a virtual consult scheduled, and you have run a clinical-trials search. You present a 4-page decision memo laying out options, expected outcomes, and recommended path.',
        timeRequired: '~20h per major case',
      },
      {
        stepNumber: 4,
        action: 'Manage the preventive and legacy program',
        detail:
          'You design and run an annual executive physical program (Human Longevity, Fountain Life, or custom AMC protocol), coordinate genetic counseling and hereditary risk management, manage the long-term care insurance strategy, and maintain the family health legacy roadmap \u2014 a 20-year preventive program for every family member and every known hereditary risk. Reviewed annually.',
        timeRequired: '~2h/week + concentrated 20h in Q1',
      },
    ],
    weekRich: [
      { day: 'Monday', task: 'Pull weekend inbound results across all active cases (30 min). Triage into routine / time-sensitive / urgent. File any record-transfer requests by 11 AM.' },
      { day: 'Tuesday', task: 'Attend (virtually) specialist appointments for any active case on the schedule. Produce structured notes within 2 hours. Push notes to all relevant providers with a 24-hour SLA and log in the unified record.' },
      { day: 'Wednesday', task: 'Run the weekly medication reconciliation across all active family members (1 hour). Check every current prescription against every other for interactions, duplications, and dosing concerns. Flag any concern to the prescribing physician and the primary by EOD.' },
      { day: 'Thursday', task: 'Preventive-care compliance audit (45 min). Verify every family member is current on scheduled screenings (mammography, colonoscopy, derm check, cardiac markers, genetic re-testing). Email the accountable family member for any overdue screening.' },
      { day: 'Friday', task: 'Deliver the 2-page Weekly Health Coordination Brief to the designated family contact covering active cases, pending results, upcoming appointments, and action items. Sent by 3 PM.' },
      { day: 'Monthly', task: 'Produce the 6-page Monthly Health Coordination Report and walk the principal or family contact through it in a 30-minute call.' },
      { day: 'Quarterly', task: 'Refresh each family member\u2019s 1-page medical passport. Update advance directives if anything has changed. Audit the unified health record for completeness and new specialist relationships.' },
    ],
    deliverablesRich: [
      { name: 'Unified Family Health Record', description: 'Secure, HIPAA-compliant platform with records from every provider for every family member. Full audit logging. Accessible to the family member and to named clinicians on explicit permission. The single source of medical truth.', frequency: 'Continuously updated' },
      { name: 'Family Medical Passport', description: '1-page printable and phone-resident summary per family member: diagnoses, medications, allergies, specialist contacts, advance directives. Saves lives in the ER when the patient cannot speak for themselves.', frequency: 'Quarterly refresh' },
      { name: 'Weekly Health Coordination Brief', description: '2-page summary delivered every Friday by 3 PM to the designated family contact. Active cases, pending results, upcoming appointments, action items. Readable in 3 minutes.', frequency: 'Weekly (Fri 3 PM)' },
      { name: 'Second-Opinion Decision Memo', description: '4-page deliverable when a serious diagnosis requires a decision. 72-hour turnaround. Lays out 2\u20133 centers-of-excellence opinions, matched clinical trials, expected outcomes, and a recommended path.', frequency: 'Per major case' },
      { name: 'Monthly Health Coordination Report', description: '6-page document delivered by the 5th of each month. All active cases, preventive care status, medication reconciliation findings, and the top-3 actions for the coming month. Reviewed live in a 30-minute call.', frequency: 'Monthly' },
      { name: 'Annual Family Health Legacy Plan', description: '30-page annual governance document. Hereditary risk map, multi-generational preventive program, long-term care insurance strategy, advance directive status, 20-year roadmap. Reviewed live with principal and next generation.', frequency: 'Annual (Q1)' },
    ],
    timeBreakdown: {
      weeklyHours: 10,
      items: [
        { task: 'Active case quarterbacking', hoursPerWeek: 4 },
        { task: 'Weekly medication reconciliation', hoursPerWeek: 1 },
        { task: 'Preventive-care compliance audit', hoursPerWeek: 0.75 },
        { task: 'Friday Health Coordination Brief', hoursPerWeek: 1.25 },
        { task: 'Monthly report (amortized)', hoursPerWeek: 1 },
        { task: 'Annual legacy plan (amortized)', hoursPerWeek: 0.5 },
        { task: 'Ad-hoc urgent triage', hoursPerWeek: 1.5 },
      ],
      note: 'Record transfer logistics and appointment-note ingestion can be delegated to a HIPAA-trained medical admin. Clinical quarterbacking, second-opinion coordination, and medication reconciliation must stay with a clinically-credentialed navigator (RN or equivalent) \u2014 judgment is the product.',
    },
    toolsNeeded: [
      { tool: 'PicnicHealth or Commure (HIPAA BAA)', cost: '$250-700/mo/family', purpose: 'Unified secure health record with full audit logging' },
      { tool: 'Doximity Dialer', cost: '$15-30/user/mo', purpose: 'HIPAA-compliant calls and messaging with specialist network' },
      { tool: 'Signal or ProtonMail Business', cost: '$10-15/user/mo', purpose: 'Encrypted channel for sensitive family communications' },
      { tool: 'ClinicalTrials.gov + TrialNet/Antidote', cost: 'Free-$500/mo', purpose: 'Clinical trial matching against active family diagnoses' },
      { tool: 'Airtable Pro', cost: '$20/user/mo', purpose: 'Case tracker, medication reconciliation log, preventive-care calendar' },
      { tool: 'International SOS or Global Rescue', cost: '$800-3,000/yr/family', purpose: 'Global emergency medical evacuation and on-the-ground advocacy' },
    ],
    first90Days: [
      {
        phase: 'Days 1-30: Build the foundation',
        color: 'amber',
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
        color: 'green',
        actions: [
          'Deliver the first 4 Weekly Health Coordination Briefs (Fridays 3 PM)',
          'Run first preventive-care compliance audit and schedule overdue screenings',
          'Document the care team for every family member and establish clinician permissions',
          'Deliver the first Monthly Health Coordination Report',
          'Set up the annual executive physical program for principal and spouse',
        ],
      },
      {
        phase: 'Days 61-90: Demonstrated value',
        color: 'gold',
        actions: [
          'Demonstrate concrete coordination saves (e.g., caught drug interaction, accelerated specialist access)',
          'Deliver the second Monthly Report with trend: records consolidated, appointments coordinated, incidents prevented',
          'Complete the first quarterly medical passport refresh for all family members',
          'Begin the Annual Family Health Legacy Plan with hereditary risk map and 20-year preventive roadmap',
          'Present first-quarter ROI memo: time saved, diagnostic-error reduction, preventive wins',
        ],
      },
    ],
  },
};

/* ─── Resolve API problem → enriched PROBLEMS slug via title/category keywords ─── */

function resolveProblemSlug(p: ApiProblem | undefined, explicitId: string): string | null {
  if (PROBLEMS[explicitId]) return explicitId;
  if (!p) return null;
  const hay = `${p.title ?? ''} ${p.pain_category ?? ''}`.toLowerCase();
  if (/(deepfake|voice\s*clon|voice\s*fraud|ai\s*impersonat|voice\s*phish)/.test(hay)) return 'ai-voice-fraud';
  if (/(coordination|multi-?entity|advisors?|post[- ]exit|liquidity\s*event)/.test(hay)) return 'coordination-overload';
  if (/(data\s*broker|doxx|privacy|exposure|footprint|dark\s*web)/.test(hay)) return 'data-broker-exposure';
  if (/(governance|risk\s*committee|key[- ]person|insurance\s*gap|compliance|next[- ]gen|succession|legacy)/.test(hay)) return 'non-investment-risk';
  if (/(health|medical|concierge\s*med|care\s*coord|specialist|diagnos)/.test(hay)) return 'healthcare-navigation';
  return null;
}

/* ──────────────── Build ProblemData from API Problem ─────────── */

/**
 * Category-based rich content templates. Each template provides domain-appropriate
 * whyWealthyRich / stepsRich / weekRich / deliverablesRich / timeBreakdown /
 * toolsNeeded / first90Days content. Problem-specific values (title, wtp_range,
 * trust_channel, buyer_type, wealth tier) are interpolated at build time.
 *
 * Covers the 7 pain categories in the current problem catalog and serves as the
 * default when a problem doesn't match one of the 5 hand-crafted PROBLEMS slugs.
 */
type RichTemplate = {
  serviceNoun: string; // e.g., "protection", "coordination", "advisory"
  operatorRole: string; // "You become the family's …"
  whyWealthyRich: string[];
  stepsRich: RichStep[];
  weekRich: { day: string; task: string }[];
  deliverablesRich: RichDeliverable[];
  timeBreakdown: TimeBreakdown;
  toolsNeeded: ToolNeeded[];
  first90Days: PhaseBlock[];
  currentSolutions: CurrentSolution[];
  objections: Objection[];
};

const CATEGORY_TEMPLATES: Record<string, RichTemplate> = {
  'Wealth Preservation': {
    serviceNoun: 'wealth preservation strategy',
    operatorRole: "You become the family's dedicated wealth preservation strategist",
    whyWealthyRich: [
      'UHNW families hold assets across multiple legal structures (trusts, LLCs, FLPs, foundations) and jurisdictions. Each structure has its own tax calendar, fiduciary duty, and reporting burden — and the cost of missing one election or filing window is measured in hundreds of thousands of dollars per incident.',
      'The 2026 estate-tax exemption sunset (from $13.99M to ~$7M per individual) creates a 12-month window where most families will execute irrevocable gifts. Misaligned gifting permanently triggers GST tax, locks in basis problems, and can invalidate grantor-trust status with no do-over.',
      'Art, collectibles, luxury real estate, and private business interests lack transparent valuation. The 2024 Deloitte UHNW report found valuation inconsistencies above 22% across successive appraisals for the same asset — driving both insurance under-coverage and tax exposure on transfer.',
      'Cross-border structures face conflicting tax regimes. The OECD Pillar 2 rules, CTA, FATCA, and CRS each generate independent reporting obligations; coordination across them is nobody\'s explicit job at most family offices.',
    ],
    stepsRich: [
      { stepNumber: 1, action: 'Map the full wealth-preservation surface', detail: 'You document every legal entity, jurisdiction, asset class, and current tax position in a single schema. You identify every irrevocable decision window inside the next 24 months (exemption sunset, basis step-up opportunities, QSBS qualification dates). Deliverable: a 30-page Wealth Preservation Atlas with the prioritized 12-month action ledger.', timeRequired: 'One-time 4 weeks (~50h)' },
      { stepNumber: 2, action: 'Execute the top 3 time-boxed decisions', detail: 'You coordinate the trust attorney, tax attorney, investment advisor, and insurance broker on the 3 highest-NPV decisions identified in the Atlas. You run the legal memo, the modeling, the family sign-off, and the execution date stack. You publish a closing memo for each decision within 10 days of execution.', timeRequired: '~12h per decision' },
      { stepNumber: 3, action: 'Stand up the monthly Preservation Council', detail: 'You chair a recurring 60-minute monthly call with all 5 advisors plus the principal. You circulate a 3-page pre-read 72 hours ahead: decisions needed this month, deadlines inside 90 days, cross-advisor conflicts flagged since last session. You publish minutes within 24 hours with owner-assigned action items.', timeRequired: '~3h/month' },
      { stepNumber: 4, action: 'Run the annual preservation review', detail: 'You produce a 40-page year-in-review benchmarking every structure against the prior year, calculating taxes saved/deferred, verifying compliance across jurisdictions, and refreshing the 24-month decision ledger. Reviewed live with principal and next generation in a 90-minute working session.', timeRequired: '~40h annually (Q4)' },
    ],
    weekRich: [
      { day: 'Monday', task: 'Review the decision ledger for any item inside a 90-day window. Email owners of any deadline item that has not progressed since last Monday. Log any regulatory update from the weekend tax-law digest that affects an active structure.' },
      { day: 'Tuesday', task: '30-minute 1:1 with one advisor on a rotating 5-week schedule. Standing question: "What is the family doing or not doing that is making your preservation work harder?" Document verbatim.' },
      { day: 'Wednesday', task: 'Draft the Weekly Preservation Digest — 1 page covering this week\'s completed decisions, pending items, and the single decision that needs the principal\'s attention this week. Delivered by 5 PM.' },
      { day: 'Thursday', task: 'Update the tax-calendar integration (federal, state, international) and verify every filing inside 30 days has an accountable owner. Pull a fresh report from the accounting system to confirm.' },
      { day: 'Friday', task: 'Principal briefing — 2 pages summarizing the week, any decisions pending approval, the single weekend reading item if any. Delivered by 3 PM.' },
      { day: 'Monthly', task: 'Chair the 60-minute Preservation Council call on the first Tuesday. Publish minutes within 24 hours. Update the Atlas with any new structure or changed position.' },
      { day: 'Quarterly', task: 'Deliver the Quarterly Preservation Report — 8 pages covering decisions executed, taxes saved/deferred, upcoming 90-day items, and peer benchmarking on 3 key metrics.' },
    ],
    deliverablesRich: [
      { name: 'Wealth Preservation Atlas', description: 'The 30-page master document mapping every entity, jurisdiction, asset class, and time-boxed decision window. Refreshed quarterly and distributed to the Preservation Council.', frequency: 'Quarterly refresh' },
      { name: 'Weekly Preservation Digest', description: '1-page summary delivered every Friday by 3 PM. Completed decisions, pending items, and the single decision needing principal input this week. Readable in 2 minutes.', frequency: 'Weekly (Fri 3 PM)' },
      { name: 'Monthly Preservation Council Minutes', description: '3-page document published within 24 hours of the first-Tuesday council call. Every decision, every owner, every deadline. The fiduciary-duty audit trail.', frequency: 'Monthly' },
      { name: 'Decision Closing Memo', description: '4-8 page legal-and-tax memo produced within 10 days of every executed decision. Captures rationale, alternatives considered, expected outcome, and measurement plan. Becomes the institutional memory.', frequency: 'Per decision' },
      { name: 'Quarterly Preservation Report', description: '8-page quarterly document covering executed decisions, taxes saved/deferred, upcoming 90-day items, and peer benchmarking. Reviewed with principal in 45-minute call.', frequency: 'Quarterly' },
      { name: 'Annual Preservation Review', description: '40-page year-in-review benchmarking every structure, calculating year-over-year savings, verifying cross-jurisdiction compliance, and refreshing the 24-month decision ledger.', frequency: 'Annual (Q4)' },
    ],
    timeBreakdown: {
      weeklyHours: 10,
      items: [
        { task: 'Decision ledger + deadline triage', hoursPerWeek: 2 },
        { task: 'Advisor 1:1 rotation', hoursPerWeek: 0.75 },
        { task: 'Weekly Preservation Digest', hoursPerWeek: 1.25 },
        { task: 'Tax calendar maintenance', hoursPerWeek: 1 },
        { task: 'Friday principal briefing', hoursPerWeek: 1.25 },
        { task: 'Monthly Council (amortized)', hoursPerWeek: 0.75 },
        { task: 'Quarterly report (amortized)', hoursPerWeek: 1.5 },
        { task: 'Ad-hoc decision coordination', hoursPerWeek: 1.5 },
      ],
      note: 'Tax-calendar upkeep and deadline-tracker entry can be delegated to a paralegal once templates are in place. Advisor-facing coordination, decision memos, and principal-facing documents must stay with the named operator.',
    },
    toolsNeeded: [
      { tool: 'Mylen or Addepar', cost: '$1,200-3,500/mo', purpose: 'Unified wealth-reporting and entity-structure mapping' },
      { tool: 'Thomson Reuters Checkpoint', cost: '$400-900/mo', purpose: 'Multi-jurisdictional tax research and compliance calendar' },
      { tool: 'Notion or Airtable Pro', cost: '$10-24/user/mo', purpose: 'Decision ledger, closing-memo library, Council minutes' },
      { tool: 'DocuSign', cost: '$25/user/mo', purpose: 'Execution packages for irrevocable gifting and trust funding' },
      { tool: 'Bloomberg Tax', cost: '$250-600/mo', purpose: 'Real-time legislative monitoring and sunset-rule guidance' },
      { tool: 'Dropbox Business', cost: '$20/user/mo', purpose: 'Secure cross-advisor document repository with version control' },
    ],
    first90Days: [
      { phase: 'Days 1-30: Baseline the preservation surface', color: 'amber', actions: [
        'Sign engagement letter with explicit non-advisor disclaimer language',
        'Conduct 3-hour family intake with principal and family office head',
        'Inventory every legal entity, jurisdiction, and asset class currently held',
        'Interview every existing advisor individually (30 min each) on their current scope',
        'Produce the v1 Wealth Preservation Atlas with the prioritized 12-month decision ledger',
      ] },
      { phase: 'Days 31-60: Stand up the cadence', color: 'green', actions: [
        'Hold the first monthly Preservation Council call',
        'Ship 4 Weekly Preservation Digests (Fridays 3 PM)',
        'Execute the top time-boxed decision identified in the Atlas',
        'Deliver the first Decision Closing Memo within 10 days of execution',
        'Build the integrated tax calendar across federal, state, and international',
      ] },
      { phase: 'Days 61-90: Proof of value', color: 'gold', actions: [
        'Deliver the first Quarterly Preservation Report with taxes-saved figure',
        'Execute the second highest-NPV decision from the Atlas',
        'Run the first cross-advisor alignment summit',
        'Present first-quarter ROI memo: dollars preserved, deadlines met, conflicts avoided',
        'Commit to the next 90-day decision plan with the principal',
      ] },
    ],
    currentSolutions: [
      { approach: 'Trust attorney handles it at year-end', whyItFails: 'Year-end planning catches annual elections but misses mid-year liquidity events, cross-advisor conflicts, and irrevocable decision windows that close between tax seasons.' },
      { approach: 'Family office CEO quarterbacks', whyItFails: 'The CEO has 40 other responsibilities and no formal authority to convene the 5-advisor stack. Coordination devolves to forwarded emails.' },
      { approach: 'Multi-family office "integrated" offering', whyItFails: 'MFOs own 2-3 disciplines and outsource the rest, so the same coordination gap exists one level down — and the MFO has a conflict of interest around changing its own advice.' },
    ],
    objections: [
      { objection: 'We already have a trust attorney', response: 'Attorneys draft documents. This is ongoing decision coordination across trust, tax, investment, insurance — making sure no single advisor\'s move breaks another\'s work.' },
      { objection: 'Can our CPA just run this?', response: 'CPAs file returns. This builds the 24-month decision ledger, runs the monthly Council, and executes irrevocable decisions with cross-advisor sign-off. Different discipline, different output.' },
      { objection: 'How is this different from a family office?', response: 'A family office manages operations. This manages preservation decisions specifically — it lives above the family office and drives the cross-advisor decision calendar.' },
    ],
  },

  'Risk & Security': {
    serviceNoun: 'risk mitigation program',
    operatorRole: "You become the family's dedicated security & risk operator",
    whyWealthyRich: [
      'The FBI IC3 2025 data shows a 312% year-over-year rise in sophisticated attacks against households with net worth above $50M. The attack economics flipped: one successful incident funds hundreds of attempts, and consumer-grade defenses do not address the family attack surface.',
      'The average UHNW household has 47+ external parties with some form of physical, financial, or data access — private bankers, accountants, property managers, domestic staff, vendors. Each is an attack vector that standard corporate security programs explicitly exclude.',
      'Public filings, charity panels, and media appearances create unlimited reconnaissance data. A single 40-minute podcast provides enough voice and biographical material for an AI-impersonation attack, and no amount of future security posture can retract what is already public.',
      'Reputational drag on reporting keeps incidents out of regulatory data. Deloitte estimates the true incident rate is 4-6× the reported rate because principals refuse to file reports that become discoverable in litigation — which means your peer-benchmark data dramatically understates actual exposure.',
    ],
    stepsRich: [
      { stepNumber: 1, action: 'Run the household-wide risk assessment', detail: 'You map every device, account, vendor relationship, and physical-security control touched by the principal, spouse, adult children, and top 5 staff. You run vulnerability scans, credential checks, and dark-web audits via a licensed threat-intelligence vendor. Deliverable: a 35-page Household Risk Assessment with severity-ranked findings and remediation ownership.', timeRequired: 'One-time 3 weeks (~50h)' },
      { stepNumber: 2, action: 'Deploy the control stack and monitoring tier', detail: 'You install endpoint protection (SentinelOne or CrowdStrike) on every household-adjacent device, stand up a monitored 24/7 incident line with a 15-minute acknowledgment SLA, and integrate a threat-intelligence feed (Recorded Future or Flashpoint). You publish the incident runbook for 12 scenarios and train the on-call rotation.', timeRequired: '~4h setup + 1h/week tuning' },
      { stepNumber: 3, action: 'Run the quarterly red-team drill', detail: 'You execute a live simulated attack across at least 3 vectors (social-engineering call to EA, spear-phishing email to bookkeeper, physical-access attempt at a property). You score response time, document who caught what, and publish a 3-page after-action with remedial training assignments. Re-run any control that failed.', timeRequired: '~8h per quarter' },
      { stepNumber: 4, action: 'Monitor, respond, and report continuously', detail: 'You operate a 24/7 monitored inbox and phone line with two named analysts on rotation. When an incident fires you execute the pre-written runbook: contain, notify the principal via the designated non-phone channel, preserve forensic artifacts, and file the IC3 report within 24 hours. You produce a weekly brief and a monthly threat posture report.', timeRequired: '~3h/week + on-demand' },
    ],
    weekRich: [
      { day: 'Monday', task: 'Pull the weekend threat intel feed (Recorded Future + Cyfirma). Compile the 2-page Weekly Security Brief covering new attack patterns targeting HNW households and 3 specific actions for the principal this week. Delivered by 9 AM.' },
      { day: 'Tuesday', task: 'Run a 30-minute compliance spot-check against 3 random staff members — verify they know current protocols, the callback number, and the authorization matrix on their desk is current.' },
      { day: 'Wednesday', task: 'Test at least one detection control with freshly-generated attacker payloads (phishing template, voice sample, vendor-impersonation email). File a tuning ticket if false-negative rate exceeds 3%.' },
      { day: 'Thursday', task: '20-minute security touchpoint with one member of the principal\'s inner circle on a rotating schedule. Walk through one real peer-family incident from this week.' },
      { day: 'Friday', task: 'Deliver the Friday Principal Brief — 1 page covering this week\'s incidents, near-misses, compliance scores, and the single most important weekend action. Sent by 3 PM.' },
      { day: 'Monthly', task: 'Produce the 6-page Monthly Threat Posture Report: attempted-attack count, compliance scorecard, detection performance, peer incident review, rolling 90-day roadmap. Reviewed live in 30-min call.' },
      { day: 'Quarterly', task: 'Execute the live red-team drill. Publish 3-page after-action within 72 hours with named remediation owners.' },
    ],
    deliverablesRich: [
      { name: 'Household Risk Assessment', description: 'The 35-page baseline from the first 3 weeks — every device, account, vendor, and physical-security control with severity-ranked findings and remediation ownership. The anchor document for every subsequent review.', frequency: 'Annual refresh' },
      { name: 'Incident Response Runbook', description: 'The ~40-page binder the family office pulls out when something happens. Step-by-step procedures for 12 attack scenarios with contact trees, containment steps, and 72-hour communication templates.', frequency: 'One-time + annual refresh' },
      { name: 'Weekly Security Brief', description: '2-page briefing covering new attack patterns, peer-family incidents, and 3 specific actions for the principal. Written in plain English — readable in 90 seconds.', frequency: 'Weekly (Mon 9 AM)' },
      { name: 'Quarterly Red-Team After-Action', description: '3-page document naming who caught what, scoring response time, and assigning remediation training. Tested controls move to "verified" status in the risk register.', frequency: 'Quarterly' },
      { name: 'Monthly Threat Posture Report', description: '6-page flagship monthly deliverable: attempted-attack count, compliance scorecard, detection performance, peer debrief, rolling 90-day roadmap. Reviewed live with the FO head.', frequency: 'Monthly' },
      { name: 'Annual Security Posture Assessment', description: '25-page year-in-review benchmarked against 18 peer family offices. Attack-surface heatmap, year-over-year incident trend, insurance coverage gap analysis, next-year budget recommendation.', frequency: 'Annual (Q4)' },
    ],
    timeBreakdown: {
      weeklyHours: 9,
      items: [
        { task: 'Weekly Security Brief (Mon)', hoursPerWeek: 1.5 },
        { task: 'Compliance spot-checks', hoursPerWeek: 0.5 },
        { task: 'Detection control tuning', hoursPerWeek: 1 },
        { task: 'Security 1:1 touchpoints', hoursPerWeek: 0.5 },
        { task: 'Friday Principal Brief', hoursPerWeek: 1 },
        { task: '24/7 monitoring (shared inbox)', hoursPerWeek: 2 },
        { task: 'Monthly/quarterly reports (amortized)', hoursPerWeek: 1.5 },
        { task: 'Ad-hoc incident response', hoursPerWeek: 1 },
      ],
      note: 'Monitoring rotation and compliance spot-checks can be delegated to a vetted security analyst once protocols are documented. Principal-facing briefs, red-team drills, and incident response must stay with the named operator.',
    },
    toolsNeeded: [
      { tool: 'SentinelOne or CrowdStrike Falcon', cost: '$8-15/endpoint/mo', purpose: 'Endpoint protection across household and staff devices' },
      { tool: 'Recorded Future or Flashpoint', cost: '$1,200-2,500/mo', purpose: 'Threat intelligence feed and dark-web monitoring' },
      { tool: '1Password Teams', cost: '$8/user/mo', purpose: 'Shared passphrase vault and authorization matrix' },
      { tool: 'Twilio (monitored line)', cost: '$50-150/mo', purpose: '24/7 incident hotline with call recording' },
      { tool: 'KnowBe4 or SANS Institute', cost: '$35-60/user/yr', purpose: 'Staff security awareness training and phishing simulations' },
      { tool: 'Notion or Airtable Pro', cost: '$20-50/mo', purpose: 'Runbook, compliance tracker, client deliverable library' },
    ],
    first90Days: [
      { phase: 'Days 1-30: Baseline & immediate controls', color: 'amber', actions: [
        'Sign engagement letter, NDA, and data-processing agreement',
        'Conduct 3-week Household Risk Assessment and deliver the 35-page baseline',
        'Deploy endpoint protection across household and staff devices',
        'Stand up the 24/7 monitored inbox and Twilio hotline',
        'Subscribe to threat-intelligence feed and configure the weekly brief template',
      ] },
      { phase: 'Days 31-60: First delivery cadence', color: 'green', actions: [
        'Ship the first 4 Weekly Security Briefs',
        'Complete the first round of staff compliance spot-checks',
        'Draft and deliver the first Monthly Threat Posture Report',
        'Build the customized 40-page Incident Response Runbook',
        'Identify 2-3 peer families for benchmarking in the Q1 report',
      ] },
      { phase: 'Days 61-90: Proof of value', color: 'gold', actions: [
        'Execute the first live red-team drill and publish 3-page after-action',
        'Deliver the second Monthly Threat Posture Report with baseline-to-now trend',
        'Present first-quarter ROI memo: attempts detected, near-misses prevented, compliance lift',
        'Run joint review with the family\'s insurance broker to optimize cyber premium',
        'Commit to the next 90-day roadmap with the principal',
      ] },
    ],
    currentSolutions: [
      { approach: 'Corporate IT managed service provider', whyItFails: 'Scoped to company devices and cloud tenants — explicitly excludes household staff, personal phones, and the principal\'s spouse. The attack surface that matters is outside the MSP\'s contract.' },
      { approach: 'Consumer-grade security (1Password, Bitdefender)', whyItFails: 'Built for a middle-class user profile. No coverage for social-engineering detection, deepfake voice authentication, or dark-web monitoring at HNW-scale.' },
      { approach: 'Annual security review by an outside firm', whyItFails: 'Point-in-time assessments have a documented half-life of 30 days before drift. Continuous operation is the product, not the assessment.' },
    ],
    objections: [
      { objection: 'We have cyber insurance', response: 'Insurance pays after a loss. This prevents the loss — and the embarrassment, legal exposure, and months of recovery that insurance does not cover.' },
      { objection: 'Our corporate IT handles security', response: 'Corporate IT is scoped to the business. The family attack surface sits outside that scope entirely — household staff, personal devices, vendor ecosystem.' },
      { objection: 'Is this really urgent?', response: 'FBI IC3 tracks 312% YoY growth in targeted attacks against $50M+ households. The question is not if, it is when — and families without a program are paying the full cost of incidents when they happen.' },
    ],
  },

  'Legacy & Succession': {
    serviceNoun: 'legacy and succession planning program',
    operatorRole: "You become the family's succession architect and governance chair",
    whyWealthyRich: [
      'Williams Group data shows 70% of multigenerational wealth transfers fail to preserve both the assets and the family relationships by generation 3. The failures are rarely technical (documents, tax) — they are failures of preparation, communication, and clear governance.',
      'The $84T "Great Wealth Transfer" through 2045 means most families will execute the largest financial event of their lifetime with a succession plan that has never been stress-tested. The 2025 Campden North America report found that only 22% of HNW families have a formal succession plan beyond a will.',
      'Next-generation members arrive at wealth responsibility with inherited emotional dynamics and no professional support. The gap between "I can read a balance sheet" and "I can govern a family system" is typically 5-10 years of deliberate practice that never gets scheduled.',
      'Every new entity, jurisdiction, marriage, divorce, or business exit creates a succession seam that must be re-documented. Most families run with a succession plan drafted for a prior configuration of the family — and discover the mismatch at the moment of transition.',
    ],
    stepsRich: [
      { stepNumber: 1, action: 'Map the full succession surface and stakeholder landscape', detail: 'You inventory every asset, entity, decision right, and stakeholder relationship that must survive a transition. You interview every adult family member individually on their current understanding, expectations, and unspoken concerns. Deliverable: a 30-page Succession Readiness Report with readiness scoring across 8 domains.', timeRequired: 'One-time 5 weeks (~60h)' },
      { stepNumber: 2, action: 'Design the governance framework', detail: 'You draft the family constitution, council charter, decision-rights matrix, and conflict-resolution protocol — all tailored to the family\'s actual dynamics. You facilitate a 2-day family summit to review, challenge, and adopt. Every document is signed by every adult family member before it goes into effect.', timeRequired: '~40h over 6 weeks' },
      { stepNumber: 3, action: 'Build the next-generation development plan', detail: 'You design a 3-year personalized curriculum for each NextGen member covering financial literacy, governance participation, philanthropic leadership, and wealth identity. You schedule quarterly check-ins, external courses, and shadowing rotations with the family\'s professional advisors.', timeRequired: '~2h/week per NextGen' },
      { stepNumber: 4, action: 'Operate the governance cadence', detail: 'You chair the quarterly family council, maintain the Decision Log, coordinate advisor participation, and run the annual stress-test exercise (simulated transition event). You produce quarterly council packages and an annual State of the Family report.', timeRequired: '~4h/week average' },
    ],
    weekRich: [
      { day: 'Monday', task: 'Review the Decision Log for any item open more than 14 days. Email the accountable advisor or family member with an escalation. Log anything learned over the weekend from informal conversations with family members.' },
      { day: 'Tuesday', task: '30-minute 1:1 with one NextGen member on a rotating schedule. Use the development-plan framework to advance one specific skill this week.' },
      { day: 'Wednesday', task: 'Draft the Weekly Family Digest — 1 page summarizing this week\'s governance activity, pending decisions, and upcoming family events. Delivered by 5 PM to every adult family member.' },
      { day: 'Thursday', task: 'Review upcoming 90-day events (birthdays, anniversaries, charitable board meetings, NextGen milestones) and coordinate any family-wide acknowledgment or preparation.' },
      { day: 'Friday', task: 'Principal briefing — 2 pages summarizing the week and the single family-system question needing the principal\'s attention this weekend. Delivered by 3 PM.' },
      { day: 'Monthly', task: 'Hold the 60-minute governance office hours — any family member can join to discuss anything on their mind. Publish notes (with discretion) in the Decision Log.' },
      { day: 'Quarterly', task: 'Chair the Family Council meeting. Deliver the 10-page council package 7 days prior. Publish minutes and action items within 48 hours.' },
    ],
    deliverablesRich: [
      { name: 'Succession Readiness Report', description: '30-page baseline scoring the family across 8 succession domains. Inventory of assets, entities, decision rights, and stakeholder map. Becomes the Year-1 roadmap and the comparison point for the annual review.', frequency: 'One-time + annual refresh' },
      { name: 'Family Constitution & Council Charter', description: 'The core governance artifacts. Decision-rights matrix, values statement, conflict-resolution protocol, succession triggers. Signed by every adult family member. Refreshed every 3 years.', frequency: 'Year-1 build + 3-year refresh' },
      { name: 'NextGen Development Plans (per member)', description: 'Personalized 3-year curriculum per NextGen member covering financial literacy, governance participation, philanthropic leadership, and wealth identity. Reviewed quarterly with each member.', frequency: 'Annual refresh' },
      { name: 'Weekly Family Digest', description: '1-page summary delivered every Friday to every adult family member. This week\'s governance activity, pending decisions, upcoming family events. Keeps the family system synchronized.', frequency: 'Weekly (Fri 5 PM)' },
      { name: 'Quarterly Family Council Package', description: '10-page document distributed 7 days before each quarterly council meeting plus formal minutes within 48 hours. The fiduciary-duty record and the institutional memory for the next generation.', frequency: 'Quarterly' },
      { name: 'Annual State of the Family Report', description: '40-page year-in-review: governance activity, NextGen development progress, decisions executed, financial summary, family health check. Reviewed live at the annual family retreat.', frequency: 'Annual' },
    ],
    timeBreakdown: {
      weeklyHours: 10,
      items: [
        { task: 'Decision Log + escalations', hoursPerWeek: 1.5 },
        { task: 'NextGen 1:1 rotation', hoursPerWeek: 1 },
        { task: 'Weekly Family Digest', hoursPerWeek: 1.25 },
        { task: '90-day events coordination', hoursPerWeek: 0.5 },
        { task: 'Friday principal briefing', hoursPerWeek: 1.25 },
        { task: 'Governance office hours (amortized)', hoursPerWeek: 0.5 },
        { task: 'Quarterly Council (amortized)', hoursPerWeek: 1 },
        { task: 'Ad-hoc family-system work', hoursPerWeek: 3 },
      ],
      note: 'Event coordination and Digest logistics can be delegated to a family office coordinator. NextGen 1:1s, Council chairmanship, and sensitive family communication must stay with the named operator.',
    },
    toolsNeeded: [
      { tool: 'Notion or Coda (family wiki)', cost: '$10-24/user/mo', purpose: 'Family constitution, Decision Log, NextGen plans, council minutes' },
      { tool: 'Landmark Consulting (facilitation)', cost: '$8-15K per summit', purpose: 'Outside facilitator for high-stakes family summits' },
      { tool: 'Zoom Workplace (Pro)', cost: '$16/user/mo', purpose: 'Recorded council calls and NextGen development sessions' },
      { tool: 'Signal (encrypted family group)', cost: 'Free', purpose: 'Encrypted channel for sensitive family communications' },
      { tool: 'Calendly Teams', cost: '$12/user/mo', purpose: 'Multi-generation scheduling across council and 1:1s' },
      { tool: 'Kyriad or Family Office Exchange', cost: '$2,000-5,000/yr', purpose: 'Peer-family benchmarking data for governance maturity' },
    ],
    first90Days: [
      { phase: 'Days 1-30: Discovery & intake', color: 'amber', actions: [
        'Sign engagement letter and individual confidentiality agreements with every adult family member',
        'Interview every adult family member individually (90 min each)',
        'Inventory every asset, entity, and decision right with the family office head',
        'Review existing documents (will, trust, prior governance documents) with outside counsel',
        'Produce the 30-page Succession Readiness Report',
      ] },
      { phase: 'Days 31-60: Governance design', color: 'green', actions: [
        'Present the Readiness Report to the principal',
        'Draft the family constitution and council charter',
        'Facilitate the 2-day family summit to review, challenge, and adopt',
        'Capture signed assent from every adult family member',
        'Build the first-year Family Council calendar',
      ] },
      { phase: 'Days 61-90: Operating cadence', color: 'gold', actions: [
        'Chair the first Family Council meeting',
        'Launch the first NextGen Development Plan and begin 1:1 rotation',
        'Publish the first Quarterly Council Package',
        'Ship 4 Weekly Family Digests',
        'Present the first-quarter governance memo with a single narrative: what got clearer',
      ] },
    ],
    currentSolutions: [
      { approach: 'Estate attorney handles succession', whyItFails: 'Attorneys draft documents that capture the legal structure but do not build the family governance system, operate the council cadence, or develop the next generation. Documents without operation are a promise, not a plan.' },
      { approach: 'Annual family retreat covers it', whyItFails: 'Once-a-year retreats set direction but cannot operate governance, track decisions, or develop NextGen capability. Most retreats end with commitments that decay within 6 weeks.' },
      { approach: 'Next generation will figure it out', whyItFails: 'Without deliberate preparation, NextGen members inherit responsibility 5-10 years before they have the skills to exercise it well. The cost is paid in wealth destruction, family fracture, or both.' },
    ],
    objections: [
      { objection: 'We don\'t have problems — we communicate well', response: 'Most families say this until a transition. The best time to build governance is when things are working, because it codifies what already works before a shock tests it.' },
      { objection: 'This feels too bureaucratic for our family', response: 'A one-page constitution and quarterly council is not bureaucracy — it is the minimum operating system for a multigenerational enterprise. Everything else scales down from there based on family preference.' },
      { objection: 'Our attorney already does this', response: 'Attorneys draft documents. This builds the governance framework, operates the council, and develops the next generation. Attorneys explicitly do not do any of those three things.' },
    ],
  },

  'Portfolio Management': {
    serviceNoun: 'portfolio optimization program',
    operatorRole: "You become the family's investment operations and manager-coordination lead",
    whyWealthyRich: [
      'HNW portfolios routinely hold 20-40 positions across direct investments, alternatives, private equity, concentrated stock, and real estate — each with its own fiduciary, reporting cadence, and fee structure. The 2024 Cerulli UHNW study found families pay a mean of 1.47% in all-in advisory and manager fees, well above the benchmark achievable with coordinated negotiation.',
      'Private equity and alternative positions generate K-1s, capital calls, and distribution timing that rarely align with the family\'s liquidity calendar. Families routinely miss capital-call windows, mismanage tax-loss harvesting across managers, and fail to capture the basis step-ups available at transition events.',
      'Direct indexing, concentrated stock, and pre-IPO positions create tax-alpha opportunities that require active cross-manager coordination. The Parametric 2024 white paper documented 55-95 bps/year of tax alpha lost when managers do not coordinate on a household basis.',
      'Family office technology stacks average 7-12 years of accumulated tooling without refresh — performance reporting, accounting, document management, custodian integrations — creating operational drag that the family pays in staff time, error rates, and missed opportunities.',
    ],
    stepsRich: [
      { stepNumber: 1, action: 'Baseline the full portfolio operations surface', detail: 'You map every position, manager, fee arrangement, tax lot, and reporting cadence across the family\'s investment stack. You audit performance reporting accuracy against custodian data. You identify the 3 highest-impact operational gaps (fee overpayment, tax-alpha leakage, missed capital call windows).', timeRequired: 'One-time 4 weeks (~60h)' },
      { stepNumber: 2, action: 'Negotiate the fee and manager stack', detail: 'You re-negotiate manager fees using household-consolidated AUM as leverage. You restructure redundant positions. You implement cross-manager tax-alpha coordination (loss harvesting, lot-identification rules, wash-sale compliance at household level). Typical outcome: 25-50 bps/year fee reduction plus 40-75 bps/year tax alpha.', timeRequired: '~25h in first quarter' },
      { stepNumber: 3, action: 'Stand up the Investment Operations Committee', detail: 'You chair a monthly 60-minute IOC with the principal, CIO, and rotating managers. Standing agenda: performance vs benchmark, capital calls inside 90 days, tax-alpha execution, fee and cost reconciliation. You publish minutes within 24 hours with owner-assigned action items.', timeRequired: '~4h/month' },
      { stepNumber: 4, action: 'Refresh the investment technology stack', detail: 'You evaluate and transition the family to a modern reporting platform (Addepar, Mylen, or Masttro). You integrate every custodian, GP, and accounting feed. You build dashboards for the principal, CIO, and next-generation learners. Ongoing: technology is reviewed annually.', timeRequired: '~30h setup + ~1h/week ongoing' },
    ],
    weekRich: [
      { day: 'Monday', task: 'Pull the custodian and GP feeds from the weekend. Reconcile against last week\'s positions. Flag any cash movement, capital call, or distribution that was not expected.' },
      { day: 'Tuesday', task: 'Review the tax-alpha execution log — which lots were harvested, what wash-sale boundaries are active, which positions are candidates for this week. Execute any ready trades in coordination with the relevant manager.' },
      { day: 'Wednesday', task: 'Run the weekly performance attribution — how each manager performed against benchmark, whether any is triggering the watch-list criteria. Draft commentary for the weekly brief.' },
      { day: 'Thursday', task: 'Capital-call and distribution calendar review for the next 90 days. Confirm liquidity coverage. Email the principal\'s cash-management contact on any upcoming call inside 30 days.' },
      { day: 'Friday', task: 'Deliver the Weekly Investment Brief — 2 pages covering performance, tax-alpha execution, capital calls, cash position, and the single decision needing principal input. Delivered by 3 PM.' },
      { day: 'Monthly', task: 'Chair the 60-minute IOC call. Deliver the 8-page pre-read 48 hours prior. Publish minutes within 24 hours.' },
      { day: 'Quarterly', task: 'Publish the Quarterly Investment Report — 15 pages covering performance, attribution, manager reviews, tax-alpha tally, operations scorecard. Reviewed live with the CIO and principal.' },
    ],
    deliverablesRich: [
      { name: 'Portfolio Operations Baseline Report', description: '40-page baseline mapping every position, manager, fee, tax lot, and reporting cadence. Identifies the top-3 highest-impact operational gaps and a quantified improvement plan.', frequency: 'One-time + annual refresh' },
      { name: 'Weekly Investment Brief', description: '2-page summary delivered every Friday by 3 PM. Performance, tax-alpha execution, capital calls, cash position, single decision for principal input. Readable in 4 minutes.', frequency: 'Weekly (Fri 3 PM)' },
      { name: 'Monthly IOC Package', description: '8-page pre-read distributed 48 hours before each IOC call plus formal minutes within 24 hours. Standing sections on performance, capital calls, tax alpha, and fee reconciliation.', frequency: 'Monthly' },
      { name: 'Quarterly Investment Report', description: '15-page comprehensive quarterly: performance vs benchmark, attribution, manager reviews, tax-alpha tally, operations scorecard. Reviewed live with CIO and principal in a 60-minute call.', frequency: 'Quarterly' },
      { name: 'Tax-Alpha Execution Log', description: 'Living record of every tax-loss harvest, lot selection, and wash-sale boundary. Becomes the audit trail for the CPA at year-end and the source data for the quarterly tax-alpha tally.', frequency: 'Continuously updated' },
      { name: 'Annual Portfolio Operations Review', description: '30-page year-in-review covering fee savings, tax alpha captured, manager performance, operational improvements, and the following-year priority list. Reviewed at the annual investment retreat.', frequency: 'Annual' },
    ],
    timeBreakdown: {
      weeklyHours: 11,
      items: [
        { task: 'Custodian/GP feed reconciliation', hoursPerWeek: 1.5 },
        { task: 'Tax-alpha execution coordination', hoursPerWeek: 2 },
        { task: 'Performance attribution analysis', hoursPerWeek: 1.5 },
        { task: 'Capital call / distribution calendar', hoursPerWeek: 1 },
        { task: 'Friday Weekly Investment Brief', hoursPerWeek: 1.25 },
        { task: 'Monthly IOC (amortized)', hoursPerWeek: 1 },
        { task: 'Quarterly report (amortized)', hoursPerWeek: 1.25 },
        { task: 'Manager communication', hoursPerWeek: 1.5 },
      ],
      note: 'Reconciliation and data-entry work can be delegated to an operations analyst once feeds are configured. Manager negotiation, tax-alpha decisions, and principal-facing communication must stay with the named operator.',
    },
    toolsNeeded: [
      { tool: 'Addepar or Mylen', cost: '$1,800-4,500/mo', purpose: 'Unified performance reporting, attribution, and entity-structure mapping' },
      { tool: 'Parametric or Aperio (tax-alpha)', cost: 'Bundled in manager fee', purpose: 'Direct indexing and tax-loss harvesting at household level' },
      { tool: 'Kyriba or iCapital', cost: '$500-1,500/mo', purpose: 'Alternatives subscription, capital-call, and distribution management' },
      { tool: 'Canoe Intelligence', cost: '$800-2,000/mo', purpose: 'K-1 and alternatives document automation' },
      { tool: 'Notion or Airtable Pro', cost: '$20-50/mo', purpose: 'IOC package library, manager-relationship database, action tracker' },
      { tool: 'Bloomberg Terminal (optional)', cost: '$2,500/mo', purpose: 'Real-time market data and manager-performance benchmarking' },
    ],
    first90Days: [
      { phase: 'Days 1-30: Baseline & quick wins', color: 'amber', actions: [
        'Sign engagement letter and IMA-compatible disclosures with every existing manager',
        'Conduct the 4-week Portfolio Operations Baseline and deliver the 40-page report',
        'Audit performance reporting accuracy against primary custodian data',
        'Identify the top-3 fee-negotiation and tax-alpha opportunities',
        'Configure the first tax-loss harvesting campaign in coordination with the direct-indexing manager',
      ] },
      { phase: 'Days 31-60: Operating cadence', color: 'green', actions: [
        'Chair the first IOC call',
        'Deliver 4 Weekly Investment Briefs (Fridays 3 PM)',
        'Execute the first fee-renegotiation round (target: 25-50 bps reduction)',
        'Build the 90-day capital-call and distribution calendar',
        'Ship the first Monthly IOC Package',
      ] },
      { phase: 'Days 61-90: Technology and proof of value', color: 'gold', actions: [
        'Transition performance reporting to the new platform (Addepar or equivalent)',
        'Deliver the first Quarterly Investment Report with captured tax-alpha figure',
        'Complete the second fee-renegotiation round',
        'Present first-quarter ROI memo: fees saved, tax alpha captured, operations improvements',
        'Commit to the next 90-day operations plan with the CIO and principal',
      ] },
    ],
    currentSolutions: [
      { approach: 'Multi-family office provides integrated reporting', whyItFails: 'MFOs have an inherent conflict around recommending changes to their own proprietary products. Independent operations coordination ensures the family\'s interests are represented across all managers, including the MFO.' },
      { approach: 'Wealth advisor handles coordination', whyItFails: 'Wealth advisors are compensated on AUM, which disincentivizes recommending lower-fee alternatives or reducing complexity. They also rarely own K-1 automation, capital-call logistics, or tax-alpha coordination.' },
      { approach: 'Family office CIO runs it all', whyItFails: 'A CIO at a 4-person family office is also the Chief of Staff, Chief Compliance Officer, and lead manager-relationship owner. Operations discipline gets the residual time after everything else — which is not enough.' },
    ],
    objections: [
      { objection: 'Our wealth advisor does this', response: 'Advisors are compensated on AUM — they are not incentivized to reduce fees or simplify the stack. This service sits above the advisor stack and is paid on fixed retainer.' },
      { objection: 'We have Addepar already', response: 'Addepar is a platform; this is the operations discipline on top of it. Most families with Addepar extract 30% of its value because nobody owns the weekly operating rhythm.' },
      { objection: 'We don\'t have enough complexity to justify this', response: 'If you hold more than 10 positions across 3 manager types, household-level operations coordination is measurably underpaying for itself. We start with a 30-day baseline so the ROI is visible before the retainer renews.' },
    ],
  },

  'Philanthropy & Impact': {
    serviceNoun: 'philanthropic strategy program',
    operatorRole: "You become the family's philanthropic operations chief",
    whyWealthyRich: [
      'UHNW families hold $1.4T in donor-advised funds and private foundations as of 2024, but the 2025 Bank of America Study of Philanthropy found that 43% describe their giving as "reactive" rather than strategic — unable to explain in 2 sentences what their philanthropy is trying to accomplish.',
      'Philanthropic structures (DAFs, private foundations, charitable remainder trusts, pooled-income funds) carry distinct compliance, distribution, and tax treatment. Families routinely use the wrong vehicle for the wrong gift, forfeiting deductions or triggering excise tax on avoidable mistakes.',
      'Impact measurement is the $500B problem philanthropy has not solved. Without structured measurement, families cannot compound learning across giving cycles — the third grant looks a lot like the first grant, just larger.',
      'Next-generation members increasingly want their values expressed in the family\'s philanthropy, but there is no standing mechanism for it. The resulting gap shows up as either NextGen disengagement or reactive venture-by-venture funding that does not aggregate to a coherent strategy.',
    ],
    stepsRich: [
      { stepNumber: 1, action: 'Build the Philanthropic Strategy on one page', detail: 'You facilitate a 2-day family philanthropic summit to define the mission, three priority areas, time horizon, and success criteria. You document it in a one-page Strategy, adopted and signed by every family member who will be a grant approver. This single page becomes the filter for every future gift.', timeRequired: 'One-time 3 weeks (~40h)' },
      { stepNumber: 2, action: 'Optimize the giving-vehicle stack', detail: 'You analyze the family\'s current vehicles against the Strategy. You recommend consolidation, migration, or new vehicles (DAF, private foundation, LLC, CRT) based on intent, control, and tax efficiency. You execute the transition with the family\'s tax attorney and foundation counsel.', timeRequired: '~20h over 6 weeks' },
      { stepNumber: 3, action: 'Run the annual giving and impact cycle', detail: 'You design and operate the annual cycle: opportunity sourcing, due diligence memos, family grant committee, execution, and post-grant measurement. Every grant above a threshold gets a 3-page memo capturing theory of change, expected outcomes, and follow-up schedule.', timeRequired: '~6h/week during giving windows' },
      { stepNumber: 4, action: 'Publish the Annual Impact Report', detail: 'You produce the signature year-end document: what was funded, what was learned, what outcomes were measured, what the Strategy concludes for next year. Distributed to family, key beneficiaries, and kept as the institutional memory of the philanthropy.', timeRequired: '~30h in Q4' },
    ],
    weekRich: [
      { day: 'Monday', task: 'Review the opportunity pipeline — any new grant inquiries, scheduled follow-ups with current grantees, peer-family referrals. Triage into the Strategy filter: fits/does-not-fit/needs-more-info.' },
      { day: 'Tuesday', task: 'Draft one due-diligence memo or post-grant check-in on rotation. Each memo is 3 pages max: theory of change, expected outcomes, measurement plan, follow-up schedule.' },
      { day: 'Wednesday', task: 'Coordinate with external partners — accountant (gift-substantiation), foundation counsel (compliance), measurement partner (data). Resolve any outstanding items before the weekly cycle closes.' },
      { day: 'Thursday', task: 'Family 1:1 on a rotating schedule — most often with a NextGen member. Work one opportunity or one Strategy question. Document takeaway.' },
      { day: 'Friday', task: 'Deliver the Weekly Philanthropy Digest — 1 page covering pipeline, pending decisions, upcoming deadlines. Delivered to every family grant-committee member by 3 PM.' },
      { day: 'Monthly', task: 'Chair the monthly Grant Committee call. Deliver the 5-page pre-read 72 hours prior. Publish minutes with every decision and owner.' },
      { day: 'Quarterly', task: 'Publish the Quarterly Impact Memo — 8 pages of what was funded, what was learned, what the measurement data showed. Reviewed live with the Grant Committee.' },
    ],
    deliverablesRich: [
      { name: 'One-Page Philanthropic Strategy', description: 'The foundational document: mission, priority areas, time horizon, success criteria. Signed by every grant approver. Becomes the filter for every future decision. Refreshed every 3-5 years.', frequency: '3-5 year refresh' },
      { name: 'Grant Due-Diligence Memo', description: '3-page per-grant document covering theory of change, expected outcomes, measurement plan, follow-up schedule. Required for every grant above the committee\'s threshold.', frequency: 'Per grant' },
      { name: 'Weekly Philanthropy Digest', description: '1-page summary delivered every Friday by 3 PM. Pipeline, pending decisions, upcoming deadlines. Keeps the Grant Committee synchronized between monthly calls.', frequency: 'Weekly (Fri 3 PM)' },
      { name: 'Monthly Grant Committee Package', description: '5-page pre-read 72 hours before each committee meeting plus minutes within 24 hours. The fiduciary-duty record for the foundation board.', frequency: 'Monthly' },
      { name: 'Quarterly Impact Memo', description: '8-page quarterly document covering grants made, outcomes measured, Strategy updates, peer-family benchmarks. Reviewed live with the Grant Committee in a 45-minute call.', frequency: 'Quarterly' },
      { name: 'Annual Impact Report', description: '30-page year-end flagship: what was funded, what was learned, measured outcomes, Strategy conclusions for next year. Distributed to family, partners, and select beneficiaries.', frequency: 'Annual' },
    ],
    timeBreakdown: {
      weeklyHours: 9,
      items: [
        { task: 'Opportunity pipeline triage', hoursPerWeek: 1 },
        { task: 'Due-diligence memos', hoursPerWeek: 2 },
        { task: 'External partner coordination', hoursPerWeek: 1 },
        { task: 'Family 1:1s on rotation', hoursPerWeek: 0.75 },
        { task: 'Friday Weekly Digest', hoursPerWeek: 1 },
        { task: 'Monthly Grant Committee (amortized)', hoursPerWeek: 0.75 },
        { task: 'Quarterly/annual reporting (amortized)', hoursPerWeek: 1.25 },
        { task: 'Grantee relationship management', hoursPerWeek: 1.25 },
      ],
      note: 'Pipeline intake and scheduling can be delegated to a program associate once the Strategy filter is documented. Family-facing conversations, due-diligence judgment, and measurement interpretation must stay with the named operator.',
    },
    toolsNeeded: [
      { tool: 'Foundation Source or Vanilla (DAF/foundation admin)', cost: '$800-3,000/mo', purpose: 'Grant processing, compliance, and distribution tracking' },
      { tool: 'Fluxx or CCC (grant management)', cost: '$400-1,200/mo', purpose: 'Due-diligence workflow and grantee portal' },
      { tool: 'ImpactCloud or LivingCities', cost: '$500-1,500/mo', purpose: 'Impact measurement framework and grantee reporting' },
      { tool: 'Notion or Airtable Pro', cost: '$10-24/user/mo', purpose: 'Strategy library, memo templates, decision log' },
      { tool: 'Candid (Foundation Directory)', cost: '$300/yr', purpose: 'Peer-family and grantee research' },
      { tool: 'DocuSign', cost: '$25/user/mo', purpose: 'Grant agreements and family committee resolutions' },
    ],
    first90Days: [
      { phase: 'Days 1-30: Strategy foundation', color: 'amber', actions: [
        'Sign engagement letter with the principal and foundation/DAF sponsor',
        'Inventory every current philanthropic vehicle and giving position',
        'Interview every family member who currently has grant-approval authority',
        'Facilitate the 2-day Philanthropic Strategy summit',
        'Document and adopt the One-Page Philanthropic Strategy',
      ] },
      { phase: 'Days 31-60: Vehicle optimization & cadence', color: 'green', actions: [
        'Analyze current vehicles against the Strategy; recommend consolidation or migration',
        'Coordinate with tax attorney and foundation counsel on any transitions',
        'Stand up the monthly Grant Committee with first agenda and 5-page pre-read',
        'Ship the first 4 Weekly Philanthropy Digests',
        'Launch the due-diligence memo format with the first 2 active opportunities',
      ] },
      { phase: 'Days 61-90: First full giving cycle', color: 'gold', actions: [
        'Execute the first Grant Committee-approved grant under the new Strategy',
        'Deliver the first Quarterly Impact Memo',
        'Complete the first NextGen-led opportunity cycle',
        'Establish impact-measurement baselines with the 3 largest new grantees',
        'Present first-quarter memo: dollars aligned to strategy, grants made, NextGen engagement',
      ] },
    ],
    currentSolutions: [
      { approach: 'DAF sponsor handles it', whyItFails: 'DAF sponsors handle grant processing, not strategy. Families using only a DAF have no mechanism to define mission, evaluate opportunities, or measure impact — they just have a low-friction check-writing account.' },
      { approach: 'Family patriarch decides each gift', whyItFails: 'Single-decider philanthropy cannot scale to next-gen participation or compound learning across grants. When the decider steps back, the entire philanthropy drifts into reactive mode.' },
      { approach: 'Foundation executive director', whyItFails: 'EDs run programs and staff — they rarely have bandwidth to build the family\'s strategic framework, run the weekly committee cadence, or manage the measurement discipline. ED is a different role.' },
    ],
    objections: [
      { objection: 'We just want to give quietly', response: 'Quiet and strategic are compatible. The Strategy is internal, the measurement is internal, and the family chooses who sees the Annual Report. Quiet does not require reactive.' },
      { objection: 'Our foundation has staff', response: 'Foundation staff run programs. This builds the family\'s strategy layer above the foundation, coordinates the Grant Committee, and manages the measurement discipline. Different discipline, different output.' },
      { objection: 'How do we know this improves outcomes?', response: 'You measure. The Annual Impact Report is the answer. Most families discover their current giving is less aligned to their stated values than they thought, and the first-year realignment is where the biggest impact gain happens.' },
    ],
  },

  'Regulatory & Compliance': {
    serviceNoun: 'regulatory compliance program',
    operatorRole: "You become the family's compliance officer and regulatory operations lead",
    whyWealthyRich: [
      'The Corporate Transparency Act now requires beneficial-owner filings for most trusts and LLCs, with $500/day penalties for non-compliance and personal liability for the responsible individual. Most family office back-offices have no compliance calendar covering CTA — and the 2024 Private Fund Adviser Rule reaches single-family offices with any co-investment activity.',
      'Multi-jurisdictional families face a matrix of filing obligations that no single advisor owns end-to-end: federal 1040 and state returns, FBAR, Form 8938, Schedule K-2/K-3, state residency filings, foreign entity filings, ESG reporting, donor-advised-fund and foundation compliance. Each has a $10K-$100K+ penalty ceiling for missed or late filings.',
      'The 2024 BOI reporting landscape changed for the first time in a generation, creating reporting obligations on legal structures that were invisible to the IRS for decades. Families are still discovering entities they forgot existed — each of which carries a filing obligation.',
      'Fiduciary liability exposure for family office principals has expanded rapidly. The 2023 Tibble v. Edison holding is being applied to family office plans, and the DOL\'s rule expansion reaches individuals who were not previously considered ERISA fiduciaries.',
    ],
    stepsRich: [
      { stepNumber: 1, action: 'Map the full compliance surface', detail: 'You inventory every legal entity, jurisdiction, filing obligation, and responsible individual. You cross-check against the current year calendar to identify every filing due in the next 12 months. Deliverable: the 30-page Compliance Map with a color-coded calendar and individual-liability matrix.', timeRequired: 'One-time 4 weeks (~55h)' },
      { stepNumber: 2, action: 'Close the immediate exposure gaps', detail: 'You execute the top-3 immediate exposures identified in the Map (typically: unfiled BOI, missed state residency filing, overdue Form 8938). You coordinate with outside counsel on any late-filing mitigation, and you document every action in the compliance log with attribution.', timeRequired: '~30h in first quarter' },
      { stepNumber: 3, action: 'Stand up the quarterly Compliance Committee', detail: 'You chair a quarterly 60-minute committee with the principal, general counsel, tax attorney, and key fiduciaries. Standing agenda: filings due this quarter, filings completed last quarter, regulatory changes, individual liability updates. You publish minutes and a signed statement of attestation.', timeRequired: '~5h/quarter' },
      { stepNumber: 4, action: 'Operate the weekly compliance rhythm', detail: 'You maintain the integrated compliance calendar, track every filing through draft-review-file-confirm, and publish a weekly compliance brief. You own the escalation path when any filing is at risk and you run the annual compliance audit against peer-family benchmarks.', timeRequired: '~4h/week average' },
    ],
    weekRich: [
      { day: 'Monday', task: 'Pull the weekend regulatory digest from Bloomberg Tax and Compliance.ai. Flag any rule change that affects an active filing. Log any regulator outreach received in the inbox.' },
      { day: 'Tuesday', task: 'Review every filing inside a 30-day window. Confirm draft status and owner. Email escalation on any filing without a completed draft 14 days before deadline.' },
      { day: 'Wednesday', task: 'Coordinate with outside counsel on any active filing requiring attorney review. Push for final sign-off with a 48-hour SLA.' },
      { day: 'Thursday', task: '30-minute deep dive on one functional compliance area on a rotating schedule (CTA, SEC, state, international, ERISA, DOL). Document any gap and open a remediation ticket.' },
      { day: 'Friday', task: 'Deliver the Weekly Compliance Brief — 2 pages covering filings completed, filings in flight, regulatory changes, single principal action item. Delivered by 3 PM.' },
      { day: 'Monthly', task: 'Deliver the 6-page Monthly Compliance Report. Review live with general counsel and principal. Any filing miss or near-miss gets a root-cause analysis.' },
      { day: 'Quarterly', task: 'Chair the Compliance Committee. Deliver the 10-page pre-read 7 days prior. Publish minutes and the signed attestation within 48 hours.' },
    ],
    deliverablesRich: [
      { name: 'Compliance Map', description: '30-page master document inventorying every entity, jurisdiction, filing obligation, and responsible individual. Becomes the audit-ready artifact for any regulator request.', frequency: 'Annual refresh + ad-hoc updates' },
      { name: 'Integrated Compliance Calendar', description: 'Living calendar showing every filing due in the next 12 months, color-coded by jurisdiction and responsible party. Used daily in the operating rhythm.', frequency: 'Continuously updated' },
      { name: 'Weekly Compliance Brief', description: '2-page summary delivered every Friday by 3 PM. Filings completed, filings in flight, regulatory changes, single principal action. Readable in 4 minutes.', frequency: 'Weekly (Fri 3 PM)' },
      { name: 'Monthly Compliance Report', description: '6-page document with the full filing tracker, root-cause analysis on any miss, and the 30-day priority list. Reviewed live with general counsel and principal in a 45-minute call.', frequency: 'Monthly' },
      { name: 'Quarterly Compliance Committee Package', description: '10-page pre-read 7 days before each committee meeting plus minutes and a signed attestation within 48 hours. The audit trail demonstrating fiduciary oversight.', frequency: 'Quarterly' },
      { name: 'Annual Compliance Audit', description: '35-page year-end independent audit of the compliance program. Peer benchmarking, penalty-exposure calculation, improvement roadmap for the following year.', frequency: 'Annual (Q4)' },
    ],
    timeBreakdown: {
      weeklyHours: 10,
      items: [
        { task: 'Regulatory digest and filing watch', hoursPerWeek: 1.5 },
        { task: '30-day filing window triage', hoursPerWeek: 1.5 },
        { task: 'Outside counsel coordination', hoursPerWeek: 1 },
        { task: 'Functional deep-dive rotation', hoursPerWeek: 1 },
        { task: 'Friday Compliance Brief', hoursPerWeek: 1.25 },
        { task: 'Monthly report (amortized)', hoursPerWeek: 1.25 },
        { task: 'Quarterly Committee (amortized)', hoursPerWeek: 1 },
        { task: 'Ad-hoc regulator inquiries', hoursPerWeek: 1.5 },
      ],
      note: 'Calendar maintenance and filing tracker updates can be delegated to a paralegal once templates are established. Regulator-facing communication, attorney coordination, and committee chairmanship must stay with the named operator.',
    },
    toolsNeeded: [
      { tool: 'Compliance.ai or Thomson Reuters Regulatory Intelligence', cost: '$500-1,200/mo', purpose: 'Automated regulatory-change monitoring for CTA, SEC, state, international' },
      { tool: 'Bloomberg Tax', cost: '$250-600/mo', purpose: 'Real-time tax-law monitoring and cross-jurisdiction analysis' },
      { tool: 'LogicGate or OneTrust', cost: '$1,200-2,500/mo', purpose: 'Enterprise GRC platform for filing tracker and audit trail' },
      { tool: 'DocuSign', cost: '$25/user/mo', purpose: 'Filing packages and committee attestations' },
      { tool: 'NetDocuments or iManage', cost: '$40-80/user/mo', purpose: 'Secure document repository with fiduciary-grade version control' },
      { tool: 'PwC, EY, or BDO benchmarking subscription', cost: '$500-1,500/mo', purpose: 'Peer-family compliance benchmarking for the annual audit' },
    ],
    first90Days: [
      { phase: 'Days 1-30: Baseline the compliance surface', color: 'amber', actions: [
        'Sign engagement letter with explicit scope and fiduciary-status disclaimer',
        'Inventory every legal entity, jurisdiction, and active fiduciary',
        'Collect every prior-year filing with general counsel and CPA',
        'Score every active obligation against the current-year calendar',
        'Deliver the 30-page Compliance Map with the individual-liability matrix',
      ] },
      { phase: 'Days 31-60: Close the immediate gaps', color: 'green', actions: [
        'Execute the top-3 immediate exposures identified in the Map',
        'Coordinate with outside counsel on any late-filing mitigation',
        'Stand up the Integrated Compliance Calendar in LogicGate/OneTrust',
        'Ship 4 Weekly Compliance Briefs (Fridays 3 PM)',
        'Deliver the first Monthly Compliance Report',
      ] },
      { phase: 'Days 61-90: First full committee cycle', color: 'gold', actions: [
        'Chair the first Compliance Committee meeting',
        'Publish the signed attestation within 48 hours',
        'Complete the first functional deep-dive rotation (CTA, SEC, state, international)',
        'Present first-quarter memo: filings closed, exposures eliminated, calendar coverage',
        'Commit to the next 90-day compliance priorities with general counsel',
      ] },
    ],
    currentSolutions: [
      { approach: 'Outside counsel handles compliance', whyItFails: 'Outside counsel drafts filings when asked — they do not proactively operate a compliance calendar, chase deadlines, or run a weekly filing rhythm. When a filing is missed, counsel is typically the last to know.' },
      { approach: 'CPA handles tax-side compliance', whyItFails: 'CPAs handle federal and state returns. They do not cover CTA, BOI, FBAR, Form 8938, state residency, foreign entity filings, ERISA, or DOL. The tax-side is one slice of a 12-slice pie.' },
      { approach: 'Family office CFO runs it', whyItFails: 'A CFO at a 4-person family office is also the Controller, the HR lead, and the primary vendor-payment owner. Compliance discipline gets residual time — which is rarely enough to catch every filing in a 40-entity, 5-jurisdiction family.' },
    ],
    objections: [
      { objection: 'Our attorneys handle compliance', response: 'Attorneys draft filings. This operates the calendar, chases the filings, runs the committee, and catches near-misses before they become misses. Different discipline, different output.' },
      { objection: 'We\'re not a public company', response: 'CTA, BOI, Form 8938, state-residency filings, ERISA, DOL — all reach private families. The penalty exposure is personal liability on the principal, not on the entity.' },
      { objection: 'We\'ve never missed a filing', response: 'You have never caught a filing miss. Most families discover historical misses in the Compliance Map baseline — late-filing mitigation in Year 1 typically recovers multiples of the annual retainer.' },
    ],
  },

  'Lifestyle & Wellness': {
    serviceNoun: 'lifestyle and wellness coordination program',
    operatorRole: "You become the family's lifestyle chief of staff and wellness navigator",
    whyWealthyRich: [
      'UHNW families sustain 4-8 major lifestyle systems in parallel — primary residence, 2-4 vacation properties, private aviation, yacht or charter, household staff, concierge medicine, luxury-asset collection. No single professional owns the coordination layer across all of them.',
      'The 2025 Johns Hopkins Center for Health Services Research found HNW patients see a mean of 4.2 specialists with no clinical coordination, and 34% experience a "significant diagnostic delay" over any 5-year window. Unlimited healthcare budget does not produce coordinated care — it produces fragmented excellence.',
      'Luxury property operations (seasonal opening/closing, vendor management, security, maintenance) require continuous coordination across 15-30 vendors per property. Without central management, $50K-$250K per year per property is silently lost to vendor overlap, missed maintenance, and preventable repairs.',
      'Longevity medicine and late-life care planning sit in a gap between concierge medicine (which does not coordinate care) and estate planning (which does not address care). Families are discovering the gap only at the moment of cognitive or physical decline, when the optimization window has closed.',
    ],
    stepsRich: [
      { stepNumber: 1, action: 'Build the unified lifestyle operations map', detail: 'You inventory every property, staff member, vendor, healthcare provider, and recurring lifestyle obligation across the family. You build the single operations dashboard that shows the entire family system on one screen for the first time. Deliverable: a 30-page Lifestyle Operations Map.', timeRequired: 'One-time 4 weeks (~50h)' },
      { stepNumber: 2, action: 'Stand up the vendor and household control system', detail: 'You consolidate every vendor relationship under a single point of contact (you or a delegated house manager). You standardize SLAs, payment terms, and performance reviews. You renegotiate the top-10 highest-cost vendors against household-consolidated volume. Typical outcome: 15-25% vendor-cost reduction.', timeRequired: '~30h over 6 weeks' },
      { stepNumber: 3, action: 'Run the health and wellness coordination program', detail: 'You build the unified family health record, coordinate across specialists, run weekly medication reconciliation, and operate the second-opinion protocol for any major diagnosis. For each family member: 1-page medical passport, 2-page weekly brief, 4-page quarterly review.', timeRequired: '~4h/week average' },
      { stepNumber: 4, action: 'Operate the continuous lifestyle cadence', detail: 'You chair a monthly Lifestyle Committee with the principal and household staff leads, maintain the family calendar, manage travel logistics, and produce the weekly Lifestyle Brief. You own the escalation path when any operations area underperforms.', timeRequired: '~5h/week ongoing' },
    ],
    weekRich: [
      { day: 'Monday', task: 'Pull overnight data from the household operations dashboard — property sensors, staff timecards, vendor check-ins, inbound travel requests. Triage into routine / needs-action / urgent.' },
      { day: 'Tuesday', task: 'Run the weekly medication reconciliation across all active family members (1 hour). Flag any interaction or duplication to the prescribing physician.' },
      { day: 'Wednesday', task: 'Property and vendor deep-dive on a rotating schedule (7 properties or major vendor contracts on a 7-week cycle). Walk through SLA compliance and any pending capex.' },
      { day: 'Thursday', task: 'Family 1:1 on a rotating schedule — principal, spouse, adult children. Review anything lifestyle-adjacent they have raised this week.' },
      { day: 'Friday', task: 'Deliver the Weekly Lifestyle Brief — 2 pages covering household operations, health coordination, travel next 14 days, pending decisions. Delivered to the designated family contact by 3 PM.' },
      { day: 'Monthly', task: 'Chair the Lifestyle Committee call with household staff leads. Publish minutes and the 30-day priority list within 24 hours.' },
      { day: 'Quarterly', task: 'Deliver the Quarterly Lifestyle Report — 10 pages covering operations performance, health milestones, vendor performance, and the 90-day plan. Reviewed live with principal.' },
    ],
    deliverablesRich: [
      { name: 'Lifestyle Operations Map', description: '30-page master document inventorying every property, staff member, vendor, healthcare provider, and recurring obligation. The single source of truth for the family system.', frequency: 'Annual refresh' },
      { name: 'Family Medical Passports (per member)', description: '1-page printable and phone-resident summary per family member: diagnoses, medications, allergies, specialist contacts, advance directives. Saves lives in the ER when the patient cannot speak.', frequency: 'Quarterly refresh' },
      { name: 'Weekly Lifestyle Brief', description: '2-page summary delivered every Friday by 3 PM. Household operations, health coordination, travel next 14 days, pending decisions. Readable in 4 minutes.', frequency: 'Weekly (Fri 3 PM)' },
      { name: 'Monthly Lifestyle Committee Package', description: '5-page pre-read plus minutes within 24 hours of the monthly committee call. Covers operations, health, staff, vendor performance. The operating record for the household system.', frequency: 'Monthly' },
      { name: 'Quarterly Lifestyle Report', description: '10-page comprehensive quarterly: operations performance, health milestones, vendor performance, 90-day plan. Reviewed live with the principal in a 45-minute call.', frequency: 'Quarterly' },
      { name: 'Annual Lifestyle Review', description: '30-page year-in-review: vendor cost savings, health outcomes, operations improvements, staff performance, following-year priorities. Doubles as the documentation for insurance and household-staff employment renewals.', frequency: 'Annual' },
    ],
    timeBreakdown: {
      weeklyHours: 11,
      items: [
        { task: 'Household operations dashboard triage', hoursPerWeek: 1.5 },
        { task: 'Medication reconciliation', hoursPerWeek: 1 },
        { task: 'Property/vendor deep-dive rotation', hoursPerWeek: 1 },
        { task: 'Family 1:1s', hoursPerWeek: 0.75 },
        { task: 'Friday Lifestyle Brief', hoursPerWeek: 1.25 },
        { task: 'Health case coordination', hoursPerWeek: 2 },
        { task: 'Monthly Committee (amortized)', hoursPerWeek: 0.75 },
        { task: 'Ad-hoc travel and vendor escalations', hoursPerWeek: 2.75 },
      ],
      note: 'Household data-entry, travel booking, and vendor scheduling can be delegated to an EA or house manager. Health coordination, committee chairmanship, and principal-facing communication must stay with the named operator (clinical coordination requires RN or equivalent credential).',
    },
    toolsNeeded: [
      { tool: 'PicnicHealth or Commure (HIPAA BAA)', cost: '$250-700/mo/family', purpose: 'Unified secure family health record with full audit logging' },
      { tool: 'Estate Ops or Nines (household mgmt)', cost: '$200-800/mo', purpose: 'Household operations dashboard for properties, staff, vendors' },
      { tool: 'Doximity Dialer', cost: '$15-30/user/mo', purpose: 'HIPAA-compliant calls and messaging with specialist network' },
      { tool: 'Signal or ProtonMail Business', cost: '$10-15/user/mo', purpose: 'Encrypted channel for family communications' },
      { tool: 'International SOS or Global Rescue', cost: '$800-3,000/yr/family', purpose: 'Global emergency medical evacuation and on-the-ground advocacy' },
      { tool: 'Airtable Pro', cost: '$20/user/mo', purpose: 'Vendor database, case tracker, medication reconciliation log' },
    ],
    first90Days: [
      { phase: 'Days 1-30: Map the system', color: 'amber', actions: [
        'Sign engagement letter, HIPAA BAAs, and household-staff privacy agreements',
        'Inventory every property, staff member, vendor, and healthcare provider',
        'Collect medical records from every provider for every family member',
        'Stand up the unified health record and household operations dashboard',
        'Deliver the 30-page Lifestyle Operations Map',
      ] },
      { phase: 'Days 31-60: Operating cadence', color: 'green', actions: [
        'Produce the first Family Medical Passports',
        'Ship 4 Weekly Lifestyle Briefs (Fridays 3 PM)',
        'Run first monthly Lifestyle Committee call',
        'Complete the first vendor-renegotiation round (target: 15-25% reduction on top-10)',
        'Deliver the first Monthly Lifestyle Committee Package',
      ] },
      { phase: 'Days 61-90: Demonstrated value', color: 'gold', actions: [
        'Document concrete saves: caught drug interaction, vendor cost reduction, scheduling conflict resolved',
        'Deliver the first Quarterly Lifestyle Report with vendor-savings tally',
        'Complete the first quarterly medical passport refresh',
        'Launch the longevity/late-life care planning discussion with principal and spouse',
        'Present first-quarter ROI memo: time saved, dollars saved, health outcomes coordinated',
      ] },
    ],
    currentSolutions: [
      { approach: 'House manager handles one property', whyItFails: 'House managers handle property-level operations. They do not coordinate across 4-8 properties, manage the healthcare layer, or operate the committee cadence that keeps the principal informed.' },
      { approach: 'Concierge medicine membership', whyItFails: 'Concierge medicine provides excellent primary care access but does not coordinate across specialists, manage second opinions, or track preventive care for the whole family.' },
      { approach: 'Family member runs coordination', whyItFails: 'A family member with no medical training cannot triage specialist recommendations or run medication reconciliation across 7 providers. A family member in emotional crisis is the worst candidate for the coordination role.' },
    ],
    objections: [
      { objection: 'We already have a house manager', response: 'A house manager runs one property. This sits above all properties and adds the healthcare coordination layer that house managers do not handle.' },
      { objection: 'We have a concierge doctor', response: 'Concierge doctors provide access. This coordinates across every specialist, runs medication reconciliation, and executes the rapid second-opinion protocol that concierge medicine explicitly does not do.' },
      { objection: 'This feels too integrated into our life', response: 'That is the point — the coordination layer only works when it has full visibility. Every engagement starts with a 30-day trial and can be stopped at any time. Trust is earned by the first quarter of concrete saves.' },
    ],
  },
};

/**
 * Build a full ProblemData from an ApiProblem, using the appropriate category
 * template to populate all rich fields. Interpolates problem-specific values
 * (title, wtp_range, buyer_type, wealth tier, trust channel) into the template.
 */
function buildFromApi(p: ApiProblem): ProblemData {
  const tierShort = p.wealth_tier.includes('UHNW') ? 'UHNW' : p.wealth_tier.includes('HNW') ? 'HNW' : p.wealth_tier;
  const tags = [p.pain_category, tierShort, p.lifecycle_stage].filter(Boolean);
  const complianceRisk = p.compliance_risk?.toLowerCase() ?? 'none';
  const tpl = CATEGORY_TEMPLATES[p.pain_category] ?? CATEGORY_TEMPLATES['Wealth Preservation'];
  const titleShort = p.title.length > 40 ? p.title.slice(0, 40) + '…' : p.title;

  // Rough price band inference from wtp_range string (e.g. "$50K-$250K/year" or "$10-25K/mo").
  const priceRangeMatch = p.wtp_range.match(/\$(\d+)(K|M)?\s*[\-–—]\s*\$?(\d+)(K|M)?/i);
  const scale = (v: string, unit: string | undefined): number => {
    const n = parseInt(v, 10);
    if (unit?.toUpperCase() === 'M') return n * 1_000_000;
    return n * 1_000;
  };
  const priceMinInferred = priceRangeMatch ? scale(priceRangeMatch[1], priceRangeMatch[2]) : 5_000;
  const priceMaxInferred = priceRangeMatch ? scale(priceRangeMatch[3], priceRangeMatch[4]) : 50_000;

  return {
    title: p.title,
    tags,
    evidenceCount: p.citation_count,
    narrative: p.description,
    scenario: '',
    scenarioAttribution: '',
    whyWealthy: [
      `${tierShort} families face outsized exposure to ${p.pain_category.toLowerCase()} risks`,
      `High willingness-to-pay signal: ${p.wtp_signal}`,
      `Best reached via ${p.trust_channel}`,
    ],
    credibility: p.credibility_score,
    wtp: p.wtp_range,
    lifecycle: p.lifecycle_stage,
    complianceRisk,
    complianceRiskNote: complianceRisk !== 'none' ? `Compliance risk rated ${p.compliance_risk} — align delivery with applicable fiduciary and regulatory requirements.` : '',
    trendData: Array.from({ length: 12 }, (_, i) => Math.round(20 + i * (p.urgency_score / 2))),
    trendGrowth: `${Math.round(p.composite_score)}%`,
    weeklyHours: `${tpl.timeBreakdown.weeklyHours}h`,
    startupCost: '$200–600',
    timeToFirstClient: '4–8 wks',
    pitchOpener: `Have any of your ${p.buyer_type} contacts mentioned challenges with ${titleShort.toLowerCase()}? We've been seeing a major uptick — I'd love to share what we're doing about it.`,
    quickFacts: [
      { label: 'Evidence credibility', value: `${p.credibility_score}/10 (${p.source_types.join(', ')})` },
      { label: 'Buyer type', value: p.buyer_type },
      { label: 'Compliance risk', value: p.compliance_risk },
      { label: 'Trust channel', value: p.trust_channel },
      { label: 'Composite score', value: `${p.composite_score}` },
    ],
    currentSolutions: tpl.currentSolutions,
    offerName: `${p.pain_category} Operating Partner Retainer`,
    offerTagline: `Expert coordination for ${titleShort.toLowerCase()}`,
    price: p.wtp_range,
    priceMin: priceMinInferred,
    priceMax: priceMaxInferred,
    delivery: 'Advisory + operations',
    steps: tpl.stepsRich.map((s) => ({ title: s.action, description: s.detail })),
    week: {
      Mon: tpl.weekRich[0]?.task ?? 'Operations review',
      Wed: tpl.weekRich[2]?.task ?? 'Deep-dive session',
      Fri: tpl.weekRich[4]?.task ?? 'Principal briefing',
      Monthly: tpl.weekRich[5]?.task ?? 'Monthly review',
    },
    deliverables: tpl.deliverablesRich.map((d) => `${d.name} (${d.frequency.toLowerCase()})`),
    idealClient: {
      who: `${tierShort} families / ${p.buyer_type}`,
      trigger: `Emerging awareness of ${p.pain_category.toLowerCase()} exposure, typically driven by ${p.lifecycle_stage.toLowerCase()} trend`,
      channel: p.trust_channel,
      question: `Who is owning ${titleShort.toLowerCase()} day-to-day for our family?`,
      roi: 'Quantified risk mitigation and operational savings, typically 2–4× retainer in Year 1',
    },
    firstClientPath: [
      `Connect with 3 professionals in the ${p.trust_channel.toLowerCase()} channel. Ask: "Have any clients raised ${p.pain_category.toLowerCase()} concerns recently?"`,
      `Offer a free 30-minute scoping call and a ${tpl.first90Days[0]?.phase.split(':')[0] ?? 'baseline'} assessment. No pitch — just show the gaps.`,
      `After the assessment, present the retainer with a 30-day trial and a concrete Year-1 ROI target based on ${p.wtp_range}.`,
    ],
    objections: tpl.objections,
    simpleStory: p.description,
    simpleExample: '',
    simpleBullets: [
      `Urgency: ${p.urgency_score}/10`,
      `Credibility: ${p.credibility_score}/10`,
      `WTP range: ${p.wtp_range}`,
    ],
    simpleRole: tpl.operatorRole,
    simpleSteps: tpl.stepsRich.map((s) => s.action),
    simpleMonth: tpl.weekRich.slice(0, 4).map((w, i) => `Week ${i + 1}: ${w.task.split('.')[0]}.`).join(' '),
    simpleSellTo: `${tierShort} families reached via ${p.trust_channel.toLowerCase()} who are concerned about ${p.pain_category.toLowerCase()} exposure.`,
    whyWealthyRich: tpl.whyWealthyRich,
    stepsRich: tpl.stepsRich,
    weekRich: tpl.weekRich,
    deliverablesRich: tpl.deliverablesRich,
    timeBreakdown: tpl.timeBreakdown,
    toolsNeeded: tpl.toolsNeeded,
    first90Days: tpl.first90Days,
  };
}

/* ──────────────────────────── Helpers ──────────────────────────── */

const tagColors: Record<string, string> = {
  Security: 'bg-red-900/30 text-red-400',
  UHNW: 'bg-[#C9A84C]/20 text-[#C9A84C]',
  Emerging: 'bg-blue-900/30 text-blue-400',
  Coordination: 'bg-violet-900/30 text-violet-400',
  HNW: 'bg-purple-900/30 text-purple-400',
  Accelerating: 'bg-emerald-900/30 text-emerald-400',
  Privacy: 'bg-cyan-900/30 text-cyan-400',
  Proven: 'bg-purple-900/30 text-purple-400',
  Governance: 'bg-amber-900/30 text-amber-400',
  'Family Office': 'bg-[#C9A84C]/20 text-[#C9A84C]',
  Medical: 'bg-teal-900/30 text-teal-400',
};

const lifecycleIcons: Record<string, string> = {
  Emerging: '\u2191',
  Accelerating: '\u2191\u2191',
  Proven: '\u2713',
  Saturated: '\u2192',
  Declining: '\u2193',
};

/* ──────────────────────────── Component ─────────────────────────── */

export default function ProblemOfferDrawer({
  isOpen,
  onClose,
  problemId,
  problem,
}: ProblemOfferDrawerProps) {
  const [isSimple, setIsSimple] = useState(false);
  const [calcClients, setCalcClients] = useState(3);
  const [calcRate, setCalcRate] = useState(17500);
  const [readinessChecked, setReadinessChecked] = useState(false);
  const [readinessItems, setReadinessItems] = useState([false, false, false]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rightColRef = useRef<HTMLDivElement>(null);
  const resolvedSlug = resolveProblemSlug(problem, problemId);
  const data = (resolvedSlug && PROBLEMS[resolvedSlug]) ?? (problem ? buildFromApi(problem) : null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleScroll = useCallback(() => {
    const el = rightColRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable > 0) {
      setScrollProgress(Math.min((el.scrollTop / scrollable) * 100, 100));
    }
  }, []);

  const toggleReadinessItem = (index: number) => {
    const next = [...readinessItems];
    next[index] = !next[index];
    setReadinessItems(next);
  };

  const allChecked = readinessItems.every(Boolean);

  if (!isOpen || !data) return null;

  const monthlyRevenue = calcClients * calcRate;
  const annualRevenue = monthlyRevenue * 12;

  /* ── Simple Mode ── */
  if (isSimple) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D1117] overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#0D1117]/95 backdrop-blur border-b border-[#1e2a3a] px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setIsSimple(false)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            &larr; Back to full view
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
          {/* Title */}
          <h1 className="text-3xl font-bold text-white leading-tight">{data.title}</h1>

          {/* Story */}
          <div className="space-y-4">
            {data.simpleStory.split('\n\n').map((p, i) => (
              <p key={i} className="text-gray-300 text-base leading-relaxed">{p}</p>
            ))}
          </div>

          {/* Example */}
          {data.simpleExample && (
            <div className="bg-[#1a1f2e] border border-[#2a3040] rounded-lg p-5">
              <p className="text-sm font-medium text-gray-400 mb-2">Real example</p>
              <p className="text-gray-200 text-sm leading-relaxed italic">&ldquo;{data.simpleExample}&rdquo;</p>
            </div>
          )}

          {/* 3 bullets */}
          <ul className="space-y-3">
            {data.simpleBullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-gray-300 text-sm">{b}</span>
              </li>
            ))}
          </ul>

          {/* Offer Card */}
          <div className="bg-emerald-900/20 border border-emerald-800/40 rounded-xl p-6 space-y-5">
            <h2 className="text-xl font-bold text-emerald-400">{data.offerName}</h2>
            <p className="text-emerald-300/80 text-sm">{data.simpleRole}</p>
            <p className="text-3xl font-bold text-white">{data.price}</p>

            {/* Steps */}
            <ol className="space-y-3">
              {data.simpleSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-800 text-emerald-300 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-gray-200 text-sm">{s}</span>
                </li>
              ))}
            </ol>

            {/* Typical month */}
            <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-400 mb-2">Real talk &mdash; what a typical month looks like</p>
              <p className="text-gray-300 text-sm leading-relaxed">{data.simpleMonth}</p>
            </div>

            {/* Who to sell to */}
            <div className="bg-[#161b22] border border-[#2a3040] rounded-lg p-4">
              <p className="text-sm font-medium text-gray-400 mb-2">Who do you sell this to?</p>
              <p className="text-gray-300 text-sm leading-relaxed">{data.simpleSellTo}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-center pb-10">
            <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors">
              Yes &mdash; I want to build this service &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Full Mode ── */
  return (
    <div className="fixed inset-0 z-50 bg-[#0D1117] overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#0D1117]/95 backdrop-blur border-b border-[#1e2a3a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-white">Problem &amp; Offer Deep Dive</h2>
          <button
            onClick={() => setIsSimple(true)}
            className="text-xs px-3 py-1 rounded-full bg-[#1a1f2e] text-gray-400 hover:text-white border border-[#2a3040] hover:border-[#3a4050] transition-colors"
          >
            Simple mode
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[calc(100vh-57px)]">
        {/* ═══ LEFT COLUMN: The Problem ═══ */}
        <div className="border-r border-[#1e2a3a] p-6 lg:p-8 space-y-6 overflow-y-auto">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">The Problem</p>
            <h1 className="text-2xl font-bold text-white leading-tight mb-4">{data.title}</h1>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${tagColors[tag] || 'bg-gray-800 text-gray-400'}`}
                >
                  {tag}
                </span>
              ))}
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#1a1f2e] text-gray-400">
                Backed by {data.evidenceCount} evidence sources
              </span>
            </div>
          </div>

          {/* Narrative */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">What&apos;s actually happening</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{data.narrative}</p>
          </div>

          {/* Scenario */}
          {data.scenario && (
            <div className="bg-[#1a1f2e] border-l-2 border-[#C9A84C] rounded-r-lg p-4">
              <h3 className="text-sm font-semibold text-[#C9A84C] mb-2">Real scenario</h3>
              <p className="text-sm text-gray-300 leading-relaxed italic mb-2">
                &ldquo;{data.scenario}&rdquo;
              </p>
              {data.scenarioAttribution && (
                <p className="text-xs text-gray-500">&mdash; {data.scenarioAttribution}</p>
              )}
            </div>
          )}

          {/* Why wealthy */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Why wealthy households specifically</h3>
            {data.whyWealthyRich && data.whyWealthyRich.length > 0 ? (
              <div className="space-y-2">
                {data.whyWealthyRich.map((reason, i) => (
                  <div
                    key={i}
                    className="bg-[#161b22] border-l-2 border-[#E24B4A]/60 rounded-r-md pl-4 pr-4 py-3 flex items-start gap-3"
                  >
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-[#E24B4A] shrink-0" />
                    <p className="text-sm text-gray-300 leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {data.whyWealthy.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                    <span className="text-sm text-gray-300">{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Compliance risk signal */}
          <div
            className={`rounded-lg p-4 ${
              data.complianceRisk === 'none' || data.complianceRisk === 'low'
                ? 'bg-[#0F2E1A] border border-[#1D9E75]/30'
                : data.complianceRisk === 'medium'
                ? 'bg-[#1f1500] border border-[#BA7517]/30'
                : 'bg-[#1f0d0d] border border-[#E24B4A]/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold ${
                data.complianceRisk === 'none' || data.complianceRisk === 'low'
                  ? 'text-[#1D9E75]'
                  : data.complianceRisk === 'medium'
                  ? 'text-[#BA7517]'
                  : 'text-[#E24B4A]'
              }`}>
                {data.complianceRisk === 'none'
                  ? '\u2713 Compliance: Clear to deliver'
                  : data.complianceRisk === 'low'
                  ? '\u2713 Compliance: Low risk'
                  : data.complianceRisk === 'medium'
                  ? '\u26A0 Compliance: Medium risk'
                  : '\u26D4 Compliance: High risk'}
              </span>
            </div>
            {data.complianceRiskNote && (
              <p className={`text-xs leading-relaxed ${
                data.complianceRisk === 'none' || data.complianceRisk === 'low'
                  ? 'text-[#1D9E75]/80'
                  : data.complianceRisk === 'medium'
                  ? 'text-[#BA7517]/80'
                  : 'text-[#E24B4A]/80'
              }`}>
                {data.complianceRiskNote}
              </p>
            )}
          </div>

          {/* How people solve this today */}
          {data.currentSolutions.length > 0 && <div>
            <h3 className="text-sm font-semibold text-white mb-3">How people solve this today</h3>
            <div className="space-y-3">
              {data.currentSolutions.map((sol, i) => (
                <div key={i} className="bg-[#161b22] border border-[#1e2a3a] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-white">{sol.approach}</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{sol.whyItFails}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>}

          {/* Evidence strip */}
          <div className="bg-[#161b22] rounded-lg p-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Credibility</p>
              <p className="text-lg font-bold text-white">{data.credibility}</p>
              <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(data.credibility / 10) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">WTP</p>
              <p className="text-sm font-bold text-white">{data.wtp}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Lifecycle</p>
              <p className="text-sm font-bold text-white">
                {lifecycleIcons[data.lifecycle] || ''} {data.lifecycle}
              </p>
            </div>
          </div>

          {/* Source quote */}
          {data.sourceQuote && (
            <div className="bg-[#161b22] border border-[#2a3040] rounded-lg p-4">
              <p className="text-xs text-gray-300 italic leading-relaxed">
                &ldquo;{data.sourceQuote}&rdquo;
              </p>
              <p className="text-xs text-gray-500 mt-2">&mdash; {data.sourceAttribution}</p>
            </div>
          )}
        </div>

        {/* ═══ RIGHT COLUMN: The Offer ═══ */}
        <div ref={rightColRef} onScroll={handleScroll} className="relative p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Scroll Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-800 z-10">
            <div
              className="h-full bg-[#C9A84C] transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              The Offer You Build
            </p>
            <h1 className="text-2xl font-bold text-white leading-tight mb-1">{data.offerName}</h1>
            <p className="text-sm text-gray-400">{data.offerTagline}</p>
          </div>

          {/* Price & delivery */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-lg px-4 py-2">
              <p className="text-xs text-[#C9A84C]/70">Price</p>
              <p className="text-lg font-bold text-[#C9A84C]">{data.price}</p>
            </div>
            <div className="bg-[#1a1f2e] border border-[#2a3040] rounded-lg px-4 py-2">
              <p className="text-xs text-gray-500">Delivery</p>
              <p className="text-sm font-semibold text-white">{data.delivery}</p>
            </div>
            {/* Integration Badges */}
            <div className="flex gap-2 w-full">
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-purple-900/30 text-purple-400 border border-purple-800/40">
                VoiceForge &mdash; Persona sim + verified comms
              </span>
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800/40">
                VisionAudio &mdash; Branded deliverables
              </span>
            </div>
          </div>

          {/* Revenue Calculator */}
          <div className="bg-[#161b22] border border-[#1e2a3a] rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Revenue Calculator</p>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-400">Clients</label>
                  <span className="text-xs font-semibold text-white">{calcClients}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={calcClients}
                  onChange={(e) => setCalcClients(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#C9A84C]"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-400">Rate / mo</label>
                  <span className="text-xs font-semibold text-white">${calcRate.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={data.priceMin}
                  max={data.priceMax}
                  step={500}
                  value={calcRate}
                  onChange={(e) => setCalcRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#C9A84C]"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                  <span>${data.priceMin.toLocaleString()}</span>
                  <span>${data.priceMax.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-[#1e2a3a] pt-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Monthly</p>
                <p className="text-xl font-bold text-[#C9A84C]">${monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Annual</p>
                <p className="text-xl font-bold text-emerald-400">${annualRevenue.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.currentTarget.textContent = '✓ Saved to Revenue Dashboard';
                e.currentTarget.disabled = true;
                e.currentTarget.className = e.currentTarget.className.replace('border-[#C9A84C]/40 text-[#C9A84C]', 'border-emerald-700 text-emerald-400');
              }}
              className="w-full mt-3 py-2 text-[10px] border border-[#C9A84C]/40 text-[#C9A84C] rounded-md hover:bg-[#C9A84C]/10 transition disabled:opacity-70"
            >
              Save this projection to Revenue Dashboard →
            </button>
          </div>

          {/* What you actually do */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">What you actually do</h3>
            <div className="space-y-3">
              {data.stepsRich && data.stepsRich.length > 0
                ? data.stepsRich.map((step) => (
                    <div key={step.stepNumber} className="bg-[#161b22] border border-[#1e2a3a] rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-900/60 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-800/50">
                          {step.stepNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{step.action}</p>
                          <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">{step.detail}</p>
                          <div className="mt-2 flex justify-end">
                            <span className="text-[10px] text-gray-500 italic">{step.timeRequired}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : data.steps.map((step, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#1e2a3a] rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{step.title}</p>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Typical week */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Typical week</h3>
            <div className="bg-[#161b22] border border-[#1e2a3a] rounded-lg divide-y divide-[#1e2a3a]">
              {data.weekRich && data.weekRich.length > 0
                ? data.weekRich.map((row, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                      <span className="text-xs font-semibold text-[#C9A84C] w-20 shrink-0 pt-0.5">{row.day}</span>
                      <span className="text-xs text-gray-300 leading-relaxed flex-1">{row.task}</span>
                    </div>
                  ))
                : Object.entries(data.week).map(([day, activity]) => (
                    <div key={day} className="flex items-start gap-3 px-4 py-3">
                      <span className="text-xs font-semibold text-[#C9A84C] w-20 shrink-0 pt-0.5">{day}</span>
                      <span className="text-xs text-gray-300 leading-relaxed flex-1">{activity}</span>
                    </div>
                  ))}
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Deliverables</h3>
            {data.deliverablesRich && data.deliverablesRich.length > 0 ? (
              <div className="space-y-2">
                {data.deliverablesRich.map((d, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#1e2a3a] rounded-lg px-4 py-3">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <p className="text-sm font-semibold text-white">{d.name}</p>
                      <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1a1f2e] text-gray-400 border border-[#2a3040]">
                        {d.frequency}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{d.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.deliverables.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 bg-[#161b22] rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-gray-300">{d}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Time & tools breakdown */}
          {(data.timeBreakdown || (data.toolsNeeded && data.toolsNeeded.length > 0)) && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Time & tools breakdown</h3>
              <div className="bg-[#161b22] border border-[#1e2a3a] rounded-lg p-5 space-y-5">
                {data.timeBreakdown && (
                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-[#C9A84C] leading-none">{data.timeBreakdown.weeklyHours}</span>
                      <span className="text-xs text-gray-400">hours/week total</span>
                    </div>
                    <div className="divide-y divide-[#1e2a3a] border-t border-[#1e2a3a]">
                      {data.timeBreakdown.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                          <span className="text-xs text-gray-300">{item.task}</span>
                          <span className="text-xs font-semibold text-gray-400 tabular-nums">{item.hoursPerWeek}h</span>
                        </div>
                      ))}
                    </div>
                    {data.timeBreakdown.note && (
                      <p className="text-[11px] text-gray-500 italic leading-relaxed mt-3 pt-3 border-t border-[#1e2a3a]">
                        <span className="font-semibold text-gray-400 not-italic">Delegation note: </span>
                        {data.timeBreakdown.note}
                      </p>
                    )}
                  </div>
                )}
                {data.toolsNeeded && data.toolsNeeded.length > 0 && (
                  <div className={data.timeBreakdown ? 'pt-4 border-t border-[#1e2a3a]' : ''}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Tools needed</p>
                    <div className="space-y-2">
                      {data.toolsNeeded.map((t, i) => (
                        <div key={i} className="flex items-start justify-between gap-3 bg-[#0D1117] rounded px-3 py-2 border border-[#1e2a3a]">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">{t.tool}</p>
                            <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{t.purpose}</p>
                          </div>
                          <span className="shrink-0 text-[11px] font-semibold text-[#C9A84C] tabular-nums">{t.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ideal client */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Ideal client profile</h3>
            <div className="bg-[#161b22] border border-[#1e2a3a] rounded-lg p-4 space-y-3">
              {[
                { label: 'Who', value: data.idealClient.who },
                { label: 'Trigger', value: data.idealClient.trigger },
                { label: 'Channel', value: data.idealClient.channel },
                { label: 'Key question', value: data.idealClient.question },
                { label: 'ROI argument', value: data.idealClient.roi },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-gray-500 w-24 shrink-0">{item.label}</span>
                  <span className="text-xs text-gray-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Your first 90 days */}
          {data.first90Days && data.first90Days.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Your first 90 days</h3>
              <div className="space-y-3">
                {data.first90Days.map((phase, i) => {
                  const borderColor =
                    phase.color === 'amber'
                      ? 'border-l-[#BA7517]'
                      : phase.color === 'green'
                      ? 'border-l-[#1D9E75]'
                      : 'border-l-[#C9A84C]';
                  const titleColor =
                    phase.color === 'amber'
                      ? 'text-[#BA7517]'
                      : phase.color === 'green'
                      ? 'text-[#1D9E75]'
                      : 'text-[#C9A84C]';
                  return (
                    <div
                      key={i}
                      className={`bg-[#0D1117] border border-[#1e2a3a] border-l-4 ${borderColor} rounded-r-lg p-4`}
                    >
                      <p className={`text-xs font-bold uppercase tracking-wider ${titleColor} mb-3`}>{phase.phase}</p>
                      <ul className="space-y-1.5">
                        {phase.actions.map((action, j) => (
                          <li key={j} className="flex items-start gap-2.5">
                            <svg
                              className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${titleColor}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-xs text-gray-300 leading-relaxed">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* First Client Pathway */}
          <div className="border border-emerald-800/40 rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">First client pathway</h3>
            {data.firstClientPath.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-900/60 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-800/50">
                  {i + 1}
                </span>
                <p className="text-xs text-gray-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          {/* Objection Handling */}
          <div className="bg-[#161b22] border border-[#1e2a3a] rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Objection Handling</p>
            {data.objections.map((obj, i) => (
              <div key={i} className="space-y-1.5">
                <p className="text-xs text-gray-400 italic">&ldquo;{obj.objection}&rdquo;</p>
                <div className="bg-emerald-900/10 border border-emerald-800/30 rounded px-3 py-2">
                  <p className="text-xs text-emerald-300">{obj.response}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Readiness Gate */}
          <div className="pt-2 pb-8 space-y-4">
            {!readinessChecked ? (
              <>
                <div className="bg-[#161b22] border border-[#1e2a3a] rounded-lg p-5 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Before you build</p>
                  {[
                    'I have at least 5 hours/week available',
                    'I can access estate attorneys or private bankers',
                    'I understand the compliance notes above',
                  ].map((label, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={readinessItems[i]}
                        onChange={() => toggleReadinessItem(i)}
                        className="w-4 h-4 rounded border-gray-600 bg-[#0D1117] text-[#C9A84C] accent-[#C9A84C] cursor-pointer"
                      />
                      <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
                    </label>
                  ))}
                </div>
                {allChecked && (
                  <button
                    onClick={() => setReadinessChecked(true)}
                    className="w-full px-6 py-3 bg-[#C9A84C] hover:bg-[#d4b65c] text-black font-semibold text-sm rounded-lg transition-colors"
                  >
                    I&apos;m ready &mdash; Build this offer &rarr;
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-2.5 bg-[#C9A84C] hover:bg-[#d4b65c] text-black font-semibold text-sm rounded-lg transition-colors">
                  Build this offer now &rarr;
                </button>
                <button className="px-5 py-2.5 border border-[#2a3040] text-gray-400 hover:text-white hover:border-[#3a4050] text-sm rounded-lg transition-colors">
                  Save for later
                </button>
                <button className="px-5 py-2.5 border border-[#2a3040] text-gray-400 hover:text-white hover:border-[#3a4050] text-sm rounded-lg transition-colors">
                  Validate first
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}