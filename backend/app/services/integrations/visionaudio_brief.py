"""Render a client brief through VisionAudioForge, or say that it was not rendered.

P-07 (T-049, module only - the scheduled job that drives this belongs to
P-08).

Queues a brief for rendering and reports its progress. The whole module is
short because the interesting decision is what it refuses to do: there is no
offline render, no sample deck and no placeholder link.

That is a direct response to what was here before. `VisionAudioForgeClient`
returned a fully populated quarterly report when unconfigured - AUM, net
return, alpha in basis points, a Sharpe ratio, dated investment
recommendations - with an `output_url` pointing at a `.pptx`. A caller could
not tell it from a real render, and a brief assembled from it would have
carried invented performance figures onto a client's desk.

So a brief that did not render produces a degraded result and no link. The
UI shows nothing, which is the correct amount of information.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

from app.services.integrations.visionaudio_client import (
    VisionAudioForgeClient,
    is_degraded,
)

#: Statuses the partner reports for a render job.
STATUS_PENDING = "pending"
STATUS_COMPLETE = "complete"
STATUS_FAILED = "failed"


@dataclass(frozen=True)
class BriefRender:
    """A queued brief, or the reason there isn't one."""

    queued: bool
    render_id: Optional[str] = None
    status: Optional[str] = None
    output_url: Optional[str] = None
    reason: Optional[str] = None
    detail: str = ""

    @property
    def ready(self) -> bool:
        return self.status == STATUS_COMPLETE and bool(self.output_url)

    def as_dict(self) -> dict[str, Any]:
        return {
            "queued": self.queued,
            "ready": self.ready,
            "render_id": self.render_id,
            "status": self.status,
            "output_url": self.output_url,
            "reason": self.reason,
            "detail": self.detail,
        }

    @classmethod
    def not_queued(cls, payload: dict[str, Any]) -> "BriefRender":
        return cls(
            queued=False,
            reason=payload.get("degraded_reason", "partner_unavailable"),
            detail=payload.get(
                "degraded_detail", "The brief was not sent for rendering."
            ),
        )


class ClientBrief:
    """Queue and track client brief renders."""

    def __init__(self, client: VisionAudioForgeClient) -> None:
        self.client = client

    async def render(
        self,
        *,
        client_name: str,
        period: str,
        sections: list[dict[str, Any]],
        template: str = "premium",
    ) -> BriefRender:
        """Queue a brief for rendering.

        *sections* is the caller's own content and is passed through
        untouched. This module adds nothing to it: an empty section stays
        empty rather than acquiring a plausible summary on the way past.
        """
        payload = await self.client.render_presentation(
            {
                "type": "client_brief",
                "client_name": client_name,
                "period": period,
                "sections": sections,
            },
            template=template,
        )
        if is_degraded(payload):
            return BriefRender.not_queued(payload)

        return BriefRender(
            queued=True,
            render_id=payload.get("render_id"),
            status=payload.get("status", STATUS_PENDING),
            output_url=payload.get("output_url"),
        )

    async def poll(self, render_id: str) -> BriefRender:
        """Check on a queued brief.

        An unreachable partner leaves `status` as None rather than
        `pending`. "Pending" is a claim about the job - that it exists and is
        progressing - and we would not know either.
        """
        payload = await self.client.get_render_status(render_id)
        if is_degraded(payload):
            result = BriefRender.not_queued(payload)
            return BriefRender(
                queued=True,
                render_id=render_id,
                status=None,
                reason=result.reason,
                detail=result.detail,
            )

        return BriefRender(
            queued=True,
            render_id=payload.get("render_id", render_id),
            status=payload.get("status"),
            output_url=payload.get("output_url"),
        )
