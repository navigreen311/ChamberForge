"""Verified voice delivery for messages that must not reach the wrong person.

P-07 (T-049, module only - the scheduled job that drives this belongs to
P-08).

The pattern this exists to enforce: **verify, then speak**. A message about a
liquidity event, an account change or a family matter is delivered by voice
only after the recipient's identity has been confirmed with the partner, and
a verification that did not happen is never treated as one that passed.

That last clause is the reason this module is written the way it is.
`VoiceForgeClient.verify_identity` previously answered
`{"verified": True, "confidence": 0.95}` whenever no API key was configured,
so an unconfigured deployment confirmed every identity it was asked about.
P-07 removed that, and the code here is written so it could not be
reintroduced without the refusal path failing: nothing reads `verified`
without first establishing that a verification actually took place.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Optional

from app.services.integrations.voiceforge_client import VoiceForgeClient

logger = logging.getLogger("chamberforge.integrations")

#: Below this, treat the partner's answer as "not confirmed". A verification
#: the partner is unsure about is not a verification; the caller asked
#: whether to disclose something to a named individual.
MIN_CONFIDENCE = 0.8

OUTCOME_DELIVERED = "delivered"
OUTCOME_REFUSED = "refused"
OUTCOME_UNAVAILABLE = "unavailable"

REASON_NOT_VERIFIED = "identity_not_verified"
REASON_LOW_CONFIDENCE = "identity_confidence_below_threshold"
REASON_VERIFICATION_UNAVAILABLE = "verification_unavailable"


@dataclass(frozen=True)
class DeliveryResult:
    """What happened to one secure message."""

    outcome: str
    reason: Optional[str] = None
    detail: str = ""
    call_id: Optional[str] = None
    confidence: Optional[float] = None

    @property
    def delivered(self) -> bool:
        return self.outcome == OUTCOME_DELIVERED

    def as_dict(self) -> dict[str, Any]:
        return {
            "outcome": self.outcome,
            "delivered": self.delivered,
            "reason": self.reason,
            "detail": self.detail,
            "call_id": self.call_id,
            "confidence": self.confidence,
        }


class SecureVoiceComms:
    """Deliver a message by voice, but only to a verified recipient."""

    def __init__(self, client: VoiceForgeClient) -> None:
        self.client = client

    async def verify(self, user_id: str, passphrase: str) -> DeliveryResult:
        """Confirm a recipient's identity, or explain why we could not.

        Three outcomes, kept distinct because they call for different
        actions: verified; the partner answered and said no; the partner
        could not be asked. Collapsing the third into the second would tell
        an operator a client failed verification when in fact nothing was
        checked.
        """
        response = await self.client.verify_identity(user_id, passphrase)

        if response.get("degraded"):
            return DeliveryResult(
                outcome=OUTCOME_UNAVAILABLE,
                reason=REASON_VERIFICATION_UNAVAILABLE,
                detail=response.get(
                    "degraded_detail", "Identity verification could not be performed."
                ),
            )

        # `is True`, not truthiness: a partner returning the string "false",
        # or 0, or an unexpected object, must not read as a pass. The schema
        # requires a bool, and this is the second line of that defence.
        if response.get("verified") is not True:
            return DeliveryResult(
                outcome=OUTCOME_REFUSED,
                reason=REASON_NOT_VERIFIED,
                detail="The partner did not confirm this recipient's identity.",
            )

        confidence = response.get("confidence")
        if isinstance(confidence, (int, float)) and confidence < MIN_CONFIDENCE:
            return DeliveryResult(
                outcome=OUTCOME_REFUSED,
                reason=REASON_LOW_CONFIDENCE,
                detail=(
                    f"Identity confidence {confidence:.2f} is below the "
                    f"{MIN_CONFIDENCE:.2f} threshold required to disclose."
                ),
                confidence=float(confidence),
            )

        return DeliveryResult(
            outcome=OUTCOME_DELIVERED,
            confidence=float(confidence) if isinstance(confidence, (int, float)) else None,
        )

    async def deliver(
        self,
        *,
        user_id: str,
        passphrase: str,
        phone: str,
        message: str,
        purpose: str = "secure_message",
    ) -> DeliveryResult:
        """Verify the recipient, then place the call. Refuses in that order.

        The ordering is the control. Placing the call first and verifying
        afterwards would have already spoken the message to whoever answered.
        """
        verification = await self.verify(user_id, passphrase)
        if not verification.delivered:
            logger.info(
                "secure message withheld for user=%s: %s",
                user_id,
                verification.reason,
            )
            # Reuse the verification's outcome verbatim: the message was not
            # delivered, and the reason is the verification's reason.
            return verification

        call = await self.client.initiate_call(
            to_number=phone,
            purpose=purpose,
            metadata={"user_id": user_id, "message": message},
        )
        if call.get("degraded"):
            return DeliveryResult(
                outcome=OUTCOME_UNAVAILABLE,
                reason=call.get("degraded_reason", "partner_unavailable"),
                detail=call.get("degraded_detail", "The call could not be placed."),
                confidence=verification.confidence,
            )

        return DeliveryResult(
            outcome=OUTCOME_DELIVERED,
            call_id=call.get("call_id"),
            confidence=verification.confidence,
        )
