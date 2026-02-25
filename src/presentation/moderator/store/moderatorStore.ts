import { create } from 'zustand';

interface ModeratorState {
  pendingCount: number;
  flaggedCount: number;
  isLoading: boolean;
  error: string | null;
  setPendingCount: (count: number) => void;
  setFlaggedCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useModeratorStore = create<ModeratorState>((set) => ({
  pendingCount: 0,
  flaggedCount: 0,
  isLoading: false,
  error: null,
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setFlaggedCount: (flaggedCount) => set({ flaggedCount }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ pendingCount: 0, flaggedCount: 0, isLoading: false, error: null }),
}));
