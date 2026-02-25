import React, { useCallback } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { Avatar } from '@/presentation/shared/components/ui/Avatar';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { SettingRow } from '@/presentation/shared/components/ui/SettingRow';
import { useSettingsStore } from '@/presentation/settings/store/settingsStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useAuth } from '@/presentation/auth/hooks/useAuth';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

export default function SettingsScreen() {
  useAnalyticsScreen(AnalyticsScreens.SETTINGS);
  const { t } = useTranslation();
  const router = useRouter();
  const settings = useSettingsStore((state) => state.settings);
  const setSettings = useSettingsStore((state) => state.setSettings);
  const { user } = useAuthStore();
  const { signOut } = useAuth();

  const notificationsEnabled = settings?.notificationsEnabled ?? true;
  const darkModeEnabled = settings?.theme === 'dark';

  const toggleNotifications = (value: boolean) => {
    setSettings({ ...settings!, notificationsEnabled: value });
  };

  const toggleDarkMode = (value: boolean) => {
    setSettings({ ...settings!, theme: value ? 'dark' : 'light' });
  };

  const handleLogout = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navigateToPersonalInfo = useCallback(() => {
    router.push('/(main)/(profile)/personal-info');
  }, [router]);

  const displayUser = user || {
    displayName: 'Guest User',
    email: 'guest@reviewhub.app',
    avatarUrl: null,
  };

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, marginTop: 16, marginBottom: 24, width: '100%', gap: 8 }}>
          {/* Avatar — navigates to Personal Info */}
          <Pressable
            style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 24 }}
            onPress={navigateToPersonalInfo}
            accessibilityRole="button"
            accessibilityLabel={t('personalInfo.title')}
          >
            <Avatar
              imageUrl={displayUser.avatarUrl ?? null}
              size="xl"
              withGlow
              initials={getInitials(displayUser.displayName)}
            />
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <AppText
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  letterSpacing: -0.3,
                  color: colors.textWhite,
                }}
              >
                {displayUser.displayName}
              </AppText>
              <AppText
                style={{
                  color: colors.textSlate400,
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {displayUser.email}
              </AppText>
            </View>
          </Pressable>

          <SectionHeader title={t('settings.profile')} />
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(51, 65, 85, 0.3)',
              overflow: 'hidden',
              width: '100%',
            }}
          >
            <SettingRow
              iconName="account"
              iconColor="blue"
              label={t('settings.personalInfo')}
              onPress={navigateToPersonalInfo}
            />
            <SettingRow
              iconName="heart"
              iconColor="pink"
              label={t('settings.wishlist')}
              onPress={() => router.push('/(main)/(profile)/wishlist')}
            />
            <SettingRow
              iconName="shield-check"
              iconColor="green"
              label={t('settings.verifyAccount')}
              onPress={() => router.push('/(main)/(profile)/personal-info')}
              isLast
            />
          </View>

          <SectionHeader title={t('settings.settingsSection')} />
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(51, 65, 85, 0.3)',
              overflow: 'hidden',
              width: '100%',
            }}
          >
            <SettingRow
              iconName="bell"
              iconColor="indigo"
              label={t('settings.notifications')}
              rightElement="toggle"
              toggleValue={notificationsEnabled}
              onToggle={toggleNotifications}
            />
            <SettingRow
              iconName="theme-light-dark"
              iconColor="purple"
              label={t('settings.darkMode')}
              rightElement="toggle"
              toggleValue={darkModeEnabled}
              onToggle={toggleDarkMode}
            />
            <SettingRow
              iconName="translate"
              iconColor="emerald"
              label={t('settings.language')}
              value="English"
              onPress={() => {}}
              isLast
            />
          </View>

          <SectionHeader title={t('settings.support')} />
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(51, 65, 85, 0.3)',
              overflow: 'hidden',
              width: '100%',
            }}
          >
            <SettingRow
              iconName="help-circle"
              iconColor="yellow"
              label={t('settings.helpCenter')}
              rightElement="external"
              onPress={() => {}}
            />
            <SettingRow
              iconName="file-document"
              iconColor="cyan"
              label={t('settings.privacyPolicy')}
              rightElement="external"
              onPress={() => {}}
            />
            <SettingRow
              iconName="logout"
              iconColor="red"
              label={t('settings.logout')}
              onPress={handleLogout}
              variant="danger"
              isLast
            />
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
