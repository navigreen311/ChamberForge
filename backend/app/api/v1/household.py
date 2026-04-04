"""Household Graph API — CRUD and enrichment for client household data."""
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_workspace_id
from app.db.session import get_db
from app.services.backbone.household_graph import HouseholdGraphService

router = APIRouter(prefix="/api/v1/household", tags=["household"])

svc = HouseholdGraphService()


@router.post("/{client_id}")
def create_household_graph(client_id: str, data: dict = Body(...), workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    existing = svc.get(db, client_id)
    if existing:
        raise HTTPException(status_code=409, detail="Household graph already exists for this client")
    graph = svc.create(db, client_id, data)
    return _serialize(graph)


@router.get("/{client_id}")
def get_household_graph(client_id: str, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    graph = svc.get(db, client_id)
    if not graph:
        raise HTTPException(status_code=404, detail="No household graph found for this client. Create one first via POST /api/v1/household/{client_id}.")
    return _serialize(graph)


@router.put("/{client_id}")
def update_household_graph(client_id: str, data: dict = Body(...), workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    graph = svc.update(db, client_id, data)
    if not graph:
        raise HTTPException(status_code=404, detail="Household graph not found")
    return _serialize(graph)


@router.post("/{client_id}/members")
def add_member(client_id: str, member_data: dict = Body(...), db: Session = Depends(get_db)):
    # Check for duplicate member name
    existing_graph = svc.get(db, client_id)
    if not existing_graph:
        raise HTTPException(status_code=404, detail="Household graph not found")
    new_name = member_data.get("name", "")
    if new_name and existing_graph.members:
        for m in existing_graph.members:
            existing_name = m.get("name", "") if isinstance(m, dict) else ""
            if existing_name and existing_name.lower() == new_name.lower():
                raise HTTPException(status_code=409, detail=f"Member '{new_name}' already exists in this household")
    graph = svc.add_member(db, client_id, member_data)
    if not graph:
        raise HTTPException(status_code=404, detail="Household graph not found")
    return _serialize(graph)


@router.post("/{client_id}/properties")
def add_property(client_id: str, property_data: dict = Body(...), db: Session = Depends(get_db)):
    graph = svc.add_property(db, client_id, property_data)
    if not graph:
        raise HTTPException(status_code=404, detail="Household graph not found")
    return _serialize(graph)


@router.post("/{client_id}/staff")
def add_staff(client_id: str, staff_data: dict = Body(...), db: Session = Depends(get_db)):
    graph = svc.add_staff(db, client_id, staff_data)
    if not graph:
        raise HTTPException(status_code=404, detail="Household graph not found")
    return _serialize(graph)


@router.post("/{client_id}/vendors")
def add_vendor(client_id: str, vendor_data: dict = Body(...), db: Session = Depends(get_db)):
    graph = svc.add_vendor(db, client_id, vendor_data)
    if not graph:
        raise HTTPException(status_code=404, detail="Household graph not found")
    return _serialize(graph)


@router.get("/{client_id}/risks")
def get_risk_summary(client_id: str, workspace_id: str = Depends(get_workspace_id), db: Session = Depends(get_db)):
    return svc.get_risk_summary(db, client_id)


def _serialize(graph) -> dict:
    """Convert a HouseholdGraph ORM object to a dict."""
    return {
        "id": str(graph.id),
        "client_id": str(graph.client_id),
        "members": graph.members,
        "properties": graph.properties,
        "staff": graph.staff,
        "vendors": graph.vendors,
        "entities": graph.entities,
        "risk_exposures": graph.risk_exposures,
        "jurisdictions": graph.jurisdictions,
        "updated_at": graph.updated_at.isoformat() if graph.updated_at else None,
    }
