"""Utilities for graceful service initialization."""
import logging

logger = logging.getLogger(__name__)


def safe_init(name: str):
    """Decorator for graceful service initialization."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.warning(f"{name} initialization failed (non-fatal): {e}")
                return None
        return wrapper
    return decorator
