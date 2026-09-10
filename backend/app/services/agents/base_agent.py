"""The shared AI call path: metered, budgeted, and honest when it cannot run.

P-04 (T-018, T-031, T-034).

Three things were wrong here, and the third is the one that matters.

**Nothing was metered.** No agent called `AIRuntime.track_usage`. Its only
callers were REST endpoints where a client self-reported its own numbers, so
a real agent invocation cost money and left no record at all.

**Nothing was refused.** `check_budget` took the ceiling as a caller-supplied
argument and returned a flag. There was no point at which a call did not
happen.

**Failure was disguised as success.** With no API key, `_call_claude`
returned a canned string, and every agent turned that into fabricated
business analysis - specific dollar figures, client identifiers, confidence
scores - returned in the same shape as a real answer, with nothing marking
it as invented. On a platform whose users are advisors to HNW families, that
is the most dangerous defect in the codebase: it does not look like an
outage, it looks like advice.

So this module publishes one call path that every agent uses, and a **typed
degraded result** that cannot be mistaken for analysis. `degraded_payload()`
carries an explicit `degraded: True`, a machine-readable reason, and
`data: None`. There is no code path here that invents a plausible number.

Only `CommandAI` subclasses `BaseAgent`; the other nine agents are standalone
classes that each built their own client. `call_claude()` is a module-level
function for exactly that reason - governance that only reached one agent in
ten would not be governance.
"""
from __future__ import annotations

import json
import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Optional

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.backbone.budget_guard import BudgetExceeded, BudgetGuard

logger = logging.getLogger("chamberforge.agents")

# Why a real value and not the provider default: an unspecified temperature
# means the provider picks, and the same input can then produce a differently
# *shaped* response between two calls - a list one time, a prose paragraph
# the next - which is what makes downstream JSON parsing intermittent. These
# agents are asked for structured output, so the sampling is pinned.
DEFAULT_TEMPERATURE = 0.0
DEFAULT_MAX_TOKENS = 2048

# Reasons a call did not happen. Machine-readable on purpose: a caller
# deciding whether to retry needs to tell "no key configured" (never retry)
# from "provider error" (maybe retry) from "over budget" (retry next month).
REASON_NO_API_KEY = "no_api_key"
REASON_OVER_BUDGET = "over_budget"
REASON_PROVIDER_ERROR = "provider_error"
REASON_NO_WORKSPACE = "no_workspace_context"
REASON_UNPARSEABLE = "unparseable_response"
REASON_BUDGET_UNAVAILABLE = "budget_unavailable"


def degraded_payload(agent: str, reason: str, detail: str = "") -> dict:
    """The one shape an agent returns when it could not produce analysis.

    Deliberately not shaped like a result. A caller that ignores the
    `degraded` flag and reaches for content finds `None`, rather than a
    plausible number it will render to an advisor as fact.
    """
    return {
        "degraded": True,
        "degraded_reason": reason,
        "degraded_detail": detail,
        "agent": agent,
        "data": None,
    }


def is_degraded(value: Any) -> bool:
    """True when *value* is a degraded result rather than analysis."""
    return isinstance(value, dict) and value.get("degraded") is True


@dataclass(frozen=True)
class AgentResponse:
    """The outcome of one call, whether or not it reached the provider."""

    text: Optional[str] = None
    degraded: bool = False
    reason: Optional[str] = None
    detail: str = ""
    tokens_in: int = 0
    tokens_out: int = 0
    latency_ms: int = 0
    model: str = ""

    @property
    def ok(self) -> bool:
        return not self.degraded and self.text is not None

    def payload(self, agent: str) -> dict:
        """This response as a degraded payload. Only valid when degraded."""
        return degraded_payload(agent, self.reason or REASON_PROVIDER_ERROR, self.detail)


def parse_json(text: Optional[str]) -> Any:
    """Parse a model response as JSON, or return None.

    Strips a markdown code fence first. Models routinely wrap JSON in
    ```json ... ``` despite being told not to, and only one of the ten agents
    handled it - the others treated a correct answer in a fence as a parse
    failure and fell through to their sample data.
    """
    if not text:
        return None
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError, ValueError):
        return None


def as_dict(agent: str, response: AgentResponse) -> dict:
    """A JSON object from *response*, or a degraded result explaining why not.

    This is the function that replaced nine copies of "return the sample
    data". There is no argument for a fallback value, because supplying one
    is the defect.
    """
    if response.degraded:
        return response.payload(agent)
    parsed = parse_json(response.text)
    if not isinstance(parsed, dict):
        return degraded_payload(
            agent, REASON_UNPARSEABLE, "The model did not return a JSON object."
        )
    return parsed


