"""Redis caching layer with graceful fallback when Redis is unavailable."""
import json
import hashlib
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheService:
    """Thin wrapper around Redis with automatic graceful degradation."""

    def __init__(self):
        try:
            import redis

            self.client = redis.from_url(settings.REDIS_URL)
            self.available = self.client.ping()
        except Exception:
            logger.info("Redis unavailable — caching disabled")
            self.client = None
            self.available = False

    def get(self, key: str):
        """Return cached value or *None* on miss / unavailability."""
        if not self.available:
            return None
        val = self.client.get(key)
        return json.loads(val) if val else None

    def set(self, key: str, value, ttl_seconds: int = 300):
        """Store *value* under *key* with the given TTL."""
        if not self.available:
            return
        self.client.setex(key, ttl_seconds, json.dumps(value, default=str))

    def delete(self, key: str):
        """Remove a single key."""
        if not self.available:
            return
        self.client.delete(key)

    def invalidate_pattern(self, pattern: str):
        """Delete all keys matching a glob *pattern* (e.g. ``problems:*``)."""
        if not self.available:
            return
        for key in self.client.scan_iter(match=pattern):
            self.client.delete(key)

    @staticmethod
    def make_key(prefix: str, **kwargs) -> str:
        """Deterministic cache key from a prefix and arbitrary keyword args."""
        param_str = json.dumps(kwargs, sort_keys=True, default=str)
        return f"{prefix}:{hashlib.md5(param_str.encode()).hexdigest()}"


cache = CacheService()
