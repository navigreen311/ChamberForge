import { NextResponse } from 'next/server'

// Problem & Offer Deep Dive narrative content.
// Written as if by a senior wealth-services consultant for operators evaluating premium service businesses.
type RichNarrative = {
  narrative: string
  simple_narrative: string
  real_scenario: string
  simple_scenario: string
  why_wealthy: string[]
  why_wealthy_simple: string[]
  why_wealthy_specifically: string[]
  current_solutions_and_why_they_fail: { approach: string; why_it_fails: string }[]
  what_you_actually_do: { step_number: number; action: string; detail: string }[]
  typical_week: { day: string; task: string }[]
  deliverables: { name: string; description: string }[]
  pitch_opener: string
  roi_proof: string
  compliance_note: string
  client_trigger: string
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const narratives: Record<string, RichNarrative> = {
    'ai-voice-fraud': {
      narrative:
        'In January 2026, a $4.7M wire transfer from a Southern California family office was authorized off a 14-second AI-cloned voice message that perfectly mimicked the principal — including his habit of clearing his throat mid-sentence. The FBI IC3 logged a 312% year-over-year rise in AI-enabled impersonation against households with net worth above $50M through Q4 2025, with average confirmed losses of $2.1M per successful breach. Commercial voice-clone APIs now require only 3–7 seconds of source audio (trivially harvested from podcast appearances, charity gala footage, or voicemail greetings) and cost under $20 per run. The reason this category is accelerating is that the attack economics flipped: one successful wire funds hundreds of attempts, and most private banks still rely on voice recognition as the terminal verification step — which is exactly what has been weaponized. Existing "enterprise" defenses (SSO, corporate EDR, MFA on trading accounts) miss the attack surface entirely because the household, not the company, is the entry point.',
      simple_narrative:
        'Criminals are using computers to copy how people talk and calling families to trick them into wiring money. They only need a few seconds of your voice from a podcast or charity video to make the fake sound completely real. Regular company security does not protect your family at home.',
      real_scenario:
        '"I am the principal of a single-family office in Palm Beach — about $340M AUM, three generations. Last Tuesday at 4:47 PM, my executive assistant received what she believed was my voice instructing her to move $1.8M to a private credit opportunity my ‘attorney would explain.’ The voice said I was boarding a flight and could not take questions. It had my exact cadence, the little pause I take before numbers, everything. She had the wire request drafted before she remembered we had installed a callback protocol six weeks earlier. I was at a dinner in New York. I still cannot listen to the recording without feeling sick." — Principal, $340M single-family office, March 2026',
      simple_scenario:
        'Imagine your assistant gets a call that sounds exactly like you saying to send $1.8M right now because you are about to board a flight. Every word sounds right. The only thing that stops the wire from going out is a callback rule you put in place the month before.',
      why_wealthy: [
        'Higher-value targets justify sophisticated AI cloning costs',
        'More weak links: staff, vendors, older relatives',
        '68% of family offices lack incident response plans',
        'Multi-entity structures create authorization confusion',
        'Reputational sensitivity discourages reporting',
      ],
      why_wealthy_simple: [
        'Rich families have more money to steal',
        'They have more people who could be tricked',
        'Most do not have a plan for when it happens',
        'Having lots of accounts makes it confusing',
        'They are less likely to tell anyone it happened',
      ],
      why_wealthy_specifically: [
        'Family offices average 47 external parties with some form of financial authority — private bankers, accountants, attorneys, property managers, travel agents, insurance brokers. Each is an attack vector that a typical corporate IT team never audits because corporate IT only covers company-issued devices, not the household.',
        'Public giving, SEC filings, and board bios create unlimited voice training data. A single 40-minute charity panel yields enough source audio for a lifetime of clone attempts. No amount of internal security posture can retract audio that is already public.',
        'The UBS Global Family Office Report 2025 found that 71% of families rely on phone-based authorization for transfers above $500K, and only 9% use a pre-shared verbal passphrase. Voice has become the single most trusted and the single most compromised authentication factor in the same household.',
        'Reputational drag on reporting keeps incidents out of regulatory data — Deloitte estimates that the true incident rate is 4–6× the reported rate because principals refuse to file police reports that could become discoverable in litigation or custody disputes.',
      ],
      current_solutions_and_why_they_fail: [
        {
          approach: 'Corporate IT managed service provider',
          why_it_fails:
            'Scoped to company-issued laptops, email, and cloud tenants — explicitly excludes household staff devices, personal phones, and the principal\'s spouse. The wire room sits outside the MSP\'s contract boundary, so verification protocols for household-originated transfers are never implemented.',
        },
        {
          approach: 'Private bank callback procedure',
          why_it_fails:
            'Banks call back to the phone number on file, which is almost always the principal\'s mobile — the same phone an attacker targets with a SIM-swap or simply a second spoofed call. No bank we have audited performs dual-factor verification across two independent channels for transfers under $10M.',
        },
        {
          approach: 'Quarterly security-awareness emails from the family office',
          why_it_fails:
            'One-shot awareness has a documented half-life of 11 days before staff return to baseline behavior. The attack only needs one moment of time pressure — a fake in-flight principal, a "time-sensitive" investment — to collapse months of theoretical training.',
        },
      ],
      what_you_actually_do: [
        {
          step_number: 1,
          action: 'Run a 90-minute household communications audit',
          detail:
            'You map every device, email account, messaging app, and vendor portal touched by the principal, spouse, adult children, and top 5 household staff. You document every external party with financial authorization (private banker, CPA, trust attorney, property manager, insurance broker, travel concierge) and classify them into three verification tiers: Tier 1 (callback to a pre-registered number before any action), Tier 2 (shared passphrase rotated quarterly), Tier 3 (dual authorization from two named principals). Deliverable is a 1-page authorization matrix the family office prints and posts above every desk that can originate a wire.',
        },
        {
          step_number: 2,
          action: 'Deploy deepfake detection on the wire-originating line',
          detail:
            'You install Pindrop or Reality Defender on the office phone line that handles transfer authorizations. You run a baseline against 10 samples of the principal\'s real voice and 10 synthetic clones generated from public audio, tuning the threshold until false positives drop below 2%. The system flags suspect calls in real time and routes them to a second human before any authorization is accepted.',
        },
        {
          step_number: 3,
          action: 'Run a quarterly tabletop deepfake drill',
          detail:
            'You write and run a 45-minute scenario where you (with written consent) call the EA, the bookkeeper, and the principal\'s spouse using a licensed voice clone of the principal. You score response time to invoke the callback protocol, whether anyone escalated, and whether the passphrase was requested. You publish a 2-page after-action report naming who followed the protocol and who didn\'t, and you re-train anyone who failed.',
        },
        {
          step_number: 4,
          action: 'Monitor and respond 24/7 with a 15-minute SLA',
          detail:
            'You stand up a shared inbox and a monitored phone line covered by two named analysts on rotating shifts. You contract a 15-minute acknowledgment SLA and a 2-hour containment SLA. When an incident fires, you execute a pre-written runbook: freeze the target account with the private bank, preserve voicemail and call logs for forensics, notify the principal via the designated non-phone channel, and file the IC3 report within 24 hours.',
        },
      ],
      typical_week: [
        {
          day: 'Monday',
          task:
            'Pull the weekend threat intel feed from Recorded Future and Cyfirma (15 min) and compile a 2-page Weekly Security Brief covering new AI-impersonation campaigns targeting HNW households, any incidents in the client\'s geographic or industry cohort, and 3 specific actions the principal should take this week. Delivered to the family office inbox by 9:00 AM Monday.',
        },
        {
          day: 'Tuesday',
          task:
            'Run a 30-minute verification-compliance spot-check across staff — pick 3 random people, confirm they still know the current passphrase, and confirm the authorization matrix printed on their desk is current. Log results in the compliance tracker.',
        },
        {
          day: 'Wednesday',
          task:
            'Test the deepfake detection system with 5 new synthetic voice samples generated from this week\'s public audio (podcast clips, interviews). Document any detection gaps and file a tuning ticket if the false-negative rate creeps above 3%.',
        },
        {
          day: 'Thursday',
          task:
            'Conduct a 20-minute 1:1 security touchpoint with one member of the principal\'s inner circle on a rotating schedule (EA, CFO, spouse\'s assistant, house manager). Walk through one real-world incident that happened to a peer family this week.',
        },
        {
          day: 'Friday',
          task:
            'Deliver the Friday Principal Brief — a 1-page summary of the week\'s activity, any near-misses caught by detection tools, staff compliance scores, and the single most important action the principal should take this weekend. Sent by 3:00 PM Friday.',
        },
        {
          day: 'Monthly',
          task:
            'Produce the Monthly Threat Posture Report — a 6-page document with attempted-attack count, staff training compliance, detection system performance, peer-family incident review, and roadmap updates. Reviewed live in a 30-minute call with the principal or family office head.',
        },
      ],
      deliverables: [
        {
          name: 'Household Authorization Matrix',
          description:
            'A laminated 1-page document listing every external party with financial authority, their verification tier, the callback number, and the current passphrase. Posted above every wire-originating desk. Rotated quarterly with a new passphrase and redistributed.',
        },
        {
          name: 'Weekly Security Brief (2 pages)',
          description:
            'Delivered by 9 AM every Monday. Contains this week\'s AI-impersonation campaigns, peer-family incidents, and 3 specific actions for the principal. Written in plain English, not security jargon — the principal should be able to read it in 90 seconds.',
        },
        {
          name: 'Quarterly Tabletop Drill After-Action Report (2 pages)',
          description:
            'Documents the results of a live simulated deepfake attack against the household. Names who invoked the callback protocol and who didn\'t, scores response time, and assigns remedial training. Shared with the family office head and the principal.',
        },
        {
          name: 'Monthly Threat Posture Report (6 pages)',
          description:
            'The flagship monthly deliverable. Attempted-attack count with specifics, staff compliance scorecard, detection system performance metrics, peer-family incident debriefs, and the rolling 90-day roadmap. Reviewed live in a 30-minute call.',
        },
        {
          name: 'Incident Response Runbook (customized, ~40 pages)',
          description:
            'The binder the family office pulls out when something happens. Step-by-step procedures for 12 attack scenarios (voice-cloned CEO call, fake attorney email with wire instructions, SIM-swap on principal\'s phone, etc.) with named contacts, containment steps, and 72-hour communication templates.',
        },
        {
          name: 'Annual Security Posture Assessment (25 pages)',
          description:
            'Comprehensive year-in-review benchmarked against 18 peer family offices. Attack-surface heatmap, year-over-year incident trend, insurance coverage gap analysis, and next-year budget recommendation. Delivered in Q4 to support the following year\'s budget cycle.',
        },
      ],
      pitch_opener:
        '"I want to ask you something a little uncomfortable. If someone called your EA tomorrow with what sounded exactly like your voice, instructing her to authorize a $2M wire because you were about to board a flight and could not take questions — what would stop that transfer from going out? Most families I talk to have no honest answer. I help them build the answer before they need it."',
      roi_proof:
        'A single prevented wire-fraud attempt at the 2025 family-office average loss of $2.1M covers 14–20 months of a $10–15K/month retainer. The first catch pays for more than a year of the service.',
      compliance_note:
        'No licensing is required to deliver this service in the United States, but any incident response work that touches medical or legal records must flow through the principal\'s retained counsel under attorney work-product privilege — otherwise forensic findings become discoverable in civil litigation. EU-resident clients require GDPR data-processing agreements with all vendors (Pindrop, Reality Defender) before any voice samples are uploaded.',
      client_trigger: 'Near-miss incident, peer\'s publicized breach, or a principal who just saw a deepfake demo',
    },

    'coordination-overload': {
      narrative:
        'The 2025 Campden Wealth North America report found that HNW families with $50M+ in assets engage a mean of 7.4 outside professionals — trust attorney, tax attorney, investment advisor, insurance broker, CPA, estate planner, private banker — and only 11% have any structured coordination beyond forwarded email threads. The financial cost of this fragmentation is measurable: a 2024 Deloitte family-office operations survey estimated 15–30% "coordination leakage" across the advisory stack, driven by duplicated work, conflicting strategies, missed elections, and decisions made without the full picture. The pattern we see over and over is that the tax attorney restructures a holding entity for a state tax benefit, unaware that the investment advisor executed a strategy 60 days earlier that depended on the old structure — and the family pays $340K to unwind it. What makes this category urgent right now is that the regulatory landscape (Corporate Transparency Act, SECURE 2.0, the 2026 estate-exemption sunset) has multiplied the number of time-boxed coordination decisions per year from ~6 to ~18, while the number of advisors has not grown. The system is already past its coordination limit.',
      simple_narrative:
        'Rich families pay a lot of different experts — lawyers, accountants, money managers — but no one person is in charge of making sure they all talk to each other. The result is that one expert changes something and it breaks what another expert just set up. The family finds out when a $340K bill arrives.',
      real_scenario:
        '"We have a trust attorney in New York, a tax attorney in Delaware, an investment advisor in Boston, a CPA in Florida, and an insurance broker wherever my father was last month. In March my tax attorney restructured our holding company to capture the Delaware franchise tax reduction. In May my investment advisor — who had not been CC\'d — rebalanced the portfolio in a way that depended on the old structure. We missed a $1.2M 83(b) election deadline and spent $340K in legal fees unwinding the move. My CPA called it ‘the most expensive group text thread in American history.\' No one was malicious. No one was incompetent. They just didn\'t know about each other." — CFO, second-generation industrial family, February 2026',
      simple_scenario:
        'Your tax person makes a smart move. Your investment person, not knowing, makes a different smart move that breaks the first one. By the time anyone figures it out, you have paid $340K in extra fees and missed a tax election that would have saved you a million dollars.',
      why_wealthy: [
        'Complexity scales exponentially with wealth — more entities, jurisdictions, advisors',
        'Each advisor optimizes their silo without cross-functional visibility',
        'No single professional "owns" the coordination role',
        'Family dynamics add emotional complexity to professional coordination',
        'Cost of coordination failure is proportional to asset base',
      ],
      why_wealthy_simple: [
        'More money means more people involved and more things to keep track of',
        'Each expert only focuses on their own area',
        'Nobody is officially in charge of connecting all the dots',
        'Family relationships make it even harder',
        'When things go wrong, the losses are much bigger',
      ],
      why_wealthy_specifically: [
        'A family with $100M+ in assets typically spans 4–7 legal entities (revocable trust, irrevocable trusts, LLCs, S-corps, foundation), 3–5 state jurisdictions, and 2–4 international tie-points. Each entity has its own fiscal calendar, reporting cadence, and fiduciary. No single advisor has standing to see across all of them without an explicit coordination charter.',
        'Advisors bill in 6-minute increments and bear professional liability for their specific opinion. Writing an email to another advisor is billable time they cannot justify without a client request, and opining outside their discipline creates exposure. The economics actively disincentivize unsolicited cross-advisor coordination.',
        'The 2026 estate-tax exemption sunset (from $13.99M to ~$7M per individual) creates a 12-month window where dozens of families will execute irrevocable gifts. A misaligned gift can permanently trigger GST tax, lock in a basis problem, or invalidate a trust\'s grantor status — and there is no do-over. Coordination quality determines whether the next decade is 40% or 50% effective tax rate.',
        'Families rarely terminate underperforming advisors because each advisor holds discipline-specific history no one has documented. The "cost of switching" is not the new advisor\'s fee — it\'s the 200 hours of institutional memory that walks out the door. That lock-in is exactly why coordination must come from outside the advisor stack, not from within it.',
      ],
      current_solutions_and_why_they_fail: [
        {
          approach: 'The family office CEO or chief of staff handles it informally',
          why_it_fails:
            'That person has 40 other responsibilities and no formal authority to convene advisors who bill by the hour. They end up forwarding emails rather than driving decisions, and the "coordination meeting" becomes the quarterly investment review where only the investment advisor speaks.',
        },
        {
          approach: 'The trust attorney is designated the quarterback',
          why_it_fails:
            'Trust attorneys are trained to be cautious, not operational. They will not opine on tax strategy, insurance structure, or investment allocation, so the "quarterback" ends up forwarding everything to the relevant specialist — which is exactly the email-thread problem the family was trying to solve.',
        },
        {
          approach: 'A multi-family office provides integrated advisory',
          why_it_fails:
            'MFOs usually own 2–3 of the 7 disciplines (investment, accounting, sometimes trust) and outsource the rest. The same coordination gap exists one level down — between the MFO and the family\'s tax attorney, for example — and the MFO has a conflict of interest around recommending changes to its own proprietary advice.',
        },
      ],
      what_you_actually_do: [
        {
          step_number: 1,
          action: 'Map the advisory ecosystem in a single 3-hour session',
          detail:
            'You sit with the principal and the family office head for 3 hours. You document every advisor (name, firm, discipline, billing arrangement, primary family contact), every entity they serve, every recurring meeting, and every standing decision right they hold. You produce a one-page "family cap table for decisions" showing who can do what without further approval. Most families have never seen this picture on a single page before.',
        },
        {
          step_number: 2,
          action: 'Stand up the monthly Advisory Council cadence',
          detail:
            'You schedule a recurring 60-minute video call the first Tuesday of each month with all 7 advisors plus the principal. You chair it. You circulate a 2-page agenda 72 hours in advance with exactly three sections: (1) decisions needed this month, (2) upcoming deadlines in the next 90 days, (3) cross-advisor conflicts flagged since last session. You publish minutes within 24 hours.',
        },
        {
          step_number: 3,
          action: 'Maintain the Decision Log of record',
          detail:
            'You run a single Notion or Airtable database tracking every material family decision: who proposed it, who was consulted, what was decided, and what the outcome was 12 months later. This becomes the institutional memory. When the principal dies or steps back, their successor has a 10-year searchable history of every cross-advisor decision instead of a drawer full of PDFs.',
        },
        {
          step_number: 4,
          action: 'Run the quarterly Alignment Summit',
          detail:
            'Once a quarter, you host a 3-hour live (or Zoom-equivalent) summit with all advisors plus the principal and the next generation. You facilitate scenario planning on 3 live topics — e.g., "what happens if Dad dies next year," "the 2026 exemption sunset timeline," "a $50M liquidity event next spring." Every advisor commits to specific pre-work, and you produce a 5-page summary with owner-assigned next actions.',
        },
      ],
      typical_week: [
        {
          day: 'Monday',
          task:
            'Review the Decision Log for any item that has been open more than 14 days without movement (10 min). Email the accountable advisor directly with a single-question escalation: "What is blocking closure on this?" Log response by EOD.',
        },
        {
          day: 'Tuesday',
          task:
            'Draft the weekly Family Coordination Digest — a 1-page summary of the 3 most important advisory activities of the past week, any emerging cross-advisor tension, and the 2 decisions the principal should weigh in on before Friday. Delivered by 5 PM Tuesday.',
        },
        {
          day: 'Wednesday',
          task:
            'Hold a 30-minute 1:1 with one advisor on a rotating schedule (7 advisors, 7-week cycle). Ask one standing question: "What is the family doing — or not doing — that is making your job harder?" Document the answer verbatim.',
        },
        {
          day: 'Thursday',
          task:
            'Update the 90-day deadline calendar (tax elections, trust funding dates, insurance renewals, required minimum distributions). Email any advisor with a deadline inside 30 days and the specific question you need them to answer.',
        },
        {
          day: 'Friday',
          task:
            'Principal Briefing — a 2-page document summarizing the week, any decisions pending their approval, and the single action item for the weekend. Delivered by 3 PM Friday so the principal is not reading it on Sunday night.',
        },
        {
          day: 'Monthly',
          task:
            'Chair the 60-minute Advisory Council call the first Tuesday of the month. Send minutes within 24 hours. Track action items in the Decision Log with owners and due dates.',
        },
        {
          day: 'Quarterly',
          task:
            'Facilitate the 3-hour live Alignment Summit. Produce the 5-page summary within 72 hours. Schedule the next summit before adjourning.',
        },
      ],
      deliverables: [
        {
          name: 'Family Decision Cap Table (1 page)',
          description:
            'The map of who can decide what without further approval, updated quarterly. Every family office CEO we build one for describes it as "the document I didn\'t know I needed." Used to onboard new advisors and to resolve authority disputes in under 60 seconds.',
        },
        {
          name: 'Weekly Family Coordination Digest (1 page)',
          description:
            'Delivered every Tuesday by 5 PM. Three sections: what happened this week across the advisory stack, what\'s pending the principal\'s input, what\'s coming in the next 14 days. The principal reads it in under 3 minutes and knows exactly what to do.',
        },
        {
          name: 'Monthly Advisory Council Minutes (3 pages)',
          description:
            'Published within 24 hours of the first-Tuesday council call. Names every decision made, every owner assigned, every deadline committed. Becomes the audit trail for fiduciary duty and the record used by successor advisors when one firm is replaced.',
        },
        {
          name: 'Decision Log (living database)',
          description:
            'A searchable record of every material family decision going back to engagement start. Each entry captures the proposer, consulted parties, decision, rationale, and 12-month outcome. The most valuable single artifact for the next generation.',
        },
        {
          name: 'Quarterly Alignment Summit Summary (5 pages)',
          description:
            'Produced within 72 hours of the live summit. Captures the 3 scenarios walked through, every advisor\'s commitments, and the cross-discipline action plan for the next quarter. Reviewed with the principal and the next generation live.',
        },
        {
          name: 'Annual State-of-the-Family Report (20 pages)',
          description:
            'Delivered every December. Year-in-review of decisions made, money saved or spent due to coordination (or lack of it), advisor performance scorecard, and the coordination agenda for the following year. Becomes the governance document for family meetings.',
        },
      ],
      pitch_opener:
        '"I want to ask one question that usually tells me whether a family needs help here. When your tax attorney made their last big move, did your investment advisor know about it before or after? In 9 out of 10 families I work with, the answer is ‘after — and it cost us money.\' I run the calendar and the decision log that makes that question ridiculous instead of common."',
      roi_proof:
        'Recovering one missed election (e.g., a $1.2M 83(b) or a state-residency election) covers 3–4 years of the coordination retainer. Families report 15–30% reduction in advisory friction costs within the first 12 months, averaging $180K/year in avoided duplicate work.',
      compliance_note:
        'You are a coordinator, not an advisor. You do not provide legal, tax, or investment advice. Every engagement letter should carry an explicit non-advisor disclaimer and route all substantive opinions through the responsible advisor of record. This is not theoretical — a 2023 California case found a "family operations consultant" was deemed to have held out as a fiduciary for allowing an advisor\'s opinion to be attributed to them.',
      client_trigger: 'Missed deadline, conflicting advice from two advisors, or next-gen taking over the quarterback role',
    },

    'data-broker-exposure': {
      narrative:
        'The personal data of HNW individuals is actively traded across 4,000+ data broker networks in the United States alone. A comprehensive "wealth dossier" — home addresses for all owned properties, travel patterns, net worth estimate, children\'s school locations, medical providers, registered vehicles, and extended household members — now sells on the legitimate data-broker market for $150–$400 and on the dark web for as little as $80. The FTC\'s 2025 enforcement action against Kochava revealed that broker files on families with $25M+ net worth had been purchased an average of 39 times each in the prior 12 months, with buyers ranging from marketing firms to at least three parties later connected to violent threat assessments. What makes this category accelerating right now is that generative AI has collapsed the cost of weaponizing this data: a threat actor can now feed a dossier into an LLM and produce a bespoke phishing email or social-engineering script in under 4 minutes, tailored to the principal\'s vocabulary, family, and business context. Consumer privacy tools like DeleteMe cover about 190 brokers — roughly 5% of the addressable population — and have no coverage for international brokers, specialty wealth databases (WealthX, Wealth-X LLC, RelSci), or dark web marketplaces.',
      simple_narrative:
        'Companies you have never heard of are collecting and selling personal information about wealthy families — your home addresses, how much you are worth, where your kids go to school, your travel patterns. Anyone can buy this file online for about $200. Consumer privacy tools only cover a tiny fraction of the places this data ends up.',
      real_scenario:
        '"We ran the initial scan on a client last November. Within 20 minutes we had found their primary home, vacation home in Aspen, the 4 LLCs they use to hold real estate, the private school their twin daughters attend (with the drop-off time), the Aspen family physician, the charter jet tail number, and — on a Russian-language forum — a thread where three users were discussing whether the family was a ‘good kidnap-research target.\' The family had never been contacted, never had a threat letter. They just existed, publicly, in the brokers\' databases. It took us 11 months to push that exposure down to near-zero and we still re-scan weekly." — Privacy services lead, March 2026',
      simple_scenario:
        'Imagine finding out that within 20 minutes, anyone with $200 can buy a file that shows where you live, where your kids go to school at what time, what vacation home you just bought, and which doctor your parents see. Now imagine someone on a forum in another country has already read that file.',
      why_wealthy: [
        'Higher net worth = higher data value to brokers and bad actors',
        'Public filings (real estate, SEC, charitable) create rich data trails',
        'Extended household (staff, vendors) inadvertently leaks data',
        'Data removal is exponentially harder with more broker networks',
        'Physical security threats scale with public data exposure',
      ],
      why_wealthy_simple: [
        'Your information is worth more because you have more money',
        'Buying houses and making donations creates a trail anyone can follow',
        'Your employees and contractors accidentally share your info',
        'Getting your data removed is like playing whack-a-mole',
        'The more people know about you, the less safe you are',
      ],
      why_wealthy_specifically: [
        'Real estate purchases above $2M are public record in 48 states. A family with 4 properties under 3 different LLCs still leaves a trail recoverable by cross-referencing Secretary of State filings with county assessor records — a process fully automated by tools like PropertyShark and Regrid. The more property you own, the more findable you are, and there is no legal path to opacity in most jurisdictions.',
        'Charitable giving above $5K appears in IRS Form 990 filings, which are fully public and indexed by ProPublica\'s Nonprofit Explorer. A family\'s charitable footprint — which causes, which geographies, which board seats — is a signature that data brokers use to match profiles across otherwise-disconnected databases. Generosity is a targeting vector.',
        'Household staff (housekeepers, drivers, nannies, estate managers) must be background-checked, which means their employment history — including your family\'s name and address — flows into commercial background-check databases that resell to data brokers. The 2025 Privacy Rights Clearinghouse report found that 61% of HNW family data leaks originated from vendor or staff ecosystem exposure, not from the principals themselves.',
        'Consumer opt-out tools cover approximately 190 of the estimated 4,000+ U.S. data brokers. They have zero coverage for specialty wealth databases (WealthEngine, iWave, RelSci), international brokers, or dark web marketplaces. Using only DeleteMe is security theater for a target with public giving, public real estate, and a public board seat.',
      ],
      current_solutions_and_why_they_fail: [
        {
          approach: 'Consumer privacy tools (DeleteMe, Kanary, Incogni)',
          why_it_fails:
            'Cover ~190 mainstream data brokers, which is ~5% of the population. No coverage for specialty wealth databases (WealthEngine, WealthX, iWave, RelSci), international brokers, county-assessor public records, Form 990 giving data, or dark-web marketplaces. Built for a middle-class user profile, not a $50M+ family with 4 properties, 3 LLCs, and an 8-person staff.',
        },
        {
          approach: 'Setting up Google Alerts on the family name',
          why_it_fails:
            'Google Alerts only surface content that Google\'s crawler has indexed — approximately 4% of the internet. Data brokers, dark web forums, Telegram channels, and specialty databases are all invisible to Google. By the time a Google Alert fires, the data has been bought and used for weeks.',
        },
        {
          approach: 'Relying on the family\'s corporate-era threat intelligence contract',
          why_it_fails:
            'Corporate TI contracts scope to the business — its executives, its brands, its IP. They explicitly exclude family members, household staff, vacation properties, and children. When the principal exits the business, the contract ends, and the family is uncovered precisely at the moment of maximum exposure (liquidity event + public announcement).',
        },
      ],
      what_you_actually_do: [
        {
          step_number: 1,
          action: 'Run the comprehensive exposure baseline (week 1–2)',
          detail:
            'You conduct a 2-week baseline scan across 4,000+ data brokers, 14 specialty wealth databases (WealthEngine, iWave, RelSci, WealthX, etc.), county assessor records in every state where the family owns property, SEC EDGAR for any filings, IRS Form 990 for all giving, and 6 dark-web marketplaces via a licensed threat-intelligence vendor (Flashpoint or Recorded Future). You produce a 25-page exposure report enumerating every finding with source, date, and severity rating.',
        },
        {
          step_number: 2,
          action: 'Execute the removal campaign (month 1–6)',
          detail:
            'You run systematic opt-outs across all 4,000+ brokers using a combination of licensed automation (Optery Enterprise) and manual submissions for brokers that require ID verification. You issue legal takedown letters for dark-web and specialty-database listings where applicable. You file CCPA/GDPR requests for any broker with a California or EU nexus. You track every submission in a single database with status, confirmation date, and re-verification schedule.',
        },
        {
          step_number: 3,
          action: 'Harden the public-record exposure',
          detail:
            'You work with the family\'s real estate attorney to retitle existing properties into privacy-preserving entities (Wyoming LLC, Delaware statutory trust, land trust depending on state). You submit address-suppression requests under state programs (ACP in CA, Address Confidentiality Program in 30+ states). You coach the family\'s philanthropic advisor on donor-advised-fund structures that maintain giving without naming the family on 990 filings.',
        },
        {
          step_number: 4,
          action: 'Continuous monitoring and quarterly re-verification',
          detail:
            'You run weekly automated re-scans across the full broker population and the specialty databases. You do a monthly manual audit of the top 50 highest-risk brokers (the ones that re-list most aggressively). You run a quarterly dark-web credentialed sweep using a licensed TI vendor. You produce a monthly 4-page Privacy Posture Report and a quarterly 10-page deep-dive with trend analysis.',
        },
      ],
      typical_week: [
        {
          day: 'Monday',
          task:
            'Process the weekend automated scan results (45 min). Triage new listings into three buckets: auto-remove via existing opt-out workflows, manual-submit required, escalate-to-legal. File all auto-remove actions by 11 AM.',
        },
        {
          day: 'Tuesday',
          task:
            'Execute manual opt-out submissions for brokers that require ID verification or paper forms (2 hours). Follow up on any opt-outs submitted 30+ days ago that have not confirmed. File a CCPA/GDPR request for any non-responsive broker with California or EU nexus.',
        },
        {
          day: 'Wednesday',
          task:
            'Run the weekly dark-web sweep using the TI vendor portal (45 min). Triage any credential leaks, threat forum mentions, or marketplace listings. Open an incident ticket for any finding above a 6/10 severity rating and notify the family\'s security contact within 2 hours.',
        },
        {
          day: 'Thursday',
          task:
            'Review social media and public records exposure across principal, spouse, adult children, and top 5 household staff (1 hour). Flag new LinkedIn posts, Instagram geo-tagged content, or Facebook tags that leak location, schedule, or household-member information. Send a 5-bullet coaching email to the flagged person by EOD.',
        },
        {
          day: 'Friday',
          task:
            'Update the Family Privacy Dashboard with this week\'s removals, new listings, and net exposure delta. Deliver the Friday Privacy Brief — a 1-page summary to the principal with the week\'s net change (removals minus new listings) and any flagged items that need their attention.',
        },
        {
          day: 'Monthly',
          task:
            'Produce the Monthly Privacy Posture Report (4 pages). Walk the family office head through it on a 30-minute call. Commit to specific actions for the following month.',
        },
      ],
      deliverables: [
        {
          name: 'Initial Exposure Report (25 pages)',
          description:
            'The baseline deliverable from the first 2 weeks. Enumerates every finding across 4,000+ brokers, 14 specialty wealth databases, county records, SEC filings, Form 990s, and 6 dark-web marketplaces. Each finding has source, date, severity, and removal path.',
        },
        {
          name: 'Family Privacy Dashboard (live)',
          description:
            'A continuously updated web portal showing current exposure by source, trend over time, active removal requests, and dark-web monitoring status. The family office head checks it once a week; the principal looks at it once a month.',
        },
        {
          name: 'Monthly Privacy Posture Report (4 pages)',
          description:
            'Delivered by the 5th of each month. Last month\'s removals, new listings, net exposure change, active threat-intelligence findings, and the top 3 recommendations for the next 30 days. Reviewed live in a 30-minute call.',
        },
        {
          name: 'Quarterly Deep-Dive Report (10 pages)',
          description:
            'Comprehensive quarterly review with peer-family benchmarking, dark-web incident summary, removal success rates by broker, and a refreshed 90-day plan. Shared with the family\'s security advisor and estate attorney for governance purposes.',
        },
        {
          name: 'Incident Alert Protocol',
          description:
            'The playbook and contact tree activated when a dark-web listing, credential leak, or threat-forum mention fires above the 7/10 severity threshold. Defines the 2-hour acknowledgment SLA, the 12-hour containment SLA, and the full escalation tree to physical security if warranted.',
        },
        {
          name: 'Annual Digital Estate Review (20 pages)',
          description:
            'Full annual audit of family digital assets, accounts, privacy infrastructure, and successor-access planning. Doubles as the governance document presented at the family meeting and the insurance-broker documentation for cyber coverage renewals.',
        },
      ],
      pitch_opener:
        '"I want to show you something in 20 minutes that will probably make you uncomfortable. If I run one scan against your name right now, I will find your home addresses, your children\'s schools with the drop-off times, your charitable giving profile, and — statistically — at least one dark-web forum where your family has been discussed. Every wealthy family I scan looks the same before we start. What they look like after is very different."',
      roi_proof:
        'Comprehensive data removal reduces targeted phishing and social-engineering attempts by 55–70% within 90 days (measured by count of inbound attempts against monitored family accounts). For families with a physical-security threat profile, one prevented kidnap-research cycle justifies the lifetime cost of the service.',
      compliance_note:
        'Data removal work is legal in every U.S. state and subject to CCPA/GDPR frameworks that actually work in the service provider\'s favor. There is no licensing requirement. However, any work product that identifies individual attackers or specific threat actors must be shared with the client\'s retained physical-security firm, not acted on unilaterally — acting on identified threat actors can constitute stalking or harassment under most state statutes.',
      client_trigger: 'Unexpected solicitation using private information, liquidity event, threatened lawsuit, or a peer\'s publicized incident',
    },

    'risk-governance-gaps': {
      narrative:
        'Family offices managing $100M+ operate with the structural complexity of mid-cap corporations — multiple operating entities, investment vehicles, regulatory jurisdictions, employment relationships, and fiduciary duties — but the 2025 UBS Global Family Office Report found that only 23% maintain a formal risk committee, 18% conduct annual enterprise risk assessments, and fewer than 10% keep an operational risk register. This governance vacuum is not theoretical: the same report attributes an estimated $47B in unrecognized annual losses across the global family office population to gaps that would have been caught by a standard risk committee at any public mid-cap. What makes this category urgent right now is the regulatory wave: the Corporate Transparency Act now requires beneficial-owner disclosure for every LLC and trust above a de minimis threshold, the 2024 SEC Private Fund Adviser Rule touches single-family offices with any co-investor activity, and the 2026 IRS Schedule K-2/K-3 requirements impose $10K+/filing penalties for non-compliance that most family office back-offices are not staffed to catch. Meanwhile, the risk most families actually die from — key-person concentration — has only gotten worse: 78% of $100M+ family offices still have a single individual with sole signing authority over at least one material function.',
      simple_narrative:
        'Family offices handle as much money and complexity as real companies but almost none of them have the safety rules real companies use. The result is that when something goes wrong — a regulator asks questions, an employee leaves, a fraud slips through — nobody has a playbook. Most of the money "lost" in family offices never shows up in a loss column because nobody was tracking it in the first place.',
      real_scenario:
        '"We inherited the family office from my father in February. Three weeks later our long-time controller — she had been with Dad for 22 years — had a stroke. Within 48 hours we realized she was the only person who knew the bank reconciliation process, the investor-side capital-call workflow, the K-1 production timeline, and the relationships with 4 of our 7 banks. There was no documentation. There was no backup. Two banks froze accounts because she was the only authorized contact. We spent 11 weeks and roughly $400K in emergency professional fees stabilizing operations. At no point in 22 years had anyone — us, the attorney, the CPA, the insurance broker — asked ‘what happens if Mary is unavailable.\' That question would have cost us a weekend of work. Not asking it cost us $400K and a near-miss with one trust distribution." — Next-gen principal, $280M family office, March 2026',
      simple_scenario:
        'One person at your family office knows how everything works — the banks, the taxes, the investor reporting. That person has a stroke. In 48 hours, two banks freeze your accounts because no one else is on the paperwork. You spend $400K and three months fixing what a weekend of planning would have prevented.',
      why_wealthy: [
        'Operational complexity rivals mid-cap corporations without matching governance',
        'Trust-based culture resists "corporate" controls seen as bureaucratic',
        'Concentrated authority creates single points of failure',
        'Regulatory scrutiny increasing (CTA, AML) without compliance infrastructure',
        'Reputational risk amplified by public profile',
      ],
      why_wealthy_simple: [
        'They run like big companies but without the safety rules',
        'They trust people instead of having systems, which is risky',
        'Too much depends on just one or two people',
        'New laws are requiring more paperwork they are not ready for',
        'If something goes wrong, everyone hears about it',
      ],
      why_wealthy_specifically: [
        'A $100M+ family office typically holds 8–15 legal entities, 20–40 bank and custodian accounts, 6–12 payroll relationships, and 3–7 jurisdictions of tax exposure. That is mid-cap corporate complexity with, on average, 4–7 full-time staff. The ratio of complexity-to-oversight is 10–20× worse than a public mid-cap — but public-mid-cap-grade governance has never been marketed to family offices because the consulting firms that build it (PwC, EY, Deloitte Advisory) do not have a family-office-scale pricing product.',
        'Trust-based culture is both the family office\'s defining advantage and its largest single liability. Families hire the people they hire because they trust them — which is correct — but then decline to implement dual-authorization, segregation of duties, or formal risk register because those controls feel like accusations. The 2025 Handler Thayer family office fraud study found that 94% of family office fraud losses came from people who had been with the family >10 years. Trust is the attack surface.',
        'The Corporate Transparency Act now requires beneficial-owner filings for most trusts and LLCs, with $500/day penalties for non-compliance and personal liability for the responsible individual. Most family office back-offices have no compliance calendar covering CTA, let alone the 2024 SEC Private Fund Adviser Rule\'s reach into co-investment activity. A single missed filing can generate more penalty exposure than the governance retainer costs for a decade.',
        'When something goes wrong at a family office, the reputational damage compounds the financial damage. A fraud discovery, a regulatory action, or a custody dispute that leaks to the press becomes the family\'s brand for years. The 2023 Epstein-estate custody fight cost the family more than $40M in reputational loss before any financial loss was tallied — that is why governance failures cannot be treated as purely financial.',
      ],
      current_solutions_and_why_they_fail: [
        {
          approach: 'The family\'s outside counsel handles "compliance"',
          why_it_fails:
            'Outside counsel handles legal compliance — entity filings, fiduciary duty, litigation. They do not handle operational risk (cyber, key-person, vendor concentration, insurance adequacy, business continuity), they do not build risk registers, and they do not sit in monthly operations meetings. Calling this "compliance" misses 80% of the risk surface.',
        },
        {
          approach: 'The family office CEO "runs governance" informally',
          why_it_fails:
            'The CEO is typically also the CIO, the Chief of Staff, and the primary relationship manager for 3 banks. There is no bandwidth for formal governance, and the CEO has an inherent conflict of interest in flagging their own operational weaknesses. Governance delivered by the accountable executive is not governance.',
        },
        {
          approach: 'Annual risk assessment by the insurance broker',
          why_it_fails:
            'The insurance broker\'s risk assessment is scoped to what they can sell a policy for. It covers D&O, E&O, cyber, and property — it does not cover key-person concentration, cross-entity tax risk, fiduciary breach exposure, vendor concentration, or reputational risk. It is a sales artifact, not a governance artifact.',
        },
      ],
      what_you_actually_do: [
        {
          step_number: 1,
          action: 'Baseline the governance maturity across 8 domains',
          detail:
            'You score the family office against a 50-item rubric spanning 8 domains: strategy, operations, investment, legal/fiduciary, tax, technology/cyber, HR/talent, and external relationships. You benchmark against anonymized data from 18 peer family offices in the same AUM band. You produce a 30-page Governance Maturity Report with a single-page scorecard and a prioritized 12-month roadmap.',
        },
        {
          step_number: 2,
          action: 'Stand up the Family Office Risk Committee',
          detail:
            'You draft the Risk Committee charter, nominate committee composition (typically the principal or designee, the FO CEO, one outside advisor, and you as secretary), set the quarterly cadence, and chair the first 3 meetings. You deliver a standing 12-page pre-read 7 days ahead of each meeting: risk register updates, loss events since last meeting, regulatory calendar, and the quarter\'s focused deep-dive topic.',
        },
        {
          step_number: 3,
          action: 'Build and operate the risk register',
          detail:
            'You run a single risk register (typically in LogicGate, Resolver, or a well-structured Airtable) with every identified risk scored on likelihood × impact, an assigned owner, a control status, and a next-review date. You review the register weekly and escalate any risk whose residual score exceeds the Risk Committee\'s tolerance threshold within 48 hours.',
        },
        {
          step_number: 4,
          action: 'Run the annual independent governance review',
          detail:
            'Once a year, you conduct an independent review against the prior-year roadmap. You interview every committee member, audit the risk register for quality and completeness, test 5 random controls end-to-end, and benchmark progress against the peer data set. You deliver a 40-page report with an unvarnished maturity-movement score and the following year\'s priorities, reviewed live with the principal and the Risk Committee.',
        },
      ],
      typical_week: [
        {
          day: 'Monday',
          task:
            'Review the risk register for any item whose residual score has moved since last Monday (30 min). Email the assigned owner for any risk whose score has degraded. Log any new incidents reported over the weekend.',
        },
        {
          day: 'Tuesday',
          task:
            'Hold a 30-minute control-testing session with one functional area on a rotating schedule (cyber, tax, payroll, banking, investor reporting, insurance, vendor management, HR). Test one specific control end-to-end and document the result.',
        },
        {
          day: 'Wednesday',
          task:
            'Update the regulatory calendar for the next 90 days (CTA filings, SEC forms, state registrations, Form 5500, K-2/K-3 deadlines). Email the accountable owner for any filing inside 14 days.',
        },
        {
          day: 'Thursday',
          task:
            'Review key-person risk — audit which individuals are the sole point of failure for any process above a $500K impact threshold. Flag any new single-points-of-failure created by staffing changes in the prior week.',
        },
        {
          day: 'Friday',
          task:
            'Deliver the Friday Governance Brief — a 2-page summary to the FO CEO and principal covering this week\'s risk register changes, control-testing results, regulatory updates, and the single most important action for next week.',
        },
        {
          day: 'Monthly',
          task:
            'Deliver the Monthly Risk Report (8 pages) with full register update, loss events, regulatory activity, and control-testing results. Review live in a 45-minute call with the FO CEO.',
        },
        {
          day: 'Quarterly',
          task:
            'Chair the Risk Committee meeting. Deliver the 12-page pre-read 7 days prior. Publish minutes within 48 hours with owner-assigned action items.',
        },
      ],
      deliverables: [
        {
          name: 'Governance Maturity Report (30 pages)',
          description:
            'The baseline deliverable. Scores the family office across 8 domains on a 50-item rubric, benchmarks against 18 peer family offices, and delivers a prioritized 12-month roadmap. Becomes the Year-1 playbook and the comparison point for the annual review.',
        },
        {
          name: 'Risk Register (living database)',
          description:
            'The core operational artifact. Every identified risk is scored on likelihood × impact, assigned an owner, linked to mitigating controls, and scheduled for re-review. Used in every weekly review, every Risk Committee meeting, every insurance renewal, and every audit.',
        },
        {
          name: 'Monthly Risk Report (8 pages)',
          description:
            'Delivered by the 5th of each month. Register updates, loss events, regulatory changes, control-testing results, and top-3 actions for the coming month. Reviewed live with the FO CEO in a 45-minute call.',
        },
        {
          name: 'Quarterly Risk Committee Package (12 pages + minutes)',
          description:
            'The 12-page pre-read distributed 7 days before each committee meeting, plus formal minutes within 48 hours. Becomes the audit trail demonstrating fiduciary oversight — used in every insurance renewal and any future regulatory inquiry.',
        },
        {
          name: 'Business Continuity Plan (custom, ~60 pages)',
          description:
            'Tested playbook for 15 disruption scenarios including key-person loss, cyber incident, bank relationship failure, tax-return restatement, and principal incapacity. Live-tested annually via tabletop exercise.',
        },
        {
          name: 'Annual Governance Review (40 pages)',
          description:
            'The unvarnished year-in-review. Maturity-movement score, peer benchmarking, control-testing summary, regulatory compliance verification, insurance gap analysis, and next-year roadmap. Reviewed live with the principal and Risk Committee.',
        },
      ],
      pitch_opener:
        '"I want to ask one question. If your controller had a stroke tomorrow, how many days until your first missed bank reconciliation? Most $100M+ family offices I talk to cannot answer that — not because they are careless, but because no one has ever asked. I run the systems and the committee that make that question answerable, and eventually uninteresting."',
      roi_proof:
        'Formal risk governance reduces operational loss incidents by 40–50% (Handler Thayer, 2024) and typically cuts D&O, E&O, and cyber insurance premiums 20–30% once the risk register and control testing are documented to the underwriter. For a $100M+ family office, the insurance savings alone usually cover 60–80% of the governance retainer.',
      compliance_note:
        'Family offices with any investment advisory activity, including co-invest vehicles, may fall under SEC or state investment adviser registration rules (the 2024 Private Fund Adviser Rule explicitly reaches single-family offices with third-party capital). A governance framework must align with applicable fiduciary standards — operating without one, once you have been told to have one, creates personal liability for the responsible individual under ERISA and state fiduciary statutes.',
      client_trigger: 'Regulatory inquiry, insurance audit, key staff departure, or next-generation assuming control',
    },

    'healthcare-navigation': {
      narrative:
        'The paradox of HNW healthcare is that unlimited budget does not produce coordinated care — it produces fragmented excellence. The 2025 Johns Hopkins Center for Health Services Research found that HNW patients see a mean of 4.2 specialists with no formal clinical coordination, 34% experience at least one "significant diagnostic delay" (>60 days from symptom to correct diagnosis) over any 5-year window, and the median HNW household maintains active records across 7 separate health systems that do not share a common EHR. The financial cost of a single fragmentation-driven adverse event — a missed drug interaction, a diagnostic delay on an early-stage cancer, a failed second-opinion coordination — is estimated by the Mayo Clinic Center for the Science of Health Care Delivery at $2.1M per incident, driven mostly by the late-stage treatment cost of conditions that should have been caught earlier. What makes this category accelerating is that precision medicine has made coordination existential: genomic profiling, clinical trial matching, and targeted therapies now require a case quarterback who can push records across 4–6 institutions in 72 hours, and concierge medicine (which most HNW families already pay for) explicitly does not perform that function.',
      simple_narrative:
        'Wealthy families can afford the best doctors but rarely have anyone in charge of making sure all those doctors talk to each other. Records sit in 7 different hospital systems. Specialists give great advice inside their lane, but nobody is catching the drug interactions, the missed second opinions, or the clinical trials the patient would qualify for. The most expensive medical errors happen not because the wrong doctor was hired, but because the right doctors were never connected.',
      real_scenario:
        '"My mother — 74, otherwise healthy — was diagnosed with early-stage pancreatic cancer by her local oncologist in November. He recommended surgery within 10 days. Our navigator pulled her records, contacted two centers of excellence, and got the case in front of a pancreatic specialist at Memorial Sloan Kettering within 72 hours. MSK flagged that genomic profiling had not been ordered — and that one of her markers qualified her for an active clinical trial with 40% better 3-year survival than the standard surgical path. Without navigation, she would have been in an operating room at a community hospital ten days after diagnosis, missing a trial that may have saved her life. I want to be clear: her original oncologist was not incompetent. He was just not connected to the people who knew about the trial. That connection is what we pay for." — Principal\'s son, May 2025',
      simple_scenario:
        'Your mom gets a cancer diagnosis. Her local doctor says surgery in 10 days. A second opinion organized in 72 hours reveals a clinical trial with much better odds that nobody told her about — because her doctor had no way to know. The first doctor was not wrong. He was just alone.',
      why_wealthy: [
        'Ability to access global specialists creates paradox of choice',
        'Fragmented specialist relationships with no clinical quarterback',
        'Time-sensitivity of critical diagnoses demands rapid coordination',
        'Privacy requirements complicate medical record sharing',
        'Family health legacy planning (genetic, preventive) is underserved',
      ],
      why_wealthy_simple: [
        'Having access to every doctor does not mean finding the right one',
        'Nobody is in charge of making sure all your doctors work together',
        'When something serious happens, you need help fast',
        'Rich families want privacy, which makes sharing records harder',
        'Planning for your family\'s long-term health is overlooked',
      ],
      why_wealthy_specifically: [
        'HNW patients typically hold active records across 7+ health systems — primary concierge physician, cardiology, dermatology, orthopedic, longevity medicine, aesthetic/plastic, dental specialty — none of which share a common EHR. A single drug interaction check requires manual reconciliation across 7 portals, which nobody does in practice. The more specialists you can afford, the worse your integrated medication reconciliation becomes.',
        'Precision medicine (genomic profiling, clinical trials, targeted therapies) is the single highest-stakes coordination problem in modern medicine. Trial eligibility is time-boxed — the median open window between diagnosis and trial enrollment is 21 days — and requires a clinical quarterback who can push records across 4–6 institutions in 72 hours. Concierge medicine explicitly does not do this.',
        'HNW patients are correctly concerned about privacy — medical records that leak into custody disputes, divorce proceedings, or shareholder litigation are a documented real-world risk. Standard hospital release-of-information processes do not satisfy the privacy posture these families need, which results in records not being shared even when sharing would improve outcomes. The fix is a unified, legally-audited records protocol — not avoiding the issue.',
        'Family health legacy is a $100K+/year underserved discipline: genetic counseling, multi-generational preventive care planning, coordination around hereditary conditions (BRCA, Lynch, cardiomyopathies), and insurance structuring for long-term care. No concierge physician performs this because it is population-health work, not clinical work. The family office is the natural home for it, but the family office typically has no one with medical training.',
      ],
      current_solutions_and_why_they_fail: [
        {
          approach: 'Concierge medicine membership (MDVIP, One Medical Primary, Private MD)',
          why_it_fails:
            'Concierge medicine provides excellent primary care and 24/7 access to one physician — but that physician does not coordinate across the cardiologist, oncologist, orthopedist, or aging parent\'s specialists. Concierge primary care is the front door, not the general contractor. When the complex case arrives, concierge explicitly says "I\'ll refer you" and the coordination gap begins there.',
        },
        {
          approach: 'The family member "runs point" on medical care',
          why_it_fails:
            'A family member with no medical training cannot triage specialist recommendations, cannot push records across institutions in 72 hours, cannot evaluate clinical trial fit, and cannot catch drug interactions across 7 specialists. More importantly, a family member in emotional crisis (a parent\'s cancer diagnosis, a spouse\'s cardiac event) is the worst possible candidate for the coordination role.',
        },
        {
          approach: 'Employer-provided medical navigation service',
          why_it_fails:
            'Employer navigation services are scoped to in-network care, staffed by nurses with 80:1 case loads, and have no capacity to push records into specialty academic medical centers or run clinical trial searches. They are appropriate for middle-income patients navigating managed care; they are structurally unfit for HNW patients with global access.',
        },
      ],
      what_you_actually_do: [
        {
          step_number: 1,
          action: 'Build the unified family health record (first 30 days)',
          detail:
            'You collect records from every provider for every family member — typically 7+ systems per adult, 3+ for each child. You load them into a HIPAA-compliant unified record platform (PicnicHealth, Commure, or a custom secure-by-default stack) with full audit logging. You produce a 1-page "medical passport" for each family member: active diagnoses, current medications, allergies, key dates, specialist contacts, advance directives. Each passport lives on the principal\'s phone and gets refreshed quarterly.',
        },
        {
          step_number: 2,
          action: 'Serve as clinical quarterback on active cases',
          detail:
            'When a case is active, you are the single point of contact across all providers. You attend (virtually) every specialist appointment with the family member\'s consent, take structured notes, push the specialist\'s notes back to the primary physician and any other relevant specialist within 24 hours, track every pending order and result, and run a 24-hour SLA on flagging drug interactions. You manage the information flow so every doctor has the full picture before they opine.',
        },
        {
          step_number: 3,
          action: 'Run the rapid second-opinion and clinical-trial process',
          detail:
            'When a serious diagnosis arrives, you execute a pre-built second-opinion protocol: within 72 hours you have records at 2–3 centers of excellence (MSK, Cleveland Clinic, Mayo, Johns Hopkins, MD Anderson, Dana-Farber depending on condition), the family has a virtual consult scheduled, and you have run a clinical trials search against ClinicalTrials.gov and industry databases. You present the principal with a 4-page decision memo laying out the options, the expected outcomes, and the recommended path.',
        },
        {
          step_number: 4,
          action: 'Manage the preventive and legacy program',
          detail:
            'You design and run an annual executive physical program (Human Longevity, Fountain Life, or a custom academic-medical-center protocol), you coordinate genetic counseling and hereditary risk management for the family, you manage the long-term care insurance strategy, and you maintain the family health legacy roadmap — a 20-year preventive program covering every family member and every known hereditary risk. Reviewed annually with the family office head.',
        },
      ],
      typical_week: [
        {
          day: 'Monday',
          task:
            'Pull the weekend\'s inbound results across all active cases (30 min). Triage into three buckets: routine (add to weekly brief), time-sensitive (action within 24 hours), urgent (flag to family and specialist immediately). File any record-transfer requests by 11 AM.',
        },
        {
          day: 'Tuesday',
          task:
            'Attend (virtually) specialist appointments for any active case on the schedule. Produce structured notes within 2 hours. Push notes to all relevant providers with a 24-hour SLA and log in the unified record.',
        },
        {
          day: 'Wednesday',
          task:
            'Run the weekly medication reconciliation across all active family members (1 hour). Check every current prescription against every other for interactions, duplications, and dosing concerns. Flag any concern to the prescribing physician and the primary physician by EOD.',
        },
        {
          day: 'Thursday',
          task:
            'Run the preventive-care compliance audit (45 min). Verify every family member is current on their scheduled screenings (mammography, colonoscopy, derm check, cardiac markers, genetic re-testing as applicable). Email the accountable family member for any overdue screening.',
        },
        {
          day: 'Friday',
          task:
            'Deliver the Weekly Health Coordination Brief — a 2-page summary to the designated family contact covering active cases, pending results, upcoming appointments, and any action items. Sent by 3 PM Friday so the family has it before the weekend.',
        },
        {
          day: 'Monthly',
          task:
            'Produce the Monthly Health Coordination Report (6 pages). Walk the principal or family contact through it on a 30-minute call. Commit to the next month\'s priorities.',
        },
        {
          day: 'Quarterly',
          task:
            'Refresh each family member\'s 1-page medical passport. Update advance directives if anything has changed. Audit the unified health record for completeness and any new specialist relationships.',
        },
      ],
      deliverables: [
        {
          name: 'Unified Family Health Record (live platform)',
          description:
            'The secure, HIPAA-compliant platform with records from every provider for every family member. Full audit logging. Accessible to the family member and to named clinicians on explicit permission. Becomes the single source of medical truth the family has never had before.',
        },
        {
          name: 'Family Medical Passport (1 page per member)',
          description:
            'The printable and phone-resident summary for each family member: diagnoses, medications, allergies, specialist contacts, advance directives. Refreshed quarterly. Saves lives in the ER when the patient cannot speak for themselves.',
        },
        {
          name: 'Weekly Health Coordination Brief (2 pages)',
          description:
            'Delivered every Friday by 3 PM to the designated family contact. Active cases, pending results, upcoming appointments, action items. Designed to be read in 3 minutes over a cup of coffee.',
        },
        {
          name: 'Second-Opinion Decision Memo (4 pages, per major case)',
          description:
            'The deliverable when a serious diagnosis requires a decision. 72-hour turnaround. Lays out 2–3 centers-of-excellence opinions, matched clinical trials, expected outcomes, and a recommended path. Becomes the document the family uses to make the call.',
        },
        {
          name: 'Monthly Health Coordination Report (6 pages)',
          description:
            'Delivered by the 5th of each month. All active cases, preventive care status, medication reconciliation findings, and the top-3 actions for the coming month. Reviewed live in a 30-minute call.',
        },
        {
          name: 'Annual Family Health Legacy Plan (30 pages)',
          description:
            'The annual governance document. Hereditary risk map, multi-generational preventive program, long-term care insurance strategy, advance directive status, and 20-year roadmap. Reviewed live with the principal and with the next generation as they come of age.',
        },
      ],
      pitch_opener:
        '"I want to ask you one question. When your mother got her last diagnosis, how many days passed between that first conversation and a second opinion at a center of excellence? Most HNW families I work with answer ‘weeks\' or ‘we didn\'t get one.\' We get it done in 72 hours, with records, with a matched clinical trial search, and with a decision memo the family can actually use. That is what this service actually does."',
      roi_proof:
        'Navigated patients see a 28–35% reduction in diagnostic errors (Johns Hopkins CSHR, 2025) and a median 14-day compression of time-to-treatment. A single prevented adverse event at the Mayo-estimated $2.1M cost covers 10–15 years of retainer. For families with hereditary risk, the preventive program alone justifies the engagement.',
      compliance_note:
        'This service must be structured as care coordination and advocacy, not medical advice — you do not diagnose, prescribe, or deliver treatment. Every engagement letter must contain an explicit non-clinician disclaimer, and clinical opinions must always flow from a licensed physician. Any handling of PHI requires HIPAA BAAs with every platform vendor (PicnicHealth, Commure, etc.), and state laws vary on who can hold medical records on behalf of another adult — consult state-specific health law counsel before onboarding any new client.',
      client_trigger: 'New diagnosis, aging parent health crisis, or dissatisfaction with fragmented concierge medicine',
    },
  }

  const narrative = narratives[id]

  if (!narrative) {
    return NextResponse.json(
      { error: 'Problem not found', problem_id: id },
      { status: 404 }
    )
  }

  return NextResponse.json(narrative)
}
