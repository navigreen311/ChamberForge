"""AuthorityPositioning — Content planning and media placement strategy."""

from __future__ import annotations

from uuid import uuid4


class ContentType(str):
    ARTICLE = "article"
    PODCAST = "podcast"
    WEBINAR = "webinar"
    WHITEPAPER = "whitepaper"
    CASE_STUDY = "case_study"
    SPEAKING = "speaking"
    MEDIA_APPEARANCE = "media_appearance"


class AuthorityPositioning:
    """Manages content plans and media placement strategies for authority building."""

    def __init__(self) -> None:
        self._content_plans: dict[str, dict] = {}
        self._media_placements: dict[str, dict] = {}

    def create_content_plan(
        self,
        brand_name: str,
        expertise_areas: list[str],
        target_audience: str,
        cadence_weeks: int = 12,
    ) -> dict:
        """Create a content authority plan.

        Args:
            brand_name: Name of the brand/person
            expertise_areas: Areas of expertise
            target_audience: Target audience description
            cadence_weeks: Number of weeks to plan (default 12)

        Returns:
            Content plan with weekly schedule and content pieces
        """
        plan_id = str(uuid4())

        content_types_cycle = [
            ContentType.ARTICLE,
            ContentType.PODCAST,
            ContentType.CASE_STUDY,
            ContentType.WEBINAR,
        ]

        weekly_schedule = []
        for week in range(1, cadence_weeks + 1):
            expertise = expertise_areas[(week - 1) % len(expertise_areas)] if expertise_areas else "industry insights"
            content_type = content_types_cycle[(week - 1) % len(content_types_cycle)]

            weekly_schedule.append({
                "week": week,
                "content_type": content_type,
                "topic": f"{expertise} — Week {week} deep dive for {target_audience}",
                "status": "planned",
                "distribution_channels": self._get_channels_for_type(content_type),
            })

        plan = {
            "id": plan_id,
            "brand_name": brand_name,
            "expertise_areas": expertise_areas,
            "target_audience": target_audience,
            "total_weeks": cadence_weeks,
            "schedule": weekly_schedule,
            "status": "active",
        }
        self._content_plans[plan_id] = plan
        return plan

    @staticmethod
    def _get_channels_for_type(content_type: str) -> list[str]:
        channel_map = {
            ContentType.ARTICLE: ["LinkedIn", "Medium", "Company blog", "Email newsletter"],
            ContentType.PODCAST: ["Spotify", "Apple Podcasts", "YouTube", "Social clips"],
            ContentType.CASE_STUDY: ["Website", "Email nurture", "Sales collateral"],
            ContentType.WEBINAR: ["Zoom", "LinkedIn Live", "YouTube", "Email invite"],
            ContentType.WHITEPAPER: ["Gated landing page", "Email nurture", "LinkedIn"],
            ContentType.SPEAKING: ["Conference", "Industry event", "Webinar"],
            ContentType.MEDIA_APPEARANCE: ["TV", "Podcast", "Print", "Online publication"],
        }
        return channel_map.get(content_type, ["LinkedIn", "Email"])

    def add_media_placement(
        self,
        outlet_name: str,
        outlet_type: str,
        audience_size: int,
        contact_name: str = "",
        status: str = "target",
        notes: str = "",
    ) -> dict:
        """Track a media placement opportunity."""
        placement_id = str(uuid4())
        placement = {
            "id": placement_id,
            "outlet_name": outlet_name,
            "outlet_type": outlet_type,
            "audience_size": audience_size,
            "contact_name": contact_name,
            "status": status,  # target, pitched, confirmed, published
            "notes": notes,
        }
        self._media_placements[placement_id] = placement
        return placement

    def get_media_placements(self, status: str | None = None) -> list[dict]:
        """Get media placements, optionally filtered by status."""
        placements = list(self._media_placements.values())
        if status:
            placements = [p for p in placements if p["status"] == status]
        return sorted(placements, key=lambda p: p["audience_size"], reverse=True)

    def update_placement_status(self, placement_id: str, status: str, notes: str = "") -> dict | None:
        """Update a media placement status."""
        p = self._media_placements.get(placement_id)
        if not p:
            return None
        p["status"] = status
        if notes:
            p["notes"] = notes
        return p

    def get_content_plan(self, plan_id: str) -> dict | None:
        return self._content_plans.get(plan_id)

    def get_authority_score(self, plan_id: str) -> dict:
        """Calculate an authority score based on content execution and media coverage."""
        plan = self._content_plans.get(plan_id)
        if not plan:
            return {"score": 0, "breakdown": {}}

        total_pieces = len(plan["schedule"])
        published = sum(1 for s in plan["schedule"] if s["status"] == "published")
        content_score = (published / total_pieces * 50) if total_pieces else 0

        placements = list(self._media_placements.values())
        confirmed = sum(1 for p in placements if p["status"] in ("confirmed", "published"))
        media_score = min(confirmed * 10, 50)  # max 50 from media

        return {
            "score": round(content_score + media_score, 1),
            "breakdown": {
                "content_execution": round(content_score, 1),
                "media_coverage": round(media_score, 1),
                "total_content_pieces": total_pieces,
                "published_pieces": published,
                "media_placements": len(placements),
                "confirmed_placements": confirmed,
            },
        }
