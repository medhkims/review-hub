import React, { useState, useEffect } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONSENT_KEY = 'analytics_consent';

export type ConsentStatus = 'accepted' | 'declined' | null;

/** Read the persisted consent value. */
export async function getAnalyticsConsent(): Promise<ConsentStatus> {
  try {
    const value = await AsyncStorage.getItem(CONSENT_KEY);
    if (value === 'accepted' || value === 'declined') return value;
    return null;
  } catch {
    return null;
  }
}

/** Persist consent. */
export async function setAnalyticsConsent(status: 'accepted' | 'declined'): Promise<void> {
  try {
    await AsyncStorage.setItem(CONSENT_KEY, status);
  } catch {
    // Best-effort
  }
}

/**
 * Cookie / analytics consent banner shown on web only.
 * On native, Firebase Analytics is not used (web-only in this app).
 */
export const CookieConsentBanner: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    getAnalyticsConsent().then((status) => {
      if (status === null) setVisible(true);
    });
  }, []);

  if (!visible) return null;

  const handleAccept = async () => {
    await setAnalyticsConsent('accepted');
    setVisible(false);
  };

  const handleDecline = async () => {
    await setAnalyticsConsent('declined');
    setVisible(false);
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.card,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <AppText style={{ flex: 1, fontSize: 13, color: theme.textSecondary, lineHeight: 18 }}>
        {t('cookieConsent.message')}
      </AppText>
      <Pressable
        onPress={handleDecline}
        accessibilityRole="button"
        accessibilityLabel={t('cookieConsent.decline')}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary }}>
          {t('cookieConsent.decline')}
        </AppText>
      </Pressable>
      <Pressable
        onPress={handleAccept}
        accessibilityRole="button"
        accessibilityLabel={t('cookieConsent.accept')}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: colors.neonPurple,
        }}
      >
        <AppText style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>
          {t('cookieConsent.accept')}
        </AppText>
      </Pressable>
    </View>
  );
};
