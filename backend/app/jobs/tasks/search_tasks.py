"""Search index synchronization background tasks."""
import logging
from datetime import datetime, timezone

from app.jobs.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="app.jobs.tasks.search_tasks.sync_entity_to_search")
def sync_entity_to_search(self, index_name: str, doc_id: str, document: dict) -> dict:
    """Index or update a single document in Elasticsearch."""
    logger.info("Syncing doc %s to index %s", doc_id, index_name)
    try:
        # TODO: integrate with Elasticsearch client
        # from elasticsearch import Elasticsearch
        # es = Elasticsearch(settings.ELASTICSEARCH_URL)
        # es.index(index=index_name, id=doc_id, document=document)
        result = {
            "index_name": index_name,
            "doc_id": doc_id,
            "status": "indexed",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        return result
    except Exception as exc:
        logger.exception("Failed to sync doc %s to index %s", doc_id, index_name)
        raise self.retry(exc=exc, countdown=15, max_retries=5)


@celery_app.task(bind=True, name="app.jobs.tasks.search_tasks.full_reindex")
def full_reindex(self, index_name: str) -> dict:
    """Drop and rebuild an entire search index from the database."""
    logger.info("Starting full reindex for %s", index_name)
    try:
        # TODO: delete index, recreate mapping, stream all docs from DB
        result = {
            "index_name": index_name,
            "documents_indexed": 0,
            "status": "completed",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        logger.info("Full reindex completed for %s: %d docs", index_name, result["documents_indexed"])
        return result
    except Exception as exc:
        logger.exception("Full reindex failed for %s", index_name)
        raise self.retry(exc=exc, countdown=60, max_retries=2)
