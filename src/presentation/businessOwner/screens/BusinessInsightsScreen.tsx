import React from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_REVENUE = { amount: '12,450', currency: 'TND', changePercent: '+15%' };

const MOCK_STATS = [
  { labelKey: 'subs' as const, value: '8.2k', color: colors.neonPurple },
  { labelKey: 'boosts' as const, value: '3.4k', color: colors.cyan },
  { labelKey: 'refunds' as const, value: '120', color: colors.orange },
];

const MOCK_HEALTH = [
  { labelKey: 'days30' as const, percent: 78 },
  { labelKey: 'monthly' as const, percent: 60 },
  { labelKey: 'yearly' as const, percent: 20 },
];

const MOCK_KEYWORDS = [
  { rank: 1, name: 'Coffee Shop', views: '1,204' },
  { rank: 2, name: 'Dentist', views: '892' },
  { rank: 3, name: 'Car Rental', views: '654' },
];

const MOCK_FUNNEL = { impressions: '45k', clicks: '3.2k', viewsPercent: 70, clicksPercent: 35 };

const MOCK_PAYMENTS = [
  { name: 'D17', percent: '45%', bg: colors.neonPurple },
  { name: 'Flouci', percent: '30%', bg: colors.success },
  { name: 'Card', percent: '25%', bg: colors.cyan },
];

const TABS = ['overview', 'profile', 'financial', 'reviews'] as const;

// ── Sub-components ───────────────────────────────────────────────────────────

interface CircleProgressProps {
  percent: number;
  label: string;
  size?: number;
}

