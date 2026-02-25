import { create } from 'zustand';
import { SettingsEntity } from '@/domain/settings/entities/settingsEntity';

interface SettingsState {
  settings: SettingsEntity | null;
  isLoading: boolean;
  error: string | null;
  setSettings: (settings: SettingsEntity) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS: SettingsEntity = {
  language: 'en',
  theme: 'dark',
  notificationsEnabled: true,
  soundEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,
  setSettings: (settings) => set({ settings, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ settings: DEFAULT_SETTINGS, isLoading: false, error: null }),
}));
