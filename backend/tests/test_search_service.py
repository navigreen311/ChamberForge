"""Tests for SearchService — graceful degradation and mocked ES."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.backbone.search_service import SearchService

# ── Unavailable ES returns empty results ─────────────────────────────


@pytest.fixture
def unavailable_service():
    """Service whose client is None (ES unreachable)."""
    svc = SearchService.__new__(SearchService)
    svc.client = None
    svc.available = False
    return svc


@pytest.mark.asyncio
async def test_search_unavailable_returns_empty(unavailable_service):
    result = await unavailable_service.search("any_index", "hello")
    assert result == {"results": [], "total": 0, "page": 1, "size": 20}


@pytest.mark.asyncio
async def test_index_document_unavailable_returns_false(unavailable_service):
    ok = await unavailable_service.index_document("idx", "1", {"title": "x"})
    assert ok is False


@pytest.mark.asyncio
async def test_delete_document_unavailable_returns_false(unavailable_service):
    ok = await unavailable_service.delete_document("idx", "1")
    assert ok is False


@pytest.mark.asyncio
async def test_bulk_index_unavailable_returns_all_errors(unavailable_service):
    docs = [{"id": "1"}, {"id": "2"}]
    result = await unavailable_service.bulk_index("idx", docs)
    assert result == {"indexed": 0, "errors": 2}


@pytest.mark.asyncio
async def test_create_index_unavailable(unavailable_service):
    ok = await unavailable_service.create_index("idx", {})
    assert ok is False


@pytest.mark.asyncio
async def test_reindex_all_unavailable(unavailable_service):
    result = await unavailable_service.reindex_all("idx", [{"id": "1"}])
    assert result["indexed"] == 0
    assert result["errors"] == 1


# ── Mocked ES client ────────────────────────────────────────────────


@pytest.fixture
def mock_service():
    """Service with a fully mocked AsyncElasticsearch client."""
    svc = SearchService.__new__(SearchService)
    svc.available = True
    svc.client = AsyncMock()
    svc.client.ping = AsyncMock(return_value=True)
    return svc


@pytest.mark.asyncio
async def test_index_document_success(mock_service):
    mock_service.client.index = AsyncMock()
    ok = await mock_service.index_document("idx", "42", {"title": "Hello"})
    assert ok is True
    mock_service.client.index.assert_awaited_once()


@pytest.mark.asyncio
async def test_search_returns_results(mock_service):
    mock_service.client.search = AsyncMock(return_value={
        "hits": {
            "total": {"value": 1},
            "hits": [
                {
                    "_id": "1",
                    "_index": "idx",
                    "_score": 1.5,
                    "_source": {"title": "Test"},
                }
            ],
        }
    })
    result = await mock_service.search("idx", "test")
    assert result["total"] == 1
    assert len(result["results"]) == 1
    assert result["results"][0]["id"] == "1"
    assert result["results"][0]["title"] == "Test"


@pytest.mark.asyncio
async def test_search_with_filters(mock_service):
    mock_service.client.search = AsyncMock(return_value={
        "hits": {"total": {"value": 0}, "hits": []}
    })
    result = await mock_service.search(
        "idx", "query", filters={"status": "active"}, page=2, size=10
    )
    assert result["page"] == 2
    assert result["size"] == 10
    call_body = mock_service.client.search.call_args
    body = call_body.kwargs.get("body") or call_body[1].get("body")
    assert any("term" in f for f in body["query"]["bool"]["filter"])


@pytest.mark.asyncio
async def test_bulk_index_counts(mock_service):
    with patch(
        "app.services.backbone.search_service.async_bulk",
        new_callable=AsyncMock,
        return_value=(3, []),
    ):
        result = await mock_service.bulk_index(
            "idx",
            [{"id": "1", "t": "a"}, {"id": "2", "t": "b"}, {"id": "3", "t": "c"}],
        )
    assert result["indexed"] == 3
    assert result["errors"] == 0


@pytest.mark.asyncio
async def test_delete_document_success(mock_service):
    mock_service.client.delete = AsyncMock()
    ok = await mock_service.delete_document("idx", "1")
    assert ok is True


@pytest.mark.asyncio
async def test_health_available(mock_service):
    mock_service.client.cluster = MagicMock()
    mock_service.client.cluster.health = AsyncMock(return_value={
        "status": "green",
        "number_of_nodes": 3,
        "active_shards": 10,
    })
    h = await mock_service.health()
    assert h["status"] == "green"


@pytest.mark.asyncio
async def test_health_unavailable(unavailable_service):
    h = await unavailable_service.health()
    assert h["status"] == "unavailable"
