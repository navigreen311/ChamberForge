"""Validate a partner's response before anything downstream trusts it.

P-07 (T-033). Partner responses were parsed and used directly:

    return response.json()

and then read field by field, several layers away, with `result["call_id"]`
or `result.get("sentiment")`. So when a partner renamed a field, the failure
surfaced as a `KeyError` inside a service - or, worse, as a `.get()`
returning `None` that flowed onward as if it were data, and a transcript
became `null` on a client's record with nothing raised anywhere.

This is the boundary. A response either matches the shape the caller
declared, or it fails **here**, naming the partner, the endpoint and the
field. That error goes to whoever can act on it, instead of to a route
handler that only knows a dictionary lacked a key.

Deliberately structural, not a full type system. It checks that required
fields are present and are roughly the right kind of thing. The aim is to
catch a renamed or dropped field at the moment it arrives, not to model the
partner's API - a schema that has to be updated for every optional field a
partner adds is a schema people start skipping.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Iterable, Mapping, Optional

from app.services.integrations._resilience import PartnerContractError

logger = logging.getLogger("chamberforge.integrations")


@dataclass(frozen=True)
class ResponseSchema:
    """The fields a caller needs from one partner endpoint.

    `required` is what the caller will actually read. Keep it to that: every
    field listed here is one the partner cannot change without breaking
    ChamberForge, and listing fields nobody reads turns a harmless partner
    release into an outage.
    """

    endpoint: str
    required: Mapping[str, type | tuple[type, ...]]
    optional: Mapping[str, type | tuple[type, ...]] = None  # type: ignore[assignment]

    def field_names(self) -> Iterable[str]:
        return self.required.keys()


def _type_name(expected: type | tuple[type, ...]) -> str:
    if isinstance(expected, tuple):
        return " or ".join(t.__name__ for t in expected)
    return expected.__name__


def validate_response(
    partner: str,
    schema: ResponseSchema,
    payload: Any,
) -> dict:
    """Return *payload* once it matches *schema*, or raise `PartnerContractError`.

    The error names the partner, the endpoint and the specific field, because
    the person reading it is deciding whether a partner shipped a breaking
    change - and "KeyError: 'call_id'" does not tell them that.
    """
    if not isinstance(payload, Mapping):
        raise PartnerContractError(
            partner,
            f"{schema.endpoint} returned {type(payload).__name__}, expected an object",
        )

    missing = [name for name in schema.required if name not in payload]
    if missing:
        raise PartnerContractError(
            partner,
            f"{schema.endpoint} response is missing {', '.join(sorted(missing))} "
            f"(received: {', '.join(sorted(str(k) for k in payload))}). "
            "The partner may have renamed or removed a field.",
        )

    for name, expected in schema.required.items():
        value = payload[name]
        if value is None:
            raise PartnerContractError(
                partner,
                f"{schema.endpoint} returned null for required field '{name}'",
            )
        if not isinstance(value, expected):
            raise PartnerContractError(
                partner,
                f"{schema.endpoint} field '{name}' is {type(value).__name__}, "
                f"expected {_type_name(expected)}",
            )

    for name, expected in (schema.optional or {}).items():
        if name in payload and payload[name] is not None:
            if not isinstance(payload[name], expected):
                # Not fatal: the caller treats it as optional, so a changed
                # optional field degrades that one value rather than the call.
                logger.warning(
                    "%s %s: optional field '%s' is %s, expected %s",
                    partner,
                    schema.endpoint,
                    name,
                    type(payload[name]).__name__,
                    _type_name(expected),
                )

    return dict(payload)


# ---------------------------------------------------------------------------
# The endpoints ChamberForge actually reads.
#
# Each entry lists only the fields consumed downstream. A partner is free to
# add, reorder or drop anything not named here without breaking us, which is
# the property that makes this worth maintaining.
# ---------------------------------------------------------------------------

VOICEFORGE_SCHEMAS: dict[str, ResponseSchema] = {
    "/calls/initiate": ResponseSchema(
        endpoint="POST /calls/initiate",
        required={"call_id": str, "status": str},
    ),
    "/calls/{id}/transcript": ResponseSchema(
        endpoint="GET /calls/{id}/transcript",
        required={"transcript": str},
        optional={"duration_seconds": (int, float), "call_id": str},
    ),
    "/calls/{id}/sentiment": ResponseSchema(
        endpoint="GET /calls/{id}/sentiment",
        required={"sentiment": str},
        optional={"score": (int, float), "key_phrases": list},
    ),
    "/identity/verify": ResponseSchema(
        endpoint="POST /identity/verify",
        # `verified` is required and must be a bool. A missing or non-boolean
        # value must never be read as a pass - see the client's note on why
        # this endpoint has no fallback of any kind.
        required={"verified": bool},
        optional={"confidence": (int, float)},
    ),
}

VISIONAUDIO_SCHEMAS: dict[str, ResponseSchema] = {
    "/renders/presentation": ResponseSchema(
        endpoint="POST /renders/presentation",
        required={"render_id": str, "status": str},
        optional={"output_url": str, "estimated_time_seconds": (int, float)},
    ),
    "/renders/dashboard": ResponseSchema(
        endpoint="POST /renders/dashboard",
        required={"render_id": str, "status": str},
        optional={"output_url": str},
    ),
    "/renders/{id}/status": ResponseSchema(
        endpoint="GET /renders/{id}/status",
        required={"render_id": str, "status": str},
        optional={"output_url": str},
    ),
    "/brand/assets": ResponseSchema(
        endpoint="POST /brand/assets",
        required={"assets": list},
    ),
}


def schema_for(
    schemas: Mapping[str, ResponseSchema], path: str
) -> Optional[ResponseSchema]:
    """Match a concrete request path to a declared schema.

    Paths carry ids (`/calls/abc-123/transcript`), so an exact lookup would
    miss almost everything. Matching on the fixed segments keeps the schema
    table readable without a router.
    """
    if path in schemas:
        return schemas[path]
    parts = [p for p in path.strip("/").split("/") if p]
    for key, schema in schemas.items():
        key_parts = [p for p in key.strip("/").split("/") if p]
        if len(key_parts) != len(parts):
            continue
        if all(
            expected.startswith("{") or expected == actual
            for expected, actual in zip(key_parts, parts)
        ):
            return schema
    return None
