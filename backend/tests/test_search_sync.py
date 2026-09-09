"""Tests for search_sync — entity sync to Elasticsearch."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.backbone.search_indices import PROBLEM_INDEX
from app.services.backbone.search_sync import (
    remove_from_index,
    sync_evidence,
    sync_offer,
    sync_problem,
)

# ── Helpers ─────────────────────────────────────────────────────────────


def _mock_search_service(available: bool = True) -> MagicMock:
    """Return a mock SearchService with configurable availability."""
    svc = MagicMock()
    svc.available = available
    svc.index_document = AsyncMock(return_value=True)
    svc.delete_document = AsyncMock(return_value=True)
    return svc


# ── sync_problem ────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_sync_problem_indexes_document():
    mock_svc = _mock_search_service(available=True)
    with patch("app.services.backbone.search_sync.get_search", return_value=mock_svc):
        await sync_problem("p-1", {"title": "Tax pain", "description": "desc"})
    mock_svc.index_document.assert_awaited_once_with(
        "chamberforge_problems", "p-1", {"title": "Tax pain", "description": "desc"}
    )


@pytest.mark.asyncio
async def test_sync_problem_skips_when_unavailable():
    mock_svc = _mock_search_service(available=False)
    with patch("app.services.backbone.search_sync.get_search", return_value=mock_svc):
        await sync_problem("p-1", {"title": "Tax pain"})
    mock_svc.index_document.assert_not_awaited()


# ── sync_evidence ───────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_sync_evidence_indexes_document():
    mock_svc = _mock_search_service(available=True)
    with patch("app.services.backbone.search_sync.get_search", return_value=mock_svc):
        await sync_evidence("e-1", {"source_url": "https://example.com"})
    mock_svc.index_document.assert_awaited_once_with(
        "chamberforge_evidence", "e-1", {"source_url": "https://example.com"}
    )


# ── sync_offer ──────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_sync_offer_indexes_document():
    mock_svc = _mock_search_service(available=True)
    with patch("app.services.backbone.search_sync.get_search", return_value=mock_svc):
        await sync_offer("o-1", {"name": "Premium Package"})
    mock_svc.index_document.assert_awaited_once_with(
        "chamberforge_offers", "o-1", {"name": "Premium Package"}
    )


# ── remove_from_index ──────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_remove_from_index_deletes_document():
    mock_svc = _mock_search_service(available=True)
    with patch("app.services.backbone.search_sync.get_search", return_value=mock_svc):
        await remove_from_index(PROBLEM_INDEX, "p-99")
    mock_svc.delete_document.assert_awaited_once_with("chamberforge_problems", "p-99")


@pytest.mark.asyncio
async def test_remove_from_index_skips_when_unavailable():
    mock_svc = _mock_search_service(available=False)
    with patch("app.services.backbone.search_sync.get_search", return_value=mock_svc):
        await remove_from_index(PROBLEM_INDEX, "p-99")
    mock_svc.delete_document.assert_not_awaited()
