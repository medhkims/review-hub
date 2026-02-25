import React from 'react';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
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
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-5 py-2.5 rounded-full mr-3 ${
        isSelected
          ? 'bg-neon-purple'
          : 'bg-card-dark border border-border-dark/50'
      }`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        marginRight: 12,
        backgroundColor: isSelected ? colors.neonPurple : colors.cardDark,
        borderWidth: isSelected ? 0 : 1,
        borderColor: isSelected ? undefined : colors.borderDark,
      }}
      accessibilityLabel={category.name}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <MaterialCommunityIcons
        name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={18}
        color={isSelected ? colors.white : colors.textSlate400}
        style={{ marginRight: 8 }}
      />
      <AppText
        className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: isSelected ? colors.white : colors.textSlate400,
        }}
      >
        {category.name}
      </AppText>
    </Pressable>
  );
};

export const CategoryChip = React.memo(CategoryChipComponent);
