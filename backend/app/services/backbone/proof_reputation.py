"""ProofReputation — Case study builder and testimonial collection workflow."""

from __future__ import annotations

from datetime import datetime
from uuid import uuid4


class TestimonialStatus:
    REQUESTED = "requested"
    DRAFT = "draft"
    APPROVED = "approved"
    PUBLISHED = "published"
    DECLINED = "declined"


class ProofReputation:
    """Builds case studies and manages testimonial collection workflows."""

    def __init__(self) -> None:
        self._case_studies: dict[str, dict] = {}
        self._testimonials: dict[str, dict] = {}

    def create_case_study(
        self,
        client_name: str,
        industry: str,
        challenge: str,
        solution: str,
        results: list[dict],
        quote: str = "",
    ) -> dict:
        """Build a structured case study.

        Args:
            client_name: Client name (or anonymized)
            industry: Client's industry
            challenge: The problem they faced
            solution: How the service solved it
            results: List of result dicts with metric, before, after
            quote: Optional client quote
        """
        cs_id = str(uuid4())
        case_study = {
            "id": cs_id,
            "client_name": client_name,
            "industry": industry,
            "challenge": challenge,
            "solution": solution,
            "results": results,
            "quote": quote,
            "status": "draft",
            "created_at": datetime.utcnow().isoformat(),
            "published_at": None,
        }
        self._case_studies[cs_id] = case_study
        return case_study

    def publish_case_study(self, cs_id: str) -> dict | None:
        """Mark a case study as published."""
        cs = self._case_studies.get(cs_id)
        if not cs:
            return None
        cs["status"] = "published"
        cs["published_at"] = datetime.utcnow().isoformat()
        return cs

    def get_case_studies(self, status: str | None = None, industry: str | None = None) -> list[dict]:
        """Get case studies with optional filters."""
        studies = list(self._case_studies.values())
        if status:
            studies = [s for s in studies if s["status"] == status]
        if industry:
            studies = [s for s in studies if s["industry"].lower() == industry.lower()]
        return studies

    def request_testimonial(
        self,
        client_name: str,
        client_email: str,
        service_type: str,
        prompt_questions: list[str] | None = None,
    ) -> dict:
        """Create a testimonial request in the collection workflow.

        Args:
            client_name: Name of the client
            client_email: Email for outreach
            service_type: What service they used
            prompt_questions: Guided questions to help them write
        """
        t_id = str(uuid4())

        default_questions = [
            "What challenge were you facing before working with us?",
            "What specific results have you achieved?",
            "What would you say to someone considering our service?",
            "How would you describe the experience of working with our team?",
        ]

        testimonial = {
            "id": t_id,
            "client_name": client_name,
            "client_email": client_email,
            "service_type": service_type,
            "prompt_questions": prompt_questions or default_questions,
            "response_text": "",
            "status": TestimonialStatus.REQUESTED,
            "requested_at": datetime.utcnow().isoformat(),
            "received_at": None,
            "follow_ups": 0,
        }
        self._testimonials[t_id] = testimonial
        return testimonial

    def submit_testimonial(self, t_id: str, response_text: str) -> dict | None:
        """Submit a testimonial response."""
        t = self._testimonials.get(t_id)
        if not t:
            return None
        t["response_text"] = response_text
        t["status"] = TestimonialStatus.DRAFT
        t["received_at"] = datetime.utcnow().isoformat()
        return t

    def approve_testimonial(self, t_id: str) -> dict | None:
        """Approve a testimonial for publication."""
        t = self._testimonials.get(t_id)
        if not t:
            return None
        t["status"] = TestimonialStatus.APPROVED
        return t

    def publish_testimonial(self, t_id: str) -> dict | None:
        """Publish an approved testimonial."""
        t = self._testimonials.get(t_id)
        if not t or t["status"] != TestimonialStatus.APPROVED:
            return None
        t["status"] = TestimonialStatus.PUBLISHED
        return t

    def record_follow_up(self, t_id: str) -> dict | None:
        """Record a follow-up attempt for a testimonial request."""
        t = self._testimonials.get(t_id)
        if not t:
            return None
        t["follow_ups"] += 1
        return t

    def get_testimonials(self, status: str | None = None) -> list[dict]:
        """Get testimonials with optional status filter."""
        testimonials = list(self._testimonials.values())
        if status:
            testimonials = [t for t in testimonials if t["status"] == status]
        return testimonials

    def get_proof_summary(self) -> dict:
        """Get a summary of all proof assets."""
        case_studies = list(self._case_studies.values())
        testimonials = list(self._testimonials.values())

        return {
            "total_case_studies": len(case_studies),
            "published_case_studies": sum(1 for c in case_studies if c["status"] == "published"),
            "total_testimonials": len(testimonials),
            "published_testimonials": sum(1 for t in testimonials if t["status"] == TestimonialStatus.PUBLISHED),
            "pending_requests": sum(1 for t in testimonials if t["status"] == TestimonialStatus.REQUESTED),
            "industries_covered": list(set(c["industry"] for c in case_studies)),
        }
