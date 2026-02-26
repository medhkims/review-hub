import React from 'react';
import { View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

// ── Types ────────────────────────────────────────────────────────────────────
interface SentimentBar {
  label: string;
  percentage: number;
  color: string;
}

interface ReviewsSentimentSectionProps {
  title: string;
  totalReviewsLabel: string;
  totalReviewsValue: string;
  flaggedLabel: string;
  flaggedValue: string;
  sentimentBars: SentimentBar[];
  moreDetailsLabel: string;
  onMoreDetails?: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────
export const ReviewsSentimentSection: React.FC<ReviewsSentimentSectionProps> = ({
  title,
  totalReviewsLabel,
  totalReviewsValue,
  flaggedLabel,
  flaggedValue,
  sentimentBars,
  moreDetailsLabel,
  onMoreDetails,
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
      {/* Top stats row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <View>
          <AppText style={{ fontSize: 10, fontWeight: '500', color: colors.textSlate400, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {totalReviewsLabel}
          </AppText>
          <AppText style={{ fontSize: 22, fontWeight: '700', color: colors.white, marginTop: 2 }}>
            {totalReviewsValue}
          </AppText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <AppText style={{ fontSize: 10, fontWeight: '500', color: colors.textSlate400, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {flaggedLabel}
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MaterialCommunityIcons name="flag" size={14} color={colors.red} />
            <AppText style={{ fontSize: 22, fontWeight: '700', color: colors.red }}>
              {flaggedValue}
            </AppText>
          </View>
        </View>
      </View>

      {/* Sentiment bars */}
      {sentimentBars.map((bar) => (
        <View key={bar.label} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.textSlate200 }}>
              {bar.label}
            </AppText>
            <AppText style={{ fontSize: 12, fontWeight: '600', color: bar.color }}>
              {bar.percentage}%
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
                width: `${bar.percentage}%`,
                backgroundColor: bar.color,
                shadowColor: bar.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
              }}
            />
          </View>
        </View>
      ))}

      {/* More Details */}
      <Pressable
        onPress={onMoreDetails}
        accessibilityRole="button"
        accessibilityLabel={moreDetailsLabel}
        style={{
          marginTop: 6,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: `${colors.neonPurple}4D`,
          backgroundColor: `${colors.neonPurple}0D`,
          paddingVertical: 10,
          alignItems: 'center',
        }}
      >
        <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.neonPurple }}>
          {moreDetailsLabel}
        </AppText>
      </Pressable>
    </View>
  </View>
);

// ── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_SENTIMENT_BARS: SentimentBar[] = [
  { label: 'Positive', percentage: 68, color: colors.green },
  { label: 'Neutral', percentage: 24, color: colors.yellow },
  { label: 'Negative', percentage: 8, color: colors.red },
];
