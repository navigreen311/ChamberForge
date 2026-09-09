"""Pagination helpers for list endpoints."""
from __future__ import annotations

import math
from typing import Any, List, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Query parameters for paginated requests."""

    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    size: int = Field(default=20, ge=1, le=100, description="Items per page")

    @property
    def skip(self) -> int:
        """Calculate the number of rows to skip."""
        return (self.page - 1) * self.size


class PaginatedResponse(BaseModel):
    """Standard paginated response envelope."""

    items: List[Any]
    total: int
    page: int
    size: int
    pages: int

    @classmethod
    def create(
        cls,
        items: List[Any],
        total: int,
        page: int,
        size: int,
    ) -> "PaginatedResponse":
        """Build a paginated response with auto-calculated page count."""
        pages = math.ceil(total / size) if size > 0 else 0
        return cls(items=items, total=total, page=page, size=size, pages=pages)
