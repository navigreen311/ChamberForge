"""Elasticsearch index definitions for ChamberForge entities."""
from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.services.backbone.search_service import SearchService

# ── Index names ──────────────────────────────────────────────────────

PROBLEM_INDEX = "chamberforge_problems"
EVIDENCE_INDEX = "chamberforge_evidence"
OFFER_INDEX = "chamberforge_offers"
CLIENT_INDEX = "chamberforge_clients"
PARTNER_INDEX = "chamberforge_partners"
EXPERT_INDEX = "chamberforge_experts"

# ── Mappings ─────────────────────────────────────────────────────────

PROBLEM_MAPPING: dict = {
    "properties": {
        "title": {
            "type": "text",
            "fields": {"keyword": {"type": "keyword"}},
        },
        "description": {"type": "text"},
        "pain_category": {"type": "keyword"},
        "wealth_tier": {"type": "keyword"},
        "lifecycle_stage": {"type": "keyword"},
        "urgency_score": {"type": "integer"},
        "workspace_id": {"type": "keyword"},
    }
}

EVIDENCE_MAPPING: dict = {
    "properties": {
        "source_url": {"type": "keyword"},
        "claims": {
            "type": "nested",
            "properties": {
                "claim_text": {"type": "text"},
                "confidence": {"type": "float"},
            },
        },
        "credibility_score": {"type": "float"},
        "source_type": {"type": "keyword"},
        "workspace_id": {"type": "keyword"},
    }
}

OFFER_MAPPING: dict = {
    "properties": {
        "name": {
            "type": "text",
            "fields": {"keyword": {"type": "keyword"}},
        },
        "value_stack": {"type": "nested"},
        "delivery_model": {"type": "keyword"},
        "status": {"type": "keyword"},
        "workspace_id": {"type": "keyword"},
    }
}

CLIENT_MAPPING: dict = {
    "properties": {
        "name": {
            "type": "text",
            "fields": {"keyword": {"type": "keyword"}},
        },
        "company": {"type": "text"},
        "wealth_tier": {"type": "keyword"},
        "status": {"type": "keyword"},
        "workspace_id": {"type": "keyword"},
    }
}

PARTNER_MAPPING: dict = {
    "properties": {
        "name": {
            "type": "text",
            "fields": {"keyword": {"type": "keyword"}},
        },
        "domain": {"type": "keyword"},
        "credentials": {"type": "text"},
        "workspace_id": {"type": "keyword"},
    }
}

EXPERT_MAPPING: dict = {
    "properties": {
        "name": {
            "type": "text",
            "fields": {"keyword": {"type": "keyword"}},
        },
        "specialty": {"type": "keyword"},
        "license_type": {"type": "keyword"},
        "jurisdiction": {"type": "keyword"},
    }
}

# ── Helpers ──────────────────────────────────────────────────────────


def get_all_indices() -> dict[str, dict]:
    """Return a mapping of every index name to its mapping definition."""
    return {
        PROBLEM_INDEX: PROBLEM_MAPPING,
        EVIDENCE_INDEX: EVIDENCE_MAPPING,
        OFFER_INDEX: OFFER_MAPPING,
        CLIENT_INDEX: CLIENT_MAPPING,
        PARTNER_INDEX: PARTNER_MAPPING,
        EXPERT_INDEX: EXPERT_MAPPING,
    }


async def init_all_indices(search_service: "SearchService") -> None:
    """Create every index if it does not already exist."""
    for name, mapping in get_all_indices().items():
        await search_service.create_index(name, mapping)
