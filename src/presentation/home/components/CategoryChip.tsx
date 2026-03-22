import React from 'react';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';

interface CategoryChipProps {
  category: CategoryEntity;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryChipComponent: React.FC<CategoryChipProps> = ({
  category,
  isSelected,
  onPress,
}) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        marginRight: 12,
        backgroundColor: isSelected ? colors.neonPurple : theme.card,
        borderWidth: isSelected ? 0 : 1,
        borderColor: isSelected ? undefined : theme.border,
      }}
      accessibilityLabel={category.name}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <MaterialCommunityIcons
        name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={18}
        color={isSelected ? colors.white : theme.textSecondary}
        style={{ marginRight: 8 }}
      />
      <AppText
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: isSelected ? colors.white : theme.text,
        }}
      >
        {category.name}
      </AppText>
    </Pressable>
  );
};

export const CategoryChip = React.memo(CategoryChipComponent);
