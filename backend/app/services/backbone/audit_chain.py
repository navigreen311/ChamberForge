"""The hash chain that makes an audit trail verifiable rather than merely stored.

P-03 (T-012). `audit_logs` was an ordinary mutable table: no chain, no
signature, and until P-01's trigger, nothing stopping a row being rewritten.
"Append-only" was asserted in the docs and enforced nowhere.

A chain fixes the half a trigger cannot. The trigger stops UPDATE and DELETE
against that database; the chain proves, from the data alone, that no row was
altered or removed - including by a restore from a doctored backup, or by a
migration that dropped the trigger.

Each entry hashes its own content together with the previous entry's hash.
Change one field and that entry's hash no longer matches; remove an entry and
the next one's `prev_hash` points at something that is not there. Either way
`verify_chain` names the first row where the trail stops adding up.

D5a: the same construction runs on both surfaces. The operator trail lives in
Prisma `AuditLog` (frontend/src/lib/audit.ts) and the system trail in FastAPI
`audit_logs`; a compliance export joins them by timestamp range, and each can
be verified on its own. `canonical_payload` and `compute_entry_hash` are the
contract between the two implementations - change them here and the
TypeScript side must change identically, or the two trails stop agreeing.
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import timedelta, timezone
from typing import Any, Iterable, Optional

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

#: Marks the first entry in a chain.
GENESIS = "genesis"


def canonical_payload(
    *,
    workspace_id: str,
    user_id: Optional[str],
    action: str,
    resource_type: str,
    resource_id: Optional[str],
    timestamp: int,
) -> str:
    """The exact bytes that get hashed.

    Field order and separators are fixed, and `sort_keys` is on, because two
    implementations have to produce byte-identical input or their chains
    disagree.

    `timestamp` is **epoch milliseconds**, not an ISO string. Two reasons,
    both learned the hard way here:

      - a tz-aware datetime written to a `sa.DateTime` column comes back
        naive from SQLite, so `.isoformat()` produced one string on write and
        a different one on read, and every hash failed to verify;
      - Python and JavaScript format ISO timestamps differently anyway
        (`+00:00` versus `Z`, and differing sub-second precision), so the two
        implementations would never have agreed.

    An integer has one representation in both languages and survives any
    dialect round-trip.

    `details` is deliberately excluded: it is free-form JSON whose
    serialisation differs between the two, and a chain that breaks on key
    ordering catches nothing but itself.
    """
    return json.dumps(
        {
            "workspace_id": workspace_id or "",
            "user_id": user_id or "",
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id or "",
            "timestamp": timestamp,
        },
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=True,
    )


def compute_entry_hash(prev_hash: Optional[str], payload: str) -> str:
    """sha256 over the previous hash and this entry's canonical payload."""
    return hashlib.sha256(f"{prev_hash or GENESIS}|{payload}".encode()).hexdigest()


def _epoch_ms(value: Any) -> int:
    """Epoch milliseconds, UTC, regardless of whether *value* carries tzinfo.

    A naive datetime read back from the database is treated as UTC, which is
    what was written.
    """
    if value is None:
        return 0
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return int(value.timestamp() * 1000)


def hash_for_entry(entry: AuditLog, prev_hash: Optional[str]) -> str:
    ts = _epoch_ms(entry.timestamp)
    return compute_entry_hash(
        prev_hash,
        canonical_payload(
            workspace_id=str(entry.workspace_id) if entry.workspace_id else "",
            user_id=str(entry.user_id) if entry.user_id else None,
            action=entry.action,
            resource_type=entry.resource_type,
            resource_id=str(entry.resource_id) if entry.resource_id else None,
            timestamp=ts,
        ),
    )


def latest_entry(db: Session, workspace_id: Any, model: type = AuditLog) -> Optional[Any]:
    """The most recent entry in this workspace's chain, or None."""
    AuditLog = model  # noqa: N806
    return (
        db.query(AuditLog)
        .filter(AuditLog.workspace_id == workspace_id)
        .order_by(AuditLog.timestamp.desc())
        .first()
    )


def next_timestamp(previous: Optional[Any], now: Any) -> Any:
    """A timestamp strictly later than the previous entry's.

    The chain is ordered by timestamp, and entries written in the same
    millisecond would make that order ambiguous - `id` is a random uuid4, so
    there is no meaningful tiebreaker. Three rapid writes were enough to pick
    the wrong tip and produce a chain that failed to verify the moment it was
    written.

    Nudging by a millisecond guarantees a total order without a schema
    change. The cost is that a burst of writes can record timestamps a few
    milliseconds later than they occurred, which is the right trade against
    an unverifiable trail.
    """
    if previous is None or previous.timestamp is None:
        return now
    prev_ts = previous.timestamp
    if prev_ts.tzinfo is None and now.tzinfo is not None:
        prev_ts = prev_ts.replace(tzinfo=now.tzinfo)
    elif prev_ts.tzinfo is not None and now.tzinfo is None:
        now = now.replace(tzinfo=prev_ts.tzinfo)
    if now <= prev_ts:
        return prev_ts + timedelta(milliseconds=1)
    return now


@dataclass(frozen=True)
class ChainBreak:
    """Where a trail stopped adding up, and why."""

    entry_id: str
    timestamp: str
    reason: str


@dataclass(frozen=True)
class ChainVerification:
    ok: bool
    checked: int
    breaks: "list[ChainBreak]"

    def describe(self) -> str:
        if self.ok:
            return f"chain intact across {self.checked} entries"
        first = self.breaks[0]
        return (
            f"chain broken at entry {first.entry_id} ({first.timestamp}): "
            f"{first.reason}; {len(self.breaks)} break(s) across "
            f"{self.checked} entries"
        )


def verify_chain(rows: Iterable[AuditLog]) -> ChainVerification:
    """Recompute the chain over *rows*, oldest first.

    Reports every break rather than stopping at the first, because a single
    tampered row makes every later `prev_hash` mismatch too - and being told
    only about the first break makes a one-row edit look identical to a
    wholesale rewrite.
    """
    breaks: list[ChainBreak] = []
    expected_prev: Optional[str] = None
    checked = 0

    for row in rows:
        checked += 1
        entry_id = str(row.id)
        ts = row.timestamp.isoformat() if row.timestamp else ""  # for reporting only

        if row.entry_hash is None:
            # Written before the chain existed. Not tampering, but the trail
            # cannot be verified across it, and saying so is the point.
            breaks.append(ChainBreak(entry_id, ts, "entry has no hash (pre-chain row)"))
            expected_prev = None
            continue

        if expected_prev is not None and row.prev_hash != expected_prev:
            breaks.append(
                ChainBreak(
                    entry_id,
                    ts,
                    f"prev_hash {row.prev_hash!r} does not match the preceding "
                    f"entry's hash {expected_prev!r} - an entry was altered or removed",
                )
            )

        recomputed = hash_for_entry(row, row.prev_hash)
        if recomputed != row.entry_hash:
            breaks.append(
                ChainBreak(entry_id, ts, "entry content does not match its recorded hash")
            )

        expected_prev = row.entry_hash

    return ChainVerification(ok=not breaks, checked=checked, breaks=breaks)


def verify_workspace_chain(
    db: Session, workspace_id: Any, model: type = AuditLog
) -> ChainVerification:
    AuditLog = model  # noqa: N806 - see latest_entry
    rows: list[Any] = (
        db.query(AuditLog)
        .filter(AuditLog.workspace_id == workspace_id)
        .order_by(AuditLog.timestamp.asc(), AuditLog.id.asc())
        .all()
    )
    return verify_chain(rows)