def as_list(agent: str, response: AgentResponse) -> list:
    """A JSON array from *response*, or an empty list.

    A list-returning method cannot hand back the degraded envelope without
    lying about its type, so it returns nothing rather than something
    invented. Callers that need the reason should use `as_dict` or check the
    response directly.
    """
    if response.degraded:
        return []
    parsed = parse_json(response.text)
    return parsed if isinstance(parsed, list) else []


def _resolve_client(client: Any = None, *, is_async: bool = True) -> Any:
    if client is not None:
        return client
    if not settings.ANTHROPIC_API_KEY:
        return None
    try:
        import anthropic

        factory = anthropic.AsyncAnthropic if is_async else anthropic.Anthropic
        return factory(api_key=settings.ANTHROPIC_API_KEY)
    except Exception as exc:  # pragma: no cover - import/config failure
        logger.warning("anthropic client construction failed: %s", exc)
        return None


def _usage_tokens(response: Any) -> tuple[int, int]:
    """Token counts from a provider response, 0 when it does not report them."""
    usage = getattr(response, "usage", None)
    if usage is None:
        return 0, 0
    try:
        return int(getattr(usage, "input_tokens", 0) or 0), int(
            getattr(usage, "output_tokens", 0) or 0
        )
    except (TypeError, ValueError):
        # A provider that changes its usage shape must not take the call down
        # with it. An uncounted call is a metering gap; a raised exception
        # here would be an outage.
        logger.warning("unrecognised usage shape on a %s response", type(response).__name__)
        return 0, 0


def _response_text(response: Any) -> Optional[str]:
    content = getattr(response, "content", None)
    if not content:
        return None
    first = content[0]
    return getattr(first, "text", None)


def _precheck(
    agent_name: str, client: Any, model: str, workspace_id: Optional[str], is_async: bool
) -> tuple[Any, Optional[AgentResponse], Optional[str]]:
    """Everything that decides whether a call may happen.

    Shared by both transports so there is exactly one budget policy. Two
    copies of this logic is how a sync agent quietly ends up unmetered.
    """
    resolved = _resolve_client(client, is_async=is_async)
    if resolved is None:
        return None, AgentResponse(
            degraded=True,
            reason=REASON_NO_API_KEY,
            detail="No ANTHROPIC_API_KEY is configured, so no analysis was produced.",
            model=model,
        ), None

    workspace_id = workspace_id or BudgetGuard.workspace_from_context()
    if workspace_id:
        db = SessionLocal()
        try:
            BudgetGuard.assert_within_ceiling(db, workspace_id, operation="ai")
        except BudgetExceeded as exc:
            return None, AgentResponse(
                degraded=True, reason=REASON_OVER_BUDGET, detail=str(exc), model=model
            ), workspace_id
        except Exception as exc:
            # The meter is unreachable. Refuse rather than proceed.
            #
            # This is a deliberate choice between two bad options. Proceeding
            # would spend real money with no ceiling and no record for as long
            # as the fault lasts - a cost control that switches itself off
            # under exactly the conditions nobody is watching. Refusing costs
            # availability, on a platform where the database being down has
            # already taken every other route with it.
            logger.error(
                "agent %s: budget check failed, refusing the call: %s", agent_name, exc
            )
            return None, AgentResponse(
                degraded=True,
                reason=REASON_BUDGET_UNAVAILABLE,
                detail=f"The spend ceiling could not be read: {exc}",
                model=model,
            ), workspace_id
        finally:
            db.close()
    return resolved, None, workspace_id


def _finish(
    agent_name: str,
    response: Any,
    started: float,
    model: str,
    workspace_id: Optional[str],
) -> AgentResponse:
    """Meter the call that just happened and package its result."""
    latency_ms = int((time.monotonic() - started) * 1000)
    tokens_in, tokens_out = _usage_tokens(response)
    text = _response_text(response)

    if workspace_id:
        db = SessionLocal()
        try:
            BudgetGuard.record(
                db, workspace_id, agent_name, tokens_in, tokens_out, latency_ms, model
            )
        except Exception as exc:  # pragma: no cover - metering must not fail a call
            logger.error("agent %s: usage recording failed: %s", agent_name, exc)
        finally:
            db.close()
    else:
        # Worth saying out loud: an unmetered call is spend nobody can see.
        logger.warning(
            "agent %s ran with no operator scope bound; the call is unmetered",
            agent_name,
        )

    if text is None:
        return AgentResponse(
            degraded=True,
            reason=REASON_PROVIDER_ERROR,
            detail="The provider returned no text content.",
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            latency_ms=latency_ms,
            model=model,
        )
    return AgentResponse(
        text=text,
        tokens_in=tokens_in,
        tokens_out=tokens_out,
        latency_ms=latency_ms,
        model=model,
    )


