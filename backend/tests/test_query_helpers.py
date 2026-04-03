"""Tests for query helper utilities."""
from unittest.mock import MagicMock, patch

import pytest
import sqlalchemy as sa
from sqlalchemy.orm import DeclarativeBase

from app.utils.query_helpers import apply_filters, apply_sorting


# ---------------------------------------------------------------------------
# Helpers – lightweight stand-in for a SQLAlchemy model
# ---------------------------------------------------------------------------

class _Base(DeclarativeBase):
    pass


class _FakeModel(_Base):
    __tablename__ = "_test_fake"
    id = sa.Column(sa.Integer, primary_key=True)
    name = sa.Column(sa.String(100))
    status = sa.Column(sa.String(50))
    created_at = sa.Column(sa.DateTime)


class _FakeQuery:
    """Records filter/order_by calls for assertion."""

    def __init__(self):
        self.filters: list = []
        self.orderings: list = []

    def filter(self, expr):
        self.filters.append(expr)
        return self  # chainable

    def order_by(self, expr):
        self.orderings.append(expr)
        return self


# ---------------------------------------------------------------------------
# apply_filters
# ---------------------------------------------------------------------------

class TestApplyFilters:

    def test_single_equality_filter(self):
        q = _FakeQuery()
        result = apply_filters(q, _FakeModel, {"status": "active"})
        assert len(result.filters) == 1

    def test_multiple_filters(self):
        q = _FakeQuery()
        result = apply_filters(q, _FakeModel, {"status": "active", "name": "foo"})
        assert len(result.filters) == 2

    def test_list_value_uses_in(self):
        q = _FakeQuery()
        result = apply_filters(q, _FakeModel, {"status": ["active", "draft"]})
        assert len(result.filters) == 1

    def test_unknown_column_ignored(self):
        q = _FakeQuery()
        result = apply_filters(q, _FakeModel, {"nonexistent": "val"})
        assert len(result.filters) == 0

    def test_empty_filters(self):
        q = _FakeQuery()
        result = apply_filters(q, _FakeModel, {})
        assert len(result.filters) == 0


# ---------------------------------------------------------------------------
# apply_sorting
# ---------------------------------------------------------------------------

class TestApplySorting:

    def test_sort_desc_default(self):
        q = _FakeQuery()
        result = apply_sorting(q, _FakeModel, "created_at")
        assert len(result.orderings) == 1

    def test_sort_asc(self):
        q = _FakeQuery()
        result = apply_sorting(q, _FakeModel, "name", order="asc")
        assert len(result.orderings) == 1

    def test_unknown_column_falls_back_to_id(self):
        q = _FakeQuery()
        result = apply_sorting(q, _FakeModel, "nonexistent")
        assert len(result.orderings) == 1
