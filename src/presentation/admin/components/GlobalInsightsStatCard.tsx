import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

// ── Types ────────────────────────────────────────────────────────────────────
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface GlobalInsightsStatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: IconName;
  accent: string;
}

// ── Component ────────────────────────────────────────────────────────────────
export const GlobalInsightsStatCard: React.FC<GlobalInsightsStatCardProps> = ({
  label,
  value,
  change,
  positive = true,
  icon,
  accent,
}) => (
  <View
    accessibilityRole="summary"
    accessibilityLabel={`${label}: ${value}${change ? `, ${change}` : ''}`}
    style={{
      flex: 1,
      backgroundColor: colors.cardDark,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      overflow: 'hidden',
    }}
  >
    {/* Accent left bar */}
    <View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: accent,
        shadowColor: accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
      }}
    />

    {/* Icon + Change badge row */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: `${accent}1A`,
          borderWidth: 1,
          borderColor: `${accent}33`,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MaterialCommunityIcons name={icon} size={16} color={accent} />
      </View>

      {change ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 9999,
            borderWidth: 1,
            backgroundColor: positive ? `${colors.green}1A` : `${colors.red}1A`,
            borderColor: positive ? `${colors.green}33` : `${colors.red}33`,
          }}
        >
          <MaterialCommunityIcons
            name={positive ? 'trending-up' : 'trending-down'}
            size={10}
            color={positive ? colors.green : colors.red}
          />
          <AppText
            style={{
              fontSize: 9,
              fontWeight: '500',
              color: positive ? colors.green : colors.red,
              marginLeft: 2,
            }}
          >
            {change}
          </AppText>
        </View>
      ) : null}
    </View>

    {/* Label + Value */}
    <View style={{ marginTop: 10 }}>
      <AppText
        style={{
          fontSize: 9,
          fontWeight: '500',
          color: colors.textSlate400,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
        numberOfLines={1}
      >
        {label}
      </AppText>
      <AppText
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.white,
          marginTop: 2,
        }}
      >
        {value}
      </AppText>
    </View>
  </View>
);
