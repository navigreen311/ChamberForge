"""Integration tests verifying real Elasticsearch operations (not mocks).

Run with: pytest tests/integration/test_real_elasticsearch.py -c conftest_docker.py
"""
import uuid

import pytest
import pytest_asyncio

from app.services.backbone.search_service import SearchService
from app.services.backbone.search_indices import (
    PROBLEM_INDEX,
    PROBLEM_MAPPING,
    CLIENT_INDEX,
    CLIENT_MAPPING,
)


ES_URL = "http://localhost:9201"
TEST_INDEX = f"test_integration_{uuid.uuid4().hex[:8]}"


@pytest_asyncio.fixture(scope="module")
async def search_service():
    """Create a SearchService connected to the real test ES instance."""
    svc = SearchService(ES_URL)
    assert svc.available, "Elasticsearch is not available at " + ES_URL
    yield svc
    # Clean up test indices
    try:
        indices = await svc.client.indices.get(index="test_integration_*")
        for idx_name in indices:
            await svc.client.indices.delete(index=idx_name)
    except Exception:
        pass
    try:
        exists = await svc.client.indices.exists(index=PROBLEM_INDEX)
        if exists:
            await svc.client.indices.delete(index=PROBLEM_INDEX)
    except Exception:
        pass
    try:
        exists = await svc.client.indices.exists(index=CLIENT_INDEX)
        if exists:
            await svc.client.indices.delete(index=CLIENT_INDEX)
    except Exception:
        pass
    await svc.close()


@pytest.mark.asyncio
class TestIndexCreation:
    """Verify ES index creation with mappings."""

    async def test_create_index_succeeds(self, search_service):
        """Creating a new index returns True."""
        result = await search_service.create_index(TEST_INDEX, PROBLEM_MAPPING)
        assert result is True

    async def test_create_index_is_idempotent(self, search_service):
        """Creating an already-existing index doesn't error."""
        await search_service.create_index(TEST_INDEX, PROBLEM_MAPPING)
        result = await search_service.create_index(TEST_INDEX, PROBLEM_MAPPING)
        assert result is True

    async def test_index_has_correct_mappings(self, search_service):
        """Created index has the expected field mappings."""
        await search_service.create_index(PROBLEM_INDEX, PROBLEM_MAPPING)
        mapping = await search_service.client.indices.get_mapping(index=PROBLEM_INDEX)
        props = mapping[PROBLEM_INDEX]["mappings"]["properties"]
        assert "title" in props
        assert "pain_category" in props
        assert props["pain_category"]["type"] == "keyword"


@pytest.mark.asyncio
class TestDocumentIndexing:
    """Verify document CRUD operations."""

    async def test_index_and_retrieve_document(self, search_service):
        """Index a document and retrieve it by ID."""
        await search_service.create_index(PROBLEM_INDEX, PROBLEM_MAPPING)

        doc_id = str(uuid.uuid4())
        doc = {
            "title": "Estate tax optimization for UHNW families",
            "description": "Complex multi-generational wealth transfer strategies",
            "pain_category": "tax_optimization",
            "wealth_tier": "uhnw",
            "urgency_score": 8,
            "workspace_id": str(uuid.uuid4()),
        }
        result = await search_service.index_document(PROBLEM_INDEX, doc_id, doc)
        assert result is True

        # Retrieve directly
        retrieved = await search_service.client.get(index=PROBLEM_INDEX, id=doc_id)
        assert retrieved["_source"]["title"] == doc["title"]
        assert retrieved["_source"]["pain_category"] == "tax_optimization"

    async def test_delete_document(self, search_service):
        """Delete a document and verify it's gone."""
        await search_service.create_index(PROBLEM_INDEX, PROBLEM_MAPPING)

        doc_id = str(uuid.uuid4())
        await search_service.index_document(
            PROBLEM_INDEX, doc_id, {"title": "To be deleted", "pain_category": "test"}
        )

        result = await search_service.delete_document(PROBLEM_INDEX, doc_id)
        assert result is True

        from elasticsearch import NotFoundError
        with pytest.raises(NotFoundError):
            await search_service.client.get(index=PROBLEM_INDEX, id=doc_id)


