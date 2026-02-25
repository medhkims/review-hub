import { useCallback, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { container } from '@/core/di/container';
import { SettingsEntity } from '@/domain/settings/entities/settingsEntity';
import { useTranslation } from 'react-i18next';

export const useSettings = () => {
  const { settings, isLoading, error, setSettings, setLoading, setError } = useSettingsStore();
  const { i18n } = useTranslation();

  const getSettingsUseCase = container.getSettingsUseCase;
  const updateSettingsUseCase = container.updateSettingsUseCase;

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const result = await getSettingsUseCase.execute();
    result.fold(
      (failure) => setError(failure.message),
      (loadedSettings) => {
        setSettings(loadedSettings);
        // Apply language
        if (loadedSettings.language !== i18n.language) {
          i18n.changeLanguage(loadedSettings.language);
        }
      }
    );
    setLoading(false);
  }, []);

  const updateSettings = useCallback(async (partialSettings: Partial<SettingsEntity>) => {
    setLoading(true);
    const result = await updateSettingsUseCase.execute(partialSettings);
    result.fold(
      (failure) => setError(failure.message),
      (updatedSettings) => {
        setSettings(updatedSettings);
        // Apply language change if needed
        if (partialSettings.language && partialSettings.language !== i18n.language) {
          i18n.changeLanguage(partialSettings.language);
        }
      }
    );
    setLoading(false);
  }, []);

  const toggleNotifications = useCallback(async (enabled: boolean) => {
    await updateSettings({ notificationsEnabled: enabled });
  }, [updateSettings]);

  const toggleDarkMode = useCallback(async (enabled: boolean) => {
    const theme = enabled ? 'dark' : 'light';
    await updateSettings({ theme });
  }, [updateSettings]);

  const changeLanguage = useCallback(async (language: string) => {
    await updateSettings({ language });
  }, [updateSettings]);

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    updateSettings,
    toggleNotifications,
    toggleDarkMode,
    changeLanguage,
  };
};
