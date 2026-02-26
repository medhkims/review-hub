import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

// ── Types ────────────────────────────────────────────────────────────────────
type MainTab = 'BOOST' | 'SUBSCRIPTION';
type BoostSubTab = 'ACTIVE' | 'PENDING' | 'PACKAGES' | 'HISTORY';
type SubsSubTab = 'ACTIVE' | 'EXPIRED' | 'PLANS' | 'REVENUE';
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;
type BadgeVariant = 'PREMIUM' | 'STANDARD' | 'WEEKEND' | 'ACTIVE' | 'EXPIRING';
interface CampaignItem { id: string; name: string; location: string; badge: BadgeVariant; durationUsed: number; durationTotal: number; views: string; progress: number }
interface SubscriptionItem { id: string; name: string; location: string; badge: BadgeVariant; plan: string; daysLeft: number; progress: number }

// ── Mock Data ────────────────────────────────────────────────────────────────
const CAMPAIGNS: CampaignItem[] = [
  { id: '1', name: 'Pasta Cosi', location: 'La Marsa, Tunis', badge: 'PREMIUM', durationUsed: 3, durationTotal: 7, views: '1.2k', progress: 65 },
  { id: '2', name: 'Cafe Journal', location: 'Sousse', badge: 'STANDARD', durationUsed: 1, durationTotal: 3, views: '450', progress: 22 },
  { id: '3', name: 'California Gym', location: 'Lac 2, Tunis', badge: 'PREMIUM', durationUsed: 28, durationTotal: 30, views: '15.4k', progress: 94 },
  { id: '4', name: 'Spa Carthage', location: 'Carthage', badge: 'WEEKEND', durationUsed: 1, durationTotal: 2, views: '120', progress: 45 },
];

const SUBSCRIPTIONS: SubscriptionItem[] = [
  { id: '1', name: 'Pasta Cosi', location: 'La Marsa, Tunis', badge: 'ACTIVE', plan: 'Yearly Premium', daysLeft: 245, progress: 32 },
  { id: '2', name: 'Cafe Journal', location: 'Sousse', badge: 'EXPIRING', plan: 'Standard Plan', daysLeft: 5, progress: 95 },
  { id: '3', name: 'California Gym', location: 'Lac 2, Tunis', badge: 'ACTIVE', plan: 'Enterprise Plan', daysLeft: 180, progress: 50 },
  { id: '4', name: 'Spa Carthage', location: 'Carthage', badge: 'ACTIVE', plan: 'Premium', daysLeft: 310, progress: 16 },
];

const BADGE_COLORS: Record<BadgeVariant, string> = {
  PREMIUM: colors.neonPurple, STANDARD: colors.textSlate400, WEEKEND: colors.orange,
  ACTIVE: colors.success, EXPIRING: colors.orange,
};

const BOOST_SUB_TABS: BoostSubTab[] = ['ACTIVE', 'PENDING', 'PACKAGES', 'HISTORY'];
const SUBS_SUB_TABS: SubsSubTab[] = ['ACTIVE', 'EXPIRED', 'PLANS', 'REVENUE'];

// ── Inline Components ────────────────────────────────────────────────────────
interface TabPillProps { label: string; active: boolean; onPress: () => void }
const TabPill: React.FC<TabPillProps> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="tab" accessibilityLabel={label}
    accessibilityState={{ selected: active }}
    style={{
      flex: 1, borderRadius: 9999, paddingVertical: 10, alignItems: 'center',
      backgroundColor: active ? colors.neonPurple : 'transparent',
      borderWidth: active ? 0 : 1, borderColor: colors.borderDark,
    }}>
    <AppText style={{ fontSize: 12, fontWeight: '700', color: active ? colors.white : colors.textSlate400 }}>
      {label}
    </AppText>
  </Pressable>
);

interface SubTabProps { label: string; active: boolean; onPress: () => void }
const SubTab: React.FC<SubTabProps> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="tab" accessibilityLabel={label}
    accessibilityState={{ selected: active }}
    style={{ paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: active ? colors.neonPurple : 'transparent', marginRight: 20 }}>
    <AppText style={{ fontSize: 12, fontWeight: active ? '700' : '500', color: active ? colors.white : colors.textSlate500 }}>
      {label}
    </AppText>
  </Pressable>
);

interface FilterChipProps { label: string; icon?: IconName }
const FilterChip: React.FC<FilterChipProps> = ({ label, icon }) => (
  <View style={{
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 9999, borderWidth: 1, borderColor: colors.borderDark, backgroundColor: colors.cardDark,
  }}>
    {icon ? <MaterialCommunityIcons name={icon} size={14} color={colors.textSlate400} /> : null}
    <AppText style={{ fontSize: 11, fontWeight: '500', color: colors.textSlate400 }}>{label}</AppText>
  </View>
);

