"""MarketingEngine — Dream 100 list generation and outreach strategy."""

from __future__ import annotations


class MarketingEngine:
    """Generates Dream 100 target lists and outreach strategies."""

    @staticmethod
    def generate_dream_100(offer_data: dict) -> dict:
        """Generate a Dream 100 target list strategy.

        Args:
            offer_data: dict with name, target_market, industry, price, pain_points, outcomes

        Returns:
            dict with target_list_criteria, outreach_strategy, personalization_fields, sequence_cadence
        """
        offer_name = offer_data.get("name", "Premium Service")
        target_market = offer_data.get("target_market", "high-net-worth individuals")
        industry = offer_data.get("industry", "premium services")
        price = offer_data.get("price", 0)
        pain_points = offer_data.get("pain_points", [])
        outcomes = offer_data.get("outcomes", [])

        # Determine tier based on price
        if isinstance(price, (int, float)) and price >= 50000:
            tier = "enterprise"
            cadence_days = [1, 4, 10, 21, 35, 50, 70, 90]
        elif isinstance(price, (int, float)) and price >= 10000:
            tier = "mid-market"
            cadence_days = [1, 3, 7, 14, 28, 42, 60]
        else:
            tier = "growth"
            cadence_days = [1, 3, 7, 14, 30, 45]

        pain_criteria = [f"Experiencing: {p}" for p in pain_points[:5]]
        outcome_criteria = [f"Seeking: {o}" for o in outcomes[:5]]

        return {
            "target_list_criteria": {
                "market_segment": target_market,
                "industry": industry,
                "tier": tier,
                "firmographic_filters": [
                    f"Industry: {industry}",
                    "Decision-maker title: C-suite, VP, Director",
                    f"Company size: appropriate for {tier} tier",
                    f"Budget authority: >${price if isinstance(price, (int, float)) else '10000'}/year",
                ],
                "pain_based_filters": pain_criteria,
                "outcome_based_filters": outcome_criteria,
                "exclusion_criteria": [
                    "Currently under contract with direct competitor",
                    "Company in financial distress or bankruptcy",
                    "No decision-making authority",
                ],
            },
            "outreach_strategy": {
                "approach": f"Multi-touch {tier}-grade outreach for {offer_name}",
                "channels": [
                    {"channel": "Warm introduction via mutual connection", "priority": 1},
                    {"channel": "Personalized email sequence", "priority": 2},
                    {"channel": "LinkedIn engagement + direct message", "priority": 3},
                    {"channel": "Direct mail with premium collateral", "priority": 4},
                    {"channel": "Event-based networking", "priority": 5},
                ],
                "value_first_assets": [
                    "Industry-specific research report",
                    "Personalized audit or assessment",
                    "Exclusive invitation to private event",
                    "Custom ROI projection",
                ],
                "touch_count": len(cadence_days),
            },
            "personalization_fields": [
                "company_name",
                "decision_maker_name",
                "decision_maker_role",
                "recent_company_news",
                "specific_pain_point",
                "mutual_connections",
                "industry_benchmark_data",
                "competitor_landscape",
                "recent_social_posts",
                "company_growth_stage",
            ],
            "sequence_cadence": {
                "total_touches": len(cadence_days),
                "days": cadence_days,
                "escalation_triggers": [
                    "Email opened 3+ times",
                    "Link clicked",
                    "LinkedIn profile viewed",
                    "Replied with question",
                    "Attended webinar or event",
                ],
                "pause_triggers": [
                    "Unsubscribe request",
                    "Explicit 'not interested'",
                    "Out of office for 2+ weeks",
                ],
            },
        }
