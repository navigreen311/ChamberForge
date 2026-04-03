"""HouseholdGraphService — CRUD and enrichment for client household graphs."""
from __future__ import annotations

import uuid as _uuid
from datetime import datetime, timezone
from typing import Optional, Union

from sqlalchemy.orm import Session

from app.models.household_graph import HouseholdGraph


def _to_uuid(value: Union[str, _uuid.UUID]) -> _uuid.UUID:
    """Coerce a string to a UUID if needed."""
    if isinstance(value, _uuid.UUID):
        return value
    return _uuid.UUID(value)


class HouseholdGraphService:
    """Manages household graph data for HNW clients."""

    @staticmethod
    def create(db: Session, client_id: Union[str, _uuid.UUID], data: dict) -> HouseholdGraph:
        """Create a new household graph for a client."""
        graph = HouseholdGraph(
            id=_uuid.uuid4(),
            client_id=_to_uuid(client_id),
            members=data.get("members", []),
            properties=data.get("properties", []),
            staff=data.get("staff", []),
            vendors=data.get("vendors", []),
            entities=data.get("entities", []),
            risk_exposures=data.get("risk_exposures", []),
            jurisdictions=data.get("jurisdictions", []),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(graph)
        db.commit()
        db.refresh(graph)
        return graph

    @staticmethod
    def get(db: Session, client_id: Union[str, _uuid.UUID]) -> Optional[HouseholdGraph]:
        """Get the household graph for a client."""
        return db.query(HouseholdGraph).filter(HouseholdGraph.client_id == _to_uuid(client_id)).first()

    @staticmethod
    def update(db: Session, client_id: Union[str, _uuid.UUID], data: dict) -> Optional[HouseholdGraph]:
        """Update household graph, merging JSON fields."""
        graph = db.query(HouseholdGraph).filter(HouseholdGraph.client_id == _to_uuid(client_id)).first()
        if not graph:
            return None

        json_fields = ["members", "properties", "staff", "vendors", "entities", "risk_exposures", "jurisdictions"]
        for field in json_fields:
            if field in data:
                existing = list(getattr(graph, field) or [])
                incoming = data[field]
                if isinstance(incoming, list):
                    # Merge: add new items (by simple dedup on the whole dict)
                    existing_set = {str(item) for item in existing}
                    for item in incoming:
                        if str(item) not in existing_set:
                            existing.append(item)
                    setattr(graph, field, existing)
                else:
                    setattr(graph, field, incoming)

        graph.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(graph)
        return graph

    @staticmethod
    def add_member(db: Session, client_id: Union[str, _uuid.UUID], member_data: dict) -> Optional[HouseholdGraph]:
        """Add a member to the household graph."""
        graph = db.query(HouseholdGraph).filter(HouseholdGraph.client_id == _to_uuid(client_id)).first()
        if not graph:
            return None
        members = list(graph.members or [])
        members.append(member_data)
        graph.members = members
        graph.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(graph)
        return graph

    @staticmethod
    def add_property(db: Session, client_id: Union[str, _uuid.UUID], property_data: dict) -> Optional[HouseholdGraph]:
        """Add a property to the household graph."""
        graph = db.query(HouseholdGraph).filter(HouseholdGraph.client_id == _to_uuid(client_id)).first()
        if not graph:
            return None
        properties = list(graph.properties or [])
        properties.append(property_data)
        graph.properties = properties
        graph.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(graph)
        return graph

    @staticmethod
    def add_staff(db: Session, client_id: Union[str, _uuid.UUID], staff_data: dict) -> Optional[HouseholdGraph]:
        """Add staff to the household graph."""
        graph = db.query(HouseholdGraph).filter(HouseholdGraph.client_id == _to_uuid(client_id)).first()
        if not graph:
            return None
        staff = list(graph.staff or [])
        staff.append(staff_data)
        graph.staff = staff
        graph.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(graph)
        return graph

    @staticmethod
    def add_vendor(db: Session, client_id: Union[str, _uuid.UUID], vendor_data: dict) -> Optional[HouseholdGraph]:
        """Add a vendor to the household graph."""
        graph = db.query(HouseholdGraph).filter(HouseholdGraph.client_id == _to_uuid(client_id)).first()
        if not graph:
            return None
        vendors = list(graph.vendors or [])
        vendors.append(vendor_data)
        graph.vendors = vendors
        graph.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(graph)
        return graph

    @staticmethod
    def get_risk_summary(db: Session, client_id: Union[str, _uuid.UUID]) -> dict:
        """Aggregate risk exposures for a client household."""
        graph = db.query(HouseholdGraph).filter(HouseholdGraph.client_id == _to_uuid(client_id)).first()
        if not graph:
            return {"error": "Household graph not found", "risks": [], "total_risks": 0}

        risks = graph.risk_exposures or []
        severity_counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        categories: dict[str, int] = {}

        for risk in risks:
            level = risk.get("level", "medium").lower() if isinstance(risk, dict) else "medium"
            if level in severity_counts:
                severity_counts[level] += 1

            category = risk.get("category", "uncategorized") if isinstance(risk, dict) else "uncategorized"
            categories[category] = categories.get(category, 0) + 1

        return {
            "client_id": str(client_id),
            "total_risks": len(risks),
            "severity_counts": severity_counts,
            "categories": categories,
            "risks": risks,
            "jurisdictions": graph.jurisdictions or [],
        }
