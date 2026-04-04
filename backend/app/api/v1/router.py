"""Consolidated v1 router — includes all ChamberForge v1 sub-routers."""
from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.workspaces import router as workspaces_router
from app.api.v1.problems import router as problems_router
from app.api.v1.discovery import router as discovery_router
from app.api.v1.evidence import router as evidence_router
from app.api.v1.qualify import router as qualify_router
from app.api.v1.offers import router as offers_router
from app.api.v1.build import router as build_router
from app.api.v1.household import router as household_router
from app.api.v1.billing import router as billing_router
from app.api.v1.sell import router as sell_router
from app.api.v1.command import router as command_router
from app.api.v1.compliance import router as compliance_router
from app.api.v1.lifecycle import router as lifecycle_router
from app.api.v1.polish import router as polish_router
from app.api.v1.primitives import router as primitives_router
from app.api.v1.admin import router as admin_router
from app.api.v1.playbooks import router as playbooks_router
from app.api.v1.voiceforge import router as voiceforge_router
from app.api.v1.visionaudio import router as visionaudio_router
from app.api.v1.search import router as search_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.email import router as email_router
from app.api.v1.storage import router as storage_router
from app.api.v1.exports import router as exports_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.health import router as health_router
from app.api.v1.metrics import router as metrics_router
from app.api.v1.security import router as security_router
from app.api.v1.profile import router as profile_router
from app.api.v1.workspace_settings import router as workspace_settings_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.clients_dashboard import router as clients_dashboard_router
from app.api.v1.webhooks.stripe import router as stripe_webhook_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(users_router)
router.include_router(workspaces_router)
router.include_router(problems_router)
router.include_router(discovery_router)
router.include_router(evidence_router)
router.include_router(qualify_router)
router.include_router(offers_router)
router.include_router(build_router)
router.include_router(household_router)
router.include_router(billing_router)
router.include_router(sell_router)
router.include_router(command_router)
router.include_router(compliance_router)
router.include_router(lifecycle_router)
router.include_router(polish_router)
router.include_router(primitives_router)
router.include_router(admin_router)
router.include_router(playbooks_router)
router.include_router(voiceforge_router)
router.include_router(visionaudio_router)
router.include_router(search_router)
router.include_router(notifications_router)
router.include_router(email_router)
router.include_router(storage_router)
router.include_router(exports_router)
router.include_router(jobs_router)
router.include_router(health_router)
router.include_router(metrics_router)
router.include_router(security_router)
router.include_router(profile_router)
router.include_router(workspace_settings_router)
router.include_router(dashboard_router)
router.include_router(clients_dashboard_router)
router.include_router(stripe_webhook_router)
