"""VoiceForge Voice Trainer — guided training modules for advisors."""
import uuid
from typing import Any

from app.services.integrations.voiceforge_client import VoiceForgeClient

_TRAINING_MODULES: dict[str, dict[str, str]] = {
    "objection_handling": {
        "module_name": "Objection Handling Mastery",
        "scenario": "Client pushes back on fee structure during annual review.",
    },
    "discovery_call": {
        "module_name": "Discovery Call Excellence",
        "scenario": "First meeting with a referred UHNW prospect — uncover needs and goals.",
    },
    "crisis_communication": {
        "module_name": "Crisis Communication",
        "scenario": "Market drops 15% overnight — proactively call your top client.",
    },
    "estate_planning": {
        "module_name": "Estate Planning Conversation",
        "scenario": "Guide a family through multi-generational wealth transfer discussion.",
    },
}


class VoiceTrainer:
    """Manages guided voice-training modules for wealth advisors."""

    def __init__(self, client: VoiceForgeClient) -> None:
        self.client = client
        self._sessions: dict[str, dict[str, Any]] = {}

    async def start_training_module(self, module_id: str, trainee_id: str) -> dict:
        """Start a training module for a trainee.

        Args:
            module_id: Key from the training module catalogue.
            trainee_id: Identifier for the trainee/user.

        Returns:
            Session info including module name and scenario.
        """
        module = _TRAINING_MODULES.get(module_id)
        if not module:
            raise ValueError(
                f"Unknown module_id '{module_id}'. "
                f"Available: {', '.join(_TRAINING_MODULES)}"
            )

        session_id = str(uuid.uuid4())
        self._sessions[session_id] = {
            "module_id": module_id,
            "trainee_id": trainee_id,
            "module_name": module["module_name"],
            "scenario": module["scenario"],
            "completed": False,
        }

        return {
            "session_id": session_id,
            "module_name": module["module_name"],
            "scenario": module["scenario"],
        }

    async def assess_performance(self, session_id: str) -> dict:
        """Assess trainee performance for a completed training session.

        Returns:
            Score (0-100), pass/fail, and feedback items.
        """
        session = self._sessions.get(session_id)
        if not session:
            raise ValueError(f"Training session {session_id} not found.")

        session["completed"] = True

        # Mock scoring — production would use VoiceForge AI grading
        score = 78
        passed = score >= 70

        return {
            "score": score,
            "passed": passed,
            "feedback": [
                "Good opening rapport-building technique.",
                "Consider pausing more to let the client speak.",
                "Strengthen your transition from discovery to recommendation.",
            ],
        }
