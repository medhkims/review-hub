export interface SettingsModel {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  sound_enabled: boolean;
}
