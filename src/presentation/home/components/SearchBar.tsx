import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onFilterPress,
}) => {
  return (
    <View
      className="flex-row items-center bg-card-dark border border-border-dark/50 rounded-2xl px-4 py-3"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardDark,
        borderWidth: 1,
        borderColor: colors.borderDark,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={22}
        color={colors.neonPurple}
        style={{ marginRight: 12 }}
      />
      <TextInput
        className="flex-1 text-white text-base"
        style={{ flex: 1, color: colors.textWhite, fontSize: 16, padding: 0 }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSlate500}
        accessibilityLabel="Search businesses"
        accessibilityRole="search"
      />
      {onFilterPress && (
        <Pressable
          onPress={onFilterPress}
          className="ml-2 active:opacity-70"
          accessibilityLabel="Filter"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={22}
            color={colors.textSlate400}
          />
        </Pressable>
      )}
    </View>
  );
};
