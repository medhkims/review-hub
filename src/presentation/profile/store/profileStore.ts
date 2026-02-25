import { create } from 'zustand';
import { ProfileEntity } from '@/domain/profile/entities/profileEntity';

interface ProfileState {
  profile: ProfileEntity | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: ProfileEntity | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  setProfile: (profile) => set({ profile, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ profile: null, isLoading: false, error: null }),
}));
