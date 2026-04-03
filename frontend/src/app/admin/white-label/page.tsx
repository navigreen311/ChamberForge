"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import ColorPicker from "@/components/ui/ColorPicker";

interface WhiteLabelConfig {
  brand_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  favicon_url: string | null;
  custom_domain: string | null;
  email_from_name: string | null;
  email_from_address: string | null;
  portal_footer_text: string | null;
  is_active: boolean;
}

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

interface DomainValidation {
  valid: boolean;
  dns_records_needed: DnsRecord[];
  error?: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

const WORKSPACE_ID = typeof window !== "undefined" ? localStorage.getItem("workspace_id") || "" : "";

export default function WhiteLabelPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [config, setConfig] = useState<WhiteLabelConfig>({
    brand_name: "ChamberForge",
    logo_url: null,
    primary_color: "#fbbf24",
    secondary_color: "#102a43",
    favicon_url: null,
    custom_domain: null,
    email_from_name: null,
    email_from_address: null,
    portal_footer_text: null,
    is_active: true,
  });
  const [domainValidation, setDomainValidation] = useState<DomainValidation | null>(null);
  const [validatingDomain, setValidatingDomain] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await api.get("/api/v1/admin/white-label", {
          params: { workspace_id: WORKSPACE_ID },
        });
        setConfig(res.data);
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          setError(err?.response?.data?.detail || "Failed to load config");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.put("/api/v1/admin/white-label", config, {
        params: { workspace_id: WORKSPACE_ID },
      });
      setConfig(res.data);
      setSuccess("White-label configuration saved successfully.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleValidateDomain = async () => {
    if (!config.custom_domain) return;
    setValidatingDomain(true);
    setDomainValidation(null);
    try {
      const res = await api.get("/api/v1/admin/white-label/validate-domain", {
        params: { domain: config.custom_domain },
      });
      setDomainValidation(res.data);
    } catch (err: any) {
      setError("Failed to validate domain");
    } finally {
      setValidatingDomain(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">White-Label Configuration</h1>
        <p className="mt-1 text-sm text-gray-400">
          Customize branding, colors, domain, and email sender for your client portal.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-800 bg-green-900/30 px-4 py-3 text-sm text-green-300">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Form */}
        <div className="space-y-6">
          {/* Brand Identity */}
          <section className="rounded-xl border border-chamber-700 bg-chamber-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Brand Identity</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Brand Name</label>
              <input
                type="text"
                value={config.brand_name}
                onChange={(e) => setConfig({ ...config, brand_name: e.target.value })}
                className="w-full rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Logo URL</label>
              <input
                type="url"
                value={config.logo_url || ""}
                onChange={(e) => setConfig({ ...config, logo_url: e.target.value || null })}
                placeholder="https://example.com/logo.png"
                className="w-full rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Favicon URL</label>
              <input
                type="url"
                value={config.favicon_url || ""}
                onChange={(e) => setConfig({ ...config, favicon_url: e.target.value || null })}
                placeholder="https://example.com/favicon.ico"
                className="w-full rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </section>

          {/* Colors */}
          <section className="rounded-xl border border-chamber-700 bg-chamber-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Brand Colors</h2>
            <ColorPicker
              label="Primary Color"
              value={config.primary_color}
              onChange={(c) => setConfig({ ...config, primary_color: c })}
            />
            <ColorPicker
              label="Secondary Color"
              value={config.secondary_color}
              onChange={(c) => setConfig({ ...config, secondary_color: c })}
            />
          </section>

          {/* Custom Domain */}
          <section className="rounded-xl border border-chamber-700 bg-chamber-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Custom Domain</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.custom_domain || ""}
                onChange={(e) => setConfig({ ...config, custom_domain: e.target.value || null })}
                placeholder="portal.yourdomain.com"
                className="flex-1 rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={handleValidateDomain}
                disabled={!config.custom_domain || validatingDomain}
                className="rounded-lg bg-chamber-700 px-4 py-2 text-sm font-medium text-white hover:bg-chamber-600 disabled:opacity-50 transition-colors"
              >
                {validatingDomain ? "Checking..." : "Verify DNS"}
              </button>
            </div>
            {domainValidation && (
              <div className={`rounded-lg p-4 text-sm ${domainValidation.valid ? "bg-blue-900/30 border border-blue-800" : "bg-red-900/30 border border-red-800"}`}>
                {domainValidation.valid ? (
                  <div className="space-y-2">
                    <p className="font-medium text-blue-300">Add these DNS records:</p>
                    {domainValidation.dns_records_needed.map((r, i) => (
                      <div key={i} className="font-mono text-xs text-gray-300 bg-chamber-900 rounded p-2">
                        <span className="text-amber-400">{r.type}</span>{" "}
                        <span className="text-white">{r.name}</span>{" -> "}
                        <span className="text-green-400">{r.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-300">{domainValidation.error || "Invalid domain"}</p>
                )}
              </div>
            )}
          </section>

          {/* Email Sender */}
          <section className="rounded-xl border border-chamber-700 bg-chamber-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Email Sender</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">From Name</label>
              <input
                type="text"
                value={config.email_from_name || ""}
                onChange={(e) => setConfig({ ...config, email_from_name: e.target.value || null })}
                placeholder="Your Company"
                className="w-full rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">From Address</label>
              <input
                type="email"
                value={config.email_from_address || ""}
                onChange={(e) => setConfig({ ...config, email_from_address: e.target.value || null })}
                placeholder="noreply@yourdomain.com"
                className="w-full rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </section>

          {/* Footer */}
          <section className="rounded-xl border border-chamber-700 bg-chamber-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Portal Footer</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Footer Text</label>
              <input
                type="text"
                value={config.portal_footer_text || ""}
                onChange={(e) => setConfig({ ...config, portal_footer_text: e.target.value || null })}
                placeholder="Powered by Your Company"
                className="w-full rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </section>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>

        {/* Right column: Portal Preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Portal Preview</h2>
          <div
            className="rounded-xl border border-chamber-700 overflow-hidden"
            style={{ minHeight: 400 }}
          >
            {/* Preview header */}
            <div
              className="px-6 py-4 flex items-center gap-3 border-b"
              style={{ backgroundColor: config.secondary_color, borderColor: config.secondary_color }}
            >
              {config.logo_url ? (
                <img src={config.logo_url} alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
              ) : (
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: config.primary_color, color: config.secondary_color }}
                >
                  {config.brand_name?.slice(0, 2).toUpperCase() || "CF"}
                </div>
              )}
              <span className="font-semibold text-white">{config.brand_name || "Client Portal"}</span>
            </div>

            {/* Preview body */}
            <div className="bg-white p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-48 rounded" style={{ backgroundColor: config.secondary_color, opacity: 0.2 }} />
                <div className="h-3 w-64 rounded bg-gray-200" />
                <div className="h-3 w-56 rounded bg-gray-200" />
              </div>
              <div className="flex gap-2">
                <div
                  className="rounded-lg px-4 py-2 text-xs font-medium"
                  style={{ backgroundColor: config.primary_color, color: config.secondary_color }}
                >
                  Primary Button
                </div>
                <div
                  className="rounded-lg px-4 py-2 text-xs font-medium text-white"
                  style={{ backgroundColor: config.secondary_color }}
                >
                  Secondary Button
                </div>
              </div>
            </div>

            {/* Preview footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-center text-xs text-gray-400">
              {config.portal_footer_text || `Powered by ${config.brand_name || "ChamberForge"}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