interface OverviewStatProps { label: string; value: string; icon: IconName; accent: string; large?: boolean }
const OverviewStat: React.FC<OverviewStatProps> = ({ label, value, icon, accent, large }) => (
  <View accessibilityRole="summary" accessibilityLabel={`${label}: ${value}`}
    style={{ flex: large ? undefined : 1, backgroundColor: colors.cardDark, borderRadius: 12, padding: large ? 16 : 12 }}>
    <AppText style={{ fontSize: 10, fontWeight: '500', color: colors.textSlate400, marginBottom: 4 }}>{label}</AppText>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <AppText style={{ fontSize: large ? 28 : 18, fontWeight: '700', color: colors.white }}>{value}</AppText>
      <View style={{
        width: 32, height: 32, borderRadius: 10, backgroundColor: `${accent}1A`,
        justifyContent: 'center', alignItems: 'center',
      }}>
        <MaterialCommunityIcons name={icon} size={18} color={accent} />
      </View>
    </View>
  </View>
);

interface ProgressBarProps { progress: number; color?: string }
const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = colors.neonPurple }) => (
  <View style={{ height: 4, borderRadius: 2, backgroundColor: `${colors.textSlate500}33`, overflow: 'hidden' }}>
    <View style={{ height: 4, borderRadius: 2, width: `${Math.min(progress, 100)}%`, backgroundColor: color }} />
  </View>
);

const Badge: React.FC<{ variant: BadgeVariant }> = ({ variant }) => (
  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: `${BADGE_COLORS[variant]}1A` }}>
    <AppText style={{ fontSize: 9, fontWeight: '700', color: BADGE_COLORS[variant], letterSpacing: 0.5 }}>{variant}</AppText>
  </View>
);

