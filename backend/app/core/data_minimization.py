"""Response filtering and data minimization utilities."""
from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict, List, Set

# Fields each role must NOT see.  "admin" has no restrictions.
ROLE_FIELD_RESTRICTIONS: Dict[str, Set[str]] = {
    "viewer": {
        "hashed_password",
        "ip_address",
        "stripe_customer_id",
        "internal_notes",
    },
    "operator": {
        "hashed_password",
        "ip_address",
        "stripe_customer_id",
        "internal_notes",
        "workspace_settings",
        "billing_details",
    },
}

# PII fields removed before writing to logs / analytics
_PII_FIELDS: Set[str] = {
    "email",
    "name",
    "first_name",
    "last_name",
    "phone",
    "phone_number",
    "address",
    "street_address",
    "ssn",
    "date_of_birth",
}


def filter_response(
    data: dict,
    user_role: str,
    resource_type: str | None = None,
) -> dict:
    """Strip restricted fields from *data* based on the caller's role.

    ``admin`` role returns data unchanged.
    """
    restricted = ROLE_FIELD_RESTRICTIONS.get(user_role)
    if restricted is None:
        return data  # admin or unknown-with-no-restrictions → pass through

    result = deepcopy(data)
    for field in restricted:
        result.pop(field, None)
    return result


def sanitize_log_data(data: dict) -> dict:
    """Remove PII fields from a dict before it hits the logging pipeline."""
    result = deepcopy(data)
    for field in _PII_FIELDS:
        if field in result:
            result[field] = "***REDACTED***"
    return result
