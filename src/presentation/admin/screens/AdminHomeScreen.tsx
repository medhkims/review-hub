import React, { useCallback } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { StatCard } from '../components/StatCard';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminHomeScreen() {
  useAnalyticsScreen(AnalyticsScreens.ADMIN_DASHBOARD);
  const { t } = useTranslation();
  const router = useRouter();
  const { totalUsers, usersByRole, recentSignups, isLoading, refresh } = useAdminDashboard();

  const handleManageUsers = useCallback(() => {
    router.push('/(main)/(admin)');
  }, [router]);

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.neonPurple}
            colors={[colors.neonPurple]}
          />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }}>
          <AppText style={{ fontSize: 28, fontWeight: '700', color: colors.white, letterSpacing: -0.5 }}>
            {t('admin.home.title')}
          </AppText>
          <AppText style={{ color: colors.textSlate400, marginTop: 4, fontSize: 14, fontWeight: '500' }}>
            {t('admin.home.subtitle')}
          </AppText>
        </View>

        {/* Stat Cards Row */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24 }}>
          <StatCard
            title={t('admin.home.totalUsers')}
            value={totalUsers}
            icon="account-group"
            color={colors.neonPurple}
          />
          <StatCard
            title={t('admin.home.activeUsers')}
            value={usersByRole.simple_user}
            icon="account-check"
            color="#22C55E"
          />
        </View>

        {/* Users by Role */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white, marginBottom: 12 }}>
            {t('admin.home.usersByRole')}
          </AppText>
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.textSlate800,
            }}
          >
            {Object.entries(usersByRole).map(([role, count]) => (
              <View
                key={role}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: role !== 'admin' ? 1 : 0,
                  borderBottomColor: colors.textSlate800,
                }}
              >
                <AppText style={{ fontSize: 14, color: colors.textSlate200, textTransform: 'capitalize' }}>
                  {t(`roles.${role}`)}
                </AppText>
                <AppText style={{ fontSize: 16, fontWeight: '600', color: colors.white }}>
                  {count}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Signups */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white, marginBottom: 12 }}>
            {t('admin.home.recentSignups')}
          </AppText>
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.textSlate800,
            }}
          >
            {recentSignups.map((signup, index) => (
              <View
                key={signup.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: index < recentSignups.length - 1 ? 1 : 0,
                  borderBottomColor: colors.textSlate800,
                }}
              >
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.white }}>
                    {signup.name}
                  </AppText>
                  <AppText style={{ fontSize: 12, color: colors.textSlate400, marginTop: 2 }}>
                    {signup.email}
                  </AppText>
                </View>
                <AppText style={{ fontSize: 11, color: colors.textSlate500 }}>
                  {signup.date}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        {/* Manage Users Button */}
        <View style={{ paddingHorizontal: 24 }}>
          <Pressable
            onPress={handleManageUsers}
            style={{
              backgroundColor: colors.neonPurple,
              borderRadius: 14,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel={t('admin.home.manageUsers')}
          >
            <MaterialCommunityIcons name="account-cog" size={20} color={colors.white} />
            <AppText style={{ fontSize: 16, fontWeight: '600', color: colors.white, marginLeft: 8 }}>
              {t('admin.home.manageUsers')}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
