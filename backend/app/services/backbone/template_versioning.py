"""Template versioning service — tracks and manages template version history."""
from uuid import UUID

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.template_version import TemplateVersion


class TemplateVersioning:
    """Manages template version lifecycle: create, history, rollback, diff."""

    @staticmethod
    def create_version(
        db: Session,
        workspace_id: UUID,
        template_type: str,
        template_id: UUID,
        content: dict,
        changes_summary: str,
        user_id: UUID | None = None,
    ) -> TemplateVersion:
        """Create a new version, deactivating the previous active one."""
        # Find current max version number for this template
        latest = (
            db.query(TemplateVersion)
            .filter(TemplateVersion.template_id == template_id)
            .order_by(desc(TemplateVersion.version_number))
            .first()
        )
        next_version = (latest.version_number + 1) if latest else 1

        # Deactivate previous active version
        db.query(TemplateVersion).filter(
            TemplateVersion.template_id == template_id,
            TemplateVersion.is_active == True,  # noqa: E712
        ).update({"is_active": False})

        version = TemplateVersion(
            workspace_id=workspace_id,
            template_type=template_type,
            template_id=template_id,
            version_number=next_version,
            content=content,
            changes_summary=changes_summary,
            created_by=user_id,
            is_active=True,
        )
        db.add(version)
        db.commit()
        db.refresh(version)
        return version

    @staticmethod
    def get_version_history(db: Session, template_id: UUID) -> list[TemplateVersion]:
        """Return all versions for a template, newest first."""
        return (
            db.query(TemplateVersion)
            .filter(TemplateVersion.template_id == template_id)
            .order_by(desc(TemplateVersion.version_number))
            .all()
        )

    @staticmethod
    def get_active_version(db: Session, template_id: UUID) -> TemplateVersion | None:
        """Return the currently active version for a template."""
        return (
            db.query(TemplateVersion)
            .filter(
                TemplateVersion.template_id == template_id,
                TemplateVersion.is_active == True,  # noqa: E712
            )
            .first()
        )

    @staticmethod
    def rollback(db: Session, template_id: UUID, target_version: int) -> TemplateVersion:
        """Roll back to a specific version number, deactivating current active."""
        # Deactivate all versions for this template
        db.query(TemplateVersion).filter(
            TemplateVersion.template_id == template_id,
        ).update({"is_active": False})

        # Activate the target version
        target = (
            db.query(TemplateVersion)
            .filter(
                TemplateVersion.template_id == template_id,
                TemplateVersion.version_number == target_version,
            )
            .first()
        )
        if not target:
            raise ValueError(f"Version {target_version} not found for template {template_id}")

        target.is_active = True
        db.commit()
        db.refresh(target)
        return target

    @staticmethod
    def diff_versions(v1_content: dict, v2_content: dict) -> dict:
        """Compare two version content dicts. Returns added, removed, changed keys."""
        v1_keys = set(v1_content.keys())
        v2_keys = set(v2_content.keys())

        added = sorted(v2_keys - v1_keys)
        removed = sorted(v1_keys - v2_keys)
        changed = sorted(
            k for k in v1_keys & v2_keys if v1_content[k] != v2_content[k]
        )

        return {"added": added, "removed": removed, "changed": changed}
