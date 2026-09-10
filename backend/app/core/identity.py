"""Identity resolution against the Prisma-owned User table.

P-11 (T-063). D4 made Prisma source of truth for `User`, but FastAPI resolved
identity from its own `users` table in five places. The moment Prisma became
authoritative, every FastAPI-authenticated request was checking a table
nobody writes to any more - a user created through the operator console would
simply not exist as far as the backend was concerned.

Two things made this less than a one-line change:

1. **Prisma's `User` has no workspace column.** FastAPI scopes on
   `workspace_id` and 105 routes depend on `get_workspace_id` returning one.
   Under D2 there is a single operator, so the workspace is resolved from the
   FastAPI-owned `workspaces` table instead - by `owner_id` where it matches,
   otherwise the sole workspace. When the reseller tier arrives this is the
   function that grows a real lookup; nothing else moves.

2. **The Prisma tables may not be provisioned yet.** Alembic runs first and
   Prisma second (docs/data-architecture.md), and the SQLite test database
   has no Prisma tables at all. So this falls back to the legacy table with a
   warning rather than refusing to authenticate anyone.

The table is read with raw SQL on purpose. Declaring a SQLAlchemy model for
`"User"` would put the same table under both stacks, which is exactly what
`test_data_architecture.py` forbids and what the ownership guard tracks.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

logger = logging.getLogger("chamberforge.identity")

# Logged once rather than per request - a missing Prisma table is a
# deployment state, not a per-call event, and one line per request would bury
# everything else.
_warned_missing_prisma_user = False


@dataclass(frozen=True)
class ResolvedIdentity:
    """Who the caller is, and which workspace their requests are scoped to."""

    id: str
    email: str | None
    name: str | None
    role: str
    workspace_id: str | None
    is_active: bool = True
    #: True when this came from the legacy FastAPI table rather than Prisma.
    from_legacy_table: bool = False


def _resolve_workspace(db: Session, user_id: str) -> str | None:
    """The workspace this operator's requests are scoped to.

    Prisma's `User` carries no workspace, so it is resolved from the
    FastAPI-owned `workspaces` table: the one they own, or - under D2, where
    there is a single operator - the only one there is.
    """
    try:
        owned = db.execute(
            text("SELECT id FROM workspaces WHERE owner_id = :uid LIMIT 1"),
            {"uid": user_id},
        ).first()
        if owned:
            return str(owned[0])

        rows = db.execute(text("SELECT id FROM workspaces LIMIT 2")).fetchall()
        if len(rows) == 1:
            # Single-operator instance (D2). Unambiguous.
            return str(rows[0][0])
        if len(rows) > 1:
            # More than one workspace and none owned by this user. Refusing to
            # guess is the point: picking arbitrarily here is how one
            # operator ends up reading another's data.
            logger.warning(
                "ambiguous_workspace",
                extra={"user_id": user_id, "workspace_count": len(rows)},
            )
        return None
    except SQLAlchemyError:
        logger.exception("workspace_resolution_failed", extra={"user_id": user_id})
        return None


def resolve_identity(db: Session, user_id: str) -> ResolvedIdentity | None:
    """Look up *user_id* in the Prisma-owned table, falling back if absent."""
    global _warned_missing_prisma_user

    try:
        row = db.execute(
            text('SELECT id, email, name, role FROM "User" WHERE id = :uid'),
            {"uid": user_id},
        ).first()
    except SQLAlchemyError:
        # The Prisma tables are not provisioned in this database.
        if not _warned_missing_prisma_user:
            _warned_missing_prisma_user = True
            logger.warning(
                'Prisma "User" table not found - falling back to the legacy '
                "users table. Provision the Prisma migration; see "
                "docs/data-architecture.md."
            )
        db.rollback()
        return _resolve_from_legacy(db, user_id)

    if row is None:
        # The Prisma table exists and has no such user. Authoritative: this
        # is a "no such user", not a reason to consult the legacy table.
        return None

    return ResolvedIdentity(
        id=str(row[0]),
        email=row[1],
        name=row[2],
        role=row[3] or "operator",
        workspace_id=_resolve_workspace(db, str(row[0])),
    )


def _resolve_from_legacy(db: Session, user_id: str) -> ResolvedIdentity | None:
    """Read the pre-D4 `users` table. Only for un-provisioned databases."""
    from app.models.user import User  # local import: legacy path only

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        return None
    return ResolvedIdentity(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role or "operator",
        workspace_id=str(user.workspace_id) if user.workspace_id else None,
        is_active=bool(user.is_active),
        from_legacy_table=True,
    )


def resolve_identity_by_email(
    db: Session, email: str
) -> "tuple[ResolvedIdentity, str | None] | None":
    """Look up by email, returning the identity and its password hash.

    For the login path. Prisma stores the hash in `password`; the legacy
    FastAPI table calls it `hashed_password`. Both are bcrypt, so the same
    verifier works on either.
    """
    global _warned_missing_prisma_user

    try:
        row = db.execute(
            text('SELECT id, email, name, role, password FROM "User" WHERE email = :em'),
            {"em": email},
        ).first()
    except SQLAlchemyError:
        if not _warned_missing_prisma_user:
            _warned_missing_prisma_user = True
            logger.warning(
                'Prisma "User" table not found - falling back to the legacy '
                "users table. Provision the Prisma migration; see "
                "docs/data-architecture.md."
            )
        db.rollback()
        return _resolve_by_email_legacy(db, email)

    if row is None:
        return None

    return (
        ResolvedIdentity(
            id=str(row[0]),
            email=row[1],
            name=row[2],
            role=row[3] or "operator",
            workspace_id=_resolve_workspace(db, str(row[0])),
        ),
        row[4],
    )


def _resolve_by_email_legacy(
    db: Session, email: str
) -> "tuple[ResolvedIdentity, str | None] | None":
    from app.models.user import User  # local import: legacy path only

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        return None
    return (
        ResolvedIdentity(
            id=str(user.id),
            email=user.email,
            name=user.name,
            role=user.role or "operator",
            workspace_id=str(user.workspace_id) if user.workspace_id else None,
            is_active=bool(user.is_active),
            from_legacy_table=True,
        ),
        user.hashed_password,
    )

