import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconColor = 'blue' | 'pink' | 'green' | 'orange' | 'indigo' | 'purple' | 'emerald' | 'yellow' | 'cyan' | 'red';

interface IconBadgeProps {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  color: IconColor;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap: Record<IconColor, { bg: string; glow: string; icon: string }> = {
  blue:    { bg: 'rgba(59, 130, 246, 0.18)',  glow: 'rgba(59, 130, 246, 0.55)',  icon: '#60A5FA' },
  pink:    { bg: 'rgba(236, 72, 153, 0.18)',  glow: 'rgba(236, 72, 153, 0.55)',  icon: '#F472B6' },
  green:   { bg: 'rgba(34, 197, 94, 0.18)',   glow: 'rgba(34, 197, 94, 0.55)',   icon: '#4ADE80' },
  orange:  { bg: 'rgba(249, 115, 22, 0.18)',  glow: 'rgba(249, 115, 22, 0.55)',  icon: '#FB923C' },
  indigo:  { bg: 'rgba(99, 102, 241, 0.18)',  glow: 'rgba(99, 102, 241, 0.55)',  icon: '#818CF8' },
  purple:  { bg: 'rgba(168, 85, 247, 0.18)',  glow: 'rgba(168, 85, 247, 0.55)',  icon: '#C084FC' },
  emerald: { bg: 'rgba(16, 185, 129, 0.18)',  glow: 'rgba(16, 185, 129, 0.55)',  icon: '#34D399' },
  yellow:  { bg: 'rgba(234, 179, 8, 0.18)',   glow: 'rgba(234, 179, 8, 0.55)',   icon: '#FACC15' },
  cyan:    { bg: 'rgba(6, 182, 212, 0.18)',   glow: 'rgba(6, 182, 212, 0.55)',   icon: '#22D3EE' },
  red:     { bg: 'rgba(239, 68, 68, 0.18)',   glow: 'rgba(239, 68, 68, 0.55)',   icon: '#F87171' },
};

const sizeMap = {
  sm: { container: 32, icon: 18 },
  md: { container: 40, icon: 22 },
  lg: { container: 48, icon: 26 },
};

export const IconBadge: React.FC<IconBadgeProps> = ({ iconName, color, size = 'md' }) => {
  const { bg, glow, icon } = colorMap[color];
  const { container, icon: iconSize } = sizeMap[size];

  return (
    <View
      style={{
        width: container,
        height: container,
        borderRadius: 12,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <MaterialCommunityIcons name={iconName} size={iconSize} color={icon} />
    </View>
  );
};
