import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useTheme } from '@/core/theme/useTheme';

interface SectionHeaderProps {
  title: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon, iconColor }) => {
  const theme = useTheme();
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 6, paddingHorizontal: 4 }}
    >
      {icon ? (
        <MaterialCommunityIcons name={icon} size={16} color={iconColor ?? theme.textMuted} />
      ) : (
        <View
          style={{
            width: 3,
            height: 14,
            borderRadius: 2,
            backgroundColor: '#A855F7',
            shadowColor: '#A855F7',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 6,
          }}
        />
      )}
      <AppText style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, color: theme.textMuted }}>
        {title}
      </AppText>
    </View>
  );
};
