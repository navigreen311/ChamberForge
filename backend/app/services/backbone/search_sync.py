"""Sync entity changes to Elasticsearch as background tasks."""
from __future__ import annotations

from app.core.config import settings
from app.services.backbone.search_indices import (
    CLIENT_INDEX,
    EVIDENCE_INDEX,
    OFFER_INDEX,
    PROBLEM_INDEX,
)
from app.services.backbone.search_service import SearchService

_search: SearchService | None = None


def get_search() -> SearchService:
    """Lazy-init singleton SearchService."""
    global _search
    if _search is None:
        _search = SearchService(settings.ELASTICSEARCH_URL)
    return _search


async def sync_problem(problem_id: str, data: dict) -> None:
    svc = get_search()
    if svc.available:
        await svc.index_document(PROBLEM_INDEX, problem_id, data)


async def sync_evidence(evidence_id: str, data: dict) -> None:
    svc = get_search()
    if svc.available:
        await svc.index_document(EVIDENCE_INDEX, evidence_id, data)


async def sync_offer(offer_id: str, data: dict) -> None:
    svc = get_search()
    if svc.available:
        await svc.index_document(OFFER_INDEX, offer_id, data)


async def sync_client(client_id: str, data: dict) -> None:
    svc = get_search()
    if svc.available:
        await svc.index_document(CLIENT_INDEX, client_id, data)


async def remove_from_index(index_name: str, doc_id: str) -> None:
    svc = get_search()
    if svc.available:
        await svc.delete_document(index_name, doc_id)
