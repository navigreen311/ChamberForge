'use client';

import { AlertTriangle } from 'lucide-react';

interface Escalation {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  client: string;
  createdAt: string;
  description?: string;
}

interface EscalationLogProps {
  escalations: Escalation[];
}

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-gray-500',
};

const SEVERITY_TEXT: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-amber-400',
  low: 'text-gray-400',
};

export default function EscalationLog({ escalations }: EscalationLogProps) {
  if (escalations.length === 0) {
    return (
      <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-5">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          Escalations
        </h3>
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <AlertTriangle size={32} className="mb-3 text-gray-600" />
          <p className="text-sm">No active escalations</p>
          <p className="text-[10px] mt-1">All deliverables are on track</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
        Escalations
      </h3>

      <div className="space-y-2">
        {escalations.map((esc) => (
          <div
            key={esc.id}
            className="flex items-start gap-3 p-3 bg-[#0d1117] border border-[#1e2a3a] rounded-lg"
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${SEVERITY_DOT[esc.severity]}`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{esc.title}</span>
                <span className={`text-[10px] capitalize ${SEVERITY_TEXT[esc.severity]}`}>
                  {esc.severity}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {esc.client} &middot; {esc.createdAt}
              </p>
              {esc.description && (
                <p className="text-xs text-gray-400 mt-1">{esc.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
