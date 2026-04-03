"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface PortalBranding {
  brand_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  footer_text: string | null;
}

const DEFAULT_BRANDING: PortalBranding = {
  brand_name: "ChamberForge",
  logo_url: null,
  primary_color: "#fbbf24",
  secondary_color: "#102a43",
  footer_text: null,
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const token = params.token as string;
  const [branding, setBranding] = useState<PortalBranding>(DEFAULT_BRANDING);

  // Portal always uses light theme for clients
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      // Restore dark class on unmount if user had it set
      const saved = localStorage.getItem('theme');
      if (!saved || saved === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  useEffect(() => {
    async function fetchBranding() {
      try {
        // Derive workspace_id from portal token context; fall back to query param
        const wsId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("workspace_id") : null;
        if (wsId) {
          const res = await api.get("/api/v1/admin/white-label/portal-branding", {
            params: { workspace_id: wsId },
          });
          setBranding(res.data);
        }
      } catch {
        // Silently fall back to defaults
      }
    }
    fetchBranding();
  }, []);

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        ["--portal-primary" as string]: branding.primary_color,
        ["--portal-secondary" as string]: branding.secondary_color,
      }}
    >
      {/* Header */}
      <header
        className="border-b border-gray-200"
        style={{ backgroundColor: branding.secondary_color }}
      >
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt={branding.brand_name} className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: branding.primary_color, color: branding.secondary_color }}
              >
                <span className="font-bold text-sm">
                  {branding.brand_name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-lg font-semibold text-white">{branding.brand_name}</span>
          </div>
          <nav className="flex gap-6">
            <Link
              href={`/portal/${token}`}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Overview
            </Link>
            <Link
              href={`/portal/${token}/deliverables`}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Deliverables
            </Link>
            <Link
              href={`/portal/${token}/kpis`}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              KPIs
            </Link>
            <Link
              href={`/portal/${token}/reports`}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Reports
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-gray-400">
          {branding.footer_text || `Powered by ${branding.brand_name} \u2014 Premium Service Operating System`}
        </div>
      </footer>
    </div>
  );
}
