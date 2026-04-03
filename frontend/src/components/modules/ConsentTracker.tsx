"use client";

interface ConsentStatus {
  type: string;
  status: "active" | "revoked";
}

interface ConsentTrackerProps {
  consents: ConsentStatus[];
}

const TYPE_LABELS: Record<string, string> = {
  data_processing: "DP",
  nda: "NDA",
  marketing: "MKT",
  third_party_sharing: "3P",
};

/**
 * Per-client consent status badges — shows compact colored indicators
 * for each consent type and its current status.
 */
export default function ConsentTracker({ consents }: ConsentTrackerProps) {
  return (
    <div className="flex items-center gap-1.5">
      {consents.map((consent, i) => {
        const label = TYPE_LABELS[consent.type] || consent.type.slice(0, 3).toUpperCase();
        const isActive = consent.status === "active";

        return (
          <span
            key={`${consent.type}-${i}`}
            title={`${consent.type.replace(/_/g, " ")} — ${consent.status}`}
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-wider ${
              isActive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/15 text-red-400 border border-red-500/30"
            }`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
