import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '@/core/theme/colors';

interface SectionHeaderProps {
  title: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon, iconColor }) => {
  return (
    <View
      className="mb-4 px-1"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
    >
      {icon ? (
        <MaterialCommunityIcons name={icon} size={16} color={iconColor ?? colors.textSlate400} />
      ) : (
        <View
          className="bg-neon-purple rounded-full"
          style={{ width: 4, height: 16, shadowColor: '#A855F7', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
        />
      )}
      <AppText className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </AppText>
    </View>
  );
};
