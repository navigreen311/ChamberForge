import { NextResponse } from 'next/server'

// TODO: Replace with AI-generated narratives from LLM pipeline
// TODO: Add persona-based narrative selection (advisor vs. principal vs. staff)
// TODO: Cache generated narratives with TTL based on evidence freshness
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const narratives: Record<
    string,
    {
      narrative: string
      simple_narrative: string
      real_scenario: string
      simple_scenario: string
      why_wealthy: string[]
      why_wealthy_simple: string[]
      roi_proof: string
      client_trigger: string
    }
  > = {
    'ai-voice-fraud': {
      narrative:
        'Cybercriminals are now using AI to clone voices of trusted family members and CFOs. FBI documented 300% increase in AI-enabled impersonation targeting HNW households. A single successful deepfake call can authorize wire transfers exceeding $5M before verification protocols catch the breach. Voice biometric authentication, once considered secure, is now compromised in under 3 seconds of sample audio.',
      simple_narrative:
        'Bad guys are using computers to copy people\'s voices and trick rich families into sending money. It\'s getting way more common and the fakes are almost impossible to tell apart from real calls.',
      real_scenario:
        'Last month, our CFO got a call that sounded exactly like our principal authorizing a $2.3M wire to a "new investment vehicle." The voice matched perfectly -- tone, cadence, even the slight Boston accent. Only a pre-agreed passphrase protocol stopped the transfer.',
      simple_scenario:
        'Imagine getting a phone call from your boss asking you to send $2 million to a new account right away. The voice sounds exactly like them. But it\'s actually a computer pretending to be them.',
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
        'Most don\'t have a plan for when it happens',
        'Having lots of accounts makes it confusing',
        'They\'re less likely to tell anyone it happened',
      ],
      roi_proof: 'One prevented wire fraud pays for 2+ years of fees',
      client_trigger: 'Near-miss incident or peer\'s security breach',
    },
    'coordination-overload': {
      narrative:
        'Wealthy families employ an average of 7.4 professional advisors across legal, tax, investment, insurance, and lifestyle domains. Yet fewer than 12% have a coordination mechanism beyond ad-hoc email threads. The result: duplicated work, conflicting advice, missed deadlines, and an estimated 15-30% value leakage from uncoordinated decision-making.',
      simple_narrative:
        'Rich families hire lots of different experts -- lawyers, accountants, money managers -- but nobody is in charge of making sure they all talk to each other. This causes expensive mistakes.',
      real_scenario:
        'A family\'s tax attorney restructured their holding company for state tax savings, unaware that their investment advisor had just executed a strategy requiring the old structure. The conflict cost $340K in unwinding fees and missed a $1.2M tax election deadline.',
      simple_scenario:
        'Imagine your lawyer changes something without telling your accountant, and it ends up costing you hundreds of thousands of dollars because they weren\'t on the same page.',
      why_wealthy: [
        'Complexity scales exponentially with wealth -- more entities, jurisdictions, advisors',
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
      roi_proof: 'Families report 15-30% reduction in advisory friction costs within first year',
      client_trigger: 'Missed deadline or conflicting advice from two advisors',
    },
    'data-broker-exposure': {
      narrative:
        'Personal data of HNW individuals and their families is actively traded across 4,000+ data broker networks. Home addresses, travel patterns, asset holdings, children\'s school locations, and health records are aggregated into "wealth profiles" sold for as little as $200. This data fuels physical security threats, social engineering, and targeted litigation.',
      simple_narrative:
        'Companies are collecting and selling personal information about wealthy families -- where they live, where their kids go to school, how much they\'re worth. Anyone can buy this data cheaply online.',
      real_scenario:
        'A family discovered that a data aggregator had compiled a dossier including their vacation home addresses, children\'s school schedules, net worth estimates, and medical provider names. This profile had been purchased 47 times in 6 months, including by two individuals later connected to a kidnapping threat assessment.',
      simple_scenario:
        'Imagine finding out that strangers can buy a file online that shows where you live, where your kids go to school, and how much money you have -- all for about $200.',
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
      roi_proof: 'Comprehensive data removal reduces social engineering attempts by 60% within 90 days',
      client_trigger: 'Unexpected solicitation using private information or a physical security scare',
    },
    'risk-governance-gaps': {
      narrative:
        'Family offices managing $100M+ operate with the complexity of mid-size corporations but rarely implement proportionate risk governance. Only 23% have a formal risk committee, 18% conduct annual risk assessments, and fewer than 10% maintain a risk register. This governance vacuum leaves families exposed to operational, reputational, and regulatory risks that compound silently.',
      simple_narrative:
        'Family offices handle huge amounts of money but most don\'t have the same safety rules that regular companies do. They\'re basically running a big business without the safety nets.',
      real_scenario:
        'A $400M family office discovered during an insurance review that their key-person risk was completely unaddressed -- one employee controlled all banking relationships, investment platforms, and tax filings with no backup, no dual-authorization, and no succession plan. A health emergency would have frozen operations for weeks.',
      simple_scenario:
        'Imagine one person at your company knows all the passwords and handles all the money, and there\'s no backup plan if they get sick. That\'s how most family offices actually work.',
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
        'New laws are requiring more paperwork they\'re not ready for',
        'If something goes wrong, everyone hears about it',
      ],
      roi_proof: 'Formal risk governance reduces operational loss incidents by 45% and cuts insurance premiums 20-30%',
      client_trigger: 'Regulatory inquiry, insurance audit, or key staff departure',
    },
    'healthcare-navigation': {
      narrative:
        'HNW families face a paradox: unlimited healthcare budgets but fragmented access to elite specialists, clinical trials, and second opinions. The average HNW patient sees 4.2 specialists with no clinical coordination. Medical errors from fragmentation cost an estimated $2.1M per incident, and 34% of HNW families report at least one significant diagnostic delay in the past 5 years.',
      simple_narrative:
        'Even though wealthy families can afford the best doctors, they often struggle to find the right specialist at the right time, and their doctors don\'t always talk to each other. This leads to mistakes and delays.',
      real_scenario:
        'A principal was diagnosed with early-stage pancreatic cancer by their local oncologist who recommended immediate surgery. A coordinated second-opinion process identified that genomic profiling -- not yet ordered -- indicated eligibility for a clinical trial with 40% better outcomes. Without navigation, this option would have been missed entirely.',
      simple_scenario:
        'Imagine being told you need surgery right away, but a second opinion reveals a much better treatment option your first doctor didn\'t know about. That\'s what healthcare navigation prevents.',
      why_wealthy: [
        'Ability to access global specialists creates paradox of choice',
        'Fragmented specialist relationships with no clinical quarterback',
        'Time-sensitivity of critical diagnoses demands rapid coordination',
        'Privacy requirements complicate medical record sharing',
        'Family health legacy planning (genetic, preventive) is underserved',
      ],
      why_wealthy_simple: [
        'Having access to every doctor doesn\'t mean finding the right one',
        'Nobody is in charge of making sure all your doctors work together',
        'When something serious happens, you need help fast',
        'Rich families want privacy, which makes sharing records harder',
        'Planning for your family\'s long-term health is overlooked',
      ],
      roi_proof: 'Navigated patients report 35% faster specialist access and 28% reduction in diagnostic errors',
      client_trigger: 'New diagnosis, aging parent health crisis, or dissatisfaction with current concierge medicine',
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
