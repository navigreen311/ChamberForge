"""The D4 contract, asserted rather than documented.

P-01. ChamberForge runs Prisma and SQLAlchemy against one PostgreSQL
database. That only works because the two table sets are disjoint by
construction - Prisma writes PascalCase ("Client"), Alembic writes snake_case
(clients) - and because ownership is written down in
docs/data-architecture.md.

The disjointness is also the hazard: because the two sets do not collide, a
write to the wrong stack does not fail. It lands in a second table nobody
reads, and the failure is invisible until someone asks why a record
disappeared. These tests are what keep that from drifting.
"""
from __future__ import annotations

import os
import re

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCHEMA_PRISMA = os.path.join(ROOT, "frontend", "prisma", "schema.prisma")
DOC = os.path.join(ROOT, "docs", "data-architecture.md")

MODEL_RE = re.compile(r"^model\s+(\w+)\s*\{", re.M)
MAP_RE = re.compile(r'@@map\("([^"]+)"\)')


def _prisma_table_names() -> "set[str]":
    """Table names Prisma will create.

    Without @@map, Prisma uses the model name verbatim, which is why these are
    PascalCase and the FastAPI tables are not.
    """
    with open(SCHEMA_PRISMA, encoding="utf-8") as fh:
        src = fh.read()
    names = set(MODEL_RE.findall(src))
    # An @@map would rename a table and could collide with a FastAPI one.
    names |= set(MAP_RE.findall(src))
    return names


def _sqlalchemy_table_names() -> "set[str]":
    import app.models  # noqa: F401  - registers every model on Base.metadata
    from app.db.session import Base

    return set(Base.metadata.tables.keys())


@pytest.mark.skipif(not os.path.exists(SCHEMA_PRISMA), reason="prisma schema not present")
def test_no_table_is_owned_by_both_stacks() -> None:
    """The acceptance criterion for P-01.

    If a name appears in both sets, the same domain concept has two tables and
    writes will silently split between them.
    """
    prisma = _prisma_table_names()
    sqlalchemy = _sqlalchemy_table_names()

    collisions = prisma & sqlalchemy
    assert not collisions, (
        "%d table name(s) claimed by BOTH stacks: %s\n"
        "Prisma owns the domain models (D4). A shared name means writes split "
        "between two tables with no error. See docs/data-architecture.md."
        % (len(collisions), sorted(collisions))
    )


@pytest.mark.skipif(not os.path.exists(SCHEMA_PRISMA), reason="prisma schema not present")
def test_case_insensitive_names_do_not_collide() -> None:
    """PostgreSQL folds unquoted identifiers to lower case.

    "Client" and clients differ, but "Client" and client would not - and a
    future @@map or a renamed SQLAlchemy table could introduce exactly that.
    Catching it here is cheaper than catching it in production.
    """
    prisma = {n.lower() for n in _prisma_table_names()}
    sqlalchemy = {n.lower() for n in _sqlalchemy_table_names()}

    # The ten legacy duplicates are known and tracked in
    # scripts/domain_ownership_baseline.txt; they differ by more than case
    # (Client vs clients), so they are not the hazard this test guards.
    ambiguous = {n for n in prisma & sqlalchemy}
    assert not ambiguous, (
        "table name(s) that differ ONLY by case: %s\n"
        "Postgres folds unquoted identifiers, so these are one table to some "
        "clients and two to others." % sorted(ambiguous)
    )


def test_export_job_cross_stack_write_is_documented() -> None:
    """D5b sanctions exactly one cross-stack write. It must stay findable.

    The Celery export worker writes status and s3Key back into the
    Prisma-owned ExportJob row. If that comment is ever removed, the next
    person to read the model sees fields nothing in the BFF assigns and
    reasonably concludes they are dead.
    """
    with open(SCHEMA_PRISMA, encoding="utf-8") as fh:
        src = fh.read()
    assert "model ExportJob" in src, "ExportJob is required by D5b"
    assert "written by FastAPI export worker" in src, (
        "ExportJob must carry the comment marking the one sanctioned "
        "cross-stack write - see docs/data-architecture.md"
    )


def test_ownership_contract_is_published() -> None:
    """Every package is told to read this before writing a query."""
    assert os.path.exists(DOC), "docs/data-architecture.md is P-01's deliverable"
    with open(DOC, encoding="utf-8") as fh:
        # Collapse whitespace: the statement is a blockquote in the doc and
        # wraps across lines, so a literal substring search would miss it.
        text = " ".join(fh.read().split())
    for required in (
        "Operator audit trail: Prisma `AuditLog`",
        "System audit trail: FastAPI `audit_logs`",
        "joins both by timestamp range",
    ):
        assert required in text, "data-architecture.md must state: %s" % required


def test_audit_log_carries_the_hash_chain_columns() -> None:
    """Both audit surfaces chain, so either can be verified on its own."""
    from app.models.audit_log import AuditLog

    columns = set(AuditLog.__table__.columns.keys())
    assert {"prev_hash", "entry_hash"} <= columns, (
        "FastAPI audit_logs is missing the hash-chain columns added in "
        "revision 003; P-03 fills them in on write"
    )

    with open(SCHEMA_PRISMA, encoding="utf-8") as fh:
        src = fh.read()
    # Slice by brace depth, not by the first "}" - the model contains
    # @default("{}") and a naive slice stops there, before the chain fields.
    start = src.index("model AuditLog")
    depth, end = 0, start
    for i in range(start, len(src)):
        if src[i] == "{":
            depth += 1
        elif src[i] == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    prisma_audit = src[start:end]
    for field in ("prevHash", "entryHash"):
        assert field in prisma_audit, (
            "Prisma AuditLog must carry %s - D5a requires the same chain "
            "construction on both surfaces" % field
        )
