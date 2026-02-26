import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { GlobalInsightsStatCard } from '../components/GlobalInsightsStatCard';
import { Top5CompaniesSection, MOCK_TOP_COMPANIES } from '../components/Top5CompaniesSection';
import { UserActivitySection, MOCK_USER_ACTIVITY_METRICS } from '../components/UserActivitySection';
import { ReviewsSentimentSection, MOCK_SENTIMENT_BARS } from '../components/ReviewsSentimentSection';
import { SystemHealthSection, MOCK_SYSTEM_HEALTH } from '../components/SystemHealthSection';
import { ConversionMetricsSection, MOCK_CONVERSION_METRICS } from '../components/ConversionMetricsSection';
import {
  GeographicalInsightsSection,
  MOCK_REGIONS,
  MOCK_DISTRIBUTIONS,
} from '../components/GeographicalInsightsSection';

// ── Types ────────────────────────────────────────────────────────────────────
type TabKey = 'COMPANY' | 'MODERATOR' | 'GLOBAL';
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface StatGridItem {
  labelKey: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: IconName;
  accent: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const TABS: TabKey[] = ['COMPANY', 'MODERATOR', 'GLOBAL'];

const STAT_GRID: StatGridItem[] = [
  { labelKey: 'appDownloads', value: '1.2M', change: '+12%', positive: true, icon: 'download', accent: colors.neonPurple },
  { labelKey: 'activeUsers', value: '84.5K', change: '+1.2%', positive: true, icon: 'account-group', accent: colors.blue },
  { labelKey: 'adRevenue', value: '$42.8K', change: '+18%', positive: true, icon: 'currency-usd', accent: colors.green },
  { labelKey: 'retentionRate', value: '64%', change: 'stable', positive: true, icon: 'chart-line', accent: colors.cyan },
  { labelKey: 'totalProfileVisits', value: '3.4M', icon: 'eye', accent: colors.orange },
  { labelKey: 'viewedCompanies', value: '12,402', icon: 'domain', accent: colors.pink },
  { labelKey: 'activeSubs', value: '856', icon: 'check-decagram', accent: colors.emerald },
  { labelKey: 'promotedAds', value: '142', icon: 'bullhorn', accent: colors.yellow },
];

const SEARCH_TERMS = ['Pizza', 'Dentist', 'Plumber', 'Gym', 'Mechanic', 'Hotel', 'Spa'];

// ── Inline Components ────────────────────────────────────────────────────────
interface TabPillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const TabPill: React.FC<TabPillProps> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityLabel={label}
    accessibilityState={{ selected: active }}
    style={{
      flex: 1,
      borderRadius: 9999,
      borderWidth: 1,
      paddingVertical: 10,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: active ? colors.neonPurple : colors.borderDark,
      backgroundColor: active ? `${colors.neonPurple}1A` : colors.cardDark,
    }}
  >
    <AppText
      style={{
        fontSize: 11,
        fontWeight: active ? '700' : '500',
        color: active ? colors.neonPurple : colors.textSlate400,
        textAlign: 'center',
      }}
    >
      {label}
    </AppText>
  </Pressable>
);

interface GlobalGrowthSectionProps {
  title: string;
  viewReportLabel: string;
  onViewReport?: () => void;
}

