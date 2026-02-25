import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = colors.neonPurple,
}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.cardDark,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: colors.textSlate800,
      }}
      accessibilityRole="summary"
      accessibilityLabel={`${title}: ${value}`}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${color}20`,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <AppText
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.white,
          marginBottom: 4,
        }}
      >
        {String(value)}
      </AppText>
      <AppText
        style={{
          fontSize: 12,
          fontWeight: '500',
          color: colors.textSlate400,
        }}
      >
        {title}
      </AppText>
    </View>
  );
};