interface CampaignCardProps { item: CampaignItem }
const CampaignCard: React.FC<CampaignCardProps> = ({ item }) => (
  <View accessibilityLabel={`${item.name} campaign, ${item.badge}`}
    style={{ backgroundColor: colors.cardDark, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.borderDark, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialCommunityIcons name="domain" size={22} color={colors.textSlate400} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>{item.name}</AppText>
          <Badge variant={item.badge} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <MaterialCommunityIcons name="map-marker" size={12} color={colors.textSlate500} />
          <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>{item.location}</AppText>
        </View>
      </View>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <MaterialCommunityIcons name="calendar-clock" size={14} color={colors.neonPurple} />
        <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.textSlate200 }}>
          {item.durationUsed}/{item.durationTotal} Days
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <MaterialCommunityIcons name="eye-outline" size={14} color={colors.textSlate400} />
        <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>{item.views} Views</AppText>
      </View>
    </View>
    <View style={{ marginTop: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <AppText style={{ fontSize: 10, color: colors.textSlate500 }}>Views vs Target</AppText>
        <AppText style={{ fontSize: 10, fontWeight: '600', color: colors.neonPurple }}>{item.progress}%</AppText>
      </View>
      <ProgressBar progress={item.progress} />
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Manage campaign for ${item.name}`}
      style={{
        marginTop: 12, borderRadius: 10, borderWidth: 1, borderColor: `${colors.neonPurple}4D`,
        backgroundColor: `${colors.neonPurple}0D`, paddingVertical: 10, alignItems: 'center',
      }}>
      <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.neonPurple }}>
        {'Manage Campaign \u2192'}
      </AppText>
    </Pressable>
  </View>
);

interface SubscriptionCardProps { item: SubscriptionItem }
const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ item }) => {
  const isExpiring = item.badge === 'EXPIRING';
  return (
    <View accessibilityLabel={`${item.name} subscription, ${item.badge}`}
      style={{ backgroundColor: colors.cardDark, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.borderDark, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialCommunityIcons name="domain" size={22} color={colors.textSlate400} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>{item.name}</AppText>
            <Badge variant={item.badge} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MaterialCommunityIcons name="map-marker" size={12} color={colors.textSlate500} />
            <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>{item.location}</AppText>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name="check-circle" size={14} color={colors.neonPurple} />
          <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.textSlate200 }}>{item.plan}</AppText>
        </View>
        <AppText style={{ fontSize: 12, fontWeight: '600', color: isExpiring ? colors.orange : colors.textSlate400 }}>
          {item.daysLeft} Days Left
        </AppText>
      </View>
      <View style={{ marginTop: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <AppText style={{ fontSize: 10, color: colors.textSlate500 }}>Subscription Progress</AppText>
          <AppText style={{ fontSize: 10, fontWeight: '600', color: colors.neonPurple }}>{item.progress}% Used</AppText>
        </View>
        <ProgressBar progress={item.progress} color={isExpiring ? colors.orange : colors.neonPurple} />
      </View>
      {isExpiring ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Renew subscription for ${item.name}`}
          style={{
            marginTop: 12, borderRadius: 10, backgroundColor: colors.neonPurple,
            paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
          }}>
          <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.white }}>Renew Subscription</AppText>
          <MaterialCommunityIcons name="check" size={14} color={colors.white} />
        </Pressable>
      ) : (
        <Pressable accessibilityRole="button" accessibilityLabel={`Manage plan for ${item.name}`}
          style={{
            marginTop: 12, borderRadius: 10, borderWidth: 1, borderColor: `${colors.neonPurple}4D`,
            backgroundColor: `${colors.neonPurple}0D`, paddingVertical: 10, alignItems: 'center',
          }}>
          <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.neonPurple }}>
            {'Manage Plan \u2192'}
          </AppText>
        </Pressable>
      )}
    </View>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function AdminBoostManagementScreen() {
  useAnalyticsScreen(AnalyticsScreens.ADMIN_BOOST_MANAGEMENT);
  const { t } = useTranslation();
  const router = useRouter();

  const [mainTab, setMainTab] = useState<MainTab>('BOOST');
  const [boostSub, setBoostSub] = useState<BoostSubTab>('ACTIVE');
  const [subsSub, setSubsSub] = useState<SubsSubTab>('ACTIVE');

  const handleMainTab = useCallback((tab: MainTab) => { setMainTab(tab); }, []);

  const isBoost = mainTab === 'BOOST';

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button"
            accessibilityLabel={t('common.back', { defaultValue: 'Go back' })} style={{ padding: 4 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.white }}>
              {t('admin.boost.title', { defaultValue: 'Boost & Promotions' })}
            </AppText>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t('notifications.title', { defaultValue: 'Notifications' })}
            style={{ padding: 4 }}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textSlate400} />
            <View style={{
              position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4,
              backgroundColor: colors.neonPurple, shadowColor: colors.neonPurple,
              shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4,
            }} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardDark,
            borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12,
          }}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textSlate400} />
            <TextInput
              placeholder={isBoost
                ? t('admin.boost.searchBoost', { defaultValue: 'Search businesses, campaigns...' })
                : t('admin.boost.searchSubs', { defaultValue: 'Search businesses, subscriptions...' })}
              placeholderTextColor={colors.textSlate500}
              style={{ flex: 1, paddingVertical: 11, paddingLeft: 8, fontSize: 13, color: colors.textSlate200 }}
              accessibilityLabel={t('admin.boost.searchPlaceholder', { defaultValue: 'Search' })}
            />
          </View>
        </View>

        {/* Main Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 14 }}>
          <TabPill label={t('admin.boost.boostTab', { defaultValue: 'BOOST' })} active={isBoost} onPress={() => handleMainTab('BOOST')} />
          <TabPill label={t('admin.boost.subscriptionTab', { defaultValue: 'SUBSCRIPTION' })} active={!isBoost} onPress={() => handleMainTab('SUBSCRIPTION')} />
        </View>

        {/* Filters */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 }}>
          <FilterChip label={t('admin.boost.sortBy', { defaultValue: 'Sort By' })} icon="sort-variant" />
          <FilterChip label={t('admin.boost.dateRange', { defaultValue: 'Date Range' })} icon="calendar-range" />
          <FilterChip label={t('admin.boost.filter', { defaultValue: 'Filter' })} icon="filter-variant" />
        </View>

        {/* Sub Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
          {isBoost
            ? BOOST_SUB_TABS.map((tab) => (
                <SubTab key={tab} label={tab} active={boostSub === tab} onPress={() => setBoostSub(tab)} />
              ))
            : SUBS_SUB_TABS.map((tab) => (
                <SubTab key={tab} label={tab} active={subsSub === tab} onPress={() => setSubsSub(tab)} />
              ))}
        </View>

        {/* Overview */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <SectionHeader title={t('admin.boost.overview', { defaultValue: 'OVERVIEW' })} />
          {isBoost ? (
            <>
              <OverviewStat label={t('admin.boost.liveBoosts', { defaultValue: 'Live Boosts' })}
                value="124" icon="lightning-bolt" accent={colors.success} large />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <OverviewStat label={t('admin.boost.requests', { defaultValue: 'Requests' })}
                  value="28" icon="lightning-bolt" accent={colors.neonPurple} />
                <OverviewStat label={t('admin.boost.adRevenue', { defaultValue: 'Ad Revenue' })}
                  value="9.2k TND" icon="currency-usd" accent={colors.success} />
              </View>
            </>
          ) : (
            <>
              <OverviewStat label={t('admin.boost.totalActiveSubs', { defaultValue: 'Total Active Subs' })}
                value="842" icon="check-circle" accent={colors.success} large />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <OverviewStat label={t('admin.boost.expiringSoon', { defaultValue: 'Expiring Soon' })}
                  value="45" icon="alert" accent={colors.orange} />
                <OverviewStat label={t('admin.boost.monthlyRevenue', { defaultValue: 'Monthly Revenue' })}
                  value="42.5K TND" icon="currency-usd" accent={colors.success} />
              </View>
            </>
          )}
        </View>

        {/* List Section */}
        <View style={{ paddingHorizontal: 16 }}>
          <SectionHeader title={isBoost
            ? t('admin.boost.activeCampaigns', { defaultValue: 'ACTIVE CAMPAIGNS' })
            : t('admin.boost.activeSubscriptions', { defaultValue: 'ACTIVE SUBSCRIPTIONS' })} />
          {isBoost
            ? CAMPAIGNS.map((c) => <CampaignCard key={c.id} item={c} />)
            : SUBSCRIPTIONS.map((s) => <SubscriptionCard key={s.id} item={s} />)}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
