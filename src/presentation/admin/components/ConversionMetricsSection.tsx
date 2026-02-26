import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

// ── Types ────────────────────────────────────────────────────────────────────
interface ConversionMetric {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

interface ConversionMetricsSectionProps {
  title: string;
  metrics: ConversionMetric[];
}

// ── Component ────────────────────────────────────────────────────────────────
export const ConversionMetricsSection: React.FC<ConversionMetricsSectionProps> = ({
  title,
  metrics,
}) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
    <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 12 }}>
      {title}
    </AppText>

    <View style={{ flexDirection: 'row', gap: 10 }}>
      {metrics.map((metric) => (
        <View
          key={metric.label}
          accessibilityRole="summary"
          accessibilityLabel={`${metric.label}: ${metric.value}, ${metric.change}`}
          style={{
            flex: 1,
            backgroundColor: colors.cardDark,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}
        >
          {/* Bottom accent line */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: `${colors.neonPurple}80`,
            }}
          />

          <AppText
            style={{
              fontSize: 10,
              fontWeight: '500',
              color: colors.textSlate400,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            {metric.label}
          </AppText>

          <AppText style={{ fontSize: 26, fontWeight: '700', color: colors.white }}>
            {metric.value}
          </AppText>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 6,
              gap: 4,
            }}
          >
            <MaterialCommunityIcons
              name={metric.positive ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={metric.positive ? colors.green : colors.red}
            />
            <AppText
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: metric.positive ? colors.green : colors.red,
              }}
            >
              {metric.change}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  </View>
);

// ── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_CONVERSION_METRICS: ConversionMetric[] = [
  { label: 'Profile to Contact', value: '12%', change: '+12%', positive: true },
  { label: 'Free to Premium', value: '5.4%', change: '+0.8%', positive: true },
];