def call_claude_sync(
    agent_name: str,
    system_prompt: str,
    user_prompt: str,
    *,
    client: Any = None,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    temperature: float = DEFAULT_TEMPERATURE,
    model: Optional[str] = None,
    workspace_id: Optional[str] = None,
) -> AgentResponse:
    """`call_claude` for agents whose methods are not coroutines.

    Same policy, blocking transport. Several agents expose synchronous
    methods and building a second, ungoverned path for them is exactly how
    metering develops holes.
    """
    model = model or settings.AI_MODEL
    resolved, refusal, workspace_id = _precheck(
        agent_name, client, model, workspace_id, is_async=False
    )
    if refusal is not None:
        return refusal

    started = time.monotonic()
    try:
        response = resolved.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
    except Exception as exc:
        logger.warning("agent %s: provider call failed: %s", agent_name, exc)
        return AgentResponse(
            degraded=True,
            reason=REASON_PROVIDER_ERROR,
            detail=str(exc),
            latency_ms=int((time.monotonic() - started) * 1000),
            model=model,
        )
    return _finish(agent_name, response, started, model, workspace_id)


async def call_claude(
    agent_name: str,
    system_prompt: str,
    user_prompt: str,
    *,
    client: Any = None,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    temperature: float = DEFAULT_TEMPERATURE,
    model: Optional[str] = None,
    workspace_id: Optional[str] = None,
) -> AgentResponse:
    """Make one budgeted, metered call - or explain why it did not happen.

    Never raises and never fabricates. Every path returns an `AgentResponse`,
    and a caller can only get content by looking at a response that is not
    degraded.

    The workspace comes from the operator scope P-02's middleware binds, so
    metering works without every agent method growing a `workspace_id`
    argument - which would have meant editing routers owned by six other
    packages.
    """
    model = model or settings.AI_MODEL
    resolved, refusal, workspace_id = _precheck(
        agent_name, client, model, workspace_id, is_async=True
    )
    if refusal is not None:
        return refusal

    started = time.monotonic()
    try:
        response = await resolved.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
    except Exception as exc:
        # The old code returned f'{{"error": "{exc}"}}' - a hand-built JSON
        # string that any quote or backslash in the message turned into
        # unparseable text, which then fell through to the sample data.
        logger.warning("agent %s: provider call failed: %s", agent_name, exc)
        return AgentResponse(
            degraded=True,
            reason=REASON_PROVIDER_ERROR,
            detail=str(exc),
            latency_ms=int((time.monotonic() - started) * 1000),
            model=model,
        )
    return _finish(agent_name, response, started, model, workspace_id)


class BaseAgent(ABC):
    """Abstract base providing the shared call path and status tracking."""

    def __init__(self, agent_name: str, anthropic_client=None):
        self.agent_name = agent_name
        self._client = anthropic_client
        self._status: str = "idle"
        self._last_output: Optional[dict] = None
        self._last_run_at: Optional[str] = None

    # ------------------------------------------------------------------
    # Abstract
    # ------------------------------------------------------------------
    @abstractmethod
    async def invoke(self, input_data: dict) -> dict:
        """Execute the agent's primary capability. Subclasses must implement."""
        ...

    # ------------------------------------------------------------------
    # Status helpers
    # ------------------------------------------------------------------
    def get_status(self) -> str:
        """Return current agent status: idle | running | complete | degraded | error."""
        return self._status

    def get_last_output(self) -> Optional[dict]:
        """Return the last output produced by invoke(), or None."""
        return self._last_output

    # ------------------------------------------------------------------
    # Prompt building
    # ------------------------------------------------------------------
    @staticmethod
    def _build_prompt(system_prompt: str, user_prompt: str) -> list:
        """Build standard Anthropic message list from system + user strings."""
        return [
            {"role": "user", "content": user_prompt},
        ]

    # ------------------------------------------------------------------
    # Shared Claude API call
    # ------------------------------------------------------------------
    async def _call_claude(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        max_tokens: int = DEFAULT_MAX_TOKENS,
        temperature: float = DEFAULT_TEMPERATURE,
    ) -> AgentResponse:
        """Call the provider through the shared governed path.

        Returns an `AgentResponse`, not a string. The previous signature
        returned a canned string on failure, which is what let nine callers
        turn an outage into invented analysis.
        """
        return await call_claude(
            self.agent_name,
            system_prompt,
            user_prompt,
            client=self._client,
            max_tokens=max_tokens,
            temperature=temperature,
        )

    # ------------------------------------------------------------------
    # Internal state management helpers
    # ------------------------------------------------------------------
    def _mark_running(self):
        self._status = "running"
        self._last_run_at = datetime.now(timezone.utc).isoformat()

    def _mark_complete(self, output: dict):
        self._status = "complete"
        self._last_output = output

    def _mark_error(self, err: str):
        self._status = "error"
        self._last_output = {"error": err}

    def _mark_degraded(self, response: AgentResponse) -> dict:
        """Record a call that did not happen, and return what to give callers."""
        payload = response.payload(self.agent_name)
        self._status = "degraded"
        self._last_output = payload
        return payload
