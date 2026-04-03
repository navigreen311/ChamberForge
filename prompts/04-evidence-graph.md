# Prompt 04: Evidence Graph — Source Docs, Claims, Credibility, Recency Decay
Branch: ai-feature/evidence-graph

## Mission
Build the Evidence Graph system: source document ingestion, claim extraction via AI, credibility scoring (1-10), recency decay logic (18-month half-life), contradiction detection, and analyst review queue.

## What to Build

### Backend
1. **services/agents/research_ai.py** — ResearchAI agent:
   - ingest_source(url_or_text, source_type) → Evidence — extracts claims, scores credibility
   - detect_contradictions(problem_id) → list[ContradictionFlag] — compares claims across sources for same problem
   - compute_recency_decay(evidence_id) → float — score reduction formula: score * 0.5^(months_since_pub / 18)
   - refresh_stale_sources(threshold_months=18) — flags sources needing refresh
2. **services/backbone/evidence_ops.py** — EvidenceOps service:
   - CRUD for evidence records
   - link_to_problem(evidence_id, problem_id)
   - deduplication check on source_url
   - analyst_queue — list evidence needing human review (low credibility or contradictions)
3. **api/v1/evidence.py** — Full REST API: CRUD, search, link, analyst queue, contradiction report
4. **jobs/evidence_refresh.py** — Background job: weekly recency decay recalculation + stale source flagging

### Frontend
1. **app/discover/evidence/page.tsx** — Evidence Graph browser: source list with credibility scores, recency indicators
2. **components/modules/EvidenceCard.tsx** — Source card: title, type badge, credibility score bar, recency indicator, claim count
3. **components/modules/ContradictionAlert.tsx** — Alert showing conflicting claims between sources
4. **components/modules/AnalystQueue.tsx** — Queue table for human review items

### Elasticsearch
- Index: chamberforge_evidence — fields: source_url, source_type, claims (nested), credibility_score, publication_date, problem_ids

## Tests
- test ResearchAI claim extraction with mocked responses
- test recency decay formula at 0, 9, 18, 36 months
- test contradiction detection logic
- test Evidence API endpoints

## Commit
feat: add Evidence Graph with AI claim extraction, credibility scoring, recency decay, and contradiction detection
