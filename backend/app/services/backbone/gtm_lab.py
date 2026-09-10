"""GTMLab — Go-to-market experimentation: headline testing and price anchoring."""

from __future__ import annotations

import hashlib
from uuid import uuid4


class GTMLab:
    """Go-to-market laboratory for testing headlines, pricing, and messaging."""

    def __init__(self) -> None:
        self._experiments: dict[str, dict] = {}

    def create_headline_test(
        self,
        name: str,
        variants: list[str],
        target_audience: str = "",
    ) -> dict:
        """Create an A/B headline test with multiple variants.

        Args:
            name: Experiment name
            variants: List of headline strings to test
            target_audience: Description of target audience

        Returns:
            Experiment dict with id, variants, and tracking data
        """
        exp_id = str(uuid4())
        variant_data = []
        for i, headline in enumerate(variants):
            variant_data.append({
                "id": f"v{i}",
                "headline": headline,
                "impressions": 0,
                "clicks": 0,
                "conversions": 0,
                "ctr": 0.0,
                "conversion_rate": 0.0,
            })

        experiment = {
            "id": exp_id,
            "name": name,
            "type": "headline_test",
            "target_audience": target_audience,
            "variants": variant_data,
            "status": "draft",
            "winner": None,
        }
        self._experiments[exp_id] = experiment
        return experiment

    def record_impression(self, experiment_id: str, variant_id: str) -> bool:
        """Record an impression for a variant."""
        exp = self._experiments.get(experiment_id)
        if not exp:
            return False
        for v in exp["variants"]:
            if v["id"] == variant_id:
                v["impressions"] += 1
                self._recalc_rates(v)
                return True
        return False

    def record_click(self, experiment_id: str, variant_id: str) -> bool:
        """Record a click for a variant."""
        exp = self._experiments.get(experiment_id)
        if not exp:
            return False
        for v in exp["variants"]:
            if v["id"] == variant_id:
                v["clicks"] += 1
                self._recalc_rates(v)
                return True
        return False

    def record_conversion(self, experiment_id: str, variant_id: str) -> bool:
        """Record a conversion for a variant."""
        exp = self._experiments.get(experiment_id)
        if not exp:
            return False
        for v in exp["variants"]:
            if v["id"] == variant_id:
                v["conversions"] += 1
                self._recalc_rates(v)
                return True
        return False

    @staticmethod
    def _recalc_rates(variant: dict) -> None:
        imp = variant["impressions"]
        variant["ctr"] = round(variant["clicks"] / imp * 100, 2) if imp > 0 else 0.0
        variant["conversion_rate"] = (
            round(variant["conversions"] / imp * 100, 2) if imp > 0 else 0.0
        )

    def pick_winner(self, experiment_id: str) -> dict | None:
        """Determine the winning variant based on conversion rate."""
        exp = self._experiments.get(experiment_id)
        if not exp:
            return None
        best = max(exp["variants"], key=lambda v: v["conversion_rate"])
        exp["winner"] = best["id"]
        exp["status"] = "completed"
        return exp

    def get_experiment(self, experiment_id: str) -> dict | None:
        return self._experiments.get(experiment_id)

    @staticmethod
    def generate_price_anchoring(
        target_price: float,
        num_tiers: int = 3,
    ) -> list[dict]:
        """Generate price anchoring tiers to make the target price attractive.

        Args:
            target_price: The price you want customers to choose
            num_tiers: Number of pricing tiers (default 3)

        Returns:
            List of tier dicts with name, price, positioning, features
        """
        if num_tiers < 2:
            num_tiers = 2
        if num_tiers > 5:
            num_tiers = 5

        tiers = []
        if num_tiers == 2:
            tiers = [
                {
                    "name": "Professional",
                    "price": round(target_price, 2),
                    "positioning": "recommended",
                    "features": ["Core offering", "Standard support", "Quarterly reviews"],
                },
                {
                    "name": "Enterprise",
                    "price": round(target_price * 2.5, 2),
                    "positioning": "anchor",
                    "features": ["Everything in Professional", "Priority support", "Monthly reviews", "Custom integrations"],
                },
            ]
        elif num_tiers == 3:
            tiers = [
                {
                    "name": "Essentials",
                    "price": round(target_price * 0.5, 2),
                    "positioning": "entry",
                    "features": ["Core offering", "Email support"],
                },
                {
                    "name": "Professional",
                    "price": round(target_price, 2),
                    "positioning": "recommended",
                    "features": ["Everything in Essentials", "Priority support", "Quarterly reviews", "Analytics dashboard"],
                },
                {
                    "name": "Enterprise",
                    "price": round(target_price * 2.5, 2),
                    "positioning": "anchor",
                    "features": ["Everything in Professional", "Dedicated success manager", "Monthly reviews", "Custom integrations", "SLA guarantee"],
                },
            ]
        else:
            # 4-5 tiers
            multipliers = [0.3, 0.6, 1.0, 2.0, 3.5][:num_tiers]
            names = ["Starter", "Growth", "Professional", "Business", "Enterprise"][:num_tiers]
            for i, (mult, name) in enumerate(zip(multipliers, names)):
                pos = "recommended" if mult == 1.0 else ("anchor" if mult > 1.5 else "entry")
                tiers.append({
                    "name": name,
                    "price": round(target_price * mult, 2),
                    "positioning": pos,
                    "features": [f"Tier {i+1} feature set"],
                })

        return tiers

    def assign_variant(self, experiment_id: str, user_id: str) -> str | None:
        """Deterministically assign a user to a variant (consistent hashing)."""
        exp = self._experiments.get(experiment_id)
        if not exp or not exp["variants"]:
            return None
        hash_input = f"{experiment_id}:{user_id}"
        hash_val = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        idx = hash_val % len(exp["variants"])
        return exp["variants"][idx]["id"]
