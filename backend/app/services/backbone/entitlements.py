"""Entitlement Engine — Plan-based feature gating and feature flags."""
import hashlib

from sqlalchemy.orm import Session

from app.models.feature_flag import FeatureFlag

# Hierarchical plan → feature map
_PLAN_FEATURES: dict[str, list[str]] = {
    "core": ["discover", "qualify", "build_basic"],
    "pro": [
        "discover", "qualify", "build_basic",
        "sell", "lifecycle", "playbooks",
    ],
    "enterprise": [
        "discover", "qualify", "build_basic",
        "sell", "lifecycle", "playbooks",
        "compliance", "admin", "api_access", "white_label",
    ],
}


class EntitlementEngine:
    """Manages plan-based entitlements and feature flags."""

    @staticmethod
    def check_feature(workspace_plan: str, feature_name: str) -> bool:
        """Check if a plan grants access to a feature."""
        plan = workspace_plan.lower()
        features = _PLAN_FEATURES.get(plan, [])
        return feature_name in features

    @staticmethod
    def get_plan_features(plan: str) -> list[str]:
        """Return the full feature list for a plan."""
        return list(_PLAN_FEATURES.get(plan.lower(), []))

    @staticmethod
    def check_flag(
        db: Session, flag_name: str, workspace_id: str | None = None
    ) -> bool:
        """Check a feature flag (enabled + rollout percentage)."""
        flag = db.query(FeatureFlag).filter(FeatureFlag.name == flag_name).first()
        if not flag or not flag.enabled:
            return False

        # If rollout is 100%, everyone gets it
        if flag.rollout_percentage >= 100.0:
            return True

        # Deterministic rollout based on workspace_id hash
        if workspace_id:
            hash_val = int(
                hashlib.sha256(
                    f"{flag_name}:{workspace_id}".encode()
                ).hexdigest(),
                16,
            )
            bucket = (hash_val % 10000) / 100.0  # 0–99.99
            return bucket < flag.rollout_percentage

        return False

    @staticmethod
    def set_flag(
        db: Session,
        flag_name: str,
        enabled: bool,
        rollout_pct: float = 100.0,
        plan_requirements: list[str] | None = None,
    ) -> FeatureFlag:
        """Create or update a feature flag."""
        flag = db.query(FeatureFlag).filter(FeatureFlag.name == flag_name).first()
        if flag:
            flag.enabled = enabled
            flag.rollout_percentage = rollout_pct
            if plan_requirements is not None:
                flag.plan_requirements = plan_requirements
        else:
            flag = FeatureFlag(
                name=flag_name,
                enabled=enabled,
                rollout_percentage=rollout_pct,
                plan_requirements=plan_requirements or [],
            )
            db.add(flag)

        db.commit()
        db.refresh(flag)
        return flag
