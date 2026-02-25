import { create } from 'zustand';
import { ProfileEntity } from '@/domain/profile/entities/profileEntity';

interface AdminState {
  users: ProfileEntity[];
  totalUsers: number;
  isLoading: boolean;
  error: string | null;
  setUsers: (users: ProfileEntity[]) => void;
  setTotalUsers: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  totalUsers: 0,
  isLoading: false,
  error: null,
  setUsers: (users) => set({ users, error: null }),
  setTotalUsers: (totalUsers) => set({ totalUsers }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ users: [], totalUsers: 0, isLoading: false, error: null }),
}));
