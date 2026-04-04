"""Search API router — unified full-text search across ChamberForge."""
from __future__ import annotations

import json
import logging
from typing import Optional

from fastapi import APIRouter, Query

from app.core.cache import cache
from app.core.config import settings
from app.core.exceptions import ValidationError
from app.services.backbone.search_indices import get_all_indices
from app.services.backbone.search_service import SearchService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/search", tags=["search"])

# Lazy singleton — created on first request so the event loop exists.
_search_service: Optional[SearchService] = None


def _get_service() -> SearchService:
    global _search_service
    if _search_service is None:
        _search_service = SearchService(settings.ELASTICSEARCH_URL)
    return _search_service


# ── Endpoints ────────────────────────────────────────────────────────


@router.get("/")
async def unified_search(
    q: str = Query("", description="Search query"),
    index: str = Query("all", description="Index to search: problems|evidence|offers|clients|partners|experts|all"),
    filters: str = Query("{}", description="JSON-encoded filter dict"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
) -> dict:
    """Unified search endpoint (cached 60s).

    When ``index=all`` the query fans out to every registered index and
    results are merged by descending relevance score.
    """
    if not q or not q.strip():
        raise ValidationError("Search query required", {"q": "Search query must not be empty"})

    key = cache.make_key("search:unified", q=q, index=index, filters=filters, page=page, size=size)
    hit = cache.get(key)
    if hit is not None:
        return hit

    service = _get_service()

    try:
        parsed_filters = json.loads(filters) if filters else {}
    except json.JSONDecodeError:
        parsed_filters = {}

    all_indices = get_all_indices()

    if index == "all":
        targets = list(all_indices.keys())
    else:
        # Map friendly names to real index names
        friendly_map = {
            "problems": "chamberforge_problems",
            "evidence": "chamberforge_evidence",
            "offers": "chamberforge_offers",
            "clients": "chamberforge_clients",
            "partners": "chamberforge_partners",
            "experts": "chamberforge_experts",
        }
        resolved = friendly_map.get(index, index)
        targets = [resolved]

    merged_results: list[dict] = []
    total = 0

    for idx in targets:
        resp = await service.search(
            index_name=idx,
            query=q,
            filters=parsed_filters,
            page=page,
            size=size,
        )
        merged_results.extend(resp["results"])
        total += resp["total"]

    # Sort merged results by score (descending)
    merged_results.sort(key=lambda r: r.get("score") or 0, reverse=True)

    # Apply pagination window to the merged list when searching all indices
    if index == "all":
        merged_results = merged_results[:size]

    result = {
        "results": merged_results,
        "total": total,
        "page": page,
        "size": size,
    }
    cache.set(key, result, ttl_seconds=60)
    return result


@router.post("/reindex/{index_name}")
async def reindex(index_name: str) -> dict:
    """Trigger a full reindex for the given index (admin use)."""
    service = _get_service()
    result = await service.reindex_all(index_name, [])
    cache.invalidate_pattern("search:*")
    return {"index": index_name, **result}


@router.get("/health")
async def search_health() -> dict:
    """Return Elasticsearch cluster health."""
    service = _get_service()
    return await service.health()
