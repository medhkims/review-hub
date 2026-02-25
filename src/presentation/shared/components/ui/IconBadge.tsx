import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconColor = 'blue' | 'pink' | 'green' | 'orange' | 'indigo' | 'purple' | 'emerald' | 'yellow' | 'cyan' | 'red';

interface IconBadgeProps {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  color: IconColor;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap: Record<IconColor, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-500/10', text: '#3B82F6' },
  pink: { bg: 'bg-pink-500/10', text: '#EC4899' },
  green: { bg: 'bg-green-500/10', text: '#22C55E' },
  orange: { bg: 'bg-orange-500/10', text: '#F97316' },
  indigo: { bg: 'bg-indigo-500/10', text: '#6366F1' },
  purple: { bg: 'bg-purple-500/10', text: '#A855F7' },
  emerald: { bg: 'bg-emerald-500/10', text: '#10B981' },
  yellow: { bg: 'bg-yellow-500/10', text: '#EAB308' },
  cyan: { bg: 'bg-cyan-500/10', text: '#06B6D4' },
  red: { bg: 'bg-red-500/10', text: '#EF4444' },
};

const sizeMap = {
  sm: { container: 32, icon: 18 },
  md: { container: 40, icon: 22 },
  lg: { container: 48, icon: 26 },
};

export const IconBadge: React.FC<IconBadgeProps> = ({ iconName, color, size = 'md' }) => {
  const { bg, text } = colorMap[color];
  const { container, icon } = sizeMap[size];

  return (
    <View
      className={`${bg} rounded-xl`}
      style={{ width: container, height: container, alignItems: 'center', justifyContent: 'center' }}
    >
      <MaterialCommunityIcons name={iconName} size={icon} color={text} />
    </View>
  );
};
