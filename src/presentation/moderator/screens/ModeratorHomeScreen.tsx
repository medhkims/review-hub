import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { StatCard } from '@/presentation/admin/components/StatCard';
import { useModeratorDashboard } from '../hooks/useModeratorDashboard';
import { colors } from '@/core/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ModeratorHomeScreen() {
  const { t } = useTranslation();
  const { pendingReviews, flaggedContent, recentActivity, isLoading, refresh } = useModeratorDashboard();

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
            {t('moderator.home.title')}
          </AppText>
          <AppText style={{ color: colors.textSlate400, marginTop: 4, fontSize: 14, fontWeight: '500' }}>
            {t('moderator.home.subtitle')}
          </AppText>
        </View>

        {/* Stat Cards */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24 }}>
          <StatCard
            title={t('moderator.home.pendingReviews')}
            value={pendingReviews}
            icon="clipboard-clock"
            color="#F59E0B"
          />
          <StatCard
            title={t('moderator.home.flaggedContent')}
            value={flaggedContent}
            icon="flag"
            color="#EF4444"
          />
        </View>

        {/* Recent Activity */}
        <View style={{ paddingHorizontal: 24 }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white, marginBottom: 12 }}>
            {t('moderator.home.recentActivity')}
          </AppText>
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.textSlate800,
            }}
          >
            {recentActivity.map((activity, index) => (
              <View
                key={activity.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: index < recentActivity.length - 1 ? 1 : 0,
                  borderBottomColor: colors.textSlate800,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: `${colors.neonPurple}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <MaterialCommunityIcons name="history" size={18} color={colors.neonPurple} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.white }}>
                    {activity.action}
                  </AppText>
                  <AppText style={{ fontSize: 12, color: colors.textSlate400, marginTop: 2 }}>
                    {activity.target}
                  </AppText>
                </View>
                <AppText style={{ fontSize: 11, color: colors.textSlate500 }}>
                  {activity.time}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
