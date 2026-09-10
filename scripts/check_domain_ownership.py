#!/usr/bin/env python3
"""Fail when new FastAPI code starts depending on a Prisma-owned domain model.

P-01 (D4). Prisma is source of truth for the domain models, but ten of them
still exist as SQLAlchemy models with 27 files importing them. Deleting those
in P-01 would break `core/dependencies.py`, 13 routers and 12 services at
once - a 27-file change across eight packages' territory, which is the
cross-package edit the parallel build exists to prevent.

So instead of deleting, this ratchets: the current importers are recorded in
scripts/domain_ownership_baseline.txt, and the check fails when the set
GROWS. Existing dependants migrate inside the packages that already own those
files (see docs/data-architecture.md); each deletes its own lines. P-26
asserts the baseline is empty, which is when D4 becomes true rather than
intended.

    python scripts/check_domain_ownership.py            # check
    python scripts/check_domain_ownership.py --write    # regenerate baseline

Exit codes:
    0  no new dependants (and the report names any that were removed)
    1  at least one file newly imports a Prisma-owned model
"""
from __future__ import annotations

import argparse
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND = os.path.join(ROOT, "backend")
BASELINE = os.path.join(ROOT, "scripts", "domain_ownership_baseline.txt")

# The SQLAlchemy classes whose tables Prisma now owns. `AuditLog` is NOT here:
# under D5a the FastAPI audit_logs table is a second, legitimate surface for
# system-layer mutations, not a duplicate of the operator trail.
PRISMA_OWNED = [
    "User",
    "Client",
    "Problem",
    "Offer",
    "Playbook",
    "Notification",
    "WealthEvent",
    "RiskReview",
    "AutomationRule",
    "Document",
]

IMPORT_RE = re.compile(r"from app\.models\.[\w.]+ import ([^\n]+)")


# The one file whose job is to span both stacks.
#
# P-11's identity resolver reads the Prisma-owned "User" with raw SQL and
# falls back to the legacy `users` table when the Prisma migration has not
# been applied to that database (Alembic runs first, Prisma second - see
# docs/data-architecture.md). That fallback is the sanctioned bridge, the
# same way ExportJob is the one sanctioned cross-stack write.
#
# Exempted here rather than added to the baseline, so the baseline keeps its
# property of only ever shrinking. Adding a file to this set is a design
# decision and needs a reason beside it.
BRIDGE_FILES = {
    "backend/app/core/identity.py",
}


def current_dependants() -> "dict[str, set[str]]":
    found: dict[str, set[str]] = {}
    for path in glob.glob(os.path.join(BACKEND, "app", "**", "*.py"), recursive=True):
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        # models/__init__.py re-exports everything by design; it is the
        # registry, not a dependant.
        if rel.endswith("app/models/__init__.py"):
            continue
        if rel in BRIDGE_FILES:
            continue
        with open(path, encoding="utf-8") as fh:
            src = fh.read()
        hits = set()
        for imported in IMPORT_RE.findall(src):
            # strip a trailing comment before splitting, or "Client  # note"
            # never matches and the guard silently passes
            imported = imported.split("#")[0]
            names = {n.strip().split(" as ")[0].strip("() ") for n in imported.split(",")}
            hits |= names & set(PRISMA_OWNED)
        if hits:
            found[rel] = hits
    return found


def load_baseline() -> "dict[str, set[str]]":
    if not os.path.exists(BASELINE):
        return {}
    out: dict[str, set[str]] = {}
    with open(BASELINE, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            path, _, models = line.partition(" ")
            out[path] = set(filter(None, models.split(",")))
    return out


def write_baseline(dependants: "dict[str, set[str]]") -> None:
    header = (
        "# Files that still import a Prisma-owned domain model.\n"
        "#\n"
        "# D4 makes Prisma source of truth for these; FastAPI must stop reading\n"
        "# and writing its own copies. The check fails when this set GROWS, so\n"
        "# new code cannot start depending on a legacy table while the existing\n"
        "# dependants are migrated package by package.\n"
        "#\n"
        "# DELETE your lines when your package migrates them. Never add one.\n"
        "# Ownership map: docs/data-architecture.md. P-26 asserts this is empty.\n"
    )
    with open(BASELINE, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(header)
        for path in sorted(dependants):
            fh.write("%s %s\n" % (path, ",".join(sorted(dependants[path]))))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="regenerate the baseline")
    args = ap.parse_args()

    dependants = current_dependants()

    if args.write:
        write_baseline(dependants)
        print("baseline written: %d file(s)" % len(dependants))
        return 0

    baseline = load_baseline()
    new = sorted(set(dependants) - set(baseline))
    gone = sorted(set(baseline) - set(dependants))

    print("files importing a Prisma-owned model : %d" % len(dependants))
    print("baseline                             : %d" % len(baseline))

    if gone:
        print("")
        print("MIGRATED - these no longer import one. Delete their lines from")
        print("scripts/domain_ownership_baseline.txt:")
        for path in gone:
            print("  %s" % path)

    # A file that stayed but picked up an extra model is also growth.
    widened = sorted(
        p for p in set(dependants) & set(baseline) if dependants[p] - baseline[p]
    )

    if new or widened:
        print("")
        print("NEW DEPENDANTS on a Prisma-owned model:")
        for path in new:
            print("  %-52s %s" % (path, ",".join(sorted(dependants[path]))))
        for path in widened:
            print("  %-52s + %s" % (path, ",".join(sorted(dependants[path] - baseline[path]))))
        print("")
        print("Prisma owns these tables (D4). Query them from the BFF, or read")
        print("docs/data-architecture.md for the boundary. Do not add a baseline")
        print("line to get past this.")
        return 1

    print("")
    if dependants:
        print("OK - no new dependants. %d file(s) still to migrate." % len(dependants))
    else:
        print("OK - nothing imports a Prisma-owned model. D4 is fully realised.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
