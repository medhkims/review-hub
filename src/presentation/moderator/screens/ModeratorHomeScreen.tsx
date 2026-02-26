import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { Card } from '@/presentation/shared/components/ui/Card';
import { colors } from '@/core/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_MODERATORS = [
  { rank: 1, name: 'Sarah Jenkins', companies: 45, users: 120, points: '2.4k', reviews: 310 },
  { rank: 2, name: 'Mike Ross', companies: 38, users: 95, points: '1.9k', reviews: 280 },
  { rank: 3, name: 'Amel Ben', companies: 32, users: 88, points: '1.6k', reviews: 215 },
  { rank: 4, name: 'Karim Harbi', companies: 28, users: 74, points: '1.4k', reviews: 190 },
  { rank: 5, name: 'Lina Trabelsi', companies: 20, users: 65, points: '1.1k', reviews: 145 },
];

type Tab = 'COMPANY' | 'MODERATOR' | 'GLOBAL';

const TABS: Tab[] = ['COMPANY', 'MODERATOR', 'GLOBAL'];

// ---------------------------------------------------------------------------
// Inline Components
// ---------------------------------------------------------------------------

interface TabPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const TabPill: React.FC<TabPillProps> = ({ label, isActive, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} tab`}
      accessibilityState={{ selected: isActive }}
      style={{
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: isActive ? colors.neonPurple : 'transparent',
        borderWidth: isActive ? 0 : 1,
        borderColor: colors.borderDark,
      }}
    >
      <AppText
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: isActive ? colors.white : colors.textSlate400,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

interface ModeratorRowProps {
  rank: number;
  name: string;
  companies: number;
  users: number;
  points: string;
  reviews: number;
}

const ModeratorRow: React.FC<ModeratorRowProps> = ({
  rank,
  name,
  companies,
  users,
  points,
  reviews,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: rank < 5 ? 1 : 0,
        borderBottomColor: `${colors.borderDark}50`,
      }}
    >
      {/* Rank Number */}
      <AppText
        style={{
          fontSize: 22,
          fontWeight: '800',
          color: colors.textSlate400,
          width: 28,
          textAlign: 'center',
        }}
      >
        {rank}
      </AppText>

      {/* Avatar Circle */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${colors.neonPurple}30`,
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 10,
          marginRight: 12,
        }}
      >
        <MaterialCommunityIcons name="account" size={22} color={colors.neonPurple} />
      </View>

      {/* Name + Metrics */}
      <View style={{ flex: 1 }}>
        <AppText
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: colors.white,
            marginBottom: 6,
          }}
        >
          {name}
        </AppText>

        {/* Metric columns */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center' }}>
            <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }}>
              {companies}
            </AppText>
            <AppText style={{ fontSize: 9, fontWeight: '500', color: colors.textSlate500, letterSpacing: 0.3 }}>
              COMPANIES
            </AppText>
          </View>

          <View style={{ alignItems: 'center' }}>
            <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }}>
              {users}
            </AppText>
            <AppText style={{ fontSize: 9, fontWeight: '500', color: colors.textSlate500, letterSpacing: 0.3 }}>
              USERS
            </AppText>
          </View>

          <View style={{ alignItems: 'center' }}>
            <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.neonPurple }}>
              {points}
            </AppText>
            <AppText style={{ fontSize: 9, fontWeight: '500', color: colors.textSlate500, letterSpacing: 0.3 }}>
              POINTS
            </AppText>
          </View>

          <View style={{ alignItems: 'center' }}>
            <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.neonPurple }}>
              {reviews}
            </AppText>
            <AppText style={{ fontSize: 9, fontWeight: '500', color: colors.textSlate500, letterSpacing: 0.3 }}>
              REVIEWS
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function ModeratorHomeScreen() {
  useAnalyticsScreen(AnalyticsScreens.MODERATOR_DASHBOARD);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('MODERATOR');
  const [searchText, setSearchText] = useState('');

  const handleTabPress = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Header Row ────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 16,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: colors.warning,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons name="account" size={24} color={colors.midnight} />
          </View>

          {/* Welcome text */}
          <View style={{ flex: 1 }}>
            <AppText
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.white,
              }}
            >
              {t('moderator.home.welcomeTitle', { defaultValue: 'Welcome back, Moderator' })}
            </AppText>
          </View>

          {/* Notification bell */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('moderator.home.notifications', { defaultValue: 'Notifications' })}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.cardDark,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.white} />
          </Pressable>
        </View>

        {/* ── Search Bar Row ────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 16,
            gap: 10,
          }}
        >
          {/* Search input */}
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.cardDark,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.borderDark,
              paddingHorizontal: 12,
              height: 44,
            }}
          >
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textSlate400} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t('moderator.home.searchPlaceholder', { defaultValue: 'Search...' })}
              placeholderTextColor={colors.textSlate500}
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 14,
                color: colors.white,
              }}
              accessibilityLabel={t('moderator.home.searchPlaceholder', { defaultValue: 'Search...' })}
            />
          </View>

          {/* Filter icon */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('moderator.home.filter', { defaultValue: 'Filter' })}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: colors.cardDark,
              borderWidth: 1,
              borderColor: colors.borderDark,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialCommunityIcons name="tune-variant" size={20} color={colors.textSlate400} />
          </Pressable>

          {/* Calendar icon */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('moderator.home.calendar', { defaultValue: 'Calendar' })}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: colors.cardDark,
              borderWidth: 1,
              borderColor: colors.borderDark,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialCommunityIcons name="calendar-outline" size={20} color={colors.textSlate400} />
          </Pressable>
        </View>

        {/* ── Tab Pills ─────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            marginBottom: 24,
            gap: 10,
          }}
        >
          {TABS.map((tab) => (
            <TabPill
              key={tab}
              label={tab}
              isActive={activeTab === tab}
              onPress={() => handleTabPress(tab)}
            />
          ))}
        </View>

        {/* ── Insights Dashboard ────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title={t('moderator.home.insightsDashboard', { defaultValue: 'Insights Dashboard' })} />

          {/* Total Moderators Card */}
          <Card style={{ padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <AppText
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: colors.textSlate400,
                    letterSpacing: 0.8,
                    marginBottom: 8,
                  }}
                >
                  {t('moderator.home.totalModerators', { defaultValue: 'TOTAL MODERATORS' })}
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <AppText style={{ fontSize: 32, fontWeight: '800', color: colors.white }}>
                    124
                  </AppText>
                  <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.success }}>
                    +5%
                  </AppText>
                </View>
              </View>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: `${colors.neonPurple}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MaterialCommunityIcons name="account-group" size={20} color={colors.neonPurple} />
              </View>
            </View>
          </Card>

          {/* Flagged Moderators Card */}
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <AppText
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: colors.textSlate400,
                    letterSpacing: 0.8,
                    marginBottom: 8,
                  }}
                >
                  {t('moderator.home.flaggedModerators', { defaultValue: 'FLAGGED MODERATORS' })}
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <AppText style={{ fontSize: 32, fontWeight: '800', color: colors.white }}>
                    8
                  </AppText>
                  <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.success }}>
                    +2%
                  </AppText>
                </View>
              </View>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: `${colors.error}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MaterialCommunityIcons name="flag" size={20} color={colors.error} />
              </View>
            </View>
          </Card>
        </View>

        {/* ── Moderator Ranking ─────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title={t('moderator.home.moderatorRanking', { defaultValue: 'MODERATOR RANKING' })} />

          <Card>
            {MOCK_MODERATORS.map((moderator) => (
              <ModeratorRow
                key={moderator.rank}
                rank={moderator.rank}
                name={moderator.name}
                companies={moderator.companies}
                users={moderator.users}
                points={moderator.points}
                reviews={moderator.reviews}
              />
            ))}
          </Card>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
