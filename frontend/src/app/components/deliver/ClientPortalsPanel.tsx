'use client';

import { ExternalLink } from 'lucide-react';

interface Portal {
  id: string;
  clientName: string;
  status: 'active' | 'inactive' | 'pending';
  url?: string;
  lastLogin?: string;
}

interface ClientPortalsPanelProps {
  portals: Portal[];
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-400',
  inactive: 'bg-gray-500',
  pending: 'bg-amber-400',
};

const STATUS_TEXT: Record<string, string> = {
  active: 'text-emerald-400',
  inactive: 'text-gray-500',
  pending: 'text-amber-400',
};

export default function ClientPortalsPanel({ portals }: ClientPortalsPanelProps) {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
        Client Portals
      </h3>

      <div className="space-y-2">
        {portals.map((portal) => (
          <div
            key={portal.id}
            className="flex items-center gap-3 p-3 bg-[#0d1117] border border-[#1e2a3a] rounded-lg"
          >
            {/* Status dot */}
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[portal.status]}`} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{portal.clientName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] capitalize ${STATUS_TEXT[portal.status]}`}>
                  {portal.status}
                </span>
                {portal.lastLogin && (
                  <span className="text-[10px] text-gray-600">
                    Last login: {portal.lastLogin}
                  </span>
                )}
              </div>
            </div>

            {portal.status === 'inactive' ? (
              <button className="text-[10px] px-3 py-1.5 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 font-medium cursor-pointer">
                Activate
              </button>
            ) : portal.url ? (
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white"
              >
                <ExternalLink size={14} />
              </a>
            ) : null}
          </div>
        ))}

        {portals.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">No portals configured</p>
        )}
      </div>
    </div>
  );
}
