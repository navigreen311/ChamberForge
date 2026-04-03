"""IntelBrief — Pre-meeting intelligence dossier generator."""
from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any


class IntelBrief:
    """Generates comprehensive pre-meeting intelligence briefs for client engagements."""

    async def generate_brief(
        self, client_data: dict[str, Any], meeting_context: str = ""
    ) -> dict[str, Any]:
        """Generate an intelligence brief for a client meeting.

        Uses Claude AI when ANTHROPIC_API_KEY is available, otherwise builds
        a structured brief directly from client_data fields.
        """
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if api_key:
            return await self._generate_with_ai(client_data, meeting_context, api_key)
        return self._generate_from_data(client_data, meeting_context)

    # ------------------------------------------------------------------
    # AI-powered generation
    # ------------------------------------------------------------------
    async def _generate_with_ai(
        self,
        client_data: dict[str, Any],
        meeting_context: str,
        api_key: str,
    ) -> dict[str, Any]:
        try:
            import anthropic

            client = anthropic.AsyncAnthropic(api_key=api_key)
            prompt = (
                "You are a premium-services intelligence analyst. Generate a concise "
                "pre-meeting brief for the following client.\n\n"
                f"Client data: {client_data}\n"
                f"Meeting context: {meeting_context or 'General review'}\n\n"
                "Return JSON with: summary, key_facts (list), talking_points (list), "
                "proof_assets_to_bring (list), recent_changes (list), "
                "recommended_approach (string), and complexity_map with wealth_tier, "
                "entities_count, jurisdictions, active_risks."
            )
            message = await client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )
            # Best-effort parse; fall back to data-driven if AI response is odd
            import json

            text = message.content[0].text
            # Try to extract JSON from the response
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                ai_data = json.loads(text[start:end])
                return self._wrap_brief(client_data, ai_data)
        except Exception:
            pass
        # Fallback
        return self._generate_from_data(client_data, meeting_context)

    # ------------------------------------------------------------------
    # Data-driven generation (no AI)
    # ------------------------------------------------------------------
    def _generate_from_data(
        self, client_data: dict[str, Any], meeting_context: str
    ) -> dict[str, Any]:
        name = client_data.get("name", "Unknown Client")
        entities = client_data.get("entities", [])
        jurisdictions = client_data.get("jurisdictions", [])
        risks = client_data.get("active_risks", [])
        wealth_tier = client_data.get("wealth_tier", "HNW")
        recent = client_data.get("recent_changes", [])
        engagement_type = client_data.get("engagement_type", "Advisory")

        key_facts = [
            f"Wealth tier: {wealth_tier}",
            f"Entities under management: {len(entities)}",
            f"Jurisdictions: {', '.join(jurisdictions) if jurisdictions else 'Domestic only'}",
        ]
        if client_data.get("aum"):
            key_facts.append(f"AUM: ${client_data['aum']:,.0f}")
        if client_data.get("tenure_years"):
            key_facts.append(f"Client tenure: {client_data['tenure_years']} years")

        talking_points = [
            f"Review {engagement_type.lower()} progress and deliverables",
            "Address any open items from previous meeting",
        ]
        if risks:
            talking_points.append(f"Discuss {len(risks)} active risk(s)")
        if meeting_context:
            talking_points.append(f"Meeting focus: {meeting_context}")

        proof_assets = ["Engagement summary report", "Deliverables tracker"]
        if entities:
            proof_assets.append("Entity structure chart")
        if jurisdictions and len(jurisdictions) > 1:
            proof_assets.append("Cross-jurisdiction compliance matrix")

        summary = (
            f"{name} is a {wealth_tier} client with {len(entities)} entities across "
            f"{len(jurisdictions)} jurisdiction(s). "
            f"{'There are ' + str(len(risks)) + ' active risk(s) to discuss.' if risks else 'No active risks noted.'}"
        )

        return {
            "client_name": name,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "summary": summary,
            "key_facts": key_facts,
            "complexity_map": {
                "wealth_tier": wealth_tier,
                "entities_count": len(entities),
                "jurisdictions": jurisdictions,
                "active_risks": risks,
            },
            "talking_points": talking_points,
            "proof_assets_to_bring": proof_assets,
            "recent_changes": recent if recent else ["No recent changes recorded"],
            "recommended_approach": self._recommend_approach(client_data),
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _recommend_approach(self, client_data: dict[str, Any]) -> str:
        health = client_data.get("health_score", 80)
        tenure = client_data.get("tenure_years", 0)
        if health < 50:
            return "Proactive recovery — lead with value demonstration and address pain points directly"
        if health < 70:
            return "Attentive check-in — listen for unspoken concerns, present quick wins"
        if tenure > 5:
            return "Strategic partner mode — discuss long-term roadmap and expansion opportunities"
        return "Confident delivery — reinforce value delivered, explore upsell naturally"

    def _wrap_brief(
        self, client_data: dict[str, Any], ai_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Normalize an AI-generated brief into the standard schema."""
        return {
            "client_name": client_data.get("name", "Unknown Client"),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "summary": ai_data.get("summary", ""),
            "key_facts": ai_data.get("key_facts", []),
            "complexity_map": ai_data.get(
                "complexity_map",
                {
                    "wealth_tier": client_data.get("wealth_tier", "HNW"),
                    "entities_count": len(client_data.get("entities", [])),
                    "jurisdictions": client_data.get("jurisdictions", []),
                    "active_risks": client_data.get("active_risks", []),
                },
            ),
            "talking_points": ai_data.get("talking_points", []),
            "proof_assets_to_bring": ai_data.get("proof_assets_to_bring", []),
            "recent_changes": ai_data.get("recent_changes", []),
            "recommended_approach": ai_data.get("recommended_approach", ""),
        }
