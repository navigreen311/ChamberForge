#!/usr/bin/env python3
"""Fail on NEW test failures, not on the known baseline.

P-00. The backend suite has 191 pre-existing failures on CI, distributed
across a dozen packages that will fix them in parallel. Gating merges on a
fully green suite would block the entire run for weeks; gating on nothing
would let regressions through unnoticed. This gates on the delta.

Usage:
    python -m pytest tests/ -q --tb=short --junitxml=report.xml ; \
    python scripts/check_test_regressions.py report.xml

Exit codes:
    0  no test failed that was not already failing
    1  at least one NEW failure, or the baseline file is missing
"""
from __future__ import annotations

import os
import sys
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASELINE = os.path.join(ROOT, "backend", "tests", "known_failures.txt")


def load_baseline() -> set[str]:
    if not os.path.exists(BASELINE):
        print("baseline file not found: %s" % BASELINE)
        sys.exit(1)
    out = set()
    with open(BASELINE, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line and not line.startswith("#"):
                out.add(line)
    return out


def load_report(path: str) -> set[str]:
    """Rebuild pytest node ids from a junit report.

    pytest writes classname="tests.security.test_x.TestClass" and leaves the
    file attribute empty, so the node id has to be reconstructed. The last
    dotted segment is a class when it starts with an uppercase letter;
    everything before it is the module path.
    """
    tree = ET.parse(path)
    failed = set()
    for case in tree.iter("testcase"):
        if case.find("failure") is None and case.find("error") is None:
            continue
        classname = case.get("classname") or ""
        name = case.get("name") or ""
        if not classname:
            failed.add(name)
            continue
        parts = classname.split(".")
        if parts and parts[-1][:1].isupper():
            module, cls = "/".join(parts[:-1]), parts[-1]
            failed.add("%s.py::%s::%s" % (module, cls, name))
        else:
            failed.add("%s.py::%s" % ("/".join(parts), name))
    return failed


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: check_test_regressions.py <junit-xml>")
        return 1
    baseline = load_baseline()
    failed = load_report(sys.argv[1])

    new = sorted(failed - baseline)
    fixed = sorted(baseline - failed)

    print("known failures in baseline : %d" % len(baseline))
    print("failures in this run       : %d" % len(failed))
    print("newly failing              : %d" % len(new))
    print("newly passing              : %d" % len(fixed))

    if fixed:
        print("\nThese now PASS. Delete them from backend/tests/known_failures.txt")
        print("in the package that fixed them:")
        for t in fixed[:40]:
            print("  %s" % t)
        if len(fixed) > 40:
            print("  ... and %d more" % (len(fixed) - 40))

    if new:
        print("\nREGRESSION - %d test(s) failed that were passing before:" % len(new))
        for t in new:
            print("  %s" % t)
        return 1

    print("\nOK - no new failures.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
