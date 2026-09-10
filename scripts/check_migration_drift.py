#!/usr/bin/env python3
"""Fail when a SQLAlchemy model has no table in the Alembic revision chain.

P-00 (T-016). The audit found four models whose tables were never created -
mfa_configs, wealth_events, community_insights, white_label_configs - so any
database built by `alembic upgrade head` was missing MFA, wealth-event
monitoring, community intel and white-label. Nothing caught it because
nothing was looking.

With --baseline, tables already known to be missing are reported but do not
fail the run, so CI gates on NEW drift while P-01 works through the backlog.
P-01 closes all four and empties the baseline file.

    python scripts/check_migration_drift.py
    python scripts/check_migration_drift.py --baseline scripts/migration_drift_baseline.txt

Exit codes:
    0  no new drift
    1  at least one model has no create_table and is not in the baseline
"""
from __future__ import annotations

import argparse
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_GLOB = os.path.join(ROOT, "backend", "app", "models", "*.py")
VERSIONS_GLOB = os.path.join(ROOT, "backend", "alembic", "versions", "*.py")

TABLENAME_RE = re.compile(r'__tablename__\s*=\s*["\']([a-zA-Z0-9_]+)["\']')
CREATE_TABLE_RE = re.compile(r'op\.create_table\(\s*["\']([a-zA-Z0-9_]+)["\']')


def _scan(pattern: str, regex: "re.Pattern[str]") -> "dict[str, str]":
    found: dict[str, str] = {}
    for path in sorted(glob.glob(pattern)):
        with open(path, encoding="utf-8") as fh:
            for name in regex.findall(fh.read()):
                found.setdefault(name, os.path.relpath(path, ROOT))
    return found


def _load_baseline(path: "str | None") -> "set[str]":
    """Tables already known to be missing. P-01 closes them and empties this."""
    if not path or not os.path.exists(path):
        return set()
    with open(path, encoding="utf-8") as fh:
        return {ln.strip() for ln in fh if ln.strip() and not ln.startswith("#")}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--baseline", help="file of table names already known to be missing")
    args = ap.parse_args()
    baseline = _load_baseline(args.baseline)

    models = _scan(MODELS_GLOB, TABLENAME_RE)
    migrated = _scan(VERSIONS_GLOB, CREATE_TABLE_RE)

    gaps = set(models) - set(migrated)
    missing = sorted(gaps - baseline)
    known = sorted(gaps & baseline)
    orphans = sorted(set(migrated) - set(models))

    print("models declaring a table : %d" % len(models))
    print("tables in the chain      : %d" % len(migrated))

    if orphans:
        print("")
        print("NOTE - tables created but no model declares them (may be intentional):")
        for name in orphans:
            print("  %-28s %s" % (name, migrated[name]))

    if known:
        print("")
        print("KNOWN gaps, owned by P-01 - not a regression:")
        for name in known:
            print("  %-28s declared in %s" % (name, models[name]))

    if missing:
        print("")
        print("NEW DRIFT - %d model(s) have no create_table in the revision chain:" % len(missing))
        for name in missing:
            print("  %-28s declared in %s" % (name, models[name]))
        print("")
        print("A database built from `alembic upgrade head` will not have these")
        print("tables, and every endpoint touching them fails at runtime. Add the")
        print("migration - or, if this is a known gap, add the table to")
        print("scripts/migration_drift_baseline.txt with a reason.")
        return 1

    print("")
    if known:
        print("OK - no NEW drift. %d known gap(s) remain for P-01." % len(known))
    else:
        print("OK - every model table appears in the revision chain.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
