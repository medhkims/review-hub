import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { Card } from '@/presentation/shared/components/ui/Card';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { CompanyRankItem } from '@/domain/admin/entities/adminDashboardEntity';
import { AdminMenuButton } from '../components/AdminMenuButton';

// ── Types ─────────────────────────────────────────────────────────────────────
type TabKey = 'COMPANY' | 'MODERATOR' | 'GLOBAL' | 'FINANCIAL';
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// ── Shared primitives ─────────────────────────────────────────────────────────
const AccentBar: React.FC<{ color: string; side?: 'left' | 'bottom' }> = ({ color, side = 'left' }) =>
  side === 'left' ? (
    <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: color }} />
  ) : (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: `${color}80` }} />
  );

interface TabPillProps { label: string; active: boolean; onPress: () => void }
const TabPill: React.FC<TabPillProps> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityLabel={label}
    accessibilityState={{ selected: active }}
    style={{
      flex: 1, borderRadius: 9999, borderWidth: 1, paddingVertical: 10,
      alignItems: 'center', justifyContent: 'center',
      borderColor: active ? colors.neonPurple : colors.borderDark,
      backgroundColor: active ? `${colors.neonPurple}1A` : colors.cardDark,
    }}
  >
    <AppText style={{ fontSize: 10, fontWeight: active ? '700' : '500', color: active ? colors.neonPurple : colors.textSlate400 }}>
      {label}
    </AppText>
  </Pressable>
);

interface StatCardProps { label: string; value: string; icon: IconName; accent: string; large?: boolean; onPress?: () => void }
const StatCard: React.FC<StatCardProps> = ({ label, value, icon, accent, large = false, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${label}: ${value}`}
    style={({ pressed }) => ({ flex: large ? undefined : 1, backgroundColor: colors.cardDark, borderRadius: 12, padding: large ? 20 : 16, overflow: 'hidden', opacity: pressed ? 0.8 : 1 })}
  >
    <AccentBar color={accent} />
    <View style={{ width: large ? 40 : 32, height: large ? 40 : 32, borderRadius: 10, backgroundColor: `${accent}1A`, borderWidth: 1, borderColor: `${accent}33`, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialCommunityIcons name={icon} size={large ? 22 : 18} color={accent} />
    </View>
    <View style={{ marginTop: large ? 16 : 12 }}>
      <AppText style={{ fontSize: 10, fontWeight: '500', color: colors.textSlate400, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </AppText>
      <AppText style={{ fontSize: large ? 24 : 20, fontWeight: '700', color: colors.white, marginTop: 4 }}>
        {value}
      </AppText>
    </View>
  </Pressable>
);

interface EngagementCardProps { label: string; value: string; accent: string; icon: IconName }
const EngagementCard: React.FC<EngagementCardProps> = ({ label, value, accent, icon }) => (
  <View style={{ flex: 1, backgroundColor: colors.cardDark, borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
    <AccentBar color={accent} side="bottom" />
    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${accent}1A`, borderWidth: 1, borderColor: `${accent}33`, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
      <MaterialCommunityIcons name={icon} size={16} color={accent} />
    </View>
    <AppText style={{ fontSize: 10, fontWeight: '500', color: colors.textSlate400, textAlign: 'center' }}>{label}</AppText>
    <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white, marginTop: 4 }}>{value}</AppText>
  </View>
);

interface CompanyRowProps { company: CompanyRankItem; isLast: boolean }
const CompanyRow: React.FC<CompanyRowProps> = ({ company, isLast }) => (
  <Pressable
    onPress={() => router.push(`/(main)/(feed)/business/${company.id}`)}
    accessibilityRole="button"
    accessibilityLabel={company.name}
    style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: isLast ? 0 : 12, marginBottom: isLast ? 0 : 12, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: 'rgba(255,255,255,0.05)', opacity: pressed ? 0.7 : 1 })}
  >
    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.borderDark, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialCommunityIcons name="domain" size={20} color={colors.textSlate400} />
    </View>
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.white }} numberOfLines={1}>
          {company.name}
        </AppText>
        <MaterialCommunityIcons
          name={company.isOwnerVerified ? 'check-decagram' : 'shield-off-outline'}
          size={14}
          color={company.isOwnerVerified ? colors.cyan : colors.textSlate500}
        />
        {company.isPremium && <MaterialCommunityIcons name="crown" size={13} color={colors.yellow} />}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <MaterialCommunityIcons name="eye-outline" size={10} color={colors.textSlate400} />
          <AppText style={{ fontSize: 10, color: colors.textSlate400 }}>{formatCount(company.visits)}</AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <MaterialCommunityIcons name="magnify" size={10} color={colors.textSlate400} />
          <AppText style={{ fontSize: 10, color: colors.textSlate400 }}>{formatCount(company.searches)}</AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <MaterialCommunityIcons name="star-outline" size={10} color={colors.textSlate400} />
          <AppText style={{ fontSize: 10, color: colors.textSlate400 }}>{formatCount(company.reviews)}</AppText>
        </View>
      </View>
    </View>
    <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.neonPurple }}>
      {company.rating.toFixed(1)}★
    </AppText>
  </Pressable>
);

