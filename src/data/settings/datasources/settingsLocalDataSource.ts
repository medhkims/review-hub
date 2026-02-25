import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsModel } from '../models/settingsModel';
import { CacheException } from '@/core/error/exceptions';

const SETTINGS_KEY = '@reviewhub:settings';

const DEFAULT_SETTINGS: SettingsModel = {
  language: 'en',
  theme: 'dark',
  notifications_enabled: true,
  sound_enabled: true,
};

export interface SettingsLocalDataSource {
  getSettings(): Promise<SettingsModel>;
  saveSettings(settings: SettingsModel): Promise<SettingsModel>;
  updateSettings(settings: Partial<SettingsModel>): Promise<SettingsModel>;
  clearSettings(): Promise<void>;
}

export class SettingsLocalDataSourceImpl implements SettingsLocalDataSource {
  async getSettings(): Promise<SettingsModel> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);

      if (settingsJson === null) {
        // First time - save and return defaults
        await this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }

      const settings = JSON.parse(settingsJson) as SettingsModel;
      return settings;
    } catch (error) {
      throw new CacheException('Failed to get settings from local storage');
    }
  }

  async saveSettings(settings: SettingsModel): Promise<SettingsModel> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return settings;
    } catch (error) {
      throw new CacheException('Failed to save settings to local storage');
    }
  }

  async updateSettings(partialSettings: Partial<SettingsModel>): Promise<SettingsModel> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings: SettingsModel = {
        ...currentSettings,
        ...partialSettings,
      };
      await this.saveSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      throw new CacheException('Failed to update settings in local storage');
    }
  }

  async clearSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      throw new CacheException('Failed to clear settings from local storage');
    }
  }
}
