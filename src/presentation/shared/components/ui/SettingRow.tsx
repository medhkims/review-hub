import React from 'react';
import { Pressable, View, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { IconBadge } from './IconBadge';

type IconColor = 'blue' | 'pink' | 'green' | 'orange' | 'indigo' | 'purple' | 'emerald' | 'yellow' | 'cyan' | 'red';

interface SettingRowProps {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: IconColor;
  label: string;
  rightElement?: 'chevron' | 'toggle' | 'external' | React.ReactNode;
  value?: string;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
  variant?: 'default' | 'danger';
}

export const SettingRow: React.FC<SettingRowProps> = ({
  iconName,
  iconColor,
  label,
  rightElement = 'chevron',
  value,
  toggleValue,
  onToggle,
  onPress,
  isLast = false,
  variant = 'default',
}) => {
  const textColor = variant === 'danger' ? 'text-red-400' : 'text-slate-200';

  const renderRightElement = () => {
    if (rightElement === 'toggle' && onToggle !== undefined && toggleValue !== undefined) {
      return (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#475569', true: '#A855F7' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#475569"
        />
      );
    }

    if (rightElement === 'chevron') {
      return (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#475569"
        />
      );
    }

    if (rightElement === 'external') {
      return (
        <MaterialCommunityIcons
          name="open-in-new"
          size={18}
          color="#475569"
        />
      );
    }

    if (typeof rightElement === 'object') {
      return rightElement;
    }

    return null;
  };

  const content = (
    <View
      className="p-4"
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 60 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 }}>
        <IconBadge iconName={iconName} color={iconColor} />
        <AppText className={`font-medium text-[15px] ${textColor}`}>
          {label}
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
        {value && (
          <AppText className="text-[14px] text-slate-400 font-medium">
            {value}
          </AppText>
        )}
        {renderRightElement()}
      </View>
    </View>
  );

  if (onPress && rightElement !== 'toggle') {
    return (
      <Pressable
        onPress={onPress}
        className={`${!isLast ? 'border-b border-border-dark/30' : ''} active:bg-slate-800/50`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className={!isLast ? 'border-b border-border-dark/30' : ''}>
      {content}
    </View>
  );
};
