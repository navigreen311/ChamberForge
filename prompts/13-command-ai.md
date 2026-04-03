# Prompt 13: Command AI — Orchestration Brain
Branch: ai-feature/command-ai

## Mission
Build Command AI — the platform's orchestration brain that synthesizes all agent outputs and tells the user exactly what to do next, why, and with what evidence.

## What to Build

### Backend
1. **services/agents/command_ai.py** — CommandAI orchestrator:
   - get_next_best_action(workspace_id) → NextAction — analyzes all agent outputs, user readiness, client health, opportunity probability-weighted ROI to determine the single most important next action
   - synthesize_dashboard(workspace_id) → DashboardSynthesis — aggregate view: top problems, active offers, client health, revenue forecast, pending risks, urgent actions
   - prioritize_opportunities(workspace_id) → list[PrioritizedOpportunity] — ranked list with probability * impact scoring
   - get_agent_status(workspace_id) → dict — what each of the 9 other agents has produced, pending, or flagged
   - generate_daily_brief(workspace_id) → DailyBrief — morning summary: what changed, what needs attention, recommended actions
2. **services/agents/base_agent.py** — BaseAgent abstract class that all 10 agents inherit from: common interface for invoke(), get_status(), get_last_output(), standard prompt construction with Problem Ontology context injection
3. **services/backbone/agent_orchestrator.py** — Manages agent coordination: parallel agent invocation, output aggregation, context sharing via Problem Ontology Engine, conflict resolution between agent recommendations
4. **api/v1/command.py** — GET /next-action, GET /dashboard, GET /opportunities, GET /daily-brief, GET /agent-status
5. **jobs/daily_brief.py** — Background job: generate daily brief every morning

### Frontend
1. **app/dashboard/page.tsx** — Main Command AI dashboard: next-best-action hero card, synthesized metrics, agent status grid, daily brief
2. **components/modules/NextActionCard.tsx** — Prominent card: action title, why, evidence links, one-click execute
3. **components/modules/AgentStatusGrid.tsx** — Grid showing each agent's status (idle/running/complete/error) with last output summary
4. **components/modules/DailyBriefPanel.tsx** — Collapsible morning brief with changes, alerts, recommendations
5. **components/modules/OpportunityRanker.tsx** — Sorted list of opportunities with probability × impact scores

## Tests
- test next-best-action prioritization logic
- test dashboard synthesis aggregation
- test daily brief generation
- test agent orchestrator parallel invocation
- test base agent interface compliance

## Commit
feat: add Command AI orchestration brain — next-best-action, dashboard synthesis, daily briefs, agent coordination
