# Prompt 25: Frontend Dashboard — Command AI Main View
Branch: ai-feature/frontend-dashboard

## Mission
Build the main Command AI dashboard — the first screen users see after login. Shows next-best-action, synthesized metrics, agent status, daily brief, and quick navigation.

## What to Build

### Frontend
1. **app/dashboard/page.tsx** — Main dashboard layout with grid:
   - Hero: Next Best Action card (prominent, full-width)
   - Row 1: Key metrics (active problems, active offers, active clients, revenue MRR)
   - Row 2: Agent Status Grid (10 agents) + Daily Brief panel
   - Row 3: Top Opportunities list + Client Health alerts
   - Row 4: Recent Activity feed
2. **components/modules/NextActionCard.tsx** — Large card: action title, description, evidence links, confidence score, "Execute" and "Dismiss" buttons. Gold accent border for high-priority.
3. **components/modules/MetricCard.tsx** — Compact metric: label, value, trend arrow (up/down/flat), sparkline
4. **components/modules/AgentStatusGrid.tsx** — 2x5 grid: each agent shows name, status (idle/running/complete/error), last run time, output summary snippet
5. **components/modules/DailyBriefPanel.tsx** — Collapsible panel: date header, changes since yesterday, alerts, recommended actions checklist
6. **components/modules/OpportunityRanker.tsx** — Sorted list: problem name, buyer tier, probability × impact score, lifecycle badge, quick-action buttons
7. **components/modules/ClientHealthAlerts.tsx** — Alert cards for clients with health score below threshold
8. **components/modules/ActivityFeed.tsx** — Chronological feed: agent outputs, user actions, system events, with filtering
9. **hooks/useDashboard.ts** — Hook fetching all dashboard data from Command AI endpoints

## Tests
- test dashboard renders all sections
- test metric card trend arrow logic
- test agent status display states
- test opportunity sorting

## Commit
feat: add Command AI dashboard — next-best-action, metrics, agent status, daily brief, opportunity ranker
