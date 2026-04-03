"""Red-team offer auditor — adversarial analysis of offer viability."""


class RedTeamAuditor:
    """Runs adversarial checks across 5 dimensions to stress-test an offer."""

    # Dimension weights for overall score
    DIMENSION_WEIGHTS = {
        "compliance_check": 0.25,
        "delivery_fragility": 0.20,
        "margin_stress": 0.20,
        "competitive_vulnerability": 0.15,
        "reputation_risk": 0.20,
    }

    @staticmethod
    def _score_to_status(score: float) -> str:
        if score >= 70:
            return "PASS"
        elif score >= 40:
            return "WARN"
        return "FAIL"

    @classmethod
    def audit_offer(cls, offer_data: dict) -> dict:
        """Run adversarial audit across 5 dimensions.

        Args:
            offer_data: Dict with keys like name, description, services, pricing,
                       delivery_model, team, target_market, etc.
        """
        dimensions = [
            cls._check_compliance(offer_data),
            cls._check_delivery_fragility(offer_data),
            cls._check_margin_stress(offer_data),
            cls._check_competitive_vulnerability(offer_data),
            cls._check_reputation_risk(offer_data),
        ]

        # Calculate weighted overall score
        overall_score = 0.0
        for dim in dimensions:
            weight = cls.DIMENSION_WEIGHTS.get(dim["name"], 0.2)
            overall_score += dim["score"] * weight

        overall_score = round(overall_score, 1)
        overall_status = cls._score_to_status(overall_score)

        return {
            "overall_status": overall_status,
            "score": overall_score,
            "dimensions": dimensions,
        }

    @classmethod
    def _check_compliance(cls, offer: dict) -> dict:
        """Check for compliance risks — licensed domains, surveillance, regulated industries."""
        findings: list[str] = []
        recommendations: list[str] = []
        score = 100.0

        description = (offer.get("description", "") + " " + offer.get("name", "")).lower()
        services = [s.lower() if isinstance(s, str) else str(s).lower() for s in offer.get("services", [])]
        all_text = description + " " + " ".join(services)

        # Check for surveillance-related services
        surveillance_terms = ["surveillance", "spy", "monitor employees", "track location",
                              "wiretap", "intercept", "covert monitoring"]
        for term in surveillance_terms:
            if term in all_text:
                findings.append(f"Potential surveillance activity detected: '{term}'")
                score -= 30

        # Check for licensed/regulated domains
        licensed_domains = ["medical", "legal advice", "financial advisory", "securities",
                           "insurance underwriting", "pharmaceutical"]
        for domain in licensed_domains:
            if domain in all_text:
                findings.append(f"Operates in licensed domain: '{domain}' — verify credentials")
                score -= 15
                recommendations.append(f"Obtain proper licensing for {domain} services")

        # Check for data privacy concerns
        data_terms = ["personal data", "biometric", "health records", "credit score"]
        for term in data_terms:
            if term in all_text:
                findings.append(f"Handles sensitive data: '{term}'")
                score -= 10
                recommendations.append(f"Ensure GDPR/CCPA compliance for {term}")

        if not findings:
            findings.append("No compliance red flags detected")

        score = max(0, score)
        return {
            "name": "compliance_check",
            "status": cls._score_to_status(score),
            "score": round(score, 1),
            "findings": findings,
            "recommendations": recommendations or ["Maintain current compliance posture"],
        }

    @classmethod
    def _check_delivery_fragility(cls, offer: dict) -> dict:
        """Check for single points of failure, key person dependency."""
        findings: list[str] = []
        recommendations: list[str] = []
        score = 100.0

        team = offer.get("team", [])
        delivery_model = offer.get("delivery_model", {})

        # Key person dependency
        if isinstance(team, list) and len(team) <= 1:
            findings.append("Single person delivery team — extreme key-person risk")
            score -= 40
            recommendations.append("Build redundancy: cross-train at least 2 team members")
        elif isinstance(team, list) and len(team) <= 2:
            findings.append("Small team with limited redundancy")
            score -= 15
            recommendations.append("Consider backup personnel for critical roles")

        # Check for single channel dependency
        channels = offer.get("channels", [])
        if isinstance(channels, list) and len(channels) <= 1:
            findings.append("Single delivery channel — no fallback if it fails")
            score -= 20
            recommendations.append("Add at least one backup delivery channel")

        # Check for automation/manual balance
        if isinstance(delivery_model, dict):
            if delivery_model.get("automation_level", "none") == "none":
                findings.append("Fully manual delivery — does not scale")
                score -= 15
                recommendations.append("Identify processes that can be partially automated")

        if not findings:
            findings.append("Delivery model appears resilient")

        score = max(0, score)
        return {
            "name": "delivery_fragility",
            "status": cls._score_to_status(score),
            "score": round(score, 1),
            "findings": findings,
            "recommendations": recommendations or ["Maintain current delivery resilience"],
        }

    @classmethod
    def _check_margin_stress(cls, offer: dict) -> dict:
        """Stress test: what if costs increase 30%?"""
        findings: list[str] = []
        recommendations: list[str] = []
        score = 85.0  # Start optimistic

        pricing = offer.get("pricing", {})
        costs = offer.get("costs", {})

        if isinstance(pricing, dict) and isinstance(costs, dict):
            revenue = pricing.get("max", 0)
            total_cost = costs.get("total", 0)

            if revenue > 0 and total_cost > 0:
                current_margin = (revenue - total_cost) / revenue * 100
                stressed_cost = total_cost * 1.3
                stressed_margin = (revenue - stressed_cost) / revenue * 100

                findings.append(f"Current margin: {current_margin:.1f}%")
                findings.append(f"Margin under +30% cost stress: {stressed_margin:.1f}%")

                if stressed_margin < 0:
                    score = 20
                    findings.append("CRITICAL: Offer becomes unprofitable under cost stress")
                    recommendations.append("Increase pricing or reduce cost base by 30%+")
                elif stressed_margin < 15:
                    score = 50
                    findings.append("Thin margins under stress — vulnerable to cost shocks")
                    recommendations.append("Build 20%+ buffer into pricing")
                elif stressed_margin < 30:
                    score = 70
                    recommendations.append("Consider adding cost escalation clauses to contracts")
            else:
                findings.append("Incomplete cost/revenue data — cannot fully stress test")
                score = 60
                recommendations.append("Provide detailed cost breakdown for accurate analysis")
        else:
            findings.append("No pricing or cost data provided")
            score = 50
            recommendations.append("Add pricing and cost structure to enable margin analysis")

        return {
            "name": "margin_stress",
            "status": cls._score_to_status(score),
            "score": round(score, 1),
            "findings": findings,
            "recommendations": recommendations,
        }

    @classmethod
    def _check_competitive_vulnerability(cls, offer: dict) -> dict:
        """Check how easily the offer can be replicated by competitors."""
        findings: list[str] = []
        recommendations: list[str] = []
        score = 75.0

        # Check for proprietary elements
        proprietary = offer.get("proprietary_elements", [])
        if not proprietary:
            findings.append("No proprietary elements identified — easy to replicate")
            score -= 30
            recommendations.append("Develop unique IP, frameworks, or proprietary data assets")
        else:
            findings.append(f"{len(proprietary)} proprietary element(s) provide competitive moat")

        # Check for unique partnerships/relationships
        partnerships = offer.get("partnerships", [])
        if partnerships:
            findings.append(f"{len(partnerships)} strategic partnership(s) add defensibility")
            score += 10
        else:
            findings.append("No exclusive partnerships — low switching cost for clients")
            score -= 10
            recommendations.append("Establish exclusive partnerships or preferred vendor status")

        # Check for brand/reputation dependency
        brand_strength = offer.get("brand_strength", "unknown")
        if brand_strength == "low":
            findings.append("Low brand recognition — commodity risk")
            score -= 15

        score = max(0, min(100, score))
        return {
            "name": "competitive_vulnerability",
            "status": cls._score_to_status(score),
            "score": round(score, 1),
            "findings": findings,
            "recommendations": recommendations or ["Maintain competitive differentiation"],
        }

    @classmethod
    def _check_reputation_risk(cls, offer: dict) -> dict:
        """Assess client backlash scenarios."""
        findings: list[str] = []
        recommendations: list[str] = []
        score = 85.0

        description = (offer.get("description", "") + " " + offer.get("name", "")).lower()
        services = [s.lower() if isinstance(s, str) else str(s).lower() for s in offer.get("services", [])]
        all_text = description + " " + " ".join(services)
        target_market = offer.get("target_market", "").lower() if isinstance(offer.get("target_market"), str) else ""

        # Sensitive client segments
        sensitive_segments = ["children", "elderly", "vulnerable", "disability", "mental health"]
        for seg in sensitive_segments:
            if seg in target_market or seg in all_text:
                findings.append(f"Serves sensitive segment: '{seg}' — heightened duty of care")
                score -= 15
                recommendations.append(f"Implement enhanced safeguards for {seg} segment")

        # Controversial methods
        controversial = ["aggressive", "manipulation", "pressure", "exploit",
                         "fear-based", "shame", "guilt"]
        for term in controversial:
            if term in all_text:
                findings.append(f"Potentially controversial method: '{term}'")
                score -= 20
                recommendations.append(f"Review and soften language/approach around '{term}'")

        # High-visibility risk
        if "public" in all_text or "media" in all_text or "celebrity" in all_text:
            findings.append("High public visibility — amplified reputation exposure")
            score -= 10
            recommendations.append("Prepare PR crisis playbook for public-facing engagements")

        if not findings:
            findings.append("Low reputation risk profile")

        score = max(0, score)
        return {
            "name": "reputation_risk",
            "status": cls._score_to_status(score),
            "score": round(score, 1),
            "findings": findings,
            "recommendations": recommendations or ["Maintain ethical standards"],
        }
