import { create } from 'zustand';
import { UserEntity } from '@/domain/auth/entities/userEntity';

interface AuthState {
  user: UserEntity | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  provider: 'email' | 'google' | 'facebook' | 'apple';
  setUser: (user: UserEntity | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setProvider: (provider: 'email' | 'google' | 'facebook' | 'apple') => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  provider: 'email',
  setUser: (user) => set({ user, isAuthenticated: user !== null, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setProvider: (provider) => set({ provider }),
  reset: () => set({ user: null, isLoading: false, isAuthenticated: false, error: null, provider: 'email' }),
}));
