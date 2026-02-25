import { create } from 'zustand';
import { BusinessDetailEntity } from '@/domain/business/entities/businessDetailEntity';

interface BusinessOwnerState {
  business: BusinessDetailEntity | null;
  isLoading: boolean;
  error: string | null;
  setBusiness: (business: BusinessDetailEntity | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useBusinessOwnerStore = create<BusinessOwnerState>((set) => ({
  business: null,
  isLoading: false,
  error: null,
  setBusiness: (business) => set({ business, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ business: null, isLoading: false, error: null }),
}));
