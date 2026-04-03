"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const token = params.token as string;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Client Portal</span>
          </div>
          <nav className="flex gap-6">
            <Link
              href={`/portal/${token}`}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Overview
            </Link>
            <Link
              href={`/portal/${token}/deliverables`}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Deliverables
            </Link>
            <Link
              href={`/portal/${token}/kpis`}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              KPIs
            </Link>
            <Link
              href={`/portal/${token}/reports`}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
          Powered by ChamberForge &mdash; Premium Service Operating System
        </div>
      </footer>
    </div>
  );
}
