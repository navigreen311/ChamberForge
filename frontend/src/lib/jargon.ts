export interface JargonEntry {
  plain: string;
  example?: string;
}

export const JARGON: Record<string, JargonEntry> = {
  UHNW: {
    plain: 'Ultra-high-net-worth — people with $30 million or more in investable assets.',
    example: 'A tech founder who sold their company for $100M is UHNW.',
  },
  HNW: {
    plain: 'High-net-worth — people with $1 million or more in investable assets.',
    example: 'A senior executive with a $2M investment portfolio is HNW.',
  },
  'WTP Signal': {
    plain: 'Willingness-to-pay signal — a clue that someone is ready to spend money on your service.',
    example: 'When a prospect asks about pricing, that is a WTP signal.',
  },
  'Evidence credibility': {
    plain: 'How believable and trustworthy your proof is that your service works.',
    example: 'A signed client testimonial has higher evidence credibility than a self-written claim.',
  },
  'Lifecycle stages': {
    plain: 'The phases a client goes through: from first hearing about you, to signing, to ongoing work.',
  },
  Playbook: {
    plain: 'A step-by-step plan you follow to get a specific result.',
    example: 'A "new client onboarding" playbook lists every task from contract to kick-off call.',
  },
  Offer: {
    plain: 'The specific service package you present to a potential client, including what they get and the price.',
  },
  'Red-team audit': {
    plain: 'Having someone deliberately try to find flaws in your plan before a client does.',
  },
  'Trust channel': {
    plain: 'The way a potential client first learns to trust you — referrals, content, events, etc.',
  },
  'Deal Desk': {
    plain: 'A central place where you manage and track all your active sales conversations.',
  },
  SLA: {
    plain: 'Service-level agreement — a promise about how fast or how well you will deliver.',
    example: 'An SLA might guarantee a response within 4 hours.',
  },
  'Guardrails Engine': {
    plain: 'An automated system that checks your work against rules to prevent mistakes.',
  },
  'Household Graph': {
    plain: 'A map showing how members of a wealthy family or household are connected.',
  },
  'Evidence Graph': {
    plain: 'A visual map linking proof points (testimonials, case studies, data) to claims you make.',
  },
  'Command AI': {
    plain: 'The AI assistant inside ChamberForge that helps you take actions and get answers.',
  },
  Retainer: {
    plain: 'A recurring fee a client pays for ongoing access to your services.',
    example: 'A $5,000/month retainer for advisory services.',
  },
  'Composite score': {
    plain: 'A single number combining multiple ratings into one easy-to-read score.',
  },
  'Orchestrated delivery': {
    plain: 'Coordinating multiple steps and people so the client experience feels seamless.',
  },
  KPI: {
    plain: 'Key performance indicator — a number you track to see if you are hitting your goals.',
    example: 'Monthly revenue is a common KPI.',
  },
  'Client portal': {
    plain: 'A private online area where your clients can see updates, files, and communicate with you.',
  },
  'Wealth event': {
    plain: 'A major financial event like selling a business, inheriting money, or an IPO.',
    example: 'A company acquisition is a wealth event that creates new advisory opportunities.',
  },
  'Pre-meeting brief': {
    plain: 'A summary you read before a meeting so you walk in prepared.',
  },
  'Proof asset': {
    plain: 'Any piece of evidence (case study, testimonial, data) that proves your service delivers results.',
  },
  'Revenue Projector': {
    plain: 'A tool that estimates how much money you will earn in the future based on current data.',
  },
  'Founder Readiness': {
    plain: 'How prepared a founder is to successfully offer premium services.',
  },
  MRR: {
    plain: 'Monthly recurring revenue — the predictable income you earn every month.',
    example: '10 clients paying $1,000/month = $10,000 MRR.',
  },
  ARR: {
    plain: 'Annual recurring revenue — your predictable yearly income (MRR x 12).',
  },
  Churn: {
    plain: 'When clients cancel or stop paying — the rate at which you lose customers.',
    example: 'If 2 out of 20 clients leave this month, your churn rate is 10%.',
  },
  Pipeline: {
    plain: 'All the potential deals you are working on that have not closed yet.',
  },
  Onboarding: {
    plain: 'The process of getting a new client set up and comfortable with your service.',
  },
  QA: {
    plain: 'Quality assurance — checking that work meets standards before delivering it.',
  },
  Compliance: {
    plain: 'Following the rules and regulations that apply to your industry or service.',
  },
  VoiceForge: {
    plain: 'A ChamberForge feature that helps you develop a consistent, professional communication style.',
  },
  VisionAudioForge: {
    plain: 'A ChamberForge feature for creating visual and audio content for your premium brand.',
  },
  Sandbox: {
    plain: 'A safe testing area where you can try things without affecting real clients or data.',
  },
  'Automation rule': {
    plain: 'A rule that tells the system to do something automatically when a condition is met.',
    example: 'Automatically send a welcome email when a new client signs up.',
  },
  Escalation: {
    plain: 'Sending a problem to someone with more authority or expertise to handle it.',
  },
  Tier: {
    plain: 'A level or rank — often used to group clients or services by value or priority.',
    example: 'Tier 1 clients get the fastest response times.',
  },
  'Pain category': {
    plain: 'A type of problem your clients commonly face that your service can solve.',
  },
  'Lifecycle Radar': {
    plain: 'A dashboard view showing where each client is in their journey with you.',
  },
  'Trend Radar': {
    plain: 'A tool that tracks industry trends so you can spot opportunities early.',
  },
};
