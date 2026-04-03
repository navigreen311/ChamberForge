"""TeamTrainer — Training curriculum and progress tracking for team members."""
from __future__ import annotations

from typing import Any


# Role-specific curriculum definitions
CURRICULA: dict[str, dict[str, Any]] = {
    "relationship_manager": {
        "modules": [
            {"title": "HNW Client Psychology", "description": "Understanding motivations and communication styles of high-net-worth individuals", "duration_hours": 4, "assessment_type": "case_study"},
            {"title": "Engagement Lifecycle Mastery", "description": "End-to-end client lifecycle from onboarding to alumni management", "duration_hours": 6, "assessment_type": "practical"},
            {"title": "Cross-Selling Premium Services", "description": "Identifying and presenting expansion opportunities naturally", "duration_hours": 3, "assessment_type": "role_play"},
            {"title": "Conflict Resolution for Premium Clients", "description": "De-escalation and recovery strategies for high-stakes relationships", "duration_hours": 3, "assessment_type": "scenario"},
            {"title": "Digital Tools & CRM Proficiency", "description": "ChamberForge platform features, reporting, and automation", "duration_hours": 4, "assessment_type": "practical"},
        ],
        "certification_requirements": "Complete all modules + pass final portfolio review",
        "total_hours": 20,
    },
    "analyst": {
        "modules": [
            {"title": "Premium Market Intelligence", "description": "Researching HNW/UHNW market trends and competitive landscape", "duration_hours": 5, "assessment_type": "report"},
            {"title": "Financial Modeling for Services", "description": "Building scenario models, pricing analysis, and margin optimization", "duration_hours": 6, "assessment_type": "practical"},
            {"title": "Data-Driven Client Insights", "description": "Extracting actionable intelligence from client health metrics", "duration_hours": 4, "assessment_type": "case_study"},
            {"title": "Compliance & Jurisdiction Awareness", "description": "Multi-jurisdiction regulatory landscape for premium services", "duration_hours": 4, "assessment_type": "exam"},
        ],
        "certification_requirements": "Complete all modules + submit capstone analysis",
        "total_hours": 19,
    },
    "operations": {
        "modules": [
            {"title": "Service Delivery Excellence", "description": "Ensuring flawless execution of premium engagements", "duration_hours": 4, "assessment_type": "practical"},
            {"title": "Client Onboarding Orchestration", "description": "End-to-end onboarding process management", "duration_hours": 3, "assessment_type": "checklist"},
            {"title": "Quality Assurance & Audit", "description": "Internal QA processes and audit preparation", "duration_hours": 3, "assessment_type": "practical"},
            {"title": "Technology Stack Mastery", "description": "ChamberForge platform administration and integrations", "duration_hours": 5, "assessment_type": "practical"},
        ],
        "certification_requirements": "Complete all modules + operational readiness assessment",
        "total_hours": 15,
    },
}


class TeamTrainer:
    """Manages training curricula and tracks trainee progress."""

    @staticmethod
    def get_curriculum(role: str) -> dict[str, Any]:
        """Return the training curriculum for a given role."""
        key = role.lower().replace(" ", "_").replace("-", "_")
        if key in CURRICULA:
            return CURRICULA[key]

        # Generic curriculum for unknown roles
        return {
            "modules": [
                {"title": "ChamberForge Platform Foundations", "description": "Core platform features and workflows", "duration_hours": 4, "assessment_type": "practical"},
                {"title": "Premium Service Standards", "description": "Quality standards for HNW/UHNW service delivery", "duration_hours": 3, "assessment_type": "case_study"},
            ],
            "certification_requirements": "Complete all modules",
            "total_hours": 7,
        }

    @staticmethod
    def assess_progress(
        trainee_id: str, completed_modules: list[str]
    ) -> dict[str, Any]:
        """Assess a trainee's progress through their curriculum.

        Returns completion percentage, remaining modules, and certification eligibility.
        """
        # In production, look up the trainee's assigned role & curriculum
        # For now, check against all curricula to find the best match
        best_match_remaining: list[str] = []
        best_match_total = 0
        best_completion = 0.0

        for _role, curriculum in CURRICULA.items():
            all_titles = [m["title"] for m in curriculum["modules"]]
            completed_in_curriculum = [
                t for t in completed_modules if t in all_titles
            ]
            if len(completed_in_curriculum) >= best_completion:
                best_completion = len(completed_in_curriculum)
                best_match_total = len(all_titles)
                best_match_remaining = [
                    t for t in all_titles if t not in completed_modules
                ]

        if best_match_total == 0:
            best_match_total = 1  # Avoid division by zero

        pct = round((best_completion / best_match_total) * 100, 1)

        return {
            "trainee_id": trainee_id,
            "completion_pct": pct,
            "remaining": best_match_remaining,
            "certification_eligible": len(best_match_remaining) == 0,
        }
