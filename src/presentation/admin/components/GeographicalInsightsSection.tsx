import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

// ── Types ────────────────────────────────────────────────────────────────────
interface Region {
  name: string;
  percentage: number;
  color: string;
}

interface Distribution {
  name: string;
  percentage: number;
  color: string;
}

interface GeographicalInsightsSectionProps {
  title: string;
  topRegionsLabel: string;
  distributionLabel: string;
  regions: Region[];
  distributions: Distribution[];
}

// ── Component ────────────────────────────────────────────────────────────────
export const GeographicalInsightsSection: React.FC<GeographicalInsightsSectionProps> = ({
  title,
  topRegionsLabel,
  distributionLabel,
  regions,
  distributions,
}) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
    <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 12 }}>
      {title}
    </AppText>

    <View
      style={{
        backgroundColor: colors.cardDark,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      {/* Top Regions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <MaterialCommunityIcons name="map-marker" size={16} color={colors.neonPurple} />
        <AppText
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: colors.textSlate400,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {topRegionsLabel}
        </AppText>
      </View>

      {regions.map((region) => (
        <View key={region.name} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <AppText style={{ fontSize: 13, fontWeight: '500', color: colors.textSlate200 }}>
              {region.name}
            </AppText>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: region.color }}>
              {region.percentage}%
            </AppText>
          </View>
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 6,
                borderRadius: 3,
                width: `${region.percentage}%`,
                backgroundColor: region.color,
                shadowColor: region.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            />
          </View>
        </View>
      ))}

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.05)',
          marginVertical: 14,
        }}
      />

      {/* Distribution by Governorate */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <MaterialCommunityIcons name="chart-pie" size={16} color={colors.neonPurple} />
        <AppText
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: colors.textSlate400,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {distributionLabel}
        </AppText>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {distributions.map((dist) => (
          <View
            key={dist.name}
            accessibilityLabel={`${dist.name}: ${dist.percentage}%`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: `${dist.color}0D`,
              borderWidth: 1,
              borderColor: `${dist.color}33`,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: dist.color,
              }}
            />
            <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.textSlate200 }}>
              {dist.name}
            </AppText>
            <AppText style={{ fontSize: 12, fontWeight: '700', color: dist.color }}>
              {dist.percentage}%
            </AppText>
          </View>
        ))}
      </View>
    </View>
  </View>
);

// ── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_REGIONS: Region[] = [
  { name: 'Tunis', percentage: 45, color: colors.neonPurple },
  { name: 'Sousse', percentage: 22, color: colors.blue },
  { name: 'Sfax', percentage: 18, color: colors.green },
  { name: 'Monastir', percentage: 10, color: colors.orange },
];

export const MOCK_DISTRIBUTIONS: Distribution[] = [
  { name: 'North East', percentage: 52, color: colors.neonPurple },
  { name: 'Ouest', percentage: 28, color: colors.blue },
  { name: 'Central', percentage: 12, color: colors.green },
  { name: 'South', percentage: 8, color: colors.orange },
];
