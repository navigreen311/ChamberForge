"""Decorator for caching async endpoint responses."""
from functools import wraps

from app.core.cache import cache


def cached(prefix: str, ttl: int = 300):
    """Cache the return value of an ``async`` endpoint function.

    Parameters
    ----------
    prefix:
        Cache-key namespace (e.g. ``"dashboard"``).
    ttl:
        Time-to-live in seconds.
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            key = cache.make_key(prefix, **kwargs)
            hit = cache.get(key)
            if hit is not None:
                return hit
            result = await func(*args, **kwargs)
            cache.set(key, result, ttl)
            return result

        return wrapper

    return decorator
