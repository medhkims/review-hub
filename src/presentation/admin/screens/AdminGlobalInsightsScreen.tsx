import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { container } from '@/core/di/container';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { AdminMenuButton } from '../components/AdminMenuButton';
import { GlobalInsightsStatCard } from '../components/GlobalInsightsStatCard';
import { Top5CompaniesSection } from '../components/Top5CompaniesSection';
import { UserActivitySection } from '../components/UserActivitySection';
import { ReviewsSentimentSection } from '../components/ReviewsSentimentSection';
import { SystemHealthSection } from '../components/SystemHealthSection';
import { ConversionMetricsSection } from '../components/ConversionMetricsSection';
import { GeographicalInsightsSection } from '../components/GeographicalInsightsSection';
import type {
  AdminStatItem,
  TopCompanyItem,
  UserActivityMetrics,
  SentimentData,
  SystemHealthData,
  ConversionData,
  GeoRegion,
} from '@/data/admin/datasources/adminInsightsRemoteDataSource';

// ── Types ────────────────────────────────────────────────────────────────────
type TabKey = 'COMPANY' | 'MODERATOR' | 'GLOBAL';
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TABS: TabKey[] = ['COMPANY', 'MODERATOR', 'GLOBAL'];

const STAT_META: { labelKey: string; icon: IconName; accent: string }[] = [
  { labelKey: 'totalCompanies',  icon: 'domain',          accent: colors.neonPurple },
  { labelKey: 'registeredUsers', icon: 'account-group',   accent: colors.blue },
  { labelKey: 'totalVisits',     icon: 'eye',             accent: colors.green },
  { labelKey: 'totalSearches',   icon: 'magnify',         accent: colors.cyan },
  { labelKey: 'totalReviews',    icon: 'star',            accent: colors.orange },
  { labelKey: 'activeCompanies', icon: 'check-circle',    accent: colors.pink },
  { labelKey: 'premiumSubs',     icon: 'check-decagram',  accent: colors.emerald },
  { labelKey: 'boostedAds',      icon: 'bullhorn',        accent: colors.yellow },
];

function fmtNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ── Inline Components ────────────────────────────────────────────────────────
interface TabPillProps { label: string; active: boolean; onPress: () => void }
const TabPill: React.FC<TabPillProps> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityLabel={label}
    accessibilityState={{ selected: active }}
    style={{
      flex: 1, borderRadius: 9999, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 4,
      alignItems: 'center', justifyContent: 'center',
      borderColor: active ? colors.neonPurple : colors.borderDark,
      backgroundColor: active ? `${colors.neonPurple}1A` : colors.cardDark,
    }}
  >
    <AppText style={{ fontSize: 11, fontWeight: active ? '700' : '500', color: active ? colors.neonPurple : colors.textSlate400, textAlign: 'center' }}>
      {label}
    </AppText>
  </Pressable>
);

interface GlobalGrowthSectionProps { title: string; viewReportLabel: string; onViewReport?: () => void }
const GlobalGrowthSection: React.FC<GlobalGrowthSectionProps> = ({ title, viewReportLabel, onViewReport }) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
    <View style={{ backgroundColor: colors.cardDark, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>{title}</AppText>
        <Pressable onPress={onViewReport} accessibilityRole="button" accessibilityLabel={viewReportLabel}>
          <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.neonPurple }}>{viewReportLabel}</AppText>
        </Pressable>
      </View>
      <View style={{ height: 60, justifyContent: 'flex-end' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 50 }}>
          {[30, 45, 35, 55, 40, 60, 50, 70, 65, 80, 72, 90].map((h, i) => (
            <View key={`bar-${i}`} style={{ flex: 1, height: `${h}%`, backgroundColor: i >= 10 ? colors.neonPurple : `${colors.neonPurple}4D`, borderRadius: 2 }} />
          ))}
        </View>
      </View>
    </View>
  </View>
);

