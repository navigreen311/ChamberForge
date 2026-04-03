import { create } from 'zustand';
import api from '@/lib/api';

interface Subscription {
  id: string;
  client_id: string;
  client_name: string;
  offer_id: string;
  offer_name: string;
  status: 'active' | 'paused' | 'cancelled' | 'past_due';
  amount: number;
  currency: string;
  interval: 'monthly' | 'quarterly' | 'annual';
  started_at: string;
  next_billing_at: string;
}

interface Invoice {
  id: string;
  subscription_id: string;
  client_name: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  issued_at: string;
  due_at: string;
  paid_at?: string;
}

interface RevenueMetrics {
  mrr: number;
  arr: number;
  revenue_mtd: number;
  revenue_last_month: number;
  growth_rate: number;
  currency: string;
}

interface Referral {
  id: string;
  referrer_name: string;
  referee_name: string;
  status: 'pending' | 'converted' | 'expired';
  reward_amount?: number;
  created_at: string;
  converted_at?: string;
}

interface BillingStore {
  subscriptions: Subscription[];
  invoices: Invoice[];
  revenue: RevenueMetrics | null;
  referrals: Referral[];
  isLoading: boolean;
  error: string | null;

  fetchRevenue: () => Promise<void>;
  fetchSubscriptions: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchReferrals: () => Promise<void>;
}

export const useBillingStore = create<BillingStore>((set) => ({
  subscriptions: [],
  invoices: [],
  revenue: null,
  referrals: [],
  isLoading: false,
  error: null,

  fetchRevenue: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<RevenueMetrics>(
        '/api/v1/billing/revenue',
      );
      set({ revenue: data });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to fetch revenue';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSubscriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Subscription[]>(
        '/api/v1/billing/subscriptions',
      );
      set({ subscriptions: data });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to fetch subscriptions';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchInvoices: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Invoice[]>('/api/v1/billing/invoices');
      set({ invoices: data });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to fetch invoices';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchReferrals: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Referral[]>('/api/v1/billing/referrals');
      set({ referrals: data });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to fetch referrals';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
