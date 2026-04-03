"use client";

import React, { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";

interface RenderAsset {
  render_id: string;
  type: string;
  status: "pending" | "rendering" | "complete" | "failed";
  output_url?: string;
  estimated_time_seconds?: number;
}

interface MultimediaPreviewProps {
  asset: RenderAsset;
  pollInterval?: number;
  apiBase?: string;
}

/**
 * Universal preview component — detects content type (video, presentation,
 * dashboard) and renders the appropriate viewer/player.
 */
export default function MultimediaPreview({
  asset,
  pollInterval = 5000,
  apiBase = "/api/v1/visionaudio",
}: MultimediaPreviewProps) {
  const [currentAsset, setCurrentAsset] = useState<RenderAsset>(asset);
  const [error, setError] = useState<string | null>(null);

  // Poll render status until complete or failed
  useEffect(() => {
    if (
      currentAsset.status === "complete" ||
      currentAsset.status === "failed"
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${apiBase}/render/${currentAsset.render_id}/status`
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: RenderAsset = await res.json();
        setCurrentAsset((prev) => ({ ...prev, ...data }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Polling failed");
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [currentAsset.render_id, currentAsset.status, pollInterval, apiBase]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center">
        <p className="text-red-700 font-medium">Render Error</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (
    currentAsset.status === "pending" ||
    currentAsset.status === "rendering"
  ) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-600 mt-4 font-medium">
          {currentAsset.status === "pending"
            ? "Queued for rendering..."
            : "Rendering in progress..."}
        </p>
        {currentAsset.estimated_time_seconds && (
          <p className="text-gray-400 text-sm mt-1">
            Estimated: {currentAsset.estimated_time_seconds}s
          </p>
        )}
      </div>
    );
  }

  if (currentAsset.status === "failed") {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center">
        <p className="text-red-700 font-medium">Render Failed</p>
        <p className="text-gray-500 text-sm mt-1">
          ID: {currentAsset.render_id}
        </p>
      </div>
    );
  }

  // Status is "complete" — render based on type
  const url = currentAsset.output_url || "";
  const contentType = detectContentType(currentAsset.type, url);

  switch (contentType) {
    case "video":
      return <VideoPlayer src={url} />;

    case "presentation":
      return (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <iframe
            src={url}
            title={`Presentation ${currentAsset.render_id}`}
            className="w-full h-[600px]"
            allowFullScreen
          />
        </div>
      );

    case "dashboard":
      return (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <iframe
            src={url}
            title={`Dashboard ${currentAsset.render_id}`}
            className="w-full h-[700px]"
            allowFullScreen
          />
        </div>
      );

    default:
      return (
        <div className="rounded-lg border border-gray-200 p-6 text-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
          >
            Download Asset
          </a>
          <p className="text-gray-400 text-sm mt-1">{currentAsset.type}</p>
        </div>
      );
  }
}

function detectContentType(
  type: string,
  url: string
): "video" | "presentation" | "dashboard" | "unknown" {
  const videoTypes = [
    "video_ad",
    "proof_walkthrough",
    "authority_clip",
    "data_story",
    "training_video",
  ];
  if (videoTypes.includes(type) || /\.(mp4|webm|mov)$/i.test(url)) {
    return "video";
  }

  const presentationTypes = [
    "quarterly_report",
    "before_after_scorecard",
    "trust_package",
    "credibility_deck",
    "landing_visuals",
  ];
  if (presentationTypes.includes(type) || /\.(pptx|pdf)$/i.test(url)) {
    return "presentation";
  }

  if (type === "kpi_dashboard" || type === "dashboard") {
    return "dashboard";
  }

  return "unknown";
}
