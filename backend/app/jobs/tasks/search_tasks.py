"""Search index synchronization background tasks.

P-08 (T-030). Both tasks reported success without touching Elasticsearch:

    result = {"index_name": index_name, "doc_id": doc_id, "status": "indexed"}

and `full_reindex` returned `"status": "completed"` with `documents_indexed:
0` - a completed reindex that indexed nothing, which is exactly what a broken
one looks like too.

Both now call `SearchService`, which P-00 already wired to
`ELASTICSEARCH_URL`. The service returns `False` when Elasticsearch is
unavailable rather than raising, so these tasks distinguish *indexed* from
*could not index* instead of reporting both as success.
"""
import asyncio
import logging

from app.core.config import settings
from app.jobs._result import blocked, done
from app.jobs.celery_app import celery_app
from app.models.evidence import Evidence
from app.services.backbone.search_service import SearchService

logger = logging.getLogger(__name__)

REASON_UNAVAILABLE = "search_unavailable"

#: Indexed in batches so a large workspace does not build one enormous list.
REINDEX_BATCH = 500


def _service() -> SearchService:
    return SearchService(settings.ELASTICSEARCH_URL)


@celery_app.task(bind=True, name="app.jobs.tasks.search_tasks.sync_entity_to_search")
def sync_entity_to_search(self, index_name: str, doc_id: str, document: dict) -> dict:
    """Index or update a single document.

    Returns a blocked result rather than "indexed" when Elasticsearch is
    unreachable. A search index silently missing recent documents is a
    failure that surfaces later as absent results, with nothing pointing at
    the cause.
    """
    logger.info("Syncing doc %s to index %s", doc_id, index_name)

    async def _run() -> bool:
        service = _service()
        try:
            return await service.index_document(index_name, doc_id, document)
        finally:
            await service.close()

    try:
        indexed = asyncio.run(_run())
    except Exception as exc:
        logger.exception("Failed to sync doc %s to index %s", doc_id, index_name)
        raise self.retry(exc=exc, countdown=15, max_retries=5)

    if not indexed:
        return blocked(
            REASON_UNAVAILABLE,
            f"Elasticsearch did not accept the document at {settings.ELASTICSEARCH_URL}.",
            index_name=index_name,
            doc_id=doc_id,
        )

    return done(index_name=index_name, doc_id=doc_id, documents_indexed=1)


@celery_app.task(bind=True, name="app.jobs.tasks.search_tasks.full_reindex")
def full_reindex(self, index_name: str, workspace_id: str | None = None) -> dict:
    """Rebuild a search index from the database.

    Only `evidence` is streamed today: it is FastAPI-owned, so a worker may
    read it. The domain entities a full-text search would most want -
    clients, problems, offers - are Prisma-owned under D4 and are covered by
    the same escalation as `ai_tasks`. Indexing the retired SQLAlchemy
    duplicates would build an index of rows nobody writes.

    The index is **not** dropped first. A drop-then-rebuild leaves search
    empty for the length of the rebuild, and if the rebuild fails it leaves
    it empty indefinitely; re-indexing in place is idempotent because the
    document id is the row id.
    """
    logger.info("Starting full reindex for %s", index_name)

    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        query = db.query(Evidence)
        if workspace_id:
            query = query.filter(Evidence.workspace_id == workspace_id)
        rows = query.all()

        documents = [
            {
                "id": str(row.id),
                "workspace_id": str(row.workspace_id),
                "source_url": row.source_url,
                "source_type": row.source_type,
                "credibility_score": row.credibility_score,
                "recency_decay_score": row.recency_decay_score,
                "extracted_claims": row.extracted_claims or [],
                "publication_date": (
                    row.publication_date.isoformat() if row.publication_date else None
                ),
            }
            for row in rows
        ]
    except Exception as exc:
        logger.exception("Full reindex could not read evidence for %s", index_name)
        db.rollback()
        raise self.retry(exc=exc, countdown=60, max_retries=2)
    finally:
        db.close()

    async def _run() -> tuple[int, int]:
        service = _service()
        indexed = 0
        errors = 0
        try:
            for start in range(0, len(documents), REINDEX_BATCH):
                batch = documents[start : start + REINDEX_BATCH]
                # bulk_index returns {indexed, errors}, not a boolean. A
                # truthiness check would count every batch as successful,
                # including one Elasticsearch rejected entirely - the exact
                # kind of false success this package is removing.
                outcome = await service.bulk_index(index_name, batch)
                indexed += int(outcome.get("indexed", 0))
                errors += int(outcome.get("errors", 0))
        finally:
            await service.close()
        return indexed, errors

    try:
        indexed, errors = asyncio.run(_run())
    except Exception as exc:
        logger.exception("Full reindex failed for %s", index_name)
        raise self.retry(exc=exc, countdown=60, max_retries=2)

    if documents and indexed == 0:
        return blocked(
            REASON_UNAVAILABLE,
            f"{len(documents)} documents were read but Elasticsearch accepted none.",
            index_name=index_name,
            documents_read=len(documents),
            errors=errors,
        )

    logger.info(
        "Full reindex completed for %s: %d indexed, %d errors",
        index_name,
        indexed,
        errors,
    )
    return done(
        index_name=index_name,
        documents_read=len(documents),
        documents_indexed=indexed,
        errors=errors,
    )
