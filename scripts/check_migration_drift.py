#!/usr/bin/env python3
"""Fail when a SQLAlchemy model has no table in the Alembic revision chain.

P-00 (T-016). The audit found four models whose tables were never created -
mfa_configs, wealth_events, community_insights, white_label_configs - so any
database built by `alembic upgrade head` was missing MFA, wealth-event
monitoring, community intel and white-label. Nothing caught it because
nothing was looking.

Exit codes:
    0  every model table appears in the chain
    1  at least one model has no create_table

Run from the repository root:  python scripts/check_migration_drift.py
"""
from __future__ import annotations

import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_GLOB = os.path.join(ROOT, "backend", "app", "models", "*.py")
VERSIONS_GLOB = os.path.join(ROOT, "backend", "alembic", "versions", "*.py")

TABLENAME_RE = re.compile(r'__tablename__\s*=\s*["\']([a-zA-Z0-9_]+)["\']')
CREATE_TABLE_RE = re.compile(r'op\.create_table\(\s*["\']([a-zA-Z0-9_]+)["\']')


def _scan(pattern: str, regex: re.Pattern[str]) -> dict[str, str]:
    found: dict[str, str] = {}
    for path in sorted(glob.glob(pattern)):
        with open(path, encoding="utf-8") as fh:
            for name in regex.findall(fh.read()):
                found.setdefault(name, os.path.relpath(path, ROOT))
    return found


def main() -> int:
    models = _scan(MODELS_GLOB, TABLENAME_RE)
    migrated = _scan(VERSIONS_GLOB, CREATE_TABLE_RE)

    missing = sorted(set(models) - set(migrated))
    orphans = sorted(set(migrated) - set(models))

    print("models declaring a table : %d" % len(models))
    print("tables in the chain      : %d" % len(migrated))

    if orphans:
        print("\nNOTE - tables created but no model declares them (may be intentional):")
        for name in orphans:
            print("  %-28s %s" % (name, migrated[name]))

    if missing:
        print("\nDRIFT - %d model(s) have no create_table in the revision chain:" % len(missing))
        for name in missing:
            print("  %-28s declared in %s" % (name, models[name]))
        print("\nA database built from `alembic upgrade head` will not have these tables,")
        print("and every endpoint touching them will fail at runtime.")
        return 1

    print("\nOK - every model table appears in the revision chain.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
