import { create } from 'zustand';
import api from '@/lib/api';
import type { Playbook } from '@/types';

interface PlaybookActivation {
  id: string;
  playbook_id: string;
  status: 'active' | 'paused' | 'completed';
  current_step: number;
  total_steps: number;
  started_at: string;
  updated_at: string;
}

interface PlaybooksStore {
  playbooks: Playbook[];
  activations: PlaybookActivation[];
  isLoading: boolean;
  error: string | null;

  fetchPlaybooks: () => Promise<void>;
  activatePlaybook: (slug: string) => Promise<PlaybookActivation>;
  getProgress: (activationId: string) => Promise<PlaybookActivation>;
}

export const usePlaybooksStore = create<PlaybooksStore>((set) => ({
  playbooks: [],
  activations: [],
  isLoading: false,
  error: null,

  fetchPlaybooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Playbook[]>('/api/v1/playbooks');
      set({ playbooks: data });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to fetch playbooks';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  activatePlaybook: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<PlaybookActivation>(
        `/api/v1/playbooks/${slug}/activate`,
      );
      set((state) => ({ activations: [data, ...state.activations] }));
      return data;
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to activate playbook';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getProgress: async (activationId: string) => {
    try {
      const { data } = await api.get<PlaybookActivation>(
        `/api/v1/playbooks/activations/${activationId}`,
      );
      set((state) => ({
        activations: state.activations.map((a) =>
          a.id === activationId ? data : a,
        ),
      }));
      return data;
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to fetch progress';
      set({ error: message });
      throw err;
    }
  },
}));
