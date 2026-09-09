"""Golden Test Runner — Load golden test sets and evaluate agent outputs."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# Base directory for golden test JSON files
_GOLDEN_DIR = Path(__file__).resolve().parents[3] / "data" / "golden_tests"


def load_test_cases(agent_name: str) -> list[dict]:
    """Load golden test cases from ``data/golden_tests/{agent_name}_tests.json``.

    Raises FileNotFoundError when the test file does not exist.
    """
    path = _GOLDEN_DIR / f"{agent_name}_tests.json"
    if not path.exists():
        raise FileNotFoundError(f"No golden test file found at {path}")
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if not isinstance(data, list):
        raise ValueError(f"Golden test file must be a JSON array, got {type(data).__name__}")
    return data


def evaluate_output(output: Any, expected: dict) -> bool:
    """Check whether *output* satisfies the constraints defined in *expected*.

    Supported constraint keys:
    - ``required_fields``        — list of keys that must exist in output
    - ``min_problems``           — output must be a list with >= N items
    - ``min_items``              — alias for min_problems (generic list check)
    - ``min_value_stack_items``  — output["value_stack"] must have >= N items
    - ``min_anchors``            — output["anchors"] must have >= N items
    - ``pain_category_includes`` — at least one item's pain_category contains str (case-insensitive)
    - ``urgency_score_min``      — urgency_score >= value
    - ``overall_score_max``      — overall_score <= value
    - ``real_score_min``         — real_score >= value
    - ``real_score_max``         — real_score <= value
    - ``recommended_monthly_min``— recommended_monthly >= value
    - ``delivery_model_in``      — delivery_model must be one of listed values
    - ``pricing_model_in``       — pricing_model must be one of listed values
    - ``priority_in``            — priority must be one of listed values
    - ``is_list``                — output must be a list
    - ``item_required_fields``   — each item in list must have these fields
    """
    if output is None:
        return False

    # --- list-level checks ---
    if expected.get("is_list"):
        if not isinstance(output, list):
            return False
        min_items = expected.get("min_items", 0)
        if len(output) < min_items:
            return False
        item_fields = expected.get("item_required_fields", [])
        for item in output:
            if not isinstance(item, dict):
                return False
            for f in item_fields:
                if f not in item:
                    return False
        # No further dict-level checks when output is expected to be a list
        return True

    # If output is a list (e.g. problems list) but is_list not set, handle min_problems
    if isinstance(output, list):
        items = output
        min_problems = expected.get("min_problems", expected.get("min_items", 0))
        if len(items) < min_problems:
            return False

        # Check required_fields on each item in the list
        req_fields = expected.get("required_fields", [])
        for item in items:
            if isinstance(item, dict):
                for f in req_fields:
                    if f not in item:
                        return False

        # pain_category_includes — case-insensitive substring on any item
        if "pain_category_includes" in expected:
            needle = expected["pain_category_includes"].lower()
            found = any(
                needle in str(item.get("pain_category", "")).lower()
                for item in items
                if isinstance(item, dict)
            )
            if not found:
                return False

        # urgency_score_min — at least one item meets threshold
        if "urgency_score_min" in expected:
            threshold = expected["urgency_score_min"]
            found = any(
                item.get("urgency_score", 0) >= threshold
                for item in items
                if isinstance(item, dict)
            )
            if not found:
                return False

        return True

    # --- dict-level checks ---
    if not isinstance(output, dict):
        return False

    # required_fields
    for field in expected.get("required_fields", []):
        if field not in output:
            return False

    # Numeric range checks
    _range_checks = [
        ("urgency_score_min", "urgency_score", ">="),
        ("overall_score_max", "overall_score", "<="),
        ("real_score_min", "real_score", ">="),
        ("real_score_max", "real_score", "<="),
        ("recommended_monthly_min", "recommended_monthly", ">="),
    ]
    for constraint_key, field_key, op in _range_checks:
        if constraint_key in expected:
            val = output.get(field_key)
            if val is None:
                return False
            threshold = expected[constraint_key]
            if op == ">=" and val < threshold:
                return False
            if op == "<=" and val > threshold:
                return False

    # Enum-in checks
    _enum_checks = [
        ("delivery_model_in", "delivery_model"),
        ("pricing_model_in", "pricing_model"),
        ("priority_in", "priority"),
    ]
    for constraint_key, field_key in _enum_checks:
        if constraint_key in expected:
            val = output.get(field_key)
            if val not in expected[constraint_key]:
                return False

    # min_value_stack_items
    if "min_value_stack_items" in expected:
        vs = output.get("value_stack", [])
        if not isinstance(vs, list) or len(vs) < expected["min_value_stack_items"]:
            return False

    # min_anchors
    if "min_anchors" in expected:
        anchors = output.get("anchors", [])
        if not isinstance(anchors, list) or len(anchors) < expected["min_anchors"]:
            return False

    # pain_category_includes (dict-level)
    if "pain_category_includes" in expected:
        needle = expected["pain_category_includes"].lower()
        if needle not in str(output.get("pain_category", "")).lower():
            return False

    return True


def run_suite(agent_name: str, invoke_fn=None) -> dict:
    """Load golden tests for *agent_name*, run each, and return a summary.

    Args:
        agent_name: Name used to find ``{agent_name}_tests.json``.
        invoke_fn:  Optional ``callable(input_data) -> output``.  When *None*
                    every test is marked as skipped (no agent invocation).

    Returns:
        dict with keys: agent, timestamp, total, passed, pass_rate, results.
    """
    test_cases = load_test_cases(agent_name)
    results: list[dict] = []

    for tc in test_cases:
        test_id = tc["id"]
        input_data = tc["input"]
        expected = tc["expected"]

        if invoke_fn is None:
            results.append({
                "test_id": test_id,
                "passed": False,
                "skipped": True,
                "expected_summary": _summarise(expected),
                "actual_summary": "no invoke_fn provided",
            })
            continue

        try:
            output = invoke_fn(input_data)
            passed = evaluate_output(output, expected)
            results.append({
                "test_id": test_id,
                "passed": passed,
                "skipped": False,
                "expected_summary": _summarise(expected),
                "actual_summary": _summarise(output),
            })
        except Exception as exc:
            results.append({
                "test_id": test_id,
                "passed": False,
                "skipped": False,
                "expected_summary": _summarise(expected),
                "actual_summary": f"ERROR: {exc}",
            })

    passed_count = sum(1 for r in results if r["passed"])
    total = len(results)
    return {
        "agent": agent_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total": total,
        "passed": passed_count,
        "pass_rate": passed_count / total if total > 0 else 0.0,
        "results": results,
    }


def _summarise(obj: Any, max_len: int = 120) -> str:
    """Create a short string summary of an object."""
    if obj is None:
        return "None"
    s = str(obj)
    if len(s) > max_len:
        return s[:max_len] + "..."
    return s
