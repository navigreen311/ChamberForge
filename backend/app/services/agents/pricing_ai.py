"""AI-powered pricing intelligence service."""
from __future__ import annotations

import json
import logging
from typing import Any

import anthropic

from app.core.config import settings

logger = logging.getLogger(__name__)

# Hardcoded market benchmarks derived from the premium-service blueprint
MARKET_BENCHMARKS: dict[str, list[dict[str, Any]]] = {
    "coordination": [
        {"service": "Multi-property coordination", "low": 15000, "high": 30000, "unit": "monthly"},
        {"service": "Staff management overlay", "low": 8000, "high": 15000, "unit": "monthly"},
        {"service": "Vendor orchestration", "low": 5000, "high": 12000, "unit": "monthly"},
    ],
    "security": [
        {"service": "Executive protection program", "low": 10000, "high": 25000, "unit": "monthly"},
        {"service": "Residential security audit", "low": 5000, "high": 15000, "unit": "project"},
        {"service": "Cyber-physical convergence", "low": 8000, "high": 20000, "unit": "monthly"},
    ],
    "privacy": [
        {"service": "Digital privacy management", "low": 8000, "high": 18000, "unit": "monthly"},
        {"service": "Entity structuring advisory", "low": 10000, "high": 15000, "unit": "project"},
        {"service": "Media & reputation shield", "low": 6000, "high": 12000, "unit": "monthly"},
    ],
    "governance": [
        {"service": "Family governance framework", "low": 15000, "high": 35000, "unit": "project"},
        {"service": "Succession planning support", "low": 10000, "high": 25000, "unit": "project"},
        {"service": "Board & advisory coordination", "low": 8000, "high": 18000, "unit": "monthly"},
    ],
    "medical": [
        {"service": "Concierge medical coordination", "low": 8000, "high": 20000, "unit": "monthly"},
        {"service": "Global medical evacuation", "low": 5000, "high": 15000, "unit": "annual"},
        {"service": "Wellness program management", "low": 6000, "high": 12000, "unit": "monthly"},
    ],
    "travel": [
        {"service": "Full-spectrum travel management", "low": 6000, "high": 15000, "unit": "monthly"},
        {"service": "Aviation program oversight", "low": 8000, "high": 18000, "unit": "monthly"},
        {"service": "Destination advance work", "low": 3000, "high": 8000, "unit": "per-trip"},
    ],
}

SAMPLE_PRICING: dict[str, Any] = {
    "recommended_monthly": 20000.0,
    "setup_fee": 5000.0,
    "pricing_model": "retainer",
    "anchors": [
        {"reference": "Big-4 advisory retainer", "price": 35000, "context": "Monthly advisory fee"},
        {"reference": "Boutique family-office service", "price": 25000, "context": "Comparable scope"},
    ],
    "packaging_options": [
        {"tier": "Essential", "price": 15000, "included_services": ["Core coordination", "Monthly reporting"]},
        {"tier": "Premium", "price": 25000, "included_services": ["Core coordination", "24/7 desk", "Quarterly strategy"]},
        {"tier": "Elite", "price": 40000, "included_services": ["Full suite", "Dedicated team", "On-site presence"]},
    ],
}


class PricingAI:
    """AI agent for pricing intelligence and margin simulation."""

    def __init__(self) -> None:
        self.api_key = settings.ANTHROPIC_API_KEY
        self.model = settings.AI_MODEL
        if self.api_key:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None

    async def generate_pricing(self, offer_data: dict) -> dict:
        """Generate pricing recommendation for an offer."""
        if not self.client:
            logger.warning("No Anthropic API key — returning sample pricing.")
            return SAMPLE_PRICING

        prompt = (
            "Analyze this premium service offer and recommend pricing.\n\n"
            f"Offer: {json.dumps(offer_data, indent=2)}\n\n"
            "Return ONLY valid JSON:\n"
            "{\n"
            '  "recommended_monthly": number,\n'
            '  "setup_fee": number,\n'
            '  "pricing_model": "retainer|project|hybrid",\n'
            '  "anchors": [{"reference": "string", "price": number, "context": "string"}],\n'
            '  "packaging_options": [{"tier": "string", "price": number, '
            '"included_services": ["string"]}]\n'
            "}"
        )

        message = self.client.messages.create(
            model=self.model,
            max_tokens=1536,
            messages=[{"role": "user", "content": prompt}],
        )
        text = message.content[0].text.strip()
        if text.startswith("```"):
            lines = text.split("\n")[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines)
        return json.loads(text)

    def simulate_margins(
        self,
        monthly_price: float,
        setup_fee: float,
        costs: dict[str, float],
    ) -> dict[str, float]:
        """Pure math margin simulation — no AI needed."""
        total_monthly_costs = sum(costs.values())
        monthly_revenue = monthly_price
        gross_margin_pct = (
            ((monthly_revenue - total_monthly_costs) / monthly_revenue * 100)
            if monthly_revenue > 0
            else 0.0
        )
        # Assume 15% overhead on top of direct costs for net margin
        overhead_rate = 0.15
        net_costs = total_monthly_costs * (1 + overhead_rate)
        net_margin_pct = (
            ((monthly_revenue - net_costs) / monthly_revenue * 100)
            if monthly_revenue > 0
            else 0.0
        )
        annual_revenue = monthly_revenue * 12 + setup_fee
        annual_profit = (monthly_revenue - net_costs) * 12 + setup_fee
        breakeven_months = (
            setup_fee / (monthly_revenue - total_monthly_costs)
            if (monthly_revenue - total_monthly_costs) > 0
            else 0.0
        )

        return {
            "monthly_revenue": round(monthly_revenue, 2),
            "monthly_costs": round(total_monthly_costs, 2),
            "gross_margin_pct": round(gross_margin_pct, 2),
            "net_margin_pct": round(net_margin_pct, 2),
            "annual_revenue": round(annual_revenue, 2),
            "annual_profit": round(annual_profit, 2),
            "breakeven_months": round(breakeven_months, 2),
        }

    def get_market_benchmarks(self, pain_category: str) -> list[dict[str, Any]]:
        """Return hardcoded market benchmarks for a pain category."""
        key = pain_category.lower()
        return MARKET_BENCHMARKS.get(key, [])
