import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onFilterPress,
  onFocus,
  onBlur,
}) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
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
        style={{ flex: 1, color: theme.text, fontSize: 16, padding: 0 }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        onFocus={onFocus}
        onBlur={onBlur}
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
            color={theme.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );
};
