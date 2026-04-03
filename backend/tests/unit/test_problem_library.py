"""Unit tests for ProblemLibrary CRUD using SQLite in-memory DB."""
from __future__ import annotations

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base
from app.models.problem import Problem  # noqa: F401  — registers the table
from app.services.backbone.problem_library import ProblemLibrary


@pytest.fixture()
def db():
    """Create an in-memory SQLite database for each test."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestSession()
    yield session
    session.close()


@pytest.fixture()
def library():
    return ProblemLibrary()


SAMPLE_DATA = {
    "title": "Test Problem",
    "description": "A test problem for unit tests",
    "wealth_tier": "hnw",
    "pain_category": "tax_optimization",
    "lifecycle_stage": "emerging",
    "urgency_score": 7,
    "wtp_confidence": 0.8,
}


# ------------------------------------------------------------------
# CREATE
# ------------------------------------------------------------------
def test_create_problem(db, library):
    problem = library.create_problem(db, "ws-1", SAMPLE_DATA.copy())
    assert problem.id is not None
    assert problem.title == "Test Problem"
    assert problem.workspace_id == "ws-1"
    assert problem.urgency_score == 7


# ------------------------------------------------------------------
# READ
# ------------------------------------------------------------------
def test_get_problem(db, library):
    created = library.create_problem(db, "ws-1", SAMPLE_DATA.copy())
    fetched = library.get_problem(db, created.id)
    assert fetched is not None
    assert fetched.id == created.id


def test_get_problem_not_found(db, library):
    result = library.get_problem(db, "nonexistent-id")
    assert result is None


# ------------------------------------------------------------------
# LIST + FILTERS
# ------------------------------------------------------------------
def test_list_problems(db, library):
    library.create_problem(db, "ws-1", SAMPLE_DATA.copy())
    library.create_problem(db, "ws-1", {**SAMPLE_DATA, "title": "Second"})
    library.create_problem(db, "ws-2", {**SAMPLE_DATA, "title": "Other WS"})

    items = library.list_problems(db, "ws-1")
    assert len(items) == 2


def test_list_problems_with_filter(db, library):
    library.create_problem(db, "ws-1", {**SAMPLE_DATA, "urgency_score": 3})
    library.create_problem(db, "ws-1", {**SAMPLE_DATA, "urgency_score": 9})

    items = library.list_problems(db, "ws-1", filters={"min_urgency": 5})
    assert len(items) == 1
    assert items[0].urgency_score == 9


# ------------------------------------------------------------------
# UPDATE
# ------------------------------------------------------------------
def test_update_problem(db, library):
    created = library.create_problem(db, "ws-1", SAMPLE_DATA.copy())
    updated = library.update_problem(db, created.id, {"title": "Updated Title"})
    assert updated is not None
    assert updated.title == "Updated Title"


def test_update_problem_not_found(db, library):
    result = library.update_problem(db, "nonexistent", {"title": "X"})
    assert result is None


# ------------------------------------------------------------------
# DELETE
# ------------------------------------------------------------------
def test_delete_problem(db, library):
    created = library.create_problem(db, "ws-1", SAMPLE_DATA.copy())
    assert library.delete_problem(db, created.id) is True
    assert library.get_problem(db, created.id) is None


def test_delete_problem_not_found(db, library):
    assert library.delete_problem(db, "nonexistent") is False


# ------------------------------------------------------------------
# TRENDING
# ------------------------------------------------------------------
def test_get_trending(db, library):
    library.create_problem(db, "ws-1", {**SAMPLE_DATA, "urgency_score": 3})
    library.create_problem(db, "ws-1", {**SAMPLE_DATA, "urgency_score": 10})
    library.create_problem(db, "ws-1", {**SAMPLE_DATA, "urgency_score": 7})

    trending = library.get_trending(db, "ws-1", limit=2)
    assert len(trending) == 2
    assert trending[0].urgency_score == 10
    assert trending[1].urgency_score == 7
