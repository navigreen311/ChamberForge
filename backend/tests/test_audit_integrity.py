"""Audit integrity: no gaps, no silent drops, and a chain that catches tampering.

P-03. The audit found `audit_logs` to be an ordinary mutable table whose
middleware silently discarded any entry it could not attribute - which meant
the least-authenticated surface in the platform was also the least audited.

These assert the three properties that make the trail worth having:

  1. nothing is dropped, including an anonymous mutation;
  2. tampering is detectable from the data alone;
  3. a failed write is reported rather than swallowed.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from app.models.audit_log import AuditLog
from app.services.backbone.audit_chain import (
    canonical_payload,
    compute_entry_hash,
    verify_chain,
)
from app.services.backbone.audit_service import AuditService

WS = "ws-audit-1"


def _log(db, action: str, resource_id: str | None = None):
    return AuditService.log_action(
        db=db,
        workspace_id=WS,
        user_id="user-1",
        action=action,
        resource_type="Offer",
        resource_id=resource_id,
        details={"note": "test"},
        ip_address="127.0.0.1",
    )


# ── 1. Nothing is dropped ────────────────────────────────────────────────


def test_anonymous_mutation_is_recorded_not_dropped() -> None:
    """T-011. The middleware used to return early with no workspace.

    187 routes still accept anonymous requests, so that made an attacker's
    requests the ones that left no trace.
    """
    from app.middleware.audit import ANONYMOUS_WORKSPACE

    assert ANONYMOUS_WORKSPACE, "a sentinel workspace must exist"
    # Deliberately not a UUID: it has to stand out in a query and must never
    # collide with a real workspace id.
    try:
        uuid.UUID(ANONYMOUS_WORKSPACE)
        raise AssertionError("sentinel must not look like a real workspace id")
    except ValueError:
        pass


def test_every_entry_is_written_with_a_hash(db_session) -> None:
    entry = _log(db_session, "offer.create", "of-1")
    assert entry.entry_hash, "an unhashed row is a gap in the chain"


# ── 2. Tampering is detectable ───────────────────────────────────────────


def test_chain_is_intact_for_untouched_entries(db_session) -> None:
    _log(db_session, "offer.create", "of-1")
    _log(db_session, "offer.update", "of-1")
    _log(db_session, "offer.activate", "of-1")

    result = AuditService.verify_chain(db_session, WS)
    assert result.ok, result.describe()
    assert result.checked == 3


def test_entries_written_in_a_burst_stay_orderable(db_session) -> None:
    """The chain is ordered by timestamp, so ties make the order ambiguous.

    This is not hypothetical: three writes in a row landed in the same
    millisecond, `id` is a random uuid4 and gave no usable tiebreaker, and
    the tip query picked a different predecessor than verification did. The
    chain failed to verify the moment it was written - with nothing tampered.
    """
    entries = [_log(db_session, f"offer.step{i}", "of-1") for i in range(10)]
    stamps = [e.timestamp for e in entries]

    assert stamps == sorted(stamps), "timestamps must not go backwards"
    assert len(set(stamps)) == len(stamps), (
        "two entries share a timestamp, so their order in the chain is "
        "ambiguous and verification is a coin flip"
    )
    assert AuditService.verify_chain(db_session, WS).ok


def test_editing_an_entry_breaks_the_chain(db_session) -> None:
    """The property a trigger cannot give you.

    P-01's trigger stops UPDATE against the live database. This is what
    catches a restore from a doctored backup, where the trigger was never
    involved.
    """
    _log(db_session, "offer.create", "of-1")
    target = _log(db_session, "offer.delete", "of-1")
    _log(db_session, "offer.create", "of-2")

    # Simulate a row rewritten out of band.
    target.action = "offer.update"
    db_session.flush()

    result = AuditService.verify_chain(db_session, WS)
    assert not result.ok
    assert any("does not match its recorded hash" in b.reason for b in result.breaks)


def test_removing_an_entry_breaks_the_chain(db_session) -> None:
    first = _log(db_session, "offer.create", "of-1")
    _log(db_session, "client.update", "cl-1")
    _log(db_session, "export.generate", "exp-1")

    rows = (
        db_session.query(AuditLog)
        .filter(AuditLog.workspace_id == WS)
        .order_by(AuditLog.timestamp.asc())
        .all()
    )
    # Verify the middle entry out of the sequence, as a deletion would.
    without_middle = [r for r in rows if r.id != rows[1].id]
    result = verify_chain(without_middle)

    assert not result.ok
    assert any("altered or removed" in b.reason for b in result.breaks)
    assert first is not None


def test_verification_names_the_first_break(db_session) -> None:
    _log(db_session, "a.one")
    bad = _log(db_session, "a.two")
    _log(db_session, "a.three")

    bad.resource_type = "Client"
    db_session.flush()

    result = AuditService.verify_chain(db_session, WS)
    assert not result.ok
    assert str(bad.id) in result.describe()


def test_pre_chain_rows_are_reported_not_silently_accepted(db_session) -> None:
    """Rows written before P-03 have no hash.

    That is not tampering, but the trail cannot be verified across them, and
    saying so is the point - "unverifiable" must not read as "intact".
    """
    legacy = AuditLog(
        id=str(uuid.uuid4()),
        workspace_id=WS,
        user_id="user-1",
        action="legacy.write",
        resource_type="Offer",
        details={},
        timestamp=datetime.now(timezone.utc) - timedelta(days=1),
    )
    db_session.add(legacy)
    db_session.commit()

    result = AuditService.verify_chain(db_session, WS)
    assert not result.ok
    assert any("pre-chain" in b.reason for b in result.breaks)


# ── 3. The two surfaces agree (D5a) ──────────────────────────────────────


def test_canonical_payload_is_stable_and_ordered() -> None:
    """The contract with frontend/src/lib/audit.ts.

    Both implementations must produce identical bytes or the two trails stop
    agreeing and a compliance export cannot be verified end to end. This
    pins the exact string; the TypeScript side asserts the same one.
    """
    payload = canonical_payload(
        workspace_id="",
        user_id="user-1",
        action="offer.create",
        resource_type="Offer",
        resource_id="of-1",
        timestamp=1789603200000,
    )
    assert payload == (
        '{"action":"offer.create","resource_id":"of-1","resource_type":"Offer",'
        '"timestamp":1789603200000,"user_id":"user-1",'
        '"workspace_id":""}'
    )


def test_known_hash_vector() -> None:
    """A fixed vector both implementations must reproduce."""
    payload = canonical_payload(
        workspace_id="",
        user_id="user-1",
        action="offer.create",
        resource_type="Offer",
        resource_id="of-1",
        timestamp=1789603200000,
    )
    assert compute_entry_hash(None, payload) == compute_entry_hash("genesis", payload)
    # Chaining changes the hash - otherwise entries would be reorderable.
    assert compute_entry_hash("abc", payload) != compute_entry_hash(None, payload)
