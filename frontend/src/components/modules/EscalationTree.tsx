"use client";

interface EscalationLevel {
  level: number;
  contact_name: string;
  contact_method: string;
  role: string;
}

interface EscalationTreeProps {
  tree: EscalationLevel[];
}

export default function EscalationTree({ tree }: EscalationTreeProps) {
  if (!tree || tree.length === 0) {
    return (
      <div className="text-chamber-500 text-sm italic">
        No escalation tree configured
      </div>
    );
  }

  const sorted = [...tree].sort((a, b) => a.level - b.level);

  return (
    <div className="space-y-0">
      {sorted.map((node, idx) => (
        <div key={idx} className="flex items-stretch">
          {/* Vertical connector line */}
          <div className="flex flex-col items-center mr-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                node.level === 1
                  ? "bg-red-900/50 text-red-400 ring-2 ring-red-500"
                  : "bg-chamber-800 text-chamber-300 ring-1 ring-chamber-600"
              }`}
            >
              L{node.level}
            </div>
            {idx < sorted.length - 1 && (
              <div className="w-px h-8 bg-chamber-600" />
            )}
          </div>

          {/* Node content */}
          <div className="flex-1 pb-4">
            <div className="bg-chamber-900 border border-chamber-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold">
                    {node.contact_name}
                  </span>
                  <span className="text-chamber-400 text-sm ml-2">
                    {node.role}
                  </span>
                </div>
                <span className="text-xs bg-chamber-800 text-chamber-300 px-2 py-1 rounded">
                  {node.contact_method}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
