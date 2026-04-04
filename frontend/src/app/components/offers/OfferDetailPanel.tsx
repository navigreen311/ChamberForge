'use client';

import React from 'react';

export interface ReadinessItem {
  label: string;
  done: boolean;
}

export interface OfferDetail {
  id: string;
  name: string;
  client: string;
  tier: string;
  status: string;
  monthly: string;
  delivery: string;
  startDate: string;
  renewalDate: string;
  description?: string;
  dealDeskStatus: {
    legal: 'approved' | 'pending' | 'rejected';
    finance: 'approved' | 'pending' | 'rejected';
    compliance: 'approved' | 'pending' | 'rejected';
  };
  readiness: ReadinessItem[];
}

interface OfferDetailPanelProps {
  offer: OfferDetail;
  onClose: () => void;
}

const STATUS_DOT: Record<string, string> = {
  approved: 'bg-emerald-400',
  pending: 'bg-[#C9A84C]',
  rejected: 'bg-red-400',
};

const STATUS_TEXT: Record<string, string> = {
  approved: 'text-emerald-400',
  pending: 'text-[#C9A84C]',
  rejected: 'text-red-400',
};

export default function OfferDetailPanel({
  offer,
  onClose,
}: OfferDetailPanelProps) {
  return (
    <div
      className="w-[300px] bg-[#111827] border-l border-[#1e2a3a] h-full overflow-y-auto flex-shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1e2a3a]">
        <div>
          <h3 className="text-sm font-semibold text-white">{offer.name}</h3>
          <p className="text-[11px] text-gray-500">{offer.client}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Offer Details */}
      <div className="p-4 border-b border-[#1e2a3a]">
        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
          Offer Details
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Tier', value: offer.tier },
            { label: 'Status', value: offer.status },
            { label: 'Monthly', value: offer.monthly },
            { label: 'Delivery', value: offer.delivery },
            { label: 'Start', value: offer.startDate },
            { label: 'Renewal', value: offer.renewalDate },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-xs">
              <span className="text-gray-500">{row.label}</span>
              <span className="text-gray-200">{row.value}</span>
            </div>
          ))}
          {offer.description && (
            <p className="text-xs text-gray-400 mt-2">{offer.description}</p>
          )}
        </div>
      </div>

      {/* Deal Desk Status */}
      <div className="p-4 border-b border-[#1e2a3a]">
        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
          Deal Desk Status
        </h4>
        <div className="space-y-2">
          {(
            Object.entries(offer.dealDeskStatus) as [
              string,
              'approved' | 'pending' | 'rejected',
            ][]
          ).map(([dept, status]) => (
            <div key={dept} className="flex items-center justify-between text-xs">
              <span className="text-gray-400 capitalize">{dept}</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                <span className={`capitalize ${STATUS_TEXT[status]}`}>{status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Readiness Checklist */}
      <div className="p-4 border-b border-[#1e2a3a]">
        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
          Readiness Checklist
        </h4>
        <div className="space-y-2">
          {offer.readiness.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span
                className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                  item.done
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-[#1e2a3a] text-gray-600'
                }`}
              >
                {item.done ? '\u2713' : ''}
              </span>
              <span className={item.done ? 'text-gray-300' : 'text-gray-500'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        <button className="w-full py-2 rounded-md text-xs font-medium bg-[#C9A84C] text-black hover:bg-[#C9A84C]/90 transition-colors">
          Edit Offer
        </button>
        <button className="w-full py-2 rounded-md text-xs font-medium border border-[#1e2a3a] text-gray-300 hover:bg-[#1e2a3a] transition-colors">
          Run Red Team
        </button>
        <button className="w-full py-2 rounded-md text-xs font-medium border border-[#1e2a3a] text-gray-300 hover:bg-[#1e2a3a] transition-colors">
          Clone Offer
        </button>
      </div>
    </div>
  );
}
