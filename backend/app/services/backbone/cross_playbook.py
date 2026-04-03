"""Cross-playbook composer — merges multiple playbooks into a unified system."""


class CrossPlaybookComposer:
    """Composes 2-3 playbooks into a single unified playbook."""

    @staticmethod
    def compose(playbooks: list[dict]) -> dict:
        """Merge multiple playbooks into one unified system.

        Each playbook should have: name, icp (dict), sops (list), pricing (dict with min/max),
        journey (list of stages), kpis (list).
        """
        if len(playbooks) < 2:
            raise ValueError("Need at least 2 playbooks to compose")
        if len(playbooks) > 3:
            raise ValueError("Maximum 3 playbooks can be composed at once")

        # Combined name
        names = [pb.get("name", "Unnamed") for pb in playbooks]
        combined_name = " + ".join(names)

        # Merge ICPs — union of all ICP attributes
        combined_icp: dict = {}
        for pb in playbooks:
            icp = pb.get("icp", {})
            for key, value in icp.items():
                if key in combined_icp:
                    existing = combined_icp[key]
                    if isinstance(existing, list) and isinstance(value, list):
                        combined_icp[key] = list(set(existing + value))
                    elif isinstance(existing, str) and isinstance(value, str):
                        if value not in existing:
                            combined_icp[key] = f"{existing}; {value}"
                    else:
                        combined_icp[key] = value
                else:
                    combined_icp[key] = value

        # Merge SOPs — concatenate, deduplicate by name
        merged_sops: list[dict] = []
        seen_sop_names: set[str] = set()
        for pb in playbooks:
            for sop in pb.get("sops", []):
                sop_name = sop.get("name", "")
                if sop_name not in seen_sop_names:
                    seen_sop_names.add(sop_name)
                    merged_sops.append(sop)

        # Combined pricing — sum of all playbook price ranges
        total_min = 0.0
        total_max = 0.0
        pricing_models: list[str] = []
        for pb in playbooks:
            pricing = pb.get("pricing", {})
            total_min += pricing.get("min", 0)
            total_max += pricing.get("max", 0)
            model = pricing.get("pricing_model", "")
            if model and model not in pricing_models:
                pricing_models.append(model)

        combined_pricing = {
            "min": total_min,
            "max": total_max,
            "pricing_model": " + ".join(pricing_models) if pricing_models else "bundled",
        }

        # Unified journey — merge stages, dedup by stage name
        unified_journey: list[dict] = []
        seen_stages: set[str] = set()
        for pb in playbooks:
            for stage in pb.get("journey", []):
                stage_name = stage.get("name", "")
                if stage_name not in seen_stages:
                    seen_stages.add(stage_name)
                    unified_journey.append(stage)

        # Bundled KPIs — union of all KPIs
        bundled_kpis: list[str] = []
        seen_kpis: set[str] = set()
        for pb in playbooks:
            for kpi in pb.get("kpis", []):
                kpi_str = kpi if isinstance(kpi, str) else str(kpi)
                if kpi_str not in seen_kpis:
                    seen_kpis.add(kpi_str)
                    bundled_kpis.append(kpi_str)

        return {
            "name": combined_name,
            "combined_icp": combined_icp,
            "merged_sops": merged_sops,
            "combined_pricing": combined_pricing,
            "unified_journey": unified_journey,
            "bundled_kpis": bundled_kpis,
        }

    @staticmethod
    def estimate_bundle_pricing(
        playbook_prices: list[tuple[float, float]],
        discount_pct: float = 10.0,
    ) -> dict:
        """Estimate bundle pricing with optional discount.

        Args:
            playbook_prices: List of (min_price, max_price) tuples.
            discount_pct: Discount percentage to apply (default 10%).
        """
        total_min = sum(p[0] for p in playbook_prices)
        total_max = sum(p[1] for p in playbook_prices)

        discount_multiplier = 1 - (discount_pct / 100)
        discounted_min = round(total_min * discount_multiplier, 2)
        discounted_max = round(total_max * discount_multiplier, 2)

        return {
            "min_price": discounted_min,
            "max_price": discounted_max,
            "discount_applied": discount_pct,
            "savings": round(total_max - discounted_max, 2),
        }
