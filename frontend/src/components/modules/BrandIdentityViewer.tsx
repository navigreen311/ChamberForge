"use client";

import React from "react";

interface BrandAsset {
  type: string;
  url: string;
  format: string;
}

interface BrandIdentity {
  logo_concepts: BrandAsset[];
  color_palette: BrandAsset | null;
  typography: {
    primary_font: string;
    secondary_font: string;
  };
  presentation_template_url: string;
}

interface BrandIdentityViewerProps {
  identity: BrandIdentity;
}

/**
 * Grid display of brand identity assets with download buttons.
 */
export default function BrandIdentityViewer({
  identity,
}: BrandIdentityViewerProps) {
  return (
    <div className="space-y-8">
      {/* Logo Concepts */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Logo Concepts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {identity.logo_concepts.map((logo, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col items-center gap-3"
            >
              <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                {logo.format === "svg" ? (
                  <img
                    src={logo.url}
                    alt={`Logo concept ${idx + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={logo.url}
                    alt={`Logo concept ${idx + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
              <DownloadButton url={logo.url} label={`Logo ${idx + 1}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Color Palette */}
      {identity.color_palette && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Color Palette
          </h3>
          <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between">
            <span className="text-gray-600 text-sm">
              {identity.color_palette.format.toUpperCase()} palette
            </span>
            <DownloadButton
              url={identity.color_palette.url}
              label="Color Palette"
            />
          </div>
        </section>
      )}

      {/* Typography */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Typography
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Primary Font</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {identity.typography.primary_font}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Secondary Font</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {identity.typography.secondary_font}
            </p>
          </div>
        </div>
      </section>

      {/* Presentation Template */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Presentation Template
        </h3>
        <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between">
          <span className="text-gray-600 text-sm">
            Master presentation template
          </span>
          <DownloadButton
            url={identity.presentation_template_url}
            label="Template"
          />
        </div>
      </section>
    </div>
  );
}

function DownloadButton({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {label}
    </a>
  );
}
