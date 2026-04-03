"""Initialize Elasticsearch indices on application startup."""
import logging

from app.core.config import settings
from app.services.backbone.search_indices import get_all_indices
from app.services.backbone.search_service import SearchService

logger = logging.getLogger(__name__)


async def init_search() -> None:
    """Create all ES indices on startup if they don't exist."""
    try:
        svc = SearchService(settings.ELASTICSEARCH_URL)
        if not svc.available:
            logger.warning("Elasticsearch unavailable — skipping index init")
            return
        # Quick connectivity check before iterating indices
        if not await svc._check_available():
            logger.warning("Elasticsearch not reachable — skipping index init")
            return
        for name, mapping in get_all_indices().items():
            await svc.create_index(name, mapping)
            logger.info("Index %s ready", name)
    except Exception as e:
        logger.warning("Search init failed (non-fatal): %s", e)
