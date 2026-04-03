"""Tests for EntitlementEngine — plan features and feature flags."""
from app.services.backbone.entitlements import EntitlementEngine


class TestPlanFeatures:
    def test_core_plan_has_discover(self):
        assert EntitlementEngine.check_feature("core", "discover") is True

    def test_core_plan_has_qualify(self):
        assert EntitlementEngine.check_feature("core", "qualify") is True

    def test_core_plan_has_build_basic(self):
        assert EntitlementEngine.check_feature("core", "build_basic") is True

    def test_core_plan_lacks_compliance(self):
        assert EntitlementEngine.check_feature("core", "compliance") is False

    def test_core_plan_lacks_sell(self):
        assert EntitlementEngine.check_feature("core", "sell") is False

    def test_pro_plan_has_sell(self):
        assert EntitlementEngine.check_feature("pro", "sell") is True

    def test_pro_plan_has_playbooks(self):
        assert EntitlementEngine.check_feature("pro", "playbooks") is True

    def test_pro_plan_lacks_white_label(self):
        assert EntitlementEngine.check_feature("pro", "white_label") is False

    def test_enterprise_has_all(self):
        all_features = [
            "discover", "qualify", "build_basic",
            "sell", "lifecycle", "playbooks",
            "compliance", "admin", "api_access", "white_label",
        ]
        for feature in all_features:
            assert EntitlementEngine.check_feature("enterprise", feature) is True, (
                f"Enterprise should have '{feature}'"
            )

    def test_unknown_plan_has_nothing(self):
        assert EntitlementEngine.check_feature("free", "discover") is False

    def test_get_plan_features_core(self):
        features = EntitlementEngine.get_plan_features("core")
        assert features == ["discover", "qualify", "build_basic"]

    def test_case_insensitive(self):
        assert EntitlementEngine.check_feature("Core", "discover") is True
        assert EntitlementEngine.check_feature("ENTERPRISE", "white_label") is True


class TestFeatureFlags:
    def test_set_and_check_flag(self, db):
        EntitlementEngine.set_flag(db, "new_dashboard", True, rollout_pct=100.0)
        assert EntitlementEngine.check_flag(db, "new_dashboard") is True

    def test_disabled_flag(self, db):
        EntitlementEngine.set_flag(db, "beta_feature", False)
        assert EntitlementEngine.check_flag(db, "beta_feature") is False

    def test_nonexistent_flag(self, db):
        assert EntitlementEngine.check_flag(db, "does_not_exist") is False

    def test_rollout_percentage(self, db):
        EntitlementEngine.set_flag(db, "gradual_rollout", True, rollout_pct=50.0)
        # With a workspace_id, it should deterministically resolve
        result = EntitlementEngine.check_flag(
            db, "gradual_rollout", "workspace-abc"
        )
        assert isinstance(result, bool)
