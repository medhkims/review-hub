import { useCallback, useEffect, useRef } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { container } from '@/core/di/container';
import { SettingsEntity } from '@/domain/settings/entities/settingsEntity';
import { useTranslation } from 'react-i18next';
import { AnalyticsHelper } from '@/core/analytics/analyticsHelper';
import { AnalyticsEvents, AnalyticsParams } from '@/core/analytics/analyticsKeys';

export const useSettings = () => {
  const { settings, isLoading, error, setSettings, setLoading, setError } = useSettingsStore();
  const { i18n } = useTranslation();
  const hasLoadedRef = useRef(false);

  const getSettingsUseCase = container.getSettingsUseCase;
  const updateSettingsUseCase = container.updateSettingsUseCase;

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
  }, [getSettingsUseCase, setLoading, setError, setSettings, i18n]);

  // Load settings on mount (once)
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadSettings();
    }
  }, [loadSettings]);

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
  }, [updateSettingsUseCase, setLoading, setError, setSettings, i18n]);

  const toggleNotifications = useCallback(async (enabled: boolean) => {
    AnalyticsHelper.sendEvent(AnalyticsEvents.TOGGLE_NOTIFICATIONS, {
      [AnalyticsParams.ENABLED]: enabled,
    });
    await updateSettings({ notificationsEnabled: enabled });
  }, [updateSettings]);

  const toggleDarkMode = useCallback(async (enabled: boolean) => {
    const theme = enabled ? 'dark' : 'light';
    AnalyticsHelper.sendEvent(AnalyticsEvents.TOGGLE_DARK_MODE, {
      [AnalyticsParams.THEME]: theme,
    });
    await updateSettings({ theme });
  }, [updateSettings]);

  const changeLanguage = useCallback(async (language: string) => {
    AnalyticsHelper.sendEvent(AnalyticsEvents.CHANGE_LANGUAGE, {
      [AnalyticsParams.LANGUAGE]: language,
    });
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
