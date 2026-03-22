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
import { useSettings } from '@/presentation/settings/hooks/useSettings';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useAuth } from '@/presentation/auth/hooks/useAuth';
import { useRoleStore } from '@/presentation/auth/store/roleStore';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

export default function SettingsScreen() {
  useAnalyticsScreen(AnalyticsScreens.SETTINGS);
  const { t } = useTranslation();
  const router = useRouter();
  const settings = useSettingsStore((state) => state.settings);
  const { toggleNotifications, toggleDarkMode } = useSettings();
  const { user } = useAuthStore();
  const { signOut } = useAuth();
  const { role } = useRoleStore();
  const isAdmin = role === 'admin';
  const isAdminOrModerator = role === 'admin' || role === 'moderator';
  const theme = useTheme();

  const notificationsEnabled = settings?.notificationsEnabled ?? true;
  const darkModeEnabled = settings?.theme === 'dark';

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
    router.push('/(main)/(settings)/personal-info');
  }, [router]);

  const displayUser = user || {
    displayName: 'Guest User',
    email: 'guest@reviewhub.app',
    avatarUrl: null,
  };

  const SettingCard = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {children}
    </View>
  );

  return (
    <ScreenLayout>
      {/* Header title */}
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <AppText style={{ fontSize: 17, fontWeight: '600', color: theme.text }}>
          {t('settings.profile')}
        </AppText>
      </View>

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
                  color: theme.text,
                }}
              >
                {displayUser.displayName}
              </AppText>
              <AppText
                style={{
                  color: theme.textSecondary,
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {displayUser.email}
              </AppText>
            </View>
          </Pressable>

          <SectionHeader title={t('settings.profile')} />
          <SettingCard>
            <SettingRow iconName="account" iconColor="blue" label={t('settings.personalInfo')} onPress={navigateToPersonalInfo} isLast />
          </SettingCard>
          <SettingCard>
            <SettingRow iconName="heart" iconColor="pink" label={t('settings.wishlist')} onPress={() => router.push('/(main)/(settings)/wishlist')} isLast />
          </SettingCard>
          <SettingCard>
            <SettingRow iconName="shield-check" iconColor="green" label={t('settings.verifyAccount')} onPress={() => router.push('/(main)/(profile)/verify-account')} isLast />
          </SettingCard>
          <SettingCard>
            <SettingRow iconName="lock-reset" iconColor="orange" label={t('settings.resetPassword')} onPress={() => router.push('/(main)/(profile)/change-password')} isLast />
          </SettingCard>

          <SectionHeader title={t('settings.settingsSection')} />
          <SettingCard>
            <SettingRow iconName="bell-outline" iconColor="purple" label={t('settings.notifications')} hint={t('settings.notificationsHint')} rightElement="toggle" toggleValue={notificationsEnabled} onToggle={toggleNotifications} isLast />
          </SettingCard>
          <SettingCard>
            <SettingRow iconName="moon-waxing-crescent" iconColor="purple" label={t('settings.darkMode')} hint={t('settings.darkModeHint')} rightElement="toggle" toggleValue={darkModeEnabled} onToggle={toggleDarkMode} isLast />
          </SettingCard>

          {isAdminOrModerator && (
            <>
              <SectionHeader title={t('settings.adminSection')} />
              <SettingCard>
                <SettingRow iconName="clock-check-outline" iconColor="yellow" label={t('settings.pendingBusinesses')} onPress={() => router.push('/(main)/(settings)/pending-businesses')} isLast />
              </SettingCard>
              <SettingCard>
                <SettingRow iconName="shield-account" iconColor="green" label={t('admin.verifications.title')} onPress={() => router.push('/(main)/(settings)/admin-verifications')} isLast />
              </SettingCard>
              {isAdmin && (
                <SettingCard>
                  <SettingRow iconName="image-multiple" iconColor="purple" label={t('settings.manageBanners')} onPress={() => router.push('/(main)/(settings)/manage-banners')} isLast />
                </SettingCard>
              )}
              {isAdmin && (
                <SettingCard>
                  <SettingRow iconName="shape" iconColor="emerald" label={t('settings.manageCategories')} onPress={() => router.push('/(main)/(settings)/manage-categories')} isLast />
                </SettingCard>
              )}
              {isAdmin && (
                <SettingCard>
                  <SettingRow iconName="account-circle-outline" iconColor="cyan" label={t('settings.adminInfo')} onPress={() => router.push('/(main)/(settings)/admin-info')} isLast />
                </SettingCard>
              )}
              {isAdmin && (
                <SettingCard>
                  <SettingRow iconName="help-circle" iconColor="green" label={t('settings.manageFaq')} onPress={() => router.push('/(main)/(settings)/manage-faq')} isLast />
                </SettingCard>
              )}
              <SettingCard>
                <SettingRow iconName="shield-account" iconColor="blue" label={t('settings.adminDashboard')} onPress={() => {}} isLast />
              </SettingCard>
            </>
          )}

          <SectionHeader title={t('settings.support')} />
          <SettingCard>
            <SettingRow iconName="ticket-outline" iconColor="purple" label={t('settings.contactSupport')} onPress={() => router.push('/(main)/(settings)/support')} isLast />
          </SettingCard>
          <SettingCard>
            <SettingRow iconName="help-circle-outline" iconColor="yellow" label={t('settings.helpCenter')} onPress={() => router.push(isAdmin ? '/(main)/(settings)/manage-faq' : '/(main)/(settings)/help-center')} isLast />
          </SettingCard>
          <SettingCard>
            <SettingRow iconName="shield-outline" iconColor="cyan" label={t('settings.privacyPolicy')} onPress={() => router.push('/(main)/(settings)/privacy-policy')} isLast />
          </SettingCard>
          <SettingCard>
            <SettingRow iconName="logout-variant" iconColor="red" label={t('settings.logout')} onPress={handleLogout} variant="danger" isLast />
          </SettingCard>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
