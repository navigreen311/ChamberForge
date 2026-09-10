"""Ontology extensions are durable and scoped, not global and transient.

P-09 (T-035). What was here:

    _extensions: dict[str, list[str]] = {}

A module-level dict. Two separate defects sharing one line:

  - **a tenancy leak** - a value one workspace added was immediately visible
    to every other workspace in the process, because there was nothing in
    the structure to scope it by;
  - **a durability bug** - every extension vanished on restart, so a firm
    that extended its ontology lost the change at the next deploy.

The leak is the more serious of the two, and the one a test can most easily
miss: a single-workspace test passes identically against a global dict and a
scoped table.
"""
from __future__ import annotations

import pytest

from app.db.scope import OperatorScope, reset_scope, set_scope
from app.models.ontology_extension import OntologyExtension
from app.services.backbone.ontology_engine import OntologyEngine

WS_A = "ws-alpha"
WS_B = "ws-beta"
FIELD = "trigger_event"


@pytest.fixture
def engine():
    return OntologyEngine()


@pytest.fixture
def scoped_a():
    token = set_scope(OperatorScope(workspace_id=WS_A, user_id="u1"))
    yield WS_A
    reset_scope(token)


# -- Durability -------------------------------------------------------------


def test_an_extension_is_written_to_the_database(db_session, engine, scoped_a):
    result = engine.update_ontology_mappings(FIELD, ["Liquidity Event"], db=db_session)

    assert result["success"] is True
    assert result["added"] == ["Liquidity Event"]

    rows = db_session.query(OntologyExtension).filter_by(workspace_id=WS_A).all()
    assert [r.value for r in rows] == ["Liquidity Event"]


def test_an_extension_survives_a_new_engine_instance(db_session, engine, scoped_a):
    """The durability property, expressed as far as a unit test can reach.

    A process restart is a new object graph reading the same rows, which is
    what this does. Against the old module-level dict the second engine would
    have seen the extension too - because the dict was shared - so this
    assertion only means something alongside the isolation tests below.
    """
    engine.update_ontology_mappings(FIELD, ["Liquidity Event"], db=db_session)

    fresh = OntologyEngine()
    schema = fresh.get_ontology_schema(db=db_session)

    assert "Liquidity Event" in schema[FIELD]["allowed_values"]


def test_the_base_ontology_is_still_present(db_session, engine, scoped_a):
    engine.update_ontology_mappings(FIELD, ["Liquidity Event"], db=db_session)
    values = engine.get_ontology_schema(db=db_session)[FIELD]["allowed_values"]

    assert "Exit" in values, "an extension must add to the ontology, not replace it"
    assert "Liquidity Event" in values


# -- Isolation: the defect that mattered ------------------------------------


def test_one_workspace_cannot_see_anothers_extension(db_session, engine):
    """The tenancy leak.

    Against the module-level dict this failed: workspace B saw A's addition
    immediately, because the dict had no workspace dimension at all.
    """
    token = set_scope(OperatorScope(workspace_id=WS_A, user_id="u1"))
    try:
        engine.update_ontology_mappings(FIELD, ["Alpha Only"], db=db_session)
    finally:
        reset_scope(token)

    token = set_scope(OperatorScope(workspace_id=WS_B, user_id="u2"))
    try:
        values = engine.get_ontology_schema(db=db_session)[FIELD]["allowed_values"]
    finally:
        reset_scope(token)

    assert "Alpha Only" not in values


def test_validation_uses_only_this_workspaces_extensions(db_session, engine):
    """A leak that shows up as acceptance rather than disclosure.

    If B can see A's extension, B silently accepts a value it never defined -
    which is how one firm's vocabulary ends up in another firm's data.
    """
    token = set_scope(OperatorScope(workspace_id=WS_A, user_id="u1"))
    try:
        engine.update_ontology_mappings(FIELD, ["Alpha Only"], db=db_session)
    finally:
        reset_scope(token)

    token = set_scope(OperatorScope(workspace_id=WS_B, user_id="u2"))
    try:
        result = engine.validate_against_ontology(
            {FIELD: "Alpha Only"}, db=db_session
        )
    finally:
        reset_scope(token)

    assert result["valid"] is False


def test_validation_accepts_this_workspaces_own_extension(db_session, engine, scoped_a):
    """The other half: a workspace's own addition must actually work.

    Validation reads the schema, so if the two diverged, a firm could add a
    value and then be told it was invalid.
    """
    engine.update_ontology_mappings(FIELD, ["Liquidity Event"], db=db_session)

    result = engine.validate_against_ontology(
        {FIELD: "Liquidity Event"}, db=db_session
    )

    assert result["valid"] is True


# -- Refusals ---------------------------------------------------------------


def test_an_unscoped_extension_is_refused(db_session, engine):
    """With no workspace bound there is no owner.

    The old behaviour - apply it to everyone - is precisely the bug.
    """
    result = engine.update_ontology_mappings(FIELD, ["Orphan"], db=db_session)

    assert result["success"] is False
    assert "no owner" in result["error"]
    assert db_session.query(OntologyExtension).count() == 0


def test_an_unscoped_schema_read_returns_the_base_ontology(db_session, engine):
    """Not every workspace's extensions merged together."""
    token = set_scope(OperatorScope(workspace_id=WS_A, user_id="u1"))
    try:
        engine.update_ontology_mappings(FIELD, ["Alpha Only"], db=db_session)
    finally:
        reset_scope(token)

    values = engine.get_ontology_schema(db=db_session)[FIELD]["allowed_values"]

    assert "Alpha Only" not in values
    assert "Exit" in values


def test_an_unknown_field_is_refused(db_session, engine, scoped_a):
    result = engine.update_ontology_mappings("not_a_field", ["x"], db=db_session)

    assert result["success"] is False
    assert "Unknown field" in result["error"]


def test_adding_an_existing_value_is_a_no_op(db_session, engine, scoped_a):
    engine.update_ontology_mappings(FIELD, ["Liquidity Event"], db=db_session)
    second = engine.update_ontology_mappings(FIELD, ["Liquidity Event"], db=db_session)

    assert second["added"] == []
    assert db_session.query(OntologyExtension).count() == 1


def test_adding_a_base_value_is_a_no_op(db_session, engine, scoped_a):
    """"Exit" is already in the ontology; extending with it adds nothing."""
    result = engine.update_ontology_mappings(FIELD, ["Exit"], db=db_session)

    assert result["added"] == []
    assert db_session.query(OntologyExtension).count() == 0
