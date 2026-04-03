import { create } from 'zustand';
import api from '@/lib/api';
import type { Client, PaginatedResponse } from '@/types';

interface ClientsStore {
  clients: Client[];
  selectedClient: Client | null;
  isLoading: boolean;
  error: string | null;

  fetchClients: () => Promise<void>;
  fetchClient: (id: string) => Promise<void>;
  createClient: (data: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<Client>;
}

export const useClientsStore = create<ClientsStore>((set) => ({
  clients: [],
  selectedClient: null,
  isLoading: false,
  error: null,

  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<PaginatedResponse<Client>>(
        '/api/v1/clients',
      );
      set({ clients: data.items });
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch clients';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchClient: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Client>(`/api/v1/clients/${id}`);
      set({ selectedClient: data });
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch client';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createClient: async (data: Partial<Client>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: created } = await api.post<Client>(
        '/api/v1/clients',
        data,
      );
      set((state) => ({ clients: [created, ...state.clients] }));
      return created;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to create client';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateClient: async (id: string, data: Partial<Client>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updated } = await api.put<Client>(
        `/api/v1/clients/${id}`,
        data,
      );
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? updated : c)),
        selectedClient:
          state.selectedClient?.id === id ? updated : state.selectedClient,
      }));
      return updated;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to update client';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
