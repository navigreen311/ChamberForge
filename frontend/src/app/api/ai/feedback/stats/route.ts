import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    totalFeedbackItems: 1842,
    averageRating: 4.3,
    ratingDistribution: { '5': 680, '4': 612, '3': 320, '2': 148, '1': 82 },
    feedbackByAgent: [
      { agentId: 'agent-discover', agentName: 'Discovery Scanner', avgRating: 4.5, totalFeedback: 420, thumbsUp: 368, thumbsDown: 52 },
      { agentId: 'agent-risk', agentName: 'Risk Sentinel', avgRating: 4.6, totalFeedback: 380, thumbsUp: 342, thumbsDown: 38 },
      { agentId: 'agent-playbook', agentName: 'Playbook Composer', avgRating: 4.1, totalFeedback: 310, thumbsUp: 248, thumbsDown: 62 },
      { agentId: 'agent-redteam', agentName: 'Red Team Challenger', avgRating: 3.9, totalFeedback: 186, thumbsUp: 130, thumbsDown: 56 },
      { agentId: 'agent-deliver', agentName: 'Delivery Engine', avgRating: 4.4, totalFeedback: 346, thumbsUp: 298, thumbsDown: 48 },
      { agentId: 'agent-evidence', agentName: 'Evidence Collector', avgRating: 4.2, totalFeedback: 200, thumbsUp: 164, thumbsDown: 36 },
    ],
    recentTrends: [
      { week: '2026-W10', avgRating: 4.1, feedbackCount: 145 },
      { week: '2026-W11', avgRating: 4.2, feedbackCount: 162 },
      { week: '2026-W12', avgRating: 4.3, feedbackCount: 158 },
      { week: '2026-W13', avgRating: 4.4, feedbackCount: 171 },
    ],
    topIssues: [
      { issue: 'Playbook suggestions sometimes miss client-specific constraints', count: 34, severity: 'medium' },
      { issue: 'Red team challenges occasionally too aggressive for conservative clients', count: 28, severity: 'low' },
      { issue: 'Evidence source latency during peak hours', count: 22, severity: 'medium' },
    ],
  })
}
