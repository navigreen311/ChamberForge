# Prompt 24: Frontend Layout Shell — Navigation, Sidebar, Theme
Branch: ai-feature/frontend-layout-shell

## Mission
Build the complete frontend layout shell: authenticated layout with sidebar navigation, top bar, breadcrumbs, theme system (dark/light), and responsive design.

## What to Build

### Frontend
1. **components/layout/AppShell.tsx** — Main authenticated layout: sidebar + top bar + content area + notification panel
2. **components/layout/Sidebar.tsx** — Collapsible sidebar with navigation groups matching the 10 layers:
   - Dashboard (Command AI)
   - Discover (problems, evidence, trends)
   - Qualify (validation, buyer profiler, guardrails)
   - Build (offers, pricing, fulfillment, playbooks, household graph, billing)
   - Sell & Retain (marketing, revenue, persona sim, retention, decision room)
   - Compliance (consent, explainability, quality, comms, benchmarks)
   - Lifecycle (intel briefs, health, alumni, scenario planner)
   - Admin (eval lab, entitlements, rules, records, trust center, sandbox, runtime, jobs, email, documents)
   Role-based visibility (admin sees Admin section, others don't)
3. **components/layout/TopBar.tsx** — Logo, global search (Cmd+K), notification bell, user avatar menu
4. **components/layout/Breadcrumbs.tsx** — Auto-generated breadcrumbs from route path
5. **components/layout/UserMenu.tsx** — Avatar dropdown: profile, workspace settings, theme toggle, logout
6. **components/ui/ThemeProvider.tsx** — Dark/light theme provider with system preference detection
7. **components/ui/Button.tsx** — Reusable button: primary, secondary, ghost, danger variants + sizes
8. **components/ui/Card.tsx** — Reusable card component
9. **components/ui/Badge.tsx** — Status badges with color variants
10. **components/ui/Modal.tsx** — Reusable modal dialog
11. **components/ui/Table.tsx** — Data table with sorting, pagination, row actions
12. **components/ui/Input.tsx** — Form input with label, error state, variants
13. **components/ui/Select.tsx** — Dropdown select with search
14. **components/ui/Tabs.tsx** — Tab navigation component
15. **components/ui/Toast.tsx** — Toast notification system
16. **lib/api.ts** — Axios API client with auth interceptor, base URL config, error handling
17. **hooks/useAuth.ts** — Authentication hook (session, user, workspace, role)
18. **types/index.ts** — Shared TypeScript types for all entities (Problem, Evidence, Offer, Client, etc.)
19. **app/(authenticated)/layout.tsx** — Authenticated route group layout using AppShell

## Tests
- test Sidebar renders correct items for each role
- test theme toggle persists preference
- test breadcrumb generation from routes
- test API client interceptor adds auth header

## Commit
feat: add frontend layout shell — sidebar, top bar, breadcrumbs, theme system, reusable UI components
