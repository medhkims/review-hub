import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';

const ICON_COLORS: Record<string, { icon: string; bg: string }> = {
  'food-fork-drink': { icon: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
  'shopping': { icon: '#A855F7', bg: 'rgba(168,85,247,0.1)' },
  'wrench': { icon: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  'spa': { icon: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
  'bed': { icon: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  'dumbbell': { icon: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  'glass-cocktail': { icon: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  'hospital-box': { icon: '#14B8A6', bg: 'rgba(20,184,166,0.1)' },
};

const DEFAULT_COLOR = { icon: colors.neonPurple, bg: 'rgba(168,85,247,0.1)' };

interface CategoryCardProps {
  category: CategoryEntity;
  onPress: (categoryId: string) => void;
}

const CategoryCardComponent: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const colorSet = ICON_COLORS[category.icon] || DEFAULT_COLOR;

  return (
    <Pressable
      onPress={() => onPress(category.id)}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cardDark,
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
      accessibilityLabel={category.name}
      accessibilityRole="button"
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colorSet.bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <MaterialCommunityIcons
          name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={28}
          color={colorSet.icon}
        />
      </View>
      <AppText
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: colors.white,
          textAlign: 'center',
        }}
      >
        {category.name}
      </AppText>
    </Pressable>
  );
};

export const CategoryCard = React.memo(CategoryCardComponent);
