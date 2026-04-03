# Prompt 11: Layer 7 — Polish Layer (All 4 Modules)
Branch: ai-feature/polish-layer

## Mission
Build all 4 Polish modules: Template Versioning, Crisis Mode Console, Cross-Playbook Composer, Red-Team Offer Auditor.

## What to Build

### Backend
1. **services/backbone/template_versioning.py** — Version control for offer templates: version history, live migration without breaking active client engagements, rollback to previous version, diff viewer between versions
2. **services/backbone/crisis_console.py** — Fast-switch fraud/incident interface: verified channels list, escalation trees (who to call in what order), incident timeline, lockdown actions (freeze accounts, revoke access), integration hooks for VoiceForge crisis escalation
3. **services/backbone/cross_playbook.py** — Bundle 2-3 playbooks into one orchestrated premium system: playbook selection UI, merged SOP generation, combined pricing calculator, unified client journey map. Example: Private Ops Office + Footprint Reduction + Family Cyber Command = Household Protection Retainer at $35-65K/mo
4. **services/backbone/red_team_auditor.py** — Adversarial pre-launch check on any offer: compliance gaps, delivery fragility assessment, margin stress test, competitive vulnerability scan. Returns a scored report with PASS/WARN/FAIL per dimension.
5. **api/v1/polish.py** — All polish layer endpoints

### Frontend
1. **app/build/versioning/page.tsx** — Template version history with diff viewer
2. **app/build/crisis/page.tsx** — Crisis Mode Console with escalation tree, incident timeline, lockdown controls
3. **app/build/composer/page.tsx** — Cross-Playbook Composer: drag-and-drop playbook bundling with live pricing preview
4. **app/build/red-team/page.tsx** — Red-Team audit results dashboard with scored dimensions
5. **components/modules/EscalationTree.tsx** — Interactive tree showing escalation path
6. **components/modules/PlaybookComposer.tsx** — Drag-and-drop playbook bundling interface
7. **components/modules/AuditScorecard.tsx** — PASS/WARN/FAIL scorecard for red-team results

## Tests
- test template versioning migration logic
- test crisis console escalation tree building
- test cross-playbook pricing composition
- test red-team auditor scoring

## Commit
feat: add Polish layer — template versioning, crisis console, cross-playbook composer, red-team auditor