interface CompanyListSectionProps { title: string; badgeLabel: string; badgeColor: string; companies: CompanyRankItem[]; onSeeAll: () => void }
const CompanyListSection: React.FC<CompanyListSectionProps> = ({ title, badgeLabel, badgeColor, companies, onSeeAll }) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
    <Card style={{ overflow: 'hidden' }}>
      <AccentBar color={colors.neonPurple} />
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white, letterSpacing: 0.5 }}>{title}</AppText>
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: `${badgeColor}1A`, borderWidth: 1, borderColor: `${badgeColor}33` }}>
            <AppText style={{ fontSize: 10, fontWeight: '600', color: badgeColor }}>{badgeLabel}</AppText>
          </View>
        </View>
        {companies.length === 0 ? (
          <AppText style={{ fontSize: 13, color: colors.textSlate500, textAlign: 'center', paddingVertical: 12 }}>
            No data yet
          </AppText>
        ) : (
          companies.map((c, i) => <CompanyRow key={c.id} company={c} isLast={i === companies.length - 1} />)
        )}
        <Pressable
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
          style={{ marginTop: 16, borderRadius: 9999, borderWidth: 1, borderColor: `${colors.neonPurple}4D`, backgroundColor: `${colors.neonPurple}1A`, paddingVertical: 10, alignItems: 'center' }}
        >
          <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.neonPurple }}>See All</AppText>
        </Pressable>
      </View>
    </Card>
  </View>
);

const ComingSoonTab: React.FC<{ label: string }> = ({ label }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 }}>
    <MaterialCommunityIcons name="tools" size={48} color={colors.textSlate600} />
    <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.textSlate400 }}>{label}</AppText>
    <AppText style={{ fontSize: 13, color: colors.textSlate600 }}>Coming soon</AppText>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const TABS: TabKey[] = ['COMPANY', 'MODERATOR', 'GLOBAL', 'FINANCIAL'];

