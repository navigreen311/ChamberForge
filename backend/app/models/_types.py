"""Portable column types that work with both PostgreSQL and SQLite."""
import uuid

from sqlalchemy import String, TypeDecorator


class PortableUUID(TypeDecorator):
    """UUID type that stores as String(36) for SQLite compatibility,
    but behaves like a UUID everywhere."""

    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            if isinstance(value, uuid.UUID):
                return str(value)
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return str(value)
        return value
