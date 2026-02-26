import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

// ── Types ────────────────────────────────────────────────────────────────────
interface ActivityMetric {
  label: string;
  value: string;
  accent: string;
}

interface UserActivitySectionProps {
  title: string;
  avgSessionLabel: string;
  avgSessionValue: string;
  metrics: ActivityMetric[];
}

// ── Component ────────────────────────────────────────────────────────────────
export const UserActivitySection: React.FC<UserActivitySectionProps> = ({
  title,
  avgSessionLabel,
  avgSessionValue,
  metrics,
}) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
    <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 12 }}>
      {title}
    </AppText>

    {/* Metric boxes - 2x2 grid */}
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {metrics.slice(0, 2).map((metric) => (
          <ActivityBox key={metric.label} metric={metric} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {metrics.slice(2, 4).map((metric) => (
          <ActivityBox key={metric.label} metric={metric} />
        ))}
      </View>
    </View>

    {/* Avg. Session Time */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.cardDark,
        borderRadius: 12,
        padding: 14,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: `${colors.cyan}1A`,
            borderWidth: 1,
            borderColor: `${colors.cyan}33`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcons name="clock-outline" size={16} color={colors.cyan} />
        </View>
        <AppText style={{ fontSize: 13, fontWeight: '500', color: colors.textSlate400 }}>
          {avgSessionLabel}
        </AppText>
      </View>
      <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
        {avgSessionValue}
      </AppText>
    </View>
  </View>
);

// ── Sub-component ────────────────────────────────────────────────────────────
interface ActivityBoxProps {
  metric: ActivityMetric;
}

const ActivityBox: React.FC<ActivityBoxProps> = ({ metric }) => (
  <View
    accessibilityRole="summary"
    accessibilityLabel={`${metric.label}: ${metric.value}`}
    style={{
      flex: 1,
      backgroundColor: colors.cardDark,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      overflow: 'hidden',
    }}
  >
    {/* Bottom accent bar */}
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: `${metric.accent}80`,
        shadowColor: metric.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      }}
    />
    <AppText
      style={{
        fontSize: 9,
        fontWeight: '600',
        color: colors.textSlate400,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 4,
      }}
    >
      {metric.label}
    </AppText>
    <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white }}>
      {metric.value}
    </AppText>
  </View>
);

// ── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_USER_ACTIVITY_METRICS: ActivityMetric[] = [
  { label: 'DAILY (MAU)', value: '84.5K', accent: colors.neonPurple },
  { label: 'WEEKLY (MAU)', value: '312K', accent: colors.blue },
  { label: 'MONTHLY (MAU)', value: '1.1M', accent: colors.green },
  { label: 'YEARLY (YAU)', value: '8.4M', accent: colors.orange },
];
