import React, { useRef, useEffect } from 'react';
import { Pressable, View, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { IconBadge } from './IconBadge';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

type IconColor = 'blue' | 'pink' | 'green' | 'orange' | 'indigo' | 'purple' | 'emerald' | 'yellow' | 'cyan' | 'red';

interface SettingRowProps {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: IconColor;
  label: string;
  hint?: string;
  rightElement?: 'chevron' | 'toggle' | 'external' | React.ReactNode;
  value?: string;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
  variant?: 'default' | 'danger';
}

const TRACK_W = 44;
const TRACK_H = 24;
const THUMB_SIZE = 18;
const THUMB_OFFSET = 3;

interface AnimatedToggleProps {
  isActive: boolean;
  toggleTrack: string;
}
const AnimatedToggle: React.FC<AnimatedToggleProps> = ({ isActive, toggleTrack }) => {
  const translateX = useRef(
    new Animated.Value(isActive ? TRACK_W - THUMB_SIZE - THUMB_OFFSET : THUMB_OFFSET),
  ).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isActive ? TRACK_W - THUMB_SIZE - THUMB_OFFSET : THUMB_OFFSET,
      useNativeDriver: true,
      bounciness: 4,
      speed: 18,
    }).start();
  }, [isActive, translateX]);

  return (
    <View
      style={{
        width: TRACK_W,
        height: TRACK_H,
        borderRadius: TRACK_H / 2,
        backgroundColor: isActive ? colors.neonPurple : toggleTrack,
        justifyContent: 'center',
        shadowColor: isActive ? colors.neonPurple : 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: isActive ? 4 : 0,
      }}
    >
      <Animated.View
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: THUMB_SIZE / 2,
          backgroundColor: isActive ? colors.white : toggleTrack,
          transform: [{ translateX }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.25,
          shadowRadius: 3,
          elevation: 2,
        }}
      />
    </View>
  );
};

export const SettingRow: React.FC<SettingRowProps> = ({
  iconName,
  iconColor,
  label,
  hint,
  rightElement = 'chevron',
  value,
  toggleValue,
  onToggle,
  onPress,
  isLast = false,
  variant = 'default',
}) => {
  const theme = useTheme();
  const labelColor = variant === 'danger' ? '#F87171' : theme.text;
  const isToggle = rightElement === 'toggle' && onToggle !== undefined && toggleValue !== undefined;

  if (isToggle) {
    return (
      <Pressable
        onPress={() => onToggle!(!toggleValue)}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: toggleValue }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 60, paddingVertical: 16, paddingLeft: 20, paddingRight: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 }}>
            <IconBadge iconName={iconName} color={iconColor} />
            <AppText style={{ fontWeight: '500', fontSize: 15, color: labelColor }}>{label}</AppText>
          </View>
          <AnimatedToggle isActive={toggleValue!} toggleTrack={theme.toggleTrack} />
        </View>
      </Pressable>
    );
  }

  const renderRightElement = () => {
    if (rightElement === 'chevron') {
      return <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textSecondary} />;
    }
    if (rightElement === 'external') {
      return <MaterialCommunityIcons name="open-in-new" size={18} color={theme.textSecondary} />;
    }
    if (typeof rightElement === 'object') {
      return rightElement;
    }
    return null;
  };

  const content = (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 60, paddingVertical: 16, paddingLeft: 20, paddingRight: 16 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 }}>
        <IconBadge iconName={iconName} color={iconColor} />
        <AppText style={{ fontWeight: '500', fontSize: 15, color: labelColor }}>
          {label}
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
        {value && (
          <AppText style={{ fontSize: 14, color: theme.textMuted, fontWeight: '500' }}>
            {value}
          </AppText>
        )}
        {renderRightElement()}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={!isLast ? { borderBottomWidth: 1, borderBottomColor: theme.border } : {}}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={!isLast ? { borderBottomWidth: 1, borderBottomColor: theme.border } : {}}>
      {content}
    </View>
  );
};
