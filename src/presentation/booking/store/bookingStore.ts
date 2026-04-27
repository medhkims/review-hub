import { create } from 'zustand';
import { BookingConfigEntity } from '@/domain/booking/entities/bookingConfigEntity';
import { BookingRequestEntity } from '@/domain/booking/entities/bookingRequestEntity';

interface BookingState {
  config: BookingConfigEntity | null;
  requests: BookingRequestEntity[];
  isLoading: boolean;
  error: string | null;
  setConfig: (config: BookingConfigEntity | null) => void;
  setRequests: (requests: BookingRequestEntity[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  config: null,
  requests: [],
  isLoading: false,
  error: null,
  setConfig: (config) => set({ config }),
  setRequests: (requests) => set({ requests }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ config: null, requests: [], isLoading: false, error: null }),
}));
