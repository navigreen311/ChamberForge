import { create } from 'zustand';
import api from '@/lib/api';
import type { Problem, PaginatedResponse } from '@/types';

interface ProblemFilters {
  wealth_tier?: string;
  pain_category?: string;
  lifecycle_stage?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

interface ProblemsStore {
  problems: Problem[];
  selectedProblem: Problem | null;
  filters: ProblemFilters;
  total: number;
  isLoading: boolean;
  error: string | null;

  fetchProblems: (filters?: ProblemFilters) => Promise<void>;
  fetchProblem: (id: string) => Promise<void>;
  createProblem: (data: Partial<Problem>) => Promise<Problem>;
  updateProblem: (id: string, data: Partial<Problem>) => Promise<Problem>;
  deleteProblem: (id: string) => Promise<void>;
  runDiscovery: (sources: string[]) => Promise<void>;
  setFilters: (filters: ProblemFilters) => Promise<void>;
}

export const useProblemsStore = create<ProblemsStore>((set, get) => ({
  problems: [],
  selectedProblem: null,
  filters: {},
  total: 0,
  isLoading: false,
  error: null,

  fetchProblems: async (filters?: ProblemFilters) => {
    set({ isLoading: true, error: null });
    try {
      const params = filters || get().filters;
      const { data } = await api.get<PaginatedResponse<Problem>>(
        '/api/v1/problems',
        { params },
      );
      set({ problems: data.items, total: data.total });
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch problems';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProblem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Problem>(`/api/v1/problems/${id}`);
      set({ selectedProblem: data });
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch problem';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createProblem: async (data: Partial<Problem>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: created } = await api.post<Problem>(
        '/api/v1/problems',
        data,
      );
      set((state) => ({ problems: [created, ...state.problems] }));
      return created;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to create problem';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProblem: async (id: string, data: Partial<Problem>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updated } = await api.put<Problem>(
        `/api/v1/problems/${id}`,
        data,
      );
      set((state) => ({
        problems: state.problems.map((p) => (p.id === id ? updated : p)),
        selectedProblem:
          state.selectedProblem?.id === id ? updated : state.selectedProblem,
      }));
      return updated;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to update problem';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProblem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/problems/${id}`);
      set((state) => ({
        problems: state.problems.filter((p) => p.id !== id),
        selectedProblem:
          state.selectedProblem?.id === id ? null : state.selectedProblem,
      }));
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to delete problem';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  runDiscovery: async (sources: string[]) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/v1/discovery/scan', { sources });
      await get().fetchProblems();
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Discovery scan failed';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: async (filters: ProblemFilters) => {
    set({ filters });
    await get().fetchProblems(filters);
  },
}));
