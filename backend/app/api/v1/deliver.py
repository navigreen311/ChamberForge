from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/deliver", tags=["deliver"])

@router.get("/kpis")
async def get_deliver_kpis():
    return {
        "total_deliverables": 14, "sla_adherence": 88, "slas_at_risk": 2,
        "overdue": 2, "qa_pass_rate": 82, "qa_delta": 5,
        "active_onboardings": 1, "onboarding_client": "Marcus Reid",
        "escalations_open": 1,
    }

@router.get("/overdue")
async def get_overdue():
    return [
        {"client": "Wellington Trust", "deliverable": "Incident Response Plan", "days_late": 2, "priority": "critical"},
        {"client": "Elizabeth Thornton", "deliverable": "Monthly Report", "days_late": 1, "priority": "medium"},
    ]

@router.get("/sla-monitor")
async def get_sla_monitor():
    return {
        "overall": 88,
        "clients": [
            {"name": "Sarah Chen", "adherence": 100, "status": "green"},
            {"name": "Harrington Dynasty", "adherence": 90, "status": "green"},
            {"name": "Wellington Trust", "adherence": 60, "status": "red"},
            {"name": "Marcus Reid", "adherence": 0, "status": "gray"},
            {"name": "Elizabeth Thornton", "adherence": 50, "status": "red"},
        ]
    }

@router.get("/tasks")
async def get_tasks():
    return [
        {"id": "t1", "name": "Wellington IR Plan", "client": "Wellington Trust", "priority": "critical", "is_overdue": True, "days_until": -2},
        {"id": "t2", "name": "VoiceForge Training", "client": "Harrington Dynasty", "priority": "high", "is_overdue": False, "days_until": 1},
        {"id": "t3", "name": "Monthly Review", "client": "Sarah Chen", "priority": "medium", "is_overdue": False, "days_until": 5},
    ]

@router.get("/escalations")
async def get_escalations():
    return [{"type": "sla_breach", "client": "Wellington Trust", "description": "Incident Response Plan 2 days overdue", "auto_triggered": True, "status": "open"}]

@router.get("/qa-status")
async def get_qa_status():
    return {"sla_compliance": {"failures": 2, "status": "failing"}, "onboarding_quality": 75, "review_cadence": "behind", "proof_assets": {"complete": 4, "total": 6}, "portal_usage": {"active": 2, "total": 5}, "escalation_response": {"avg_hours": 18, "status": "amber"}}
