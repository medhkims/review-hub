import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { AdminMenuButton } from '../components/AdminMenuButton';
import { ManageTrendingScreen } from './ManageTrendingScreen';
import { ManageWeeklyPicksScreen } from './ManageWeeklyPicksScreen';

type SubTab = null | 'trending' | 'weeklyPicks';

export function UserFeedScreen() {
  const { t } = useTranslation();
  const [subTab, setSubTab] = useState<SubTab>(null);

  if (subTab === 'trending') {
    return <ManageTrendingScreen onBack={() => setSubTab(null)} />;
  }

  if (subTab === 'weeklyPicks') {
    return <ManageWeeklyPicksScreen onBack={() => setSubTab(null)} />;
  }

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          gap: 14,
        }}
      >
        <AdminMenuButton />
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </Pressable>
        <AppText style={{ fontSize: 20, fontWeight: '800', color: colors.white, flex: 1 }}>
          {t('admin.userFeed.title')}
        </AppText>
      </View>

      {/* Two-card landing */}
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Card: Trending */}
        <Pressable
          onPress={() => setSubTab('trending')}
          accessibilityRole="button"
          accessibilityLabel={t('admin.userFeed.trendingTitle')}
          style={({ pressed }) => ({
            backgroundColor: colors.cardDark,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.borderDark,
            padding: 28,
            alignItems: 'center',
            gap: 12,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View
            style={{
              width: 72, height: 72, borderRadius: 20,
              backgroundColor: 'rgba(249,115,22,0.18)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="fire" size={36} color="#F97316" />
          </View>
          <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.textWhite }}>
            {t('admin.userFeed.trendingTitle')}
          </AppText>
          <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center' }}>
            {t('admin.userFeed.trendingDesc')}
          </AppText>
          <View
            style={{
              marginTop: 4, backgroundColor: 'rgba(249,115,22,0.15)',
              borderRadius: 10, paddingHorizontal: 18, paddingVertical: 8,
              borderWidth: 1, borderColor: '#F97316',
            }}
          >
            <AppText style={{ color: '#F97316', fontWeight: '600', fontSize: 14 }}>
              {t('admin.userFeed.manage')} →
            </AppText>
          </View>
        </Pressable>

        {/* Card: Weekly Picks */}
        <Pressable
          onPress={() => setSubTab('weeklyPicks')}
          accessibilityRole="button"
          accessibilityLabel={t('admin.userFeed.weeklyPicksTitle')}
          style={({ pressed }) => ({
            backgroundColor: colors.cardDark,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.borderDark,
            padding: 28,
            alignItems: 'center',
            gap: 12,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View
            style={{
              width: 72, height: 72, borderRadius: 20,
              backgroundColor: 'rgba(234,179,8,0.18)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="crown-outline" size={36} color="#EAB308" />
          </View>
          <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.textWhite }}>
            {t('admin.userFeed.weeklyPicksTitle')}
          </AppText>
          <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center' }}>
            {t('admin.userFeed.weeklyPicksDesc')}
          </AppText>
          <View
            style={{
              marginTop: 4, backgroundColor: 'rgba(234,179,8,0.12)',
              borderRadius: 10, paddingHorizontal: 18, paddingVertical: 8,
              borderWidth: 1, borderColor: '#EAB308',
            }}
          >
            <AppText style={{ color: '#EAB308', fontWeight: '600', fontSize: 14 }}>
              {t('admin.userFeed.manage')} →
            </AppText>
          </View>
        </Pressable>
      </ScrollView>
    </ScreenLayout>
  );
}
