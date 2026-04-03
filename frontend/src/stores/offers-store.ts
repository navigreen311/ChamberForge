import { create } from 'zustand';
import api from '@/lib/api';
import type { Offer, PaginatedResponse } from '@/types';

interface OffersStore {
  offers: Offer[];
  selectedOffer: Offer | null;
  isLoading: boolean;
  error: string | null;

  fetchOffers: () => Promise<void>;
  fetchOffer: (id: string) => Promise<void>;
  createOffer: (data: Partial<Offer>) => Promise<Offer>;
  generateOffer: (problemId: string) => Promise<Offer>;
  updateOffer: (id: string, data: Partial<Offer>) => Promise<Offer>;
}

export const useOffersStore = create<OffersStore>((set, get) => ({
  offers: [],
  selectedOffer: null,
  isLoading: false,
  error: null,

  fetchOffers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<PaginatedResponse<Offer>>(
        '/api/v1/offers',
      );
      set({ offers: data.items });
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch offers';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOffer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Offer>(`/api/v1/offers/${id}`);
      set({ selectedOffer: data });
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch offer';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createOffer: async (data: Partial<Offer>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: created } = await api.post<Offer>(
        '/api/v1/offers',
        data,
      );
      set((state) => ({ offers: [created, ...state.offers] }));
      return created;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to create offer';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  generateOffer: async (problemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: generated } = await api.post<Offer>(
        '/api/v1/offers/generate',
        { problem_id: problemId },
      );
      set((state) => ({ offers: [generated, ...state.offers] }));
      return generated;
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to generate offer';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateOffer: async (id: string, data: Partial<Offer>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updated } = await api.put<Offer>(
        `/api/v1/offers/${id}`,
        data,
      );
      set((state) => ({
        offers: state.offers.map((o) => (o.id === id ? updated : o)),
        selectedOffer:
          state.selectedOffer?.id === id ? updated : state.selectedOffer,
      }));
      return updated;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to update offer';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
