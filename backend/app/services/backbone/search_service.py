"""Elasticsearch search service with graceful degradation."""
import logging
from typing import Optional

from elasticsearch import AsyncElasticsearch, NotFoundError
from elasticsearch.helpers import async_bulk

logger = logging.getLogger(__name__)


class SearchService:
    """Full-text search service backed by Elasticsearch.

    Gracefully handles ES being unavailable — returns empty results
    instead of raising exceptions.
    """

    def __init__(self, es_url: str) -> None:
        self.available = False
        try:
            self.client = AsyncElasticsearch(
                hosts=[es_url],
                request_timeout=5,
                retry_on_timeout=False,
                max_retries=1,
            )
            self.available = True
        except Exception:
            logger.warning("Elasticsearch client creation failed — search disabled")
            self.client = None

    async def _check_available(self) -> bool:
        """Ping ES to confirm connectivity; update self.available."""
        if self.client is None:
            self.available = False
            return False
        try:
            self.available = await self.client.ping()
        except Exception:
            self.available = False
        return self.available

    # ------------------------------------------------------------------
    # Index management
    # ------------------------------------------------------------------

    async def create_index(self, index_name: str, mapping: dict) -> bool:
        """Create an index with the given mapping. Returns False on failure."""
        if not await self._check_available():
            return False
        try:
            exists = await self.client.indices.exists(index=index_name)
            if not exists:
                await self.client.indices.create(
                    index=index_name,
                    body={"mappings": mapping},
                )
            return True
        except Exception as exc:
            logger.error("create_index(%s) failed: %s", index_name, exc)
            return False

    # ------------------------------------------------------------------
    # Document CRUD
    # ------------------------------------------------------------------

    async def index_document(
        self, index_name: str, doc_id: str, document: dict
    ) -> bool:
        """Index a single document. Returns False if ES unavailable."""
        if not await self._check_available():
            return False
        try:
            await self.client.index(
                index=index_name, id=doc_id, document=document, refresh="wait_for"
            )
            return True
        except Exception as exc:
            logger.error("index_document(%s, %s) failed: %s", index_name, doc_id, exc)
            return False

    async def delete_document(self, index_name: str, doc_id: str) -> bool:
        """Delete a single document. Returns False on failure."""
        if not await self._check_available():
            return False
        try:
            await self.client.delete(
                index=index_name, id=doc_id, refresh="wait_for"
            )
            return True
        except NotFoundError:
            return True  # already gone
        except Exception as exc:
            logger.error("delete_document(%s, %s) failed: %s", index_name, doc_id, exc)
            return False

    # ------------------------------------------------------------------
    # Search
    # ------------------------------------------------------------------

    async def search(
        self,
        index_name: str,
        query: str,
        filters: Optional[dict] = None,
        page: int = 1,
        size: int = 20,
    ) -> dict:
        """Full-text search with optional keyword filters.

        Returns ``{results, total, page, size}`` — empty on failure.
        """
        empty = {"results": [], "total": 0, "page": page, "size": size}

        if not await self._check_available():
            return empty

        must_clauses: list[dict] = []
        if query:
            must_clauses.append(
                {"multi_match": {"query": query, "fields": ["*"], "fuzziness": "AUTO"}}
            )

        filter_clauses: list[dict] = []
        if filters:
            for field, value in filters.items():
                if isinstance(value, list):
                    filter_clauses.append({"terms": {field: value}})
                else:
                    filter_clauses.append({"term": {field: value}})

        body: dict = {
            "query": {
                "bool": {
                    "must": must_clauses or [{"match_all": {}}],
                    "filter": filter_clauses,
                }
            },
            "from": (page - 1) * size,
            "size": size,
            "highlight": {
                "fields": {"*": {}},
                "pre_tags": ["<mark>"],
                "post_tags": ["</mark>"],
            },
        }

        try:
            resp = await self.client.search(index=index_name, body=body)
            hits = resp.get("hits", {})
            results = []
            for hit in hits.get("hits", []):
                item = {
                    "id": hit["_id"],
                    "index": hit["_index"],
                    "score": hit["_score"],
                    **hit["_source"],
                }
                if "highlight" in hit:
                    item["highlight"] = hit["highlight"]
                results.append(item)
            total_value = hits.get("total", {})
            total = (
                total_value["value"]
                if isinstance(total_value, dict)
                else int(total_value)
            )
            return {"results": results, "total": total, "page": page, "size": size}
        except Exception as exc:
            logger.error("search(%s, %r) failed: %s", index_name, query, exc)
            return empty

    # ------------------------------------------------------------------
    # Bulk operations
    # ------------------------------------------------------------------

    async def bulk_index(
        self, index_name: str, documents: list[dict]
    ) -> dict:
        """Bulk-index documents. Each doc must have an ``id`` key.

        Returns ``{indexed, errors}``.
        """
        result = {"indexed": 0, "errors": 0}
        if not await self._check_available():
            result["errors"] = len(documents)
            return result

        actions = []
        for doc in documents:
            doc_copy = dict(doc)
            doc_id = doc_copy.pop("id", None)
            action = {"_index": index_name, "_source": doc_copy}
            if doc_id is not None:
                action["_id"] = doc_id
            actions.append(action)

        try:
            success, errors = await async_bulk(
                self.client, actions, raise_on_error=False, refresh="wait_for"
            )
            result["indexed"] = success
            result["errors"] = len(errors) if isinstance(errors, list) else 0
        except Exception as exc:
            logger.error("bulk_index(%s) failed: %s", index_name, exc)
            result["errors"] = len(documents)

        return result

    async def reindex_all(
        self, index_name: str, documents: list[dict]
    ) -> dict:
        """Delete the index, recreate it, and bulk-index all documents.

        Returns ``{indexed, errors}``.
        """
        if not await self._check_available():
            return {"indexed": 0, "errors": len(documents)}

        try:
            exists = await self.client.indices.exists(index=index_name)
            if exists:
                await self.client.indices.delete(index=index_name)
            await self.client.indices.create(index=index_name)
        except Exception as exc:
            logger.error("reindex_all(%s) delete/create failed: %s", index_name, exc)
            return {"indexed": 0, "errors": len(documents)}

        return await self.bulk_index(index_name, documents)

    # ------------------------------------------------------------------
    # Health
    # ------------------------------------------------------------------

    async def health(self) -> dict:
        """Return ES cluster health or a degraded status."""
        if not await self._check_available():
            return {"status": "unavailable"}
        try:
            info = await self.client.cluster.health()
            return {
                "status": info.get("status", "unknown"),
                "number_of_nodes": info.get("number_of_nodes", 0),
                "active_shards": info.get("active_shards", 0),
            }
        except Exception:
            return {"status": "unavailable"}

    async def close(self) -> None:
        """Close the underlying transport."""
        if self.client:
            await self.client.close()
