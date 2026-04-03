"use client";

interface SubscriptionCardProps {
  clientName: string;
  planName: string;
  amount: number;
  status: "active" | "past_due" | "canceled";
  periodStart: string;
  periodEnd: string;
  currency?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  past_due: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  canceled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function SubscriptionCard({
  clientName,
  planName,
  amount,
  status,
  periodStart,
  periodEnd,
  currency = "usd",
}: SubscriptionCardProps) {
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const fmtAmount = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-indigo-500/30 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{clientName}</h3>
          <p className="mt-0.5 text-xs text-white/50">{planName}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusStyles[status] ?? statusStyles.active}`}
        >
          {status.replace("_", " ")}
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold text-white">
        {fmtAmount(amount)}
        <span className="text-sm font-normal text-white/40">/mo</span>
      </p>

      <div className="mt-3 flex gap-4 text-xs text-white/40">
        <span>Start: {fmtDate(periodStart)}</span>
        <span>End: {fmtDate(periodEnd)}</span>
      </div>
    </div>
  );
}
