import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/presentation/settings/store/settingsStore';

export const darkTheme = {
  isDark: true,
  background: '#0F172A',
  card: '#1E293B',
  border: 'rgba(51, 65, 85, 0.3)',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  toggleTrack: 'rgba(255,255,255,0.1)',
  statusBar: 'light' as const,
};

export const lightTheme = {
  isDark: false,
  background: '#F1F5F9',
  card: '#FFFFFF',
  border: 'rgba(148, 163, 184, 0.3)',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  toggleTrack: 'rgba(0,0,0,0.12)',
  statusBar: 'dark' as const,
};

export type AppTheme = Omit<typeof darkTheme, 'statusBar'> & { statusBar: 'light' | 'dark' };

export const useTheme = (): AppTheme => {
  const settings = useSettingsStore((state) => state.settings);
  const deviceScheme = useColorScheme();

  if (settings?.theme === 'light') return lightTheme;
  if (settings?.theme === 'dark') return darkTheme;

  // 'system' or null — follow the device preference
  return deviceScheme === 'light' ? lightTheme : darkTheme;
};
