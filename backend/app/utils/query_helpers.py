"""Generic query helpers for filtering, sorting, and pagination."""
from __future__ import annotations

import math
from typing import Any, Dict, Optional

from sqlalchemy import asc, desc
from sqlalchemy.orm import Query

from app.utils.pagination import PaginatedResponse


def apply_filters(query: Query, model: Any, filters: Dict[str, Any]) -> Query:
    """Apply a dict of ``{column_name: value}`` equality filters to *query*.

    Unknown column names are silently skipped so callers can pass user-supplied
    dicts without risking ``AttributeError``.
    """
    for col_name, value in filters.items():
        column = getattr(model, col_name, None)
        if column is None:
            continue
        if isinstance(value, list):
            query = query.filter(column.in_(value))
        else:
            query = query.filter(column == value)
    return query


def apply_sorting(
    query: Query,
    model: Any,
    sort_by: str,
    order: str = "desc",
) -> Query:
    """Sort *query* by the given column name.

    Falls back to ``id`` when *sort_by* does not exist on the model.
    """
    column = getattr(model, sort_by, None)
    if column is None:
        column = getattr(model, "id")
    direction = desc if order.lower() == "desc" else asc
    return query.order_by(direction(column))


def paginate(
    query: Query,
    page: int = 1,
    size: int = 20,
) -> PaginatedResponse:
    """Execute *query* with pagination and return a :class:`PaginatedResponse`.

    Runs a ``COUNT`` first, then fetches only the requested slice.
    """
    total: int = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    pages = math.ceil(total / size) if size > 0 else 0
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )
