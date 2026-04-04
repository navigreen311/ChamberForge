'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  FileText,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Send,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Inline data                                                        */
/* ------------------------------------------------------------------ */

const currentPlan = {
  name: 'Enterprise',
  seats: 5,
  price: 299,
  renewal: 'May 1, 2026',
};

type InvoiceStatus = 'paid' | 'pending' | 'overdue';

interface Invoice {
  id: string;
  client: string;
  number: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
}

const invoices: Invoice[] = [
  { id: '1', client: 'Acme Corp', number: 'INV-1041', amount: 12500, status: 'paid', date: '2026-03-28' },
  { id: '2', client: 'Globex Inc', number: 'INV-1042', amount: 8750, status: 'paid', date: '2026-03-20' },
  { id: '3', client: 'Initech LLC', number: 'INV-1043', amount: 4200, status: 'pending', date: '2026-03-15' },
  { id: '4', client: 'Umbrella Co', number: 'INV-1044', amount: 15300, status: 'overdue', date: '2026-02-28' },
  { id: '5', client: 'Acme Corp', number: 'INV-1045', amount: 6100, status: 'paid', date: '2026-02-15' },
  { id: '6', client: 'Globex Inc', number: 'INV-1046', amount: 9400, status: 'pending', date: '2026-02-01' },
];

type PayoutStatus = 'completed' | 'pending' | 'processing';

interface Payout {
  id: string;
  partner: string;
  service: string;
  amount: number;
  date: string;
  method: string;
  status: PayoutStatus;
}

const payouts: Payout[] = [
  { id: '1', partner: 'Sarah Chen', service: 'Legal Consulting', amount: 3500, date: '2026-03-25', method: 'ACH', status: 'completed' },
  { id: '2', partner: 'Marcus Rivera', service: 'Tax Advisory', amount: 2800, date: '2026-03-18', method: 'Wire', status: 'pending' },
  { id: '3', partner: 'Emily Nakamura', service: 'IP Strategy', amount: 4200, date: '2026-03-10', method: 'ACH', status: 'processing' },
];

const paymentMethods = [
  { id: '1', brand: 'Visa', last4: '4242', exp: '12/27' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    paid: 'bg-green-500/20 text-green-400',
    completed: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    overdue: 'bg-red-500/20 text-red-400',
    processing: 'bg-blue-500/20 text-blue-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] ?? 'bg-chamber-700 text-chamber-300'}`}>
      {status}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BillingPage() {
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | InvoiceStatus>('');

  const uniqueClients = Array.from(new Set(invoices.map((i) => i.client)));

  const filteredInvoices = invoices.filter((inv) => {
    if (clientFilter && inv.client !== clientFilter) return false;
    if (statusFilter && inv.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-chamber-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
        Billing
      </h1>
      <p className="text-chamber-400 mb-8">
        Manage your plan, invoices, partner payouts, and payment methods.
      </p>

      {/* ============================================================ */}
      {/*  Panel 1 — Current Plan                                      */}
      {/* ============================================================ */}
      <section className="bg-chamber-900 rounded-xl border border-chamber-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/20">
            <CreditCard className="h-4 w-4 text-gold-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Current Plan</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-chamber-400">Plan</p>
            <p className="text-xl font-bold text-white">{currentPlan.name}</p>
          </div>
          <div>
            <p className="text-sm text-chamber-400">Seats</p>
            <p className="text-xl font-bold text-white">{currentPlan.seats}</p>
          </div>
          <div>
            <p className="text-sm text-chamber-400">Monthly Price</p>
            <p className="text-xl font-bold text-white">{usd(currentPlan.price)}/mo</p>
          </div>
          <div>
            <p className="text-sm text-chamber-400">Renewal Date</p>
            <p className="text-xl font-bold text-white">{currentPlan.renewal}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-chamber-950 hover:bg-gold-300 transition">
            <ChevronUp className="h-4 w-4" /> Upgrade Plan
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-chamber-700 px-4 py-2 text-sm font-semibold text-chamber-300 hover:border-chamber-500 hover:text-white transition">
            <ChevronDown className="h-4 w-4" /> Downgrade Plan
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Panel 2 — Invoices                                          */}
      {/* ============================================================ */}
      <section className="bg-chamber-900 rounded-xl border border-chamber-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/20">
            <FileText className="h-4 w-4 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Invoices</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-chamber-500" />
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="appearance-none rounded-lg border border-chamber-700 bg-chamber-800 pl-9 pr-8 py-2 text-sm text-chamber-200 focus:border-gold-400 focus:outline-none"
            >
              <option value="">All Clients</option>
              {uniqueClients.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | InvoiceStatus)}
            className="appearance-none rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-sm text-chamber-200 focus:border-gold-400 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-chamber-800 text-chamber-400">
                <th className="pb-3 pr-4 font-medium">Client</th>
                <th className="pb-3 pr-4 font-medium">Invoice #</th>
                <th className="pb-3 pr-4 font-medium">Amount</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-chamber-500">
                    No invoices match the current filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition-colors">
                    <td className="py-3 pr-4 text-white">{inv.client}</td>
                    <td className="py-3 pr-4 text-chamber-300 font-mono">{inv.number}</td>
                    <td className="py-3 pr-4 text-white">{usd(inv.amount)}</td>
                    <td className="py-3 pr-4">{statusBadge(inv.status)}</td>
                    <td className="py-3 pr-4 text-chamber-400">{inv.date}</td>
                    <td className="py-3">
                      <button className="inline-flex items-center gap-1.5 text-gold-400 hover:text-gold-300 text-sm transition">
                        View <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Panel 3 — Partner Payouts                                   */}
      {/* ============================================================ */}
      <section className="bg-chamber-900 rounded-xl border border-chamber-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-400/20">
            <DollarSign className="h-4 w-4 text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Partner Payouts</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-chamber-800 text-chamber-400">
                <th className="pb-3 pr-4 font-medium">Partner</th>
                <th className="pb-3 pr-4 font-medium">Service</th>
                <th className="pb-3 pr-4 font-medium">Amount</th>
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Method</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition-colors">
                  <td className="py-3 pr-4 text-white">{p.partner}</td>
                  <td className="py-3 pr-4 text-chamber-300">{p.service}</td>
                  <td className="py-3 pr-4 text-white">{usd(p.amount)}</td>
                  <td className="py-3 pr-4 text-chamber-400">{p.date}</td>
                  <td className="py-3 pr-4 text-chamber-300">{p.method}</td>
                  <td className="py-3">{statusBadge(p.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5">
          <button className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 transition">
            <Send className="h-4 w-4" /> Process Payout
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Payment Methods                                             */}
      {/* ============================================================ */}
      <section className="bg-chamber-900 rounded-xl border border-chamber-800 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-400/20">
            <CreditCard className="h-4 w-4 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Payment Methods</h2>
        </div>

        <div className="space-y-3 mb-5">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="flex items-center justify-between rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-chamber-400" />
                <div>
                  <p className="text-sm font-medium text-white">
                    {pm.brand} ending in {pm.last4}
                  </p>
                  <p className="text-xs text-chamber-400">Expires {pm.exp}</p>
                </div>
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-red-800/50 px-3 py-1.5 text-xs font-medium text-red-400 hover:border-red-600 hover:bg-red-950/40 transition">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          ))}
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg border border-chamber-700 px-4 py-2 text-sm font-semibold text-chamber-300 hover:border-gold-400/50 hover:text-white transition">
          <Plus className="h-4 w-4" /> Add Payment Method
        </button>
      </section>
    </div>
  );
}
