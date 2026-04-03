"""Tests for pagination helpers."""
import math

import pytest

from app.utils.pagination import PaginatedResponse, PaginationParams


class TestPaginationParams:
    """PaginationParams skip calculation."""

    def test_skip_page_one(self):
        p = PaginationParams(page=1, size=20)
        assert p.skip == 0

    def test_skip_page_two(self):
        p = PaginationParams(page=2, size=20)
        assert p.skip == 20

    def test_skip_page_three_size_ten(self):
        p = PaginationParams(page=3, size=10)
        assert p.skip == 20

    def test_skip_large_page(self):
        p = PaginationParams(page=100, size=50)
        assert p.skip == 4950

    def test_defaults(self):
        p = PaginationParams()
        assert p.page == 1
        assert p.size == 20
        assert p.skip == 0


class TestPaginatedResponse:
    """PaginatedResponse pages calculation."""

    def test_pages_exact_division(self):
        resp = PaginatedResponse.create(items=[], total=100, page=1, size=20)
        assert resp.pages == 5

    def test_pages_with_remainder(self):
        resp = PaginatedResponse.create(items=[], total=101, page=1, size=20)
        assert resp.pages == 6

    def test_pages_single_page(self):
        resp = PaginatedResponse.create(items=[], total=5, page=1, size=20)
        assert resp.pages == 1

    def test_pages_zero_total(self):
        resp = PaginatedResponse.create(items=[], total=0, page=1, size=20)
        assert resp.pages == 0

    def test_pages_one_item(self):
        resp = PaginatedResponse.create(items=["a"], total=1, page=1, size=20)
        assert resp.pages == 1
        assert resp.items == ["a"]

    def test_response_fields(self):
        resp = PaginatedResponse.create(items=[1, 2, 3], total=50, page=2, size=10)
        assert resp.items == [1, 2, 3]
        assert resp.total == 50
        assert resp.page == 2
        assert resp.size == 10
        assert resp.pages == 5
