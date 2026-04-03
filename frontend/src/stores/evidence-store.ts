import { create } from 'zustand';
import api from '@/lib/api';
import type { Evidence, PaginatedResponse } from '@/types';

interface EvidenceFilters {
  problem_id?: string;
  source_type?: string;
  page?: number;
  page_size?: number;
}

interface AnalystQueueItem {
  id: string;
  evidence_id: string;
  status: string;
  assigned_to?: string;
  created_at: string;
}

interface EvidenceStore {
  evidences: Evidence[];
  analystQueue: AnalystQueueItem[];
  isLoading: boolean;
  error: string | null;

  fetchEvidence: (filters?: EvidenceFilters) => Promise<void>;
  ingestSource: (text: string, type: string) => Promise<void>;
  fetchAnalystQueue: () => Promise<void>;
}

export const useEvidenceStore = create<EvidenceStore>((set) => ({
  evidences: [],
  analystQueue: [],
  isLoading: false,
  error: null,

  fetchEvidence: async (filters?: EvidenceFilters) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<PaginatedResponse<Evidence>>(
        '/api/v1/evidence',
        { params: filters },
      );
      set({ evidences: data.items });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to fetch evidence';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  ingestSource: async (text: string, type: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/v1/evidence/ingest', { text, source_type: type });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to ingest source';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAnalystQueue: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<AnalystQueueItem[]>(
        '/api/v1/evidence/analyst-queue',
      );
      set({ analystQueue: data });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to fetch analyst queue';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