const CircleProgress: React.FC<CircleProgressProps> = ({ percent, label, size = 64 }) => (
  <View style={{ alignItems: 'center', gap: 6 }}>
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 5,
        borderColor: colors.borderDark,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 5,
          borderColor: colors.neonPurple,
          borderTopColor: percent < 75 ? 'transparent' : colors.neonPurple,
          borderRightColor: percent < 50 ? 'transparent' : colors.neonPurple,
          borderBottomColor: percent < 25 ? 'transparent' : colors.neonPurple,
          transform: [{ rotate: '-90deg' }],
        }}
      />
      <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>{percent}%</AppText>
    </View>
    <AppText style={{ fontSize: 10, color: colors.textSlate400, fontWeight: '600' }}>{label}</AppText>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function BusinessInsightsScreen() {
  useAnalyticsScreen(AnalyticsScreens.BUSINESS_INSIGHTS);
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<typeof TABS[number]>('financial');

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.cardDark, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="account" size={24} color={colors.neonPurple} />
            </View>
            <View>
              <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>Welcome back,</AppText>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white }}>Ahmed Ben Ali</AppText>
            </View>
          </View>
          <Pressable accessibilityLabel="Notifications" accessibilityRole="button" onPress={() => router.push('/(main)/notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.white} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardDark, borderRadius: 12, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: colors.borderDark }}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textSlate500} />
            <TextInput
              placeholder={t('businessOwner.insights.searchPlaceholder')}
              placeholderTextColor={colors.textSlate500}
              style={{ flex: 1, marginLeft: 8, color: colors.white, fontSize: 14 }}
              accessibilityLabel={t('businessOwner.insights.searchPlaceholder')}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 8 }}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityLabel={t(`businessOwner.insights.${tab}`)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeTab === tab ? colors.neonPurple : 'transparent',
                borderWidth: activeTab === tab ? 0 : 1,
                borderColor: colors.borderDark,
              }}
            >
              <AppText style={{ fontSize: 11, fontWeight: '700', color: activeTab === tab ? colors.white : colors.textSlate400 }}>
                {t(`businessOwner.insights.${tab}`)}
              </AppText>
            </Pressable>
          ))}
        </View>

        {/* FINANCIAL MONEY Section */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.textSlate400, letterSpacing: 1 }}>
              {t('businessOwner.insights.financialMoney')}
            </AppText>
            <Pressable accessibilityLabel={t('businessOwner.insights.downloadReport')} accessibilityRole="button">
              <AppText style={{ fontSize: 12, color: colors.neonPurple, fontWeight: '600' }}>
                {t('businessOwner.insights.downloadReport')} <MaterialCommunityIcons name="download" size={12} color={colors.neonPurple} />
              </AppText>
            </Pressable>
          </View>

          {/* Revenue Card */}
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 20, marginTop: 12, borderWidth: 1, borderColor: colors.borderDark }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>{t('businessOwner.insights.totalRevenue')}</AppText>
              <View style={{ backgroundColor: 'rgba(34,197,94,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <AppText style={{ fontSize: 11, color: colors.success, fontWeight: '700' }}>{MOCK_REVENUE.changePercent}</AppText>
              </View>
            </View>
            <AppText style={{ fontSize: 32, fontWeight: '800', color: colors.white, marginTop: 4 }}>
              {MOCK_REVENUE.amount} <AppText style={{ fontSize: 16, fontWeight: '600', color: colors.textSlate400 }}>{MOCK_REVENUE.currency}</AppText>
            </AppText>
            {/* Bar chart placeholder */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 16, height: 60 }}>
              {[30, 50, 70, 90, 60, 80, 45, 65, 85, 55, 75, 95].map((h, i) => (
                <View
                  key={i}
                  style={{ flex: 1, height: h * 0.6, borderRadius: 4, backgroundColor: i >= 8 ? colors.neonPurple : `${colors.neonPurple}60` }}
                />
              ))}
            </View>
          </View>

          {/* Stats Row */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            {MOCK_STATS.map((stat) => (
              <View key={stat.labelKey} style={{ flex: 1, backgroundColor: colors.cardDark, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.borderDark }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${stat.color}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons
                    name={stat.labelKey === 'subs' ? 'account-group' : stat.labelKey === 'boosts' ? 'rocket-launch' : 'cash-refund'}
                    size={18}
                    color={stat.color}
                  />
                </View>
                <AppText style={{ fontSize: 18, fontWeight: '800', color: colors.white, marginTop: 6 }}>{stat.value}</AppText>
                <AppText style={{ fontSize: 10, color: colors.textSlate400, fontWeight: '600' }}>{t(`businessOwner.insights.${stat.labelKey}`)}</AppText>
              </View>
            ))}
          </View>
        </View>

        {/* NUMBERS DATA Section */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.textSlate400, letterSpacing: 1 }}>
            {t('businessOwner.insights.numbersData')}
          </AppText>

          {/* Subscription Health Card */}
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 20, marginTop: 12, borderWidth: 1, borderColor: colors.borderDark }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>{t('businessOwner.insights.subscriptionHealth')}</AppText>
              <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.textSlate400} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
              {MOCK_HEALTH.map((item) => (
                <CircleProgress key={item.labelKey} percent={item.percent} label={t(`businessOwner.insights.${item.labelKey}`)} />
              ))}
            </View>
          </View>
        </View>

        {/* BOOST INTELLIGENCE Section */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.textSlate400, letterSpacing: 1 }}>
            {t('businessOwner.insights.boostIntelligence')}
          </AppText>

          {/* Top Performing Keywords */}
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 20, marginTop: 12, borderWidth: 1, borderColor: colors.borderDark }}>
            <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>{t('businessOwner.insights.topKeywords')}</AppText>
            <View style={{ marginTop: 14, gap: 12 }}>
              {MOCK_KEYWORDS.map((kw) => (
                <View key={kw.rank} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: colors.borderDark, alignItems: 'center', justifyContent: 'center' }}>
                    <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.textSlate400 }}>{kw.rank}</AppText>
                  </View>
                  <AppText style={{ flex: 1, fontSize: 14, color: colors.white, marginLeft: 12 }}>{kw.name}</AppText>
                  <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>{kw.views} {t('businessOwner.insights.views')}</AppText>
                </View>
              ))}
            </View>
          </View>

          {/* Conversion Funnel */}
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 20, marginTop: 12, borderWidth: 1, borderColor: colors.borderDark }}>
            <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>{t('businessOwner.insights.conversionFunnel')}</AppText>
            <View style={{ marginTop: 14, gap: 14 }}>
              {/* Impressions */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText style={{ fontSize: 12, color: colors.textSlate400, width: 90 }}>{t('businessOwner.insights.impressions')}</AppText>
                <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>{MOCK_FUNNEL.impressions}</AppText>
              </View>
              {/* Views bar */}
              <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.borderDark }}>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.success, width: `${MOCK_FUNNEL.viewsPercent}%` }} />
              </View>
              {/* Clicks */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText style={{ fontSize: 12, color: colors.textSlate400, width: 90 }}>{t('businessOwner.insights.clicks')}</AppText>
                <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>{MOCK_FUNNEL.clicks}</AppText>
              </View>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.borderDark }}>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.neonPurple, width: `${MOCK_FUNNEL.clicksPercent}%` }} />
              </View>
            </View>
          </View>
        </View>

        {/* PAYMENT METHODS Section */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.textSlate400, letterSpacing: 1 }}>
            {t('businessOwner.insights.paymentMethods')}
          </AppText>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            {MOCK_PAYMENTS.map((pm) => (
              <View
                key={pm.name}
                style={{ flex: 1, backgroundColor: pm.bg, borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}
              >
                <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.white }}>{pm.name} ({pm.percent})</AppText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