const GlobalGrowthSection: React.FC<GlobalGrowthSectionProps> = ({
  title,
  viewReportLabel,
  onViewReport,
}) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
    <View
      style={{
        backgroundColor: colors.cardDark,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>{title}</AppText>
        <Pressable
          onPress={onViewReport}
          accessibilityRole="button"
          accessibilityLabel={viewReportLabel}
        >
          <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.neonPurple }}>
            {viewReportLabel}
          </AppText>
        </Pressable>
      </View>

      {/* Mini sparkline placeholder */}
      <View style={{ height: 60, justifyContent: 'flex-end' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 50 }}>
          {[30, 45, 35, 55, 40, 60, 50, 70, 65, 80, 72, 90].map((h, i) => (
            <View
              key={`bar-${i}`}
              style={{
                flex: 1,
                height: `${h}%`,
                backgroundColor: i >= 10 ? colors.neonPurple : `${colors.neonPurple}4D`,
                borderRadius: 2,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  </View>
);

interface SearchTermsSectionProps {
  title: string;
  terms: string[];
  seeAllLabel: string;
  onSeeAll?: () => void;
}

const SearchTermsSection: React.FC<SearchTermsSectionProps> = ({
  title,
  terms,
  seeAllLabel,
  onSeeAll,
}) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
    <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 12 }}>
      {title}
    </AppText>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {terms.map((term) => (
        <View
          key={term}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 9999,
            backgroundColor: `${colors.neonPurple}0D`,
            borderWidth: 1,
            borderColor: `${colors.neonPurple}33`,
          }}
        >
          <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.neonPurple }}>{term}</AppText>
        </View>
      ))}
      <Pressable
        onPress={onSeeAll}
        accessibilityRole="button"
        accessibilityLabel={seeAllLabel}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 9999,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderWidth: 1,
          borderColor: colors.borderDark,
        }}
      >
        <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.textSlate400 }}>
          {seeAllLabel}
        </AppText>
      </Pressable>
    </View>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function AdminGlobalInsightsScreen() {
  useAnalyticsScreen(AnalyticsScreens.ADMIN_GLOBAL_INSIGHTS);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('GLOBAL');
  const handleTabPress = useCallback((tab: TabKey) => { setActiveTab(tab); }, []);

  const T = (key: string, fallback: string): string =>
    t(`admin.globalInsights.${key}`, { defaultValue: fallback });

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white }}>
            {'Hello, '}
            <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.neonPurple }}>
              {t('roles.admin', { defaultValue: 'Admin' })}
            </AppText>
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('notifications.title', { defaultValue: 'Notifications' })}
            style={{ padding: 8 }}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textSlate400} />
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.red,
                shadowColor: colors.red,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
              }}
            />
          </Pressable>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.cardDark,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              paddingHorizontal: 12,
            }}
          >
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textSlate400} />
            <TextInput
              placeholder={T('searchPlaceholder', 'Search insights...')}
              placeholderTextColor={colors.textSlate500}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingLeft: 8,
                fontSize: 14,
                color: colors.textSlate200,
              }}
              accessibilityLabel={T('searchPlaceholder', 'Search insights...')}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 }}>
          {TABS.map((tab) => (
            <TabPill
              key={tab}
              label={T(tab.toLowerCase(), tab)}
              active={activeTab === tab}
              onPress={() => handleTabPress(tab)}
            />
          ))}
        </View>

        {/* Stat Cards Grid */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <SectionHeader title={T('title', 'Global Insights')} />
        </View>

        {/* 2-column grid of stat cards */}
        {[0, 2, 4, 6].map((startIndex) => (
          <View
            key={`row-${startIndex}`}
            style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10 }}
          >
            <GlobalInsightsStatCard
              label={T(STAT_GRID[startIndex].labelKey, STAT_GRID[startIndex].labelKey)}
              value={STAT_GRID[startIndex].value}
              change={STAT_GRID[startIndex].change}
              positive={STAT_GRID[startIndex].positive}
              icon={STAT_GRID[startIndex].icon}
              accent={STAT_GRID[startIndex].accent}
            />
            <GlobalInsightsStatCard
              label={T(STAT_GRID[startIndex + 1].labelKey, STAT_GRID[startIndex + 1].labelKey)}
              value={STAT_GRID[startIndex + 1].value}
              change={STAT_GRID[startIndex + 1].change}
              positive={STAT_GRID[startIndex + 1].positive}
              icon={STAT_GRID[startIndex + 1].icon}
              accent={STAT_GRID[startIndex + 1].accent}
            />
          </View>
        ))}

        {/* Global Growth */}
        <View style={{ height: 16 }} />
        <GlobalGrowthSection
          title={T('globalGrowth', 'Global Growth')}
          viewReportLabel={T('viewReport', 'VIEW REPORT')}
        />

        {/* Top 5 Companies */}
        <Top5CompaniesSection
          title={T('topCompanies', 'Top 5 Companies')}
          seeAllLabel={T('seeAll', 'See all')}
          companies={MOCK_TOP_COMPANIES}
        />

        {/* User Activity */}
        <UserActivitySection
          title={T('userActivity', 'User Activity')}
          avgSessionLabel={T('avgSessionTime', 'Avg. Session Time')}
          avgSessionValue="12m 45s"
          metrics={MOCK_USER_ACTIVITY_METRICS.map((m, i) => ({
            ...m,
            label: T(
              ['dailyMau', 'weeklyMau', 'monthlyMau', 'yearlyYau'][i],
              m.label,
            ),
          }))}
        />

        {/* Search Terms */}
        <SearchTermsSection
          title={T('searchTerms', 'Most Common Search Terms')}
          terms={SEARCH_TERMS}
          seeAllLabel={T('seeAll', 'See all')}
        />

        {/* Reviews & Sentiment */}
        <ReviewsSentimentSection
          title={T('reviewsSentiment', 'Reviews & Sentiment')}
          totalReviewsLabel={T('totalReviews', 'Total Reviews')}
          totalReviewsValue="28.4K"
          flaggedLabel={T('flagged', 'Flagged')}
          flaggedValue="142"
          sentimentBars={MOCK_SENTIMENT_BARS.map((bar, i) => ({
            ...bar,
            label: T(
              ['positive', 'neutral', 'negative'][i],
              bar.label,
            ),
          }))}
          moreDetailsLabel={T('moreDetails', 'More Details')}
        />

        {/* System Health */}
        <SystemHealthSection
          title={T('systemHealth', 'System Health')}
          items={MOCK_SYSTEM_HEALTH.map((item, i) => ({
            ...item,
            label: T(
              ['pendingApprovals', 'moderationBacklog', 'reportedIssues'][i],
              item.label,
            ),
          }))}
        />

        {/* Conversion Metrics */}
        <ConversionMetricsSection
          title={T('conversionMetrics', 'Conversion Metrics')}
          metrics={MOCK_CONVERSION_METRICS.map((m, i) => ({
            ...m,
            label: T(
              ['profileToContact', 'freeToPremium'][i],
              m.label,
            ),
          }))}
        />

        {/* Geographical Insights */}
        <GeographicalInsightsSection
          title={T('geographicalInsights', 'Geographical Insights')}
          topRegionsLabel={T('topRegions', 'TOP REGIONS')}
          distributionLabel={T('distributionByGov', 'DISTRIBUTION BY GOVERNORATE')}
          regions={MOCK_REGIONS}
          distributions={MOCK_DISTRIBUTIONS}
        />
      </ScrollView>
    </ScreenLayout>
  );
}