export default function AdminHomeScreen() {
  useAnalyticsScreen(AnalyticsScreens.ADMIN_DASHBOARD);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('COMPANY');
  const handleTabPress = useCallback((tab: TabKey) => setActiveTab(tab), []);
  const { stats, isLoading, error, refresh } = useAdminDashboard();

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <AdminMenuButton />
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white, letterSpacing: -0.3 }}>
            {t('admin.home.title', { defaultValue: 'Admin Dashboard' })}
          </AppText>
          <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={{ padding: 8 }}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textSlate400} />
          </Pressable>
        </View>

        {/* Welcome */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.textSlate400, marginBottom: 2 }}>
            {t('admin.home.welcomeBack', { defaultValue: 'Welcome back,' })}
          </AppText>
          <AppText style={{ fontSize: 24, fontWeight: '700', color: colors.white }}>
            {t('admin.home.administrator', { defaultValue: 'Administrator' })}
          </AppText>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardDark, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12 }}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textSlate400} />
            <TextInput
              placeholder={t('admin.home.searchPlaceholder', { defaultValue: 'Search companies, users or reports...' })}
              placeholderTextColor={colors.textSlate500}
              style={{ flex: 1, paddingVertical: 12, paddingLeft: 8, fontSize: 14, color: colors.textSlate200 }}
              accessibilityLabel="Search"
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 }}>
          {TABS.map((tab) => (
            <TabPill key={tab} label={tab} active={activeTab === tab} onPress={() => handleTabPress(tab)} />
          ))}
        </View>

        {/* ── COMPANY tab ──────────────────────────────────────────────────── */}
        {activeTab === 'COMPANY' && (
          <>
            {isLoading && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color={colors.neonPurple} />
              </View>
            )}

            {!isLoading && !!error && (
              <View style={{ alignItems: 'center', paddingVertical: 40, gap: 12 }}>
                <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.red} />
                <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center' }}>{error}</AppText>
                <Pressable
                  onPress={refresh}
                  accessibilityRole="button"
                  accessibilityLabel="Retry"
                  style={{ paddingHorizontal: 24, paddingVertical: 10, borderRadius: 9999, backgroundColor: `${colors.neonPurple}1A`, borderWidth: 1, borderColor: `${colors.neonPurple}33` }}
                >
                  <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.neonPurple }}>Retry</AppText>
                </Pressable>
              </View>
            )}

            {/* Add Company Row */}
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              <Pressable
                onPress={() => router.push('/(main)/(feed)/add-business?isAdmin=true')}
                accessibilityRole="button"
                accessibilityLabel="Add New Company"
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: `${colors.neonPurple}1A`,
                  borderWidth: 1,
                  borderColor: `${colors.neonPurple}4D`,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.neonPurple, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="plus" size={18} color={colors.white} />
                </View>
                <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.neonPurple }}>
                  Add New Company
                </AppText>
              </Pressable>
            </View>

            {!isLoading && !error && !!stats && (
              <>
                {/* Total + Active */}
                <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 }}>
                  <StatCard label="Total Companies" value={formatCount(stats.totalCompanies)} icon="office-building" accent={colors.neonPurple} onPress={() => router.push('/(main)/(feed)/admin-companies?filter=all')} />
                  <StatCard label="Active" value={formatCount(stats.active)} icon="check-circle-outline" accent={colors.green} onPress={() => router.push('/(main)/(feed)/admin-companies?filter=active')} />
                </View>

                {/* Approval Status */}
                <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
                  <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, textTransform: 'uppercase', letterSpacing: 1 }}>Approval Status</AppText>
                </View>
                <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 20 }}>
                  <StatCard label="Suspended" value={formatCount(stats.suspended)} icon="cancel" accent={colors.red} onPress={() => router.push('/(main)/(feed)/admin-companies?filter=suspended')} />
                  <StatCard label="Pending" value={formatCount(stats.pending)} icon="clock-outline" accent={colors.yellow} onPress={() => router.push('/(main)/(feed)/admin-companies?filter=pending')} />
                </View>

                {/* Owner Account */}
                <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
                  <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, textTransform: 'uppercase', letterSpacing: 1 }}>Owner Account</AppText>
                </View>
                <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 20 }}>
                  <StatCard label="Verified" value={formatCount(stats.ownerVerified)} icon="check-decagram" accent={colors.cyan} onPress={() => router.push('/(main)/(feed)/admin-companies?filter=ownerVerified')} />
                  <StatCard label="Unclaimed" value={formatCount(stats.ownerUnverified)} icon="shield-off-outline" accent={colors.textSlate400} onPress={() => router.push('/(main)/(feed)/admin-companies?filter=ownerUnverified')} />
                </View>

                {/* Subscription */}
                <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
                  <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate500, textTransform: 'uppercase', letterSpacing: 1 }}>Subscription</AppText>
                </View>
                <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 24 }}>
                  <StatCard label="Premium" value={formatCount(stats.premium)} icon="crown" accent={colors.pink} onPress={() => router.push('/(main)/(feed)/admin-companies?filter=premium')} />
                  <StatCard label="Basic" value={formatCount(stats.verifiedBasic)} icon="shield-check" accent={colors.blue} onPress={() => router.push('/(main)/(feed)/admin-companies?filter=verifiedBasic')} />
                </View>

                {/* Global Engagement */}
                <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                    <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white }}>
                      Global Engagement
                    </AppText>
                    <AppText style={{ fontSize: 11, color: colors.textSlate500 }}>All time</AppText>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <EngagementCard label="Total Visits" value={formatCount(stats.totalVisits)} accent={colors.cyan} icon="eye" />
                    <EngagementCard label="Searches" value={formatCount(stats.totalSearches)} accent={colors.orange} icon="magnify" />
                    <EngagementCard label="Reviews" value={formatCount(stats.totalReviews)} accent={colors.pink} icon="star" />
                  </View>
                  <Pressable
                    onPress={() => router.push('/(main)/(feed)/engagement-details')}
                    accessibilityRole="button"
                    accessibilityLabel="View More Details"
                    style={{ borderRadius: 9999, borderWidth: 1, borderColor: `${colors.neonPurple}4D`, backgroundColor: `${colors.neonPurple}1A`, paddingVertical: 12, alignItems: 'center' }}
                  >
                    <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.neonPurple }}>View More Details</AppText>
                  </Pressable>
                </View>

                {/* Top 5 company lists */}
                <CompanyListSection title="TOP COMPANIES" badgeLabel="Top 5" badgeColor={colors.textSlate400} companies={stats.topTotal} onSeeAll={() => router.push('/(main)/(feed)/admin-companies?filter=all')} />
                <CompanyListSection title="TOP ACTIVE" badgeLabel="Active" badgeColor={colors.green} companies={stats.topActive} onSeeAll={() => router.push('/(main)/(feed)/admin-companies?filter=active')} />
                <CompanyListSection title="TOP PENDING" badgeLabel="Pending" badgeColor={colors.yellow} companies={stats.topPending} onSeeAll={() => router.push('/(main)/(feed)/admin-companies?filter=pending')} />
                <CompanyListSection title="TOP OWNER VERIFIED" badgeLabel="Claimed" badgeColor={colors.cyan} companies={stats.topOwnerVerified} onSeeAll={() => router.push('/(main)/(feed)/admin-companies?filter=ownerVerified')} />
                <CompanyListSection title="TOP PREMIUM" badgeLabel="Elite" badgeColor={colors.pink} companies={stats.topPremium} onSeeAll={() => router.push('/(main)/(feed)/admin-companies?filter=premium')} />
              </>
            )}
          </>
        )}

        {/* ── Empty tabs ────────────────────────────────────────────────── */}
        {activeTab === 'MODERATOR' && <ComingSoonTab label="Moderator Panel" />}
        {activeTab === 'GLOBAL' && <ComingSoonTab label="Global Insights" />}
        {activeTab === 'FINANCIAL' && <ComingSoonTab label="Financial Overview" />}

      </ScrollView>

    </ScreenLayout>
  );
}
