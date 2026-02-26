import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { Card } from '@/presentation/shared/components/ui/Card';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ── Types ────────────────────────────────────────────────────────────────────
type TabKey = 'COMPANY' | 'MODERATOR' | 'GLOBAL' | 'FINANCIAL';
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;
interface StatItem { label: string; value: string; change: string; positive: boolean; accent: string; icon: IconName }
interface CompanyItem { id: string; name: string; verified: boolean; views: string; searches: string; reviews: string }
interface EngagementItem { label: string; value: string; accent: string; icon: IconName }
interface CompanyListSection { title: string; badgeLabel: string; badgeColor: string; companies: CompanyItem[] }

// ── Mock Data ────────────────────────────────────────────────────────────────
const TABS: TabKey[] = ['COMPANY', 'MODERATOR', 'GLOBAL', 'FINANCIAL'];

const MAIN_STAT: StatItem = {
  label: 'Total Companies', value: '1,248', change: '+12%', positive: true, accent: colors.neonPurple, icon: 'office-building',
};
const GRID_STATS: StatItem[] = [
  { label: 'Verified', value: '856', change: '+8%', positive: true, accent: colors.green, icon: 'check-decagram' },
  { label: 'Unverified', value: '392', change: '-2%', positive: false, accent: colors.yellow, icon: 'alert-decagram' },
  { label: 'Premium', value: '124', change: '+15%', positive: true, accent: colors.red, icon: 'crown' },
  { label: 'Verif. Basic', value: '732', change: '+4%', positive: true, accent: colors.blue, icon: 'shield-check' },
];
const ENGAGEMENT: EngagementItem[] = [
  { label: 'Total Visits', value: '45.2k', accent: colors.cyan, icon: 'eye' },
  { label: 'Searches', value: '12.8k', accent: colors.orange, icon: 'magnify' },
  { label: 'Reviews', value: '3.4k', accent: colors.pink, icon: 'star' },
];
const LISTS: CompanyListSection[] = [
  { title: 'TOP TOTAL COMPANIES', badgeLabel: 'Top 4', badgeColor: colors.textSlate400, companies: [
    { id: '1', name: 'Pasta Cosi', verified: true, views: '12.4k', searches: '8.2k', reviews: '128' },
    { id: '2', name: 'Le Malouf', verified: true, views: '10.1k', searches: '6.5k', reviews: '94' },
    { id: '3', name: 'Dar El Jeld', verified: false, views: '9.8k', searches: '5.1k', reviews: '82' },
    { id: '4', name: 'Bella Spa', verified: true, views: '8.5k', searches: '4.3k', reviews: '65' },
  ]},
  { title: 'TOP VERIFIED', badgeLabel: 'Active', badgeColor: colors.green, companies: [
    { id: '5', name: 'Cafe Culture', verified: true, views: '15.2k', searches: '9.1k', reviews: '210' },
    { id: '6', name: 'Tunis Tech', verified: true, views: '11.5k', searches: '7.2k', reviews: '145' },
    { id: '7', name: 'Oasis Gym', verified: true, views: '9.3k', searches: '4.8k', reviews: '88' },
    { id: '8', name: 'Sfax Motors', verified: true, views: '8.9k', searches: '5.5k', reviews: '76' },
  ]},
  { title: 'TOP UNVERIFIED', badgeLabel: 'Pending', badgeColor: colors.textSlate400, companies: [
    { id: '9', name: 'Bizerte Bakery', verified: false, views: '4.2k', searches: '1.2k', reviews: '12' },
    { id: '10', name: 'Hammamet Souk', verified: false, views: '3.8k', searches: '980', reviews: '8' },
    { id: '11', name: 'Kairouan Carpets', verified: false, views: '2.5k', searches: '650', reviews: '5' },
    { id: '12', name: 'Monastir Textiles', verified: false, views: '1.9k', searches: '420', reviews: '2' },
  ]},
  { title: 'TOP PREMIUM', badgeLabel: 'Elite', badgeColor: colors.red, companies: [
    { id: '13', name: 'Royal Hotel', verified: true, views: '22.4k', searches: '14.2k', reviews: '450' },
    { id: '14', name: 'Golden Mall', verified: true, views: '18.1k', searches: '10.5k', reviews: '320' },
    { id: '15', name: 'Luxury Rides', verified: true, views: '14.8k', searches: '8.9k', reviews: '215' },
    { id: '16', name: 'Elite Consulting', verified: true, views: '12.2k', searches: '6.8k', reviews: '180' },
  ]},
  { title: 'TOP VERIFIED BASIC', badgeLabel: 'Standard', badgeColor: colors.blue, companies: [
    { id: '17', name: 'Djerba Delights', verified: true, views: '6.5k', searches: '3.2k', reviews: '45' },
    { id: '18', name: 'Tozeur Handicrafts', verified: true, views: '5.8k', searches: '2.9k', reviews: '38' },
    { id: '19', name: 'Nabeul Souvenirs', verified: true, views: '5.1k', searches: '2.5k', reviews: '32' },
    { id: '20', name: 'Gafsa Electronics', verified: true, views: '4.5k', searches: '2.1k', reviews: '28' },
  ]},
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const AccentBar: React.FC<{ color: string; side?: 'left' | 'bottom' }> = ({ color, side = 'left' }) => (
  <View style={{
    position: 'absolute', backgroundColor: `${color}${side === 'bottom' ? '80' : 'FF'}`,
    shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 8,
    ...(side === 'left' ? { left: 0, top: 0, bottom: 0, width: 3 } : { bottom: 0, left: 0, right: 0, height: 2 }),
  }} />
);

const TabPill: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="tab" accessibilityLabel={label}
    accessibilityState={{ selected: active }}
    style={{
      flex: 1, borderRadius: 9999, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 4,
      alignItems: 'center', justifyContent: 'center',
      borderColor: active ? colors.neonPurple : colors.borderDark,
      backgroundColor: active ? `${colors.neonPurple}1A` : colors.cardDark,
    }}>
    <AppText style={{ fontSize: 10, fontWeight: active ? '700' : '500', color: active ? colors.neonPurple : colors.textSlate400, textAlign: 'center' }}>
      {label}
    </AppText>
  </Pressable>
);

