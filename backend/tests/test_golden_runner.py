"""Tests for the golden test runner — evaluate_output and load_test_cases."""
import pytest

from app.services.backbone.golden_test_runner import evaluate_output, load_test_cases

# ---------------------------------------------------------------------------
# evaluate_output — required_fields
# ---------------------------------------------------------------------------

class TestEvaluateOutputRequiredFields:
    def test_all_required_fields_present(self):
        output = {"title": "X", "pain_category": "Security", "urgency_score": 8}
        expected = {"required_fields": ["title", "pain_category", "urgency_score"]}
        assert evaluate_output(output, expected) is True

    def test_missing_required_field(self):
        output = {"title": "X"}
        expected = {"required_fields": ["title", "pain_category"]}
        assert evaluate_output(output, expected) is False

    def test_none_output_fails(self):
        assert evaluate_output(None, {"required_fields": ["title"]}) is False


# ---------------------------------------------------------------------------
# evaluate_output — list-level checks
# ---------------------------------------------------------------------------

class TestEvaluateOutputListChecks:
    def test_min_problems_met(self):
        output = [{"title": "A", "pain_category": "X", "urgency_score": 5}]
        expected = {"min_problems": 1, "required_fields": ["title"]}
        assert evaluate_output(output, expected) is True

    def test_min_problems_not_met(self):
        output = []
        expected = {"min_problems": 1}
        assert evaluate_output(output, expected) is False

    def test_is_list_with_item_required_fields(self):
        output = [
            {"problem_name": "A", "weighted_score": 7.2},
            {"problem_name": "B", "weighted_score": 4.5},
        ]
        expected = {"is_list": True, "min_items": 1, "item_required_fields": ["problem_name", "weighted_score"]}
        assert evaluate_output(output, expected) is True

    def test_is_list_fails_when_dict(self):
        output = {"not": "a list"}
        expected = {"is_list": True}
        assert evaluate_output(output, expected) is False

    def test_is_list_item_missing_field(self):
        output = [{"problem_name": "A"}]
        expected = {"is_list": True, "item_required_fields": ["problem_name", "weighted_score"]}
        assert evaluate_output(output, expected) is False


# ---------------------------------------------------------------------------
# evaluate_output — pain_category_includes
# ---------------------------------------------------------------------------

class TestEvaluateOutputPainCategory:
    def test_pain_category_includes_match_list(self):
        output = [{"pain_category": "privacy_security"}]
        expected = {"min_problems": 1, "pain_category_includes": "Security"}
        assert evaluate_output(output, expected) is True

    def test_pain_category_includes_no_match_list(self):
        output = [{"pain_category": "estate_planning"}]
        expected = {"min_problems": 1, "pain_category_includes": "Security"}
        assert evaluate_output(output, expected) is False

    def test_pain_category_includes_match_dict(self):
        output = {"pain_category": "privacy_security", "title": "X"}
        expected = {"pain_category_includes": "security"}
        assert evaluate_output(output, expected) is True


# ---------------------------------------------------------------------------
# evaluate_output — numeric ranges
# ---------------------------------------------------------------------------

class TestEvaluateOutputNumericRanges:
    def test_recommended_monthly_min_pass(self):
        output = {"recommended_monthly": 15000, "pricing_model": "retainer"}
        expected = {"required_fields": ["recommended_monthly"], "recommended_monthly_min": 1000}
        assert evaluate_output(output, expected) is True

    def test_recommended_monthly_min_fail(self):
        output = {"recommended_monthly": 500, "pricing_model": "retainer"}
        expected = {"recommended_monthly_min": 1000}
        assert evaluate_output(output, expected) is False

    def test_overall_score_max_pass(self):
        output = {"overall_score": 7.5}
        expected = {"required_fields": ["overall_score"], "overall_score_max": 10.0}
        assert evaluate_output(output, expected) is True

    def test_overall_score_max_fail(self):
        output = {"overall_score": 11.0}
        expected = {"overall_score_max": 10.0}
        assert evaluate_output(output, expected) is False


# ---------------------------------------------------------------------------
# evaluate_output — enum checks
# ---------------------------------------------------------------------------

class TestEvaluateOutputEnumChecks:
    def test_priority_in_pass(self):
        output = {"action_title": "X", "priority": "high", "estimated_impact": "Y"}
        expected = {"required_fields": ["action_title"], "priority_in": ["critical", "high", "medium", "low"]}
        assert evaluate_output(output, expected) is True

    def test_priority_in_fail(self):
        output = {"priority": "unknown"}
        expected = {"priority_in": ["critical", "high", "medium", "low"]}
        assert evaluate_output(output, expected) is False

    def test_delivery_model_in_pass(self):
        output = {"name": "X", "description": "Y", "delivery_model": "retainer"}
        expected = {"delivery_model_in": ["retainer", "project", "concierge", "hybrid"]}
        assert evaluate_output(output, expected) is True


# ---------------------------------------------------------------------------
# evaluate_output — nested list size checks
# ---------------------------------------------------------------------------

class TestEvaluateOutputNestedLists:
    def test_min_value_stack_items_pass(self):
        output = {"name": "X", "value_stack": [{"name": "A"}, {"name": "B"}]}
        expected = {"min_value_stack_items": 1}
        assert evaluate_output(output, expected) is True

    def test_min_value_stack_items_fail(self):
        output = {"name": "X", "value_stack": []}
        expected = {"min_value_stack_items": 1}
        assert evaluate_output(output, expected) is False

    def test_min_anchors_pass(self):
        output = {"recommended_monthly": 20000, "anchors": [{"ref": "A"}]}
        expected = {"min_anchors": 1}
        assert evaluate_output(output, expected) is True


# ---------------------------------------------------------------------------
# load_test_cases
# ---------------------------------------------------------------------------

class TestLoadTestCases:
    def test_load_problem_ai(self):
        cases = load_test_cases("problem_ai")
        assert isinstance(cases, list)
        assert len(cases) == 5
        assert all("id" in c and "input" in c and "expected" in c for c in cases)

    def test_load_validator_ai(self):
        cases = load_test_cases("validator_ai")
        assert len(cases) == 5

    def test_load_offer_ai(self):
        cases = load_test_cases("offer_ai")
        assert len(cases) == 5

    def test_load_pricing_ai(self):
        cases = load_test_cases("pricing_ai")
        assert len(cases) == 5

    def test_load_command_ai(self):
        cases = load_test_cases("command_ai")
        assert len(cases) == 5

    def test_load_nonexistent_raises(self):
        with pytest.raises(FileNotFoundError):
            load_test_cases("nonexistent_agent")
