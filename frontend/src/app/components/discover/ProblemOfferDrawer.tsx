'use client';

import { useEffect, useState, useCallback } from 'react';

/* ───────────────────────────── Types ───────────────────────────── */

interface ProblemOfferDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string;
}

interface OfferStep {
  title: string;
  description: string;
}

interface IdealClient {
  who: string;
  trigger: string;
  channel: string;
  question: string;
  roi: string;
}

interface WeekSchedule {
  [key: string]: string;
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
  /* RIGHT — The Offer */
  offerName: string;
  offerTagline: string;
  price: string;
  delivery: string;
  steps: OfferStep[];
  week: WeekSchedule;
  deliverables: string[];
  idealClient: IdealClient;
  /* Simple-mode extras */
  simpleStory: string;
  simpleExample: string;
  simpleBullets: string[];
  simpleRole: string;
  simpleSteps: string[];
  simpleMonth: string;
  simpleSellTo: string;
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
    sourceQuote:
      'AI is being used to increase the speed and believability of phishing and impersonation, including voice/video cloning',
    sourceAttribution: 'FBI Alert IC3-2025',
    offerName: 'Family Cybersecurity & Identity Command Center',
    offerTagline: "24/7 protection for your family\u2019s digital identity and financial communications",
    price: '$10,000 \u2013 $25,000/month',
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
    offerName: 'Private Operations Office',
    offerTagline: 'One command center for your entire household and lifestyle',
    price: '$15,000 \u2013 $30,000/month',
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
    sourceQuote:
      'Data broker information has been directly linked to stalking, harassment, and physical threats against high-profile individuals',
    sourceAttribution: 'Privacy Rights Clearinghouse, 2025 Report',
    offerName: 'Digital Footprint Erasure & Monitoring Service',
    offerTagline: 'Continuously remove your family from data brokers and monitor for new exposure',
    price: '$8,000 \u2013 $20,000/month',
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
    sourceQuote:
      '72% of family offices have no formal risk framework that addresses non-investment risks',
    sourceAttribution: 'Deloitte Family Office Risk Survey, 2025',
    offerName: 'Family Office Risk & Governance Audit Practice',
    offerTagline: 'Identify and close the non-investment risks that destroy multi-generational wealth',
    price: '$12,000 \u2013 $28,000/month',
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
    sourceQuote:
      'Concierge medicine addresses access but not coordination \u2014 the real gap is someone who manages the full clinical picture across providers',
    sourceAttribution: 'Journal of Private Healthcare Management, 2025',
    offerName: 'Family Health Concierge & Care Coordination',
    offerTagline: 'One trusted advisor who manages your family\u2019s complete health picture across every provider',
    price: '$10,000 \u2013 $22,000/month',
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
  },
};

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
}: ProblemOfferDrawerProps) {
  const [isSimple, setIsSimple] = useState(false);
  const data = PROBLEMS[problemId];

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

  if (!isOpen || !data) return null;

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
          <div className="bg-[#1a1f2e] border border-[#2a3040] rounded-lg p-5">
            <p className="text-sm font-medium text-gray-400 mb-2">Real example</p>
            <p className="text-gray-200 text-sm leading-relaxed italic">&ldquo;{data.simpleExample}&rdquo;</p>
          </div>

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
          <div className="bg-[#1a1f2e] border-l-2 border-[#C9A84C] rounded-r-lg p-4">
            <h3 className="text-sm font-semibold text-[#C9A84C] mb-2">Real scenario</h3>
            <p className="text-sm text-gray-300 leading-relaxed italic mb-2">
              &ldquo;{data.scenario}&rdquo;
            </p>
            <p className="text-xs text-gray-500">&mdash; {data.scenarioAttribution}</p>
          </div>

          {/* Why wealthy */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Why wealthy households specifically</h3>
            <ul className="space-y-2">
              {data.whyWealthy.map((reason, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                  <span className="text-sm text-gray-300">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

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
        <div className="p-6 lg:p-8 space-y-6 overflow-y-auto">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              The Offer You Build
            </p>
            <h1 className="text-2xl font-bold text-white leading-tight mb-1">{data.offerName}</h1>
            <p className="text-sm text-gray-400">{data.offerTagline}</p>
          </div>

          {/* Price & delivery */}
          <div className="flex items-center gap-4">
            <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-lg px-4 py-2">
              <p className="text-xs text-[#C9A84C]/70">Price</p>
              <p className="text-lg font-bold text-[#C9A84C]">{data.price}</p>
            </div>
            <div className="bg-[#1a1f2e] border border-[#2a3040] rounded-lg px-4 py-2">
              <p className="text-xs text-gray-500">Delivery</p>
              <p className="text-sm font-semibold text-white">{data.delivery}</p>
            </div>
          </div>

          {/* What you actually do */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">What you actually do</h3>
            <div className="space-y-3">
              {data.steps.map((step, i) => (
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
              {Object.entries(data.week).map(([day, activity]) => (
                <div key={day} className="flex items-start gap-3 px-4 py-2.5">
                  <span className="text-xs font-semibold text-[#C9A84C] w-20 shrink-0">{day}</span>
                  <span className="text-xs text-gray-300">{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Deliverables</h3>
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
          </div>

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

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2 pb-8">
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
        </div>
      </div>
    </div>
  );
}