const ChangeBadge: React.FC<{ change: string; positive: boolean }> = ({ change, positive }) => (
  <View style={{
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, borderWidth: 1,
    backgroundColor: positive ? `${colors.green}1A` : `${colors.red}1A`,
    borderColor: positive ? `${colors.green}33` : `${colors.red}33`,
  }}>
    <MaterialCommunityIcons name={positive ? 'trending-up' : 'trending-down'} size={10} color={positive ? colors.green : colors.red} />
    <AppText style={{ fontSize: 10, fontWeight: '500', color: positive ? colors.green : colors.red, marginLeft: 2 }}>{change}</AppText>
  </View>
);

const StatCard: React.FC<{ stat: StatItem; large?: boolean }> = ({ stat, large = false }) => (
  <View accessibilityRole="summary" accessibilityLabel={`${stat.label}: ${stat.value}, ${stat.change}`}
    style={{ flex: large ? undefined : 1, backgroundColor: colors.cardDark, borderRadius: 12, padding: large ? 20 : 16, overflow: 'hidden' }}>
    <AccentBar color={stat.accent} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View style={{
        width: large ? 40 : 32, height: large ? 40 : 32, borderRadius: 10,
        backgroundColor: `${stat.accent}1A`, borderWidth: 1, borderColor: `${stat.accent}33`,
        justifyContent: 'center', alignItems: 'center',
      }}>
        <MaterialCommunityIcons name={stat.icon} size={large ? 22 : 18} color={stat.accent} />
      </View>
      <ChangeBadge change={stat.change} positive={stat.positive} />
    </View>
    <View style={{ marginTop: large ? 16 : 12 }}>
      <AppText style={{ fontSize: 10, fontWeight: '500', color: colors.textSlate400, textTransform: 'uppercase', letterSpacing: 1 }}>
        {stat.label}
      </AppText>
      <AppText style={{ fontSize: large ? 24 : 20, fontWeight: '700', color: colors.white, marginTop: 4 }}>{stat.value}</AppText>
    </View>
  </View>
);

const EngagementCard: React.FC<{ item: EngagementItem }> = ({ item }) => (
  <View accessibilityRole="summary" accessibilityLabel={`${item.label}: ${item.value}`}
    style={{ flex: 1, backgroundColor: colors.cardDark, borderRadius: 12, padding: 12, alignItems: 'center',
      justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
    <AccentBar color={item.accent} side="bottom" />
    <View style={{
      width: 32, height: 32, borderRadius: 16, backgroundColor: `${item.accent}1A`,
      borderWidth: 1, borderColor: `${item.accent}33`, justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    }}>
      <MaterialCommunityIcons name={item.icon} size={16} color={item.accent} />
    </View>
    <AppText style={{ fontSize: 10, fontWeight: '500', color: colors.textSlate400, textAlign: 'center' }}>{item.label}</AppText>
    <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white, marginTop: 4 }}>{item.value}</AppText>
  </View>
);

const MetricChip: React.FC<{ icon: IconName; value: string }> = ({ icon, value }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
    <MaterialCommunityIcons name={icon} size={10} color={colors.textSlate400} />
    <AppText style={{ fontSize: 10, color: colors.textSlate400 }}>{value}</AppText>
  </View>
);

