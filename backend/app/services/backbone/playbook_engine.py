"""PlaybookEngine — core service for playbook CRUD, activation, and progress tracking."""
from __future__ import annotations

import copy
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.playbook import Playbook
from app.models.playbook_activation import PlaybookActivation
from app.services.backbone.playbook_data import PLAYBOOK_TEMPLATES

# Section names that define the standard playbook workflow
DEFAULT_SECTIONS = [
    "ICP Definition",
    "Pain Trigger Mapping",
    "SOP Configuration",
    "Pricing Model Setup",
    "KPI Stack Calibration",
    "Trust & Objection Prep",
    "VoiceForge Asset Generation",
    "VisionAudio Asset Generation",
]


class PlaybookEngine:
    """Service layer for playbook operations."""

    # ── Seed ──────────────────────────────────────────────────────────

    @staticmethod
    def seed_playbooks(db: Session) -> list[Playbook]:
        """Insert all 10 playbook templates if not already present."""
        created: list[Playbook] = []
        for tpl in PLAYBOOK_TEMPLATES:
            existing = db.query(Playbook).filter(Playbook.slug == tpl["slug"]).first()
            if existing:
                continue
            playbook = Playbook(**tpl)
            db.add(playbook)
            created.append(playbook)
        if created:
            db.commit()
            for p in created:
                db.refresh(p)
        return created

    # ── Read ──────────────────────────────────────────────────────────

    @staticmethod
    def get_all_playbooks(db: Session) -> list[Playbook]:
        """Return all playbook templates."""
        return db.query(Playbook).order_by(Playbook.name).all()

    @staticmethod
    def get_playbook(db: Session, slug: str) -> Optional[Playbook]:
        """Return a single playbook by slug."""
        return db.query(Playbook).filter(Playbook.slug == slug).first()

    # ── Activation ────────────────────────────────────────────────────

    @staticmethod
    def activate_playbook(
        db: Session, workspace_id: uuid.UUID, playbook_slug: str
    ) -> Optional[PlaybookActivation]:
        """Create an activation record for a workspace and playbook."""
        playbook = db.query(Playbook).filter(Playbook.slug == playbook_slug).first()
        if not playbook:
            return None

        # Build default progress from sections
        progress = {
            section: "not_started" for section in DEFAULT_SECTIONS
        }

        activation = PlaybookActivation(
            workspace_id=workspace_id,
            playbook_id=playbook.id,
            customizations={},
            progress=progress,
            status="active",
            activated_at=datetime.now(timezone.utc),
            completed_sections=0,
            total_sections=len(DEFAULT_SECTIONS),
        )
        db.add(activation)
        db.commit()
        db.refresh(activation)
        return activation

    # ── Customization ─────────────────────────────────────────────────

    @staticmethod
    def customize_playbook(
        db: Session, activation_id: uuid.UUID, overrides: dict
    ) -> Optional[PlaybookActivation]:
        """Merge overrides into an activation's customizations."""
        activation = (
            db.query(PlaybookActivation)
            .filter(PlaybookActivation.id == activation_id)
            .first()
        )
        if not activation:
            return None

        merged = copy.deepcopy(activation.customizations or {})
        merged.update(overrides)
        activation.customizations = merged
        db.commit()
        db.refresh(activation)
        return activation

    # ── Progress ──────────────────────────────────────────────────────

    @staticmethod
    def get_progress(db: Session, activation_id: uuid.UUID) -> Optional[dict]:
        """Return structured progress for an activation."""
        activation = (
            db.query(PlaybookActivation)
            .filter(PlaybookActivation.id == activation_id)
            .first()
        )
        if not activation:
            return None

        progress = activation.progress or {}
        sections = []
        for section_name in DEFAULT_SECTIONS:
            status = progress.get(section_name, "not_started")
            sections.append({"name": section_name, "status": status})

        completed = sum(1 for s in sections if s["status"] == "complete")
        total = len(DEFAULT_SECTIONS)
        completion_pct = round((completed / total) * 100, 1) if total > 0 else 0.0

        # Determine next step
        next_step = None
        for s in sections:
            if s["status"] in ("not_started", "in_progress"):
                next_step = s["name"]
                break

        playbook_name = ""
        if activation.playbook:
            playbook_name = activation.playbook.name

        return {
            "activation_id": str(activation.id),
            "playbook_name": playbook_name,
            "completion_pct": completion_pct,
            "sections": sections,
            "next_step": next_step,
        }

    @staticmethod
    def update_section_progress(
        db: Session,
        activation_id: uuid.UUID,
        section_name: str,
        status: str,
    ) -> Optional[PlaybookActivation]:
        """Update the status of a specific section in the activation progress."""
        if status not in ("complete", "in_progress", "not_started"):
            return None

        activation = (
            db.query(PlaybookActivation)
            .filter(PlaybookActivation.id == activation_id)
            .first()
        )
        if not activation:
            return None

        progress = copy.deepcopy(activation.progress or {})
        if section_name not in progress and section_name not in DEFAULT_SECTIONS:
            return None

        progress[section_name] = status
        activation.progress = progress

        # Recount completed sections
        activation.completed_sections = sum(
            1 for v in progress.values() if v == "complete"
        )

        # Auto-complete activation if all sections done
        if activation.completed_sections >= activation.total_sections:
            activation.status = "completed"

        db.commit()
        db.refresh(activation)
        return activation

    # ── Activation-to-Offer ─────────────────────────────────────────────

    @staticmethod
    def activate_to_offer(
        db: Session, workspace_id: uuid.UUID, activation_id: uuid.UUID
    ) -> Optional["Offer"]:
        """Convert an activated playbook into a draft Offer.

        Copies name, pricing model, SOP skeleton, and KPI stack from the
        playbook (with any customization overrides applied) into a new Offer
        record with status='draft'.
        """
        from app.models.offer import Offer

        activation = (
            db.query(PlaybookActivation)
            .filter(PlaybookActivation.id == activation_id)
            .first()
        )
        if not activation or not activation.playbook:
            return None

        # Verify workspace ownership
        if str(activation.workspace_id) != str(workspace_id):
            return None

        playbook = activation.playbook
        customizations = activation.customizations or {}

        # Build offer fields from playbook data, applying customizations
        offer_name = customizations.get("name", playbook.name)
        pricing_model = customizations.get("pricing_model", playbook.pricing_model or {})
        sop_skeleton = customizations.get("sop_skeleton", playbook.sop_skeleton or [])
        kpi_stack = customizations.get("kpi_stack", playbook.kpi_stack or [])
        icp = customizations.get("icp", playbook.icp or {})

        offer = Offer(
            workspace_id=workspace_id,
            name=f"{offer_name} — Offer",
            description=f"Draft offer created from playbook: {playbook.name}. "
                        f"Target buyer: {playbook.target_buyer}. "
                        f"Core pain: {playbook.core_pain}",
            pricing_model=pricing_model,
            sop_bundle={"sop_skeleton": sop_skeleton, "source_playbook": playbook.slug},
            value_stack=kpi_stack,
            journey_map={
                "icp": icp,
                "pain_triggers": playbook.pain_triggers or [],
                "trust_concerns": playbook.trust_concerns or [],
                "objection_handling": playbook.objection_handling or [],
            },
            status="draft",
        )
        db.add(offer)
        db.commit()
        db.refresh(offer)
        return offer

    # ── List Activations ──────────────────────────────────────────────

    @staticmethod
    def get_activated_playbooks(
        db: Session, workspace_id: uuid.UUID
    ) -> list[dict]:
        """List all playbook activations for a workspace with progress info."""
        activations = (
            db.query(PlaybookActivation)
            .filter(PlaybookActivation.workspace_id == str(workspace_id))
            .order_by(PlaybookActivation.activated_at.desc())
            .all()
        )

        results = []
        for act in activations:
            progress = act.progress or {}
            completed = sum(1 for v in progress.values() if v == "complete")
            total = act.total_sections or len(DEFAULT_SECTIONS)
            completion_pct = round((completed / total) * 100, 1) if total > 0 else 0.0

            # Determine next step
            next_step = None
            for section in DEFAULT_SECTIONS:
                if progress.get(section, "not_started") in ("not_started", "in_progress"):
                    next_step = section
                    break

            results.append({
                "activation_id": str(act.id),
                "workspace_id": str(act.workspace_id),
                "playbook_id": str(act.playbook_id),
                "playbook_name": act.playbook.name if act.playbook else "",
                "playbook_slug": act.playbook.slug if act.playbook else "",
                "status": act.status,
                "completion_pct": completion_pct,
                "completed_sections": completed,
                "total_sections": total,
                "next_step": next_step,
                "activated_at": act.activated_at.isoformat() if act.activated_at else None,
            })

        return results

    # ── Export ─────────────────────────────────────────────────────────

    @staticmethod
    def export_playbook(
        db: Session, activation_id: uuid.UUID, fmt: str = "json"
    ) -> Optional[dict]:
        """Export full playbook data with customizations applied."""
        activation = (
            db.query(PlaybookActivation)
            .filter(PlaybookActivation.id == activation_id)
            .first()
        )
        if not activation or not activation.playbook:
            return None

        playbook = activation.playbook
        base = playbook.to_dict()

        # Apply customizations on top of base data
        customizations = activation.customizations or {}
        for key, value in customizations.items():
            if key in base:
                if isinstance(base[key], dict) and isinstance(value, dict):
                    base[key] = {**base[key], **value}
                else:
                    base[key] = value

        # Add activation metadata
        base["activation"] = {
            "id": str(activation.id),
            "workspace_id": str(activation.workspace_id),
            "status": activation.status,
            "activated_at": activation.activated_at.isoformat() if activation.activated_at else None,
            "completed_sections": activation.completed_sections,
            "total_sections": activation.total_sections,
            "progress": activation.progress,
        }
        base["export_format"] = fmt
        base["exported_at"] = datetime.now(timezone.utc).isoformat()

        return base