interface SearchTermsSectionProps { title: string; terms: string[]; seeAllLabel: string; onSeeAll?: () => void }
const SearchTermsSection: React.FC<SearchTermsSectionProps> = ({ title, terms, seeAllLabel, onSeeAll }) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
    <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 12 }}>{title}</AppText>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {terms.map((term) => (
        <View key={term} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999, backgroundColor: `${colors.neonPurple}0D`, borderWidth: 1, borderColor: `${colors.neonPurple}33` }}>
          <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.neonPurple }}>{term}</AppText>
        </View>
      ))}
      <Pressable onPress={onSeeAll} accessibilityRole="button" accessibilityLabel={seeAllLabel}
        style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: colors.borderDark }}>
        <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.textSlate400 }}>{seeAllLabel}</AppText>
      </Pressable>
    </View>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function AdminGlobalInsightsScreen() {
  useAnalyticsScreen(AnalyticsScreens.ADMIN_GLOBAL_INSIGHTS);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('GLOBAL');
  const [loading, setLoading] = useState(true);

  // Data state
  const [stats, setStats] = useState<AdminStatItem[]>([]);
  const [topCompanies, setTopCompanies] = useState<TopCompanyItem[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityMetrics | null>(null);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [conversion, setConversion] = useState<ConversionData | null>(null);
  const [geoRegions, setGeoRegions] = useState<GeoRegion[]>([]);

  const ds = container.adminInsightsDataSource;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, tc, ua, st, se, sh, cm, gr] = await Promise.all([
        ds.fetchPlatformStats(),
        ds.fetchTopCompanies(5),
        ds.fetchUserActivity(),
        ds.fetchTopSearchTerms(10),
        ds.fetchSentiment(),
        ds.fetchSystemHealth(),
        ds.fetchConversionMetrics(),
        ds.fetchGeoDistribution(),
      ]);
      setStats(s);
      setTopCompanies(tc);
      setUserActivity(ua);
      setSearchTerms(st);
      setSentiment(se);
      setHealth(sh);
      setConversion(cm);
      setGeoRegions(gr);
    } catch { /* silently fail — sections show zero */ }
    finally { setLoading(false); }
  }, [ds]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleTabPress = useCallback((tab: TabKey) => { setActiveTab(tab); }, []);

  const T = (key: string, fallback: string): string =>
    t(`admin.globalInsights.${key}`, { defaultValue: fallback });

  // Build stat grid from real data
  const statGrid = STAT_META.map((meta) => {
    const match = stats.find(s => s.label === meta.labelKey);
    return { ...meta, value: match ? fmtNumber(match.value) : '—' };
  });

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <AdminMenuButton />
            <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white }}>
              {'Hello, '}
              <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.neonPurple }}>
                {t('roles.admin', { defaultValue: 'Admin' })}
              </AppText>
            </AppText>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t('notifications.title', { defaultValue: 'Notifications' })} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textSlate400} />
            <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red, shadowColor: colors.red, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4 }} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardDark, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12 }}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textSlate400} />
            <TextInput
              placeholder={T('searchPlaceholder', 'Search insights...')}
              placeholderTextColor={colors.textSlate500}
              style={{ flex: 1, paddingVertical: 12, paddingLeft: 8, fontSize: 14, color: colors.textSlate200 }}
              accessibilityLabel={T('searchPlaceholder', 'Search insights...')}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 }}>
          {TABS.map((tab) => (
            <TabPill key={tab} label={T(tab.toLowerCase(), tab)} active={activeTab === tab} onPress={() => handleTabPress(tab)} />
          ))}
        </View>

        {loading && <ActivityIndicator size="large" color={colors.neonPurple} style={{ marginTop: 40 }} />}

        {!loading && (
          <>
            {/* Stat Cards Grid */}
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <SectionHeader title={T('title', 'Global Insights')} />
            </View>

            {[0, 2, 4, 6].map((startIndex) => (
              <View key={`row-${startIndex}`} style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10 }}>
                <GlobalInsightsStatCard
                  label={T(statGrid[startIndex].labelKey, statGrid[startIndex].labelKey)}
                  value={statGrid[startIndex].value}
                  icon={statGrid[startIndex].icon}
                  accent={statGrid[startIndex].accent}
                />
                <GlobalInsightsStatCard
                  label={T(statGrid[startIndex + 1].labelKey, statGrid[startIndex + 1].labelKey)}
                  value={statGrid[startIndex + 1].value}
                  icon={statGrid[startIndex + 1].icon}
                  accent={statGrid[startIndex + 1].accent}
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
              companies={topCompanies.map(c => ({
                ...c,
                views: fmtNumber(c.views),
              }))}
            />

            {/* User Activity */}
            {userActivity && (
              <UserActivitySection
                title={T('userActivity', 'User Activity')}
                avgSessionLabel={T('totalUsers', 'Total Users')}
                avgSessionValue={fmtNumber(userActivity.totalUsers)}
                metrics={[
                  { label: T('dailyActive', 'DAILY ACTIVE'), value: fmtNumber(userActivity.recentDayUsers), accent: colors.neonPurple },
                  { label: T('weeklyActive', 'WEEKLY ACTIVE'), value: fmtNumber(userActivity.recentWeekUsers), accent: colors.blue },
                  { label: T('monthlyActive', 'MONTHLY ACTIVE'), value: fmtNumber(userActivity.recentMonthUsers), accent: colors.green },
                  { label: T('totalUsers', 'TOTAL USERS'), value: fmtNumber(userActivity.totalUsers), accent: colors.orange },
                ]}
              />
            )}

            {/* Search Terms */}
            {searchTerms.length > 0 && (
              <SearchTermsSection
                title={T('searchTerms', 'Most Common Search Terms')}
                terms={searchTerms}
                seeAllLabel={T('seeAll', 'See all')}
              />
            )}

            {/* Reviews & Sentiment */}
            {sentiment && (
              <ReviewsSentimentSection
                title={T('reviewsSentiment', 'Reviews & Sentiment')}
                totalReviewsLabel={T('totalReviews', 'Total Reviews')}
                totalReviewsValue={fmtNumber(sentiment.totalReviews)}
                flaggedLabel={T('flagged', 'Flagged')}
                flaggedValue={String(sentiment.flaggedCount)}
                sentimentBars={[
                  { label: T('positive', 'Positive'), percentage: sentiment.positivePercent, color: colors.green },
                  { label: T('neutral', 'Neutral'), percentage: sentiment.neutralPercent, color: colors.yellow },
                  { label: T('negative', 'Negative'), percentage: sentiment.negativePercent, color: colors.red },
                ]}
                moreDetailsLabel={T('moreDetails', 'More Details')}
              />
            )}

            {/* System Health */}
            {health && (
              <SystemHealthSection
                title={T('systemHealth', 'System Health')}
                items={[
                  { label: T('pendingApprovals', 'Pending Approvals'), value: health.pendingBusinesses, icon: 'clock-check-outline' as IconName, accent: colors.orange },
                  { label: T('moderationBacklog', 'Pending Reviews'), value: health.pendingReviews, icon: 'shield-alert-outline' as IconName, accent: colors.red },
                  { label: T('reportedIssues', 'Reported Issues'), value: health.reportedIssues, icon: 'alert-circle-outline' as IconName, accent: colors.yellow },
                ]}
              />
            )}

            {/* Conversion Metrics */}
            {conversion && (
              <ConversionMetricsSection
                title={T('conversionMetrics', 'Conversion Metrics')}
                metrics={[
                  { label: T('verifiedRate', 'Verified Rate'), value: `${conversion.verifiedRate}%`, change: '', positive: true },
                  { label: T('freeToPremium', 'Free to Premium'), value: `${conversion.premiumRate}%`, change: '', positive: true },
                ]}
              />
            )}

            {/* Geographical Insights */}
            {geoRegions.length > 0 && (
              <GeographicalInsightsSection
                title={T('geographicalInsights', 'Geographical Insights')}
                topRegionsLabel={T('topRegions', 'TOP REGIONS')}
                distributionLabel={T('distributionByGov', 'DISTRIBUTION BY GOVERNORATE')}
                regions={geoRegions.slice(0, 4).map((r, i) => ({
                  name: r.name,
                  percentage: r.percentage,
                  color: [colors.neonPurple, colors.blue, colors.green, colors.orange][i % 4],
                }))}
                distributions={geoRegions.map((r, i) => ({
                  name: r.name,
                  percentage: r.percentage,
                  color: [colors.neonPurple, colors.blue, colors.green, colors.orange, colors.pink, colors.cyan, colors.yellow, colors.red][i % 8],
                }))}
              />
            )}
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
