"use client";

interface InvoiceRow {
  id: string;
  clientName: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string | null;
  paidAt: string | null;
}

interface InvoiceTableProps {
  invoices: InvoiceRow[];
}

const statusBadge: Record<string, string> = {
  draft: "bg-white/10 text-white/60",
  sent: "bg-blue-500/20 text-blue-400",
  paid: "bg-emerald-500/20 text-emerald-400",
  overdue: "bg-red-500/20 text-red-400",
};

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "--";

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  if (!invoices.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/40">
        No invoices yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
            <th className="px-5 py-3">Invoice</th>
            <th className="px-5 py-3">Client</th>
            <th className="px-5 py-3 text-right">Amount</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Due Date</th>
            <th className="px-5 py-3">Paid</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
              <td className="px-5 py-3 font-mono text-xs text-white/60">
                {inv.id.slice(0, 8)}
              </td>
              <td className="px-5 py-3 text-white">{inv.clientName}</td>
              <td className="px-5 py-3 text-right font-semibold text-white">
                {fmtCurrency(inv.amount)}
              </td>
              <td className="px-5 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusBadge[inv.status] ?? statusBadge.draft}`}
                >
                  {inv.status}
                </span>
              </td>
              <td className="px-5 py-3 text-white/50">{fmtDate(inv.dueDate)}</td>
              <td className="px-5 py-3 text-white/50">{fmtDate(inv.paidAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
