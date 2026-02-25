import React from 'react';
import { View } from 'react-native';
import { AppText } from './AppText';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <View
      className="mb-4 px-1"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
    >
      <View
        className="bg-neon-purple rounded-full"
        style={{ width: 4, height: 16, shadowColor: '#A855F7', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
      />
      <AppText className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </AppText>
    </View>
  );
};
