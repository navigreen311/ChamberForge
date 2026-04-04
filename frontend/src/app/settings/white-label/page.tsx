'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, Globe, Mail, Palette } from 'lucide-react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Inline Data & Types                                                */
/* ------------------------------------------------------------------ */

const FONTS = ['Inter', 'Playfair Display', 'DM Sans'] as const;

interface BrandState {
  logoPreview: string | null;
  primaryColor: string;
  secondaryColor: string;
  font: (typeof FONTS)[number];
  portalName: string;
  customDomain: string;
  emailFrom: string;
  emailSubjectPrefix: string;
  emailFooter: string;
}

const INITIAL: BrandState = {
  logoPreview: null,
  primaryColor: '#C9A84C',
  secondaryColor: '#1A1A2E',
  font: 'Inter',
  portalName: 'ChamberForge',
  customDomain: '',
  emailFrom: 'ChamberForge',
  emailSubjectPrefix: '[ChamberForge]',
  emailFooter: '(c) 2026 ChamberForge. All rights reserved.',
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function WhiteLabelPage() {
  const [brand, setBrand] = useState<BrandState>(INITIAL);

  const set = <K extends keyof BrandState>(key: K, val: BrandState[K]) =>
    setBrand((prev) => ({ ...prev, [key]: val }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('logoPreview', reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/70 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl flex items-center gap-4 px-6 py-4">
          <Link href="/settings" className="text-zinc-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">White-Label Configuration</h1>
            <p className="text-sm text-zinc-500">Customize branding, domain, and email templates</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 grid lg:grid-cols-[1fr_380px] gap-8">
        {/* ---- Left: Controls ---- */}
        <div className="space-y-8">
          {/* Brand Settings */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-6">
            <h2 className="flex items-center gap-2 text-sm font-medium text-zinc-400">
              <Palette size={16} className="text-amber-400" /> Brand Settings
            </h2>

            {/* Logo Upload */}
            <div>
              <label className="text-xs text-zinc-500 block mb-2">Logo</label>
              <label className="flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed border-zinc-700 hover:border-amber-500/50 cursor-pointer transition bg-zinc-800/40">
                {brand.logoPreview ? (
                  <img src={brand.logoPreview} alt="Logo" className="h-20 object-contain" />
                ) : (
                  <>
                    <Upload size={24} className="text-zinc-600 mb-1" />
                    <span className="text-xs text-zinc-500">Click to upload logo (PNG, SVG)</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>

            {/* Colors */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.primaryColor}
                    onChange={(e) => set('primaryColor', e.target.value)}
                    className="h-9 w-9 rounded border border-zinc-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={brand.primaryColor}
                    onChange={(e) => set('primaryColor', e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.secondaryColor}
                    onChange={(e) => set('secondaryColor', e.target.value)}
                    className="h-9 w-9 rounded border border-zinc-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={brand.secondaryColor}
                    onChange={(e) => set('secondaryColor', e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Font */}
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Font Family</label>
              <select
                value={brand.font}
                onChange={(e) => set('font', e.target.value as BrandState['font'])}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Portal Name */}
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Portal Name</label>
              <input
                type="text"
                value={brand.portalName}
                onChange={(e) => set('portalName', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </section>

          {/* Custom Domain */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-zinc-400">
              <Globe size={16} className="text-blue-400" /> Custom Domain
            </h2>
            <input
              type="text"
              placeholder="portal.yourdomain.com"
              value={brand.customDomain}
              onChange={(e) => set('customDomain', e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <div className="rounded-lg bg-zinc-800/60 border border-zinc-700/50 p-4 text-xs text-zinc-400 space-y-2">
              <p className="font-medium text-zinc-300">DNS Configuration</p>
              <p>1. Add a <span className="text-amber-400 font-mono">CNAME</span> record pointing to <span className="font-mono text-zinc-300">portal.chamberforge.io</span></p>
              <p>2. Wait for DNS propagation (up to 48 hours)</p>
              <p>3. SSL certificate will be provisioned automatically</p>
            </div>
          </section>

          {/* Email Template */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-zinc-400">
              <Mail size={16} className="text-purple-400" /> Email Template
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1">From Name</label>
                <input
                  type="text"
                  value={brand.emailFrom}
                  onChange={(e) => set('emailFrom', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Subject Prefix</label>
                <input
                  type="text"
                  value={brand.emailSubjectPrefix}
                  onChange={(e) => set('emailSubjectPrefix', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Footer Text</label>
              <textarea
                rows={2}
                value={brand.emailFooter}
                onChange={(e) => set('emailFooter', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>
          </section>

          {/* Apply Button */}
          <div className="flex justify-end">
            <button
              className="px-6 py-2.5 rounded-lg font-medium text-sm transition text-zinc-950"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Apply Branding
            </button>
          </div>
        </div>

        {/* ---- Right: Live Preview ---- */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wide">
              Live Preview
            </div>

            {/* Mini Portal Mockup */}
            <div className="p-4 space-y-4" style={{ fontFamily: brand.font }}>
              {/* Top Bar */}
              <div className="rounded-lg p-3 flex items-center gap-3" style={{ backgroundColor: brand.secondaryColor }}>
                {brand.logoPreview ? (
                  <img src={brand.logoPreview} alt="" className="h-6 object-contain" />
                ) : (
                  <div className="h-6 w-6 rounded" style={{ backgroundColor: brand.primaryColor }} />
                )}
                <span className="text-sm font-semibold" style={{ color: brand.primaryColor }}>
                  {brand.portalName || 'Portal'}
                </span>
              </div>

              {/* Fake Card */}
              <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 space-y-3">
                <div className="h-2.5 w-3/4 rounded-full bg-zinc-700" />
                <div className="h-2 w-1/2 rounded-full bg-zinc-700/60" />
                <button
                  className="px-4 py-1.5 rounded text-xs font-medium text-zinc-950"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  Primary Action
                </button>
              </div>

              {/* Fake Nav */}
              <div className="flex gap-2">
                {['Dashboard', 'Clients', 'Reports'].map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-1 rounded"
                    style={{
                      backgroundColor: t === 'Dashboard' ? brand.primaryColor + '22' : 'transparent',
                      color: t === 'Dashboard' ? brand.primaryColor : '#71717a',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Domain preview */}
              {brand.customDomain && (
                <div className="text-[10px] text-zinc-500 bg-zinc-800 rounded px-2 py-1 font-mono truncate">
                  https://{brand.customDomain}
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
