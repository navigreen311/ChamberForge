"""Crisis management console — incident lifecycle management."""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.crisis_incident import CrisisIncident


class CrisisConsole:
    """Manages crisis incidents: create, timeline, escalation, lockdown, resolve."""

    @staticmethod
    def create_incident(
        db: Session,
        workspace_id: UUID,
        title: str,
        severity: str,
        reported_by: UUID | None = None,
    ) -> CrisisIncident:
        """Create a new crisis incident."""
        if severity not in ("low", "medium", "high", "critical"):
            raise ValueError(f"Invalid severity: {severity}")

        incident = CrisisIncident(
            workspace_id=workspace_id,
            title=title,
            severity=severity,
            status="active",
            reported_by=reported_by,
            timeline=[
                {
                    "event_type": "created",
                    "description": f"Incident created: {title}",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            ],
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def add_timeline_event(
        db: Session,
        incident_id: UUID,
        event_type: str,
        description: str,
    ) -> CrisisIncident:
        """Append an event to the incident timeline."""
        incident = db.query(CrisisIncident).filter(CrisisIncident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")

        timeline = list(incident.timeline or [])
        timeline.append(
            {
                "event_type": event_type,
                "description": description,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )
        incident.timeline = timeline
        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def set_escalation_tree(
        db: Session,
        incident_id: UUID,
        tree: list[dict],
    ) -> CrisisIncident:
        """Set the escalation tree. Each entry: {level, contact_name, contact_method, role}."""
        incident = db.query(CrisisIncident).filter(CrisisIncident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")

        incident.escalation_tree = tree
        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def execute_lockdown(
        db: Session,
        incident_id: UUID,
        actions: list[str],
    ) -> CrisisIncident:
        """Record lockdown actions and update status to contained."""
        incident = db.query(CrisisIncident).filter(CrisisIncident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")

        incident.lockdown_actions = actions
        incident.status = "contained"

        # Also add to timeline
        timeline = list(incident.timeline or [])
        timeline.append(
            {
                "event_type": "lockdown",
                "description": f"Lockdown executed: {', '.join(actions)}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )
        incident.timeline = timeline
        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def resolve_incident(
        db: Session,
        incident_id: UUID,
        resolution_notes: str,
    ) -> CrisisIncident:
        """Resolve an incident."""
        incident = db.query(CrisisIncident).filter(CrisisIncident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")

        incident.status = "resolved"
        incident.resolved_at = datetime.now(timezone.utc)

        timeline = list(incident.timeline or [])
        timeline.append(
            {
                "event_type": "resolved",
                "description": f"Resolved: {resolution_notes}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )
        incident.timeline = timeline
        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def get_active_incidents(db: Session, workspace_id: UUID) -> list[CrisisIncident]:
        """Return all active (non-resolved) incidents for a workspace."""
        return (
            db.query(CrisisIncident)
            .filter(
                CrisisIncident.workspace_id == workspace_id,
                CrisisIncident.status.in_(["active", "contained"]),
            )
            .order_by(CrisisIncident.created_at.desc())
            .all()
        )

    @staticmethod
    def get_incident_detail(db: Session, incident_id: UUID) -> CrisisIncident | None:
        """Return full incident detail."""
        return db.query(CrisisIncident).filter(CrisisIncident.id == incident_id).first()
