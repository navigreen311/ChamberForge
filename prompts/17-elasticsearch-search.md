# Prompt 17: Elasticsearch Integration — Full-Text Search Across Platform
Branch: ai-feature/elasticsearch-search

## Mission
Build the Elasticsearch integration providing full-text search across problems, evidence, offers, clients, partners, and expert network.

## What to Build

### Backend
1. **services/backbone/search_service.py** — SearchService:
   - index_document(index_name, doc_id, document) — index any entity
   - search(index_name, query, filters, page, size) → SearchResults
   - bulk_index(index_name, documents) — batch indexing
   - delete_document(index_name, doc_id)
   - reindex_all(index_name) — full reindex from database
2. **services/backbone/search_indices.py** — Index definitions:
   - chamberforge_problems: title, description, pain_category, wealth_tier, lifecycle_stage, urgency_score
   - chamberforge_evidence: source_url, claims (nested), credibility_score, source_type
   - chamberforge_offers: name, value_stack, delivery_model, pricing, status
   - chamberforge_clients: name, company, wealth_tier, status, health_score
   - chamberforge_partners: name, domain, credentials, verification_status
   - chamberforge_experts: name, specialty, license_type, jurisdiction
3. **api/v1/search.py** — GET /api/v1/search?q=&index=&filters=&page=&size= — unified search endpoint with faceted filtering
4. **jobs/search_sync.py** — Background job: sync database changes to Elasticsearch indices (on create/update/delete events)

### Frontend
1. **components/modules/GlobalSearch.tsx** — Command-palette style search (Cmd+K): query input, result categories, quick navigation
2. **components/layout/SearchBar.tsx** — Top-bar search component used across all pages
3. **app/search/page.tsx** — Full search results page with faceted filters (by index, tier, status, etc.)

## Tests
- test index creation and mapping
- test search with various query types and filters
- test bulk indexing performance
- test sync job correctness

## Commit
feat: add Elasticsearch integration — full-text search across problems, evidence, offers, clients, partners
