import { NextResponse } from 'next/server'

// TODO: Replace with database query joining problems, evidence, and playbook tables
// TODO: Add caching layer for frequently accessed problem details
// TODO: Implement evidence freshness validation on read
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const problems: Record<
    string,
    {
      id: string
      title: string
      description: string
      wealth_tier: string
      pain_category: string
      lifecycle_stage: string
      urgency_score: number
      credibility_score: number
      wtp_signal: string
      composite_score: number
      wtp_range: string
      citation_count: number
      buyer_type: string
      compliance_risk: string
      trust_channel: string
      source_types: string[]
      created_at: string
      is_new: boolean
      evidence_citations: {
        source: string
        claim: string
        date: string
        credibility: number
      }[]
      matched_playbook_slug: string
    }
  > = {
    'ai-voice-fraud': {
      id: 'ai-voice-fraud',
      title: 'AI Voice Cloning & Deepfake Fraud',
      description:
        'Cybercriminals are using AI to clone voices of trusted family members and CFOs. FBI documented 300% increase in AI-enabled impersonation targeting HNW households with average loss per incident exceeding $2M.',
      wealth_tier: 'UHNW ($30M+)',
      pain_category: 'Risk & Security',
      lifecycle_stage: 'Emerging',
      urgency_score: 9.5,
      credibility_score: 8.4,
      wtp_signal: 'Very High',
      composite_score: 92,
      wtp_range: '$75K-$300K/year',
      citation_count: 11,
      buyer_type: 'Family Office COO',
      compliance_risk: 'Critical',
      trust_channel: 'Peer Network',
      source_types: ['FBI Alert', 'IC3 Report', 'Deloitte Survey'],
      created_at: '2026-03-15T09:00:00Z',
      is_new: true,
      evidence_citations: [
        { source: 'FBI Internet Crime Report Q1 2026', claim: 'AI voice cloning used in 28% of wire fraud attempts targeting family offices', date: '2026-03-25', credibility: 9.4 },
        { source: 'Deloitte Family Office Cybersecurity Survey 2025', claim: '68% of family offices lack formal incident response plans for AI-enabled attacks', date: '2025-08-20', credibility: 9.1 },
        { source: 'FTC Consumer Alert - AI Impersonation', claim: 'Average loss per AI voice fraud incident: $2.3M for HNW targets', date: '2026-02-14', credibility: 8.8 },
        { source: 'Pindrop Voice Intelligence Report 2026', claim: 'Voice cloning quality now indistinguishable from real in 92% of blind tests', date: '2026-01-10', credibility: 7.9 },
      ],
      matched_playbook_slug: 'family-cyber-command',
    },
    'coordination-overload': {
      id: 'coordination-overload',
      title: 'Multi-Advisor Coordination Overload',
      description:
        'Wealthy families employ an average of 7.4 professional advisors with no coordination mechanism. Result: duplicated work, conflicting advice, and 15-30% value leakage from uncoordinated decisions.',
      wealth_tier: 'HNW ($5M-$30M)',
      pain_category: 'Operational Efficiency',
      lifecycle_stage: 'Accelerating',
      urgency_score: 8.1,
      credibility_score: 8.6,
      wtp_signal: 'High',
      composite_score: 84,
      wtp_range: '$50K-$200K/year',
      citation_count: 15,
      buyer_type: 'Patriarch/Matriarch',
      compliance_risk: 'Medium',
      trust_channel: 'Trusted Advisor Referral',
      source_types: ['Industry Report', 'Capgemini WWR', 'Academic Study'],
      created_at: '2026-01-20T11:30:00Z',
      is_new: false,
      evidence_citations: [
        { source: 'Capgemini World Wealth Report 2025', claim: 'Average HNW family engages 7.4 professional advisors across legal, tax, investment, and lifestyle', date: '2025-07-10', credibility: 8.8 },
        { source: 'EY Family Office Benchmarking Study', claim: 'Fewer than 12% of HNW families have a formal advisory coordination mechanism', date: '2025-09-15', credibility: 8.5 },
        { source: 'Journal of Wealth Management', claim: 'Uncoordinated advisory ecosystems result in 15-30% value leakage annually', date: '2025-06-01', credibility: 7.8 },
        { source: 'McKinsey Private Banking Survey', claim: 'Cross-advisor conflicts cited as top frustration by 64% of HNW clients', date: '2025-10-05', credibility: 8.2 },
      ],
      matched_playbook_slug: 'wealth-coordination-hub',
    },
    'data-broker-exposure': {
      id: 'data-broker-exposure',
      title: 'Data Broker Exposure & Digital Privacy',
      description:
        'Personal data of HNW individuals is traded across 4,000+ data broker networks. Wealth profiles sold for as little as $200 fuel physical security threats, social engineering, and targeted litigation.',
      wealth_tier: 'HNW ($5M-$30M)',
      pain_category: 'Risk & Security',
      lifecycle_stage: 'Accelerating',
      urgency_score: 8.7,
      credibility_score: 8.2,
      wtp_signal: 'High',
      composite_score: 85,
      wtp_range: '$40K-$150K/year',
      citation_count: 13,
      buyer_type: 'Family Office COO',
      compliance_risk: 'High',
      trust_channel: 'Security Consultant',
      source_types: ['FTC Report', 'Privacy Research', 'Industry Survey'],
      created_at: '2026-02-10T14:00:00Z',
      is_new: false,
      evidence_citations: [
        { source: 'FTC Data Broker Ecosystem Report 2025', claim: 'Over 4,000 active data broker networks trading personal information globally', date: '2025-11-20', credibility: 9.0 },
        { source: 'Privacy Rights Clearinghouse Study', claim: 'HNW wealth profiles available for purchase at $200-$500 per dossier', date: '2025-08-15', credibility: 7.8 },
        { source: 'Ponemon Institute - HNW Privacy Survey', claim: '72% of HNW individuals unaware of extent of their data broker exposure', date: '2026-01-05', credibility: 8.3 },
        { source: 'World Privacy Forum - Data Broker Index', claim: 'Average HNW individual listed on 187 data broker sites', date: '2025-12-10', credibility: 7.6 },
      ],
      matched_playbook_slug: 'digital-privacy-shield',
    },
    'risk-governance-gaps': {
      id: 'risk-governance-gaps',
      title: 'Family Office Risk Governance Gaps',
      description:
        'Family offices managing $100M+ operate with corporate complexity but without proportionate governance. Only 23% have a formal risk committee, 18% conduct annual risk assessments.',
      wealth_tier: 'UHNW ($30M+)',
      pain_category: 'Regulatory & Compliance',
      lifecycle_stage: 'Proven',
      urgency_score: 8.3,
      credibility_score: 9.0,
      wtp_signal: 'High',
      composite_score: 86,
      wtp_range: '$80K-$300K/year',
      citation_count: 18,
      buyer_type: 'Family Office CEO',
      compliance_risk: 'Critical',
      trust_channel: 'Legal Network',
      source_types: ['Regulatory Filing', 'Industry Survey', 'Consulting Report'],
      created_at: '2025-11-05T10:15:00Z',
      is_new: false,
      evidence_citations: [
        { source: 'KPMG Family Office Governance Survey 2025', claim: 'Only 23% of family offices have a formal risk committee', date: '2025-09-20', credibility: 9.1 },
        { source: 'Deloitte Family Office Risk Management', claim: '18% conduct annual comprehensive risk assessments; fewer than 10% maintain a risk register', date: '2025-08-20', credibility: 9.0 },
        { source: 'FinCEN - Corporate Transparency Act Guidance', claim: 'New CTA reporting requirements affect 80%+ of family office structures', date: '2026-01-15', credibility: 9.5 },
        { source: 'Campden Wealth Global Family Office Report', claim: 'Key-person dependency identified as top operational risk by 57% of family offices', date: '2025-05-15', credibility: 8.4 },
        { source: 'AIG Private Client Group', claim: 'Family offices with formal governance frameworks see 20-30% lower insurance premiums', date: '2025-10-30', credibility: 7.8 },
      ],
      matched_playbook_slug: 'fo-risk-governance',
    },
    'healthcare-navigation': {
      id: 'healthcare-navigation',
      title: 'Elite Healthcare Navigation & Coordination',
      description:
        'HNW families face fragmented access to elite specialists and clinical trials. Average HNW patient sees 4.2 specialists with no coordination. Diagnostic delays reported by 34% of families.',
      wealth_tier: 'HNW ($5M-$30M)',
      pain_category: 'Lifestyle & Wellness',
      lifecycle_stage: 'Accelerating',
      urgency_score: 7.6,
      credibility_score: 8.1,
      wtp_signal: 'High',
      composite_score: 79,
      wtp_range: '$40K-$180K/year',
      citation_count: 10,
      buyer_type: 'HNW Individual',
      compliance_risk: 'Medium',
      trust_channel: 'Concierge Physician',
      source_types: ['PubMed', 'Industry Report', 'Survey Data'],
      created_at: '2026-02-25T08:45:00Z',
      is_new: false,
      evidence_citations: [
        { source: 'Journal of Concierge Medicine', claim: 'Average HNW patient sees 4.2 uncoordinated specialists annually', date: '2025-07-15', credibility: 8.0 },
        { source: 'Mayo Clinic Private Practice Report', claim: 'Medical errors from care fragmentation cost an estimated $2.1M per incident for HNW patients', date: '2025-11-10', credibility: 8.7 },
        { source: 'PwC Health Research Institute', claim: '34% of HNW families report at least one significant diagnostic delay in past 5 years', date: '2026-01-20', credibility: 8.2 },
        { source: 'Stanford Executive Health Program Data', claim: 'Navigated patients achieve 35% faster specialist access vs. self-referred', date: '2025-09-05', credibility: 7.9 },
      ],
      matched_playbook_slug: 'elite-health-navigation',
    },
  }

  const problem = problems[id]

  if (!problem) {
    return NextResponse.json(
      { error: 'Problem not found', problem_id: id },
      { status: 404 }
    )
  }

  return NextResponse.json(problem)
}