const CompanyRow: React.FC<{ company: CompanyItem; isLast: boolean }> = ({ company, isLast }) => (
  <View accessibilityLabel={`${company.name}, ${company.verified ? 'verified' : 'unverified'}`}
    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: isLast ? 0 : 12,
      marginBottom: isLast ? 0 : 12, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.borderDark, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialCommunityIcons name="domain" size={20} color={colors.textSlate400} />
    </View>
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <AppText style={{ fontSize: 14, fontWeight: '600', color: company.verified ? colors.white : colors.textSlate200 }} numberOfLines={1}>
          {company.name}
        </AppText>
        <MaterialCommunityIcons name={company.verified ? 'check-decagram' : 'shield-off-outline'} size={14}
          color={company.verified ? colors.green : colors.textSlate500} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
        <MetricChip icon="eye-outline" value={company.views} />
        <MetricChip icon="magnify" value={company.searches} />
        <MetricChip icon="star-outline" value={company.reviews} />
      </View>
    </View>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function AdminHomeScreen() {
  useAnalyticsScreen(AnalyticsScreens.ADMIN_DASHBOARD);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('COMPANY');
  const handleTabPress = useCallback((tab: TabKey) => { setActiveTab(tab); }, []);

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white, letterSpacing: -0.3 }}>
            {t('admin.home.title', { defaultValue: 'Admin Dashboard' })}
          </AppText>
          <Pressable accessibilityRole="button" accessibilityLabel={t('notifications.title', { defaultValue: 'Notifications' })}
            style={{ position: 'absolute', right: 16, padding: 8 }}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textSlate400} />
            <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4,
              backgroundColor: colors.red, shadowColor: colors.red, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4 }} />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardDark, borderRadius: 12,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12 }}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textSlate400} />
            <TextInput
              placeholder={t('admin.home.searchPlaceholder', { defaultValue: 'Search companies, users or reports...' })}
              placeholderTextColor={colors.textSlate500}
              style={{ flex: 1, paddingVertical: 12, paddingLeft: 8, fontSize: 14, color: colors.textSlate200 }}
              accessibilityLabel={t('admin.home.searchPlaceholder', { defaultValue: 'Search companies, users or reports...' })}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 }}>
          {TABS.map((tab) => (
            <TabPill key={tab} label={tab} active={activeTab === tab} onPress={() => handleTabPress(tab)} />
          ))}
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <SectionHeader title={t('admin.home.companyStats', { defaultValue: 'Company Statistics' })} />
          <StatCard stat={MAIN_STAT} large />
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 12 }}>
          <StatCard stat={GRID_STATS[0]} />
          <StatCard stat={GRID_STATS[1]} />
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 24 }}>
          <StatCard stat={GRID_STATS[2]} />
          <StatCard stat={GRID_STATS[3]} />
        </View>

        {/* Global Engagement */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 12 }}>
            {t('admin.home.globalEngagement', { defaultValue: 'Global Engagement' })}
          </AppText>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            {ENGAGEMENT.map((item) => <EngagementCard key={item.label} item={item} />)}
          </View>
          <Pressable accessibilityRole="button"
            accessibilityLabel={t('admin.home.viewMoreDetails', { defaultValue: 'View More Details' })}
            style={{ borderRadius: 9999, borderWidth: 1, borderColor: `${colors.neonPurple}4D`, backgroundColor: `${colors.neonPurple}1A`,
              paddingVertical: 12, alignItems: 'center', shadowColor: colors.neonPurple, shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15, shadowRadius: 10 }}>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.neonPurple }}>
              {t('admin.home.viewMoreDetails', { defaultValue: 'View More Details' })}
            </AppText>
          </Pressable>
        </View>

        {/* Company Lists */}
        {LISTS.map((section) => (
          <View key={section.title} style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <Card style={{ overflow: 'hidden' }}>
              <AccentBar color={colors.neonPurple} />
              <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white, letterSpacing: 1 }}>{section.title}</AppText>
                  <View style={{
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999,
                    backgroundColor: section.badgeColor === colors.textSlate400 ? 'rgba(255,255,255,0.05)' : `${section.badgeColor}1A`,
                    borderWidth: section.badgeColor === colors.textSlate400 ? 0 : 1, borderColor: `${section.badgeColor}33`,
                  }}>
                    <AppText style={{ fontSize: 10, fontWeight: '500', color: section.badgeColor }}>{section.badgeLabel}</AppText>
                  </View>
                </View>
                {section.companies.map((c, i) => <CompanyRow key={c.id} company={c} isLast={i === section.companies.length - 1} />)}
              </View>
            </Card>
          </View>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
}
