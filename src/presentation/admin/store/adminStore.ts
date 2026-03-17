import { create } from 'zustand';
import { AdminDashboardStats } from '@/domain/admin/entities/adminDashboardEntity';

interface AdminState {
  stats: AdminDashboardStats | null;
  isLoading: boolean;
  error: string | null;
  setStats: (stats: AdminDashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  setStats: (stats) => set({ stats, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ stats: null, isLoading: false, error: null }),
}));
