"""Email drip sequence engine — defines sequences and manages user progression."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models.drip_status import DripStatus

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Sequence definitions
# ---------------------------------------------------------------------------

DRIP_SEQUENCES: dict[str, list[dict[str, Any]]] = {
    "onboarding": [
        {
            "step": 0,
            "delay_hours": 0,
            "template_name": "onboarding_welcome",
            "subject_template": "Welcome to ChamberForge!",
            "conditions": None,
        },
        {
            "step": 1,
            "delay_hours": 24,
            "template_name": "onboarding_getting_started",
            "subject_template": "Getting started with ChamberForge",
            "conditions": None,
        },
        {
            "step": 2,
            "delay_hours": 72,
            "template_name": "onboarding_first_discovery",
            "subject_template": "Discover your first insights",
            "conditions": None,
        },
        {
            "step": 3,
            "delay_hours": 168,
            "template_name": "onboarding_activate_playbook",
            "subject_template": "Activate your first playbook",
            "conditions": None,
        },
        {
            "step": 4,
            "delay_hours": 336,
            "template_name": "onboarding_invite_team",
            "subject_template": "Invite your team to ChamberForge",
            "conditions": None,
        },
    ],
    "trial_expiring": [
        {
            "step": 0,
            "delay_hours": 0,
            "template_name": "trial_expiring_7day",
            "subject_template": "Your trial expires in 7 days",
            "conditions": {"days_before_expiry": 7},
        },
        {
            "step": 1,
            "delay_hours": 96,
            "template_name": "trial_expiring_3day",
            "subject_template": "Your trial expires in 3 days",
            "conditions": {"days_before_expiry": 3},
        },
        {
            "step": 2,
            "delay_hours": 168,
            "template_name": "trial_expiring_today",
            "subject_template": "Your trial expires today",
            "conditions": {"days_before_expiry": 0},
        },
    ],
    "re_engagement": [
        {
            "step": 0,
            "delay_hours": 0,
            "template_name": "re_engagement_30day",
            "subject_template": "We miss you at ChamberForge",
            "conditions": {"inactive_days": 30},
        },
        {
            "step": 1,
            "delay_hours": 720,
            "template_name": "re_engagement_60day",
            "subject_template": "A lot has changed — come back and see",
            "conditions": {"inactive_days": 60},
        },
        {
            "step": 2,
            "delay_hours": 1440,
            "template_name": "re_engagement_90day_final",
            "subject_template": "Final check-in from ChamberForge",
            "conditions": {"inactive_days": 90},
        },
    ],
}


def get_drip_sequence(sequence_name: str) -> list[dict]:
    """Return the step definitions for a named drip sequence.

    Raises ``KeyError`` if the sequence name is unknown.
    """
    if sequence_name not in DRIP_SEQUENCES:
        raise KeyError(f"Unknown drip sequence: {sequence_name}")
    return DRIP_SEQUENCES[sequence_name]


def get_user_drip_status(db: Session, user_id: str, sequence_name: str) -> dict:
    """Return the user's current position in *sequence_name*.

    Returns a dict with drip status fields and the next scheduled step info.
    If no DripStatus row exists, returns a default "not started" dict.
    """
    status = (
        db.query(DripStatus)
        .filter(DripStatus.user_id == user_id, DripStatus.sequence_name == sequence_name)
        .first()
    )

    if not status:
        return {
            "user_id": user_id,
            "sequence_name": sequence_name,
            "current_step": 0,
            "last_sent_at": None,
            "next_send_at": None,
            "completed": False,
            "started": False,
        }

    sequence = DRIP_SEQUENCES.get(sequence_name, [])
    next_step_info = None
    if not status.completed and status.current_step < len(sequence):
        next_step_info = sequence[status.current_step]

    result = status.to_dict()
    result["started"] = True
    result["next_step_info"] = next_step_info
    return result


def advance_drip(db: Session, user_id: str, sequence_name: str) -> dict:
    """Send the next email in the sequence and advance the user's step.

    Returns a dict describing what happened (step sent, whether sequence completed).
    """
    sequence = get_drip_sequence(sequence_name)

    status = (
        db.query(DripStatus)
        .filter(DripStatus.user_id == user_id, DripStatus.sequence_name == sequence_name)
        .first()
    )

    if not status:
        status = DripStatus(
            user_id=user_id,
            sequence_name=sequence_name,
            current_step=0,
        )
        db.add(status)
        db.flush()

    if status.completed:
        return {"action": "none", "reason": "sequence_completed", "user_id": user_id}

    current_step_idx = status.current_step
    if current_step_idx >= len(sequence):
        status.completed = True
        db.commit()
        return {"action": "none", "reason": "sequence_completed", "user_id": user_id}

    step = sequence[current_step_idx]

    now = datetime.now(timezone.utc)
    status.last_sent_at = now
    status.current_step = current_step_idx + 1

    # Schedule next send
    if status.current_step < len(sequence):
        next_step = sequence[status.current_step]
        # delay_hours is relative to sequence start; compute delta from current step
        hours_delta = next_step["delay_hours"] - step["delay_hours"]
        status.next_send_at = now + timedelta(hours=max(hours_delta, 1))
    else:
        status.completed = True
        status.next_send_at = None

    db.commit()

    logger.info(
        "Advanced drip user=%s seq=%s step=%d template=%s",
        user_id,
        sequence_name,
        current_step_idx,
        step["template_name"],
    )

    return {
        "action": "sent",
        "user_id": user_id,
        "sequence_name": sequence_name,
        "step": current_step_idx,
        "template_name": step["template_name"],
        "subject": step["subject_template"],
        "completed": status.completed,
        "next_send_at": status.next_send_at.isoformat() if status.next_send_at else None,
    }


def stop_drip(db: Session, user_id: str, sequence_name: str) -> dict:
    """Stop a drip sequence for a user, marking it as completed."""
    status = (
        db.query(DripStatus)
        .filter(DripStatus.user_id == user_id, DripStatus.sequence_name == sequence_name)
        .first()
    )

    if not status:
        return {"action": "none", "reason": "not_found", "user_id": user_id}

    status.completed = True
    status.next_send_at = None
    db.commit()

    return {"action": "stopped", "user_id": user_id, "sequence_name": sequence_name}
