"""Fixtures for unit tests."""
import uuid

import pytest


@pytest.fixture()
def sample_offer_payload():
    """Sample payload for creating an offer via API."""
    return {
        "workspace_id": str(uuid.uuid4()),
        "name": "Test Offer",
        "delivery_model": "done_for_you",
        "description": "A test offer",
        "value_stack": [{"name": "Core", "description": "Core service", "delivery_method": "remote", "estimated_hours": 10}],
        "guarantee_framework": {},
        "pricing_model": {},
        "sop_bundle": [],
        "journey_map": {},
        "status": "draft",
    }