@pytest.mark.asyncio
class TestFullTextSearch:
    """Verify full-text search returns relevant results."""

    async def test_search_by_keyword(self, search_service):
        """Full-text search finds documents matching query terms."""
        await search_service.create_index(PROBLEM_INDEX, PROBLEM_MAPPING)

        ws_id = str(uuid.uuid4())
        docs = [
            {
                "title": "Luxury yacht insurance coverage gaps",
                "description": "Coverage analysis for high-value marine assets",
                "pain_category": "insurance",
                "wealth_tier": "hnw",
                "urgency_score": 5,
                "workspace_id": ws_id,
            },
            {
                "title": "Private aviation regulatory compliance",
                "description": "FAA and international aviation law requirements",
                "pain_category": "compliance",
                "wealth_tier": "uhnw",
                "urgency_score": 7,
                "workspace_id": ws_id,
            },
            {
                "title": "Family office succession planning",
                "description": "Multi-generational governance and transition",
                "pain_category": "succession",
                "wealth_tier": "uhnw",
                "urgency_score": 9,
                "workspace_id": ws_id,
            },
        ]
        for i, doc in enumerate(docs):
            await search_service.index_document(PROBLEM_INDEX, f"search-test-{i}", doc)

        # Search for "yacht"
        results = await search_service.search(PROBLEM_INDEX, "yacht")
        assert results["total"] >= 1
        titles = [r["title"] for r in results["results"]]
        assert any("yacht" in t.lower() for t in titles)

    async def test_search_returns_highlights(self, search_service):
        """Search results include highlight snippets."""
        results = await search_service.search(PROBLEM_INDEX, "aviation")
        if results["total"] > 0:
            # At least one result should have highlights
            has_highlights = any("highlight" in r for r in results["results"])
            assert has_highlights

    async def test_search_empty_query_returns_all(self, search_service):
        """An empty query string returns all documents (match_all)."""
        results = await search_service.search(PROBLEM_INDEX, "")
        assert results["total"] >= 1


@pytest.mark.asyncio
class TestFacetedFiltering:
    """Verify keyword-based filtering (facets) in search."""

    async def test_filter_by_single_keyword(self, search_service):
        """Filtering by a keyword field narrows results."""
        await search_service.create_index(CLIENT_INDEX, CLIENT_MAPPING)

        ws_id = str(uuid.uuid4())
        clients = [
            {"name": "Alice Wealthington", "wealth_tier": "uhnw", "status": "active", "workspace_id": ws_id},
            {"name": "Bob Richman", "wealth_tier": "hnw", "status": "active", "workspace_id": ws_id},
            {"name": "Carol Bigsworth", "wealth_tier": "uhnw", "status": "inactive", "workspace_id": ws_id},
        ]
        for i, c in enumerate(clients):
            await search_service.index_document(CLIENT_INDEX, f"filter-test-{i}", c)

        results = await search_service.search(
            CLIENT_INDEX, "", filters={"wealth_tier": "uhnw"}
        )
        assert results["total"] >= 2
        for r in results["results"]:
            assert r.get("wealth_tier") == "uhnw"

    async def test_filter_by_multiple_values(self, search_service):
        """Filtering with a list of values uses terms query."""
        results = await search_service.search(
            CLIENT_INDEX, "", filters={"status": ["active", "inactive"]}
        )
        assert results["total"] >= 1

    async def test_combined_search_and_filter(self, search_service):
        """Full-text search combined with keyword filter works."""
        results = await search_service.search(
            CLIENT_INDEX, "Alice", filters={"wealth_tier": "uhnw"}
        )
        assert results["total"] >= 1
        assert any("Alice" in r.get("name", "") for r in results["results"])
