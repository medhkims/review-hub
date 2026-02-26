import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

// ── Types ────────────────────────────────────────────────────────────────────
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface HealthItem {
  label: string;
  value: number;
  icon: IconName;
  accent: string;
}

interface SystemHealthSectionProps {
  title: string;
  items: HealthItem[];
}

// ── Component ────────────────────────────────────────────────────────────────
export const SystemHealthSection: React.FC<SystemHealthSectionProps> = ({
  title,
  items,
}) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
    <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 12 }}>
      {title}
    </AppText>

    <View style={{ flexDirection: 'row', gap: 10 }}>
      {items.map((item) => (
        <View
          key={item.label}
          accessibilityRole="summary"
          accessibilityLabel={`${item.label}: ${item.value}`}
          style={{
            flex: 1,
            backgroundColor: colors.cardDark,
            borderRadius: 12,
            padding: 14,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: `${item.accent}1A`,
              borderWidth: 1,
              borderColor: `${item.accent}33`,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <MaterialCommunityIcons name={item.icon} size={18} color={item.accent} />
          </View>
          <AppText style={{ fontSize: 22, fontWeight: '700', color: colors.white }}>
            {String(item.value)}
          </AppText>
          <AppText
            style={{
              fontSize: 9,
              fontWeight: '500',
              color: colors.textSlate400,
              textAlign: 'center',
              marginTop: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
            numberOfLines={2}
          >
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  </View>
);

// ── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_SYSTEM_HEALTH: HealthItem[] = [
  { label: 'Pending Approvals', value: 45, icon: 'clock-check-outline', accent: colors.orange },
  { label: 'Moderation Backlog', value: 128, icon: 'shield-alert-outline', accent: colors.red },
  { label: 'Reported Issues', value: 23, icon: 'alert-circle-outline', accent: colors.yellow },
];
