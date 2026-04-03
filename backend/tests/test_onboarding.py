"""Tests for OnboardingService — status, complete, skip, dismiss."""
import pytest
from app.services.backbone.onboarding import OnboardingService, TOTAL_STEPS


class TestGetOnboardingStatus:
    def test_fresh_user_gets_default_status(self, db):
        status = OnboardingService.get_onboarding_status(db, "user-fresh-1")
        assert status["completed"] is False
        assert status["current_step"] == 1
        assert status["total_steps"] == TOTAL_STEPS
        assert len(status["steps"]) == TOTAL_STEPS
        assert all(not s["completed"] and not s["skipped"] for s in status["steps"])

    def test_status_is_idempotent(self, db):
        s1 = OnboardingService.get_onboarding_status(db, "user-idem-1")
        s2 = OnboardingService.get_onboarding_status(db, "user-idem-1")
        assert s1 == s2


class TestCompleteStep:
    def test_complete_first_step(self, db):
        result = OnboardingService.complete_step(db, "user-comp-1", 1)
        assert result["steps"][0]["completed"] is True
        assert result["current_step"] == 2

    def test_complete_all_steps_marks_done(self, db):
        uid = "user-comp-all"
        for step_id in range(1, TOTAL_STEPS + 1):
            result = OnboardingService.complete_step(db, uid, step_id)
        assert result["completed"] is True
        assert all(s["completed"] for s in result["steps"])

    def test_complete_same_step_twice_is_idempotent(self, db):
        uid = "user-comp-dup"
        OnboardingService.complete_step(db, uid, 1)
        result = OnboardingService.complete_step(db, uid, 1)
        assert result["steps"][0]["completed"] is True
        assert result["current_step"] == 2

    def test_invalid_step_raises(self, db):
        with pytest.raises(ValueError, match="Invalid step_id"):
            OnboardingService.complete_step(db, "user-bad", 0)
        with pytest.raises(ValueError, match="Invalid step_id"):
            OnboardingService.complete_step(db, "user-bad", TOTAL_STEPS + 1)


class TestSkipStep:
    def test_skip_step_advances(self, db):
        result = OnboardingService.skip_step(db, "user-skip-1", 1)
        assert result["steps"][0]["skipped"] is True
        assert result["current_step"] == 2

    def test_skip_all_marks_complete(self, db):
        uid = "user-skip-all"
        for step_id in range(1, TOTAL_STEPS + 1):
            result = OnboardingService.skip_step(db, uid, step_id)
        assert result["completed"] is True

    def test_invalid_skip_raises(self, db):
        with pytest.raises(ValueError, match="Invalid step_id"):
            OnboardingService.skip_step(db, "user-bad-skip", 99)


class TestDismiss:
    def test_dismiss_marks_completed(self, db):
        result = OnboardingService.dismiss(db, "user-dismiss-1")
        assert result["completed"] is True

    def test_dismiss_fresh_user(self, db):
        result = OnboardingService.dismiss(db, "user-dismiss-fresh")
        assert result["completed"] is True
        # Steps remain incomplete but onboarding is dismissed
        assert not all(s["completed"] for s in result["steps"])


class TestMixedFlow:
    def test_complete_and_skip_interleaved(self, db):
        uid = "user-mixed-1"
        OnboardingService.complete_step(db, uid, 1)
        OnboardingService.skip_step(db, uid, 2)
        result = OnboardingService.complete_step(db, uid, 3)
        assert result["current_step"] == 4
        assert result["steps"][0]["completed"] is True
        assert result["steps"][1]["skipped"] is True
        assert result["steps"][2]["completed"] is True
