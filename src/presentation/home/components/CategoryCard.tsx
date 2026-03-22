import React from 'react';
import { Pressable, View, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';
import { useTheme } from '@/core/theme/useTheme';

const ICON_COLORS: Record<string, { icon: string; bg: string }> = {
  'silverware-fork-knife': { icon: '#EC4899', bg: 'rgba(236,72,153,0.15)' },   // restaurant — pink
  'dumbbell': { icon: '#22C55E', bg: 'rgba(34,197,94,0.15)' },                  // gym — green
  'coffee': { icon: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },                   // coffee shop — amber
  'hospital-box': { icon: '#14B8A6', bg: 'rgba(20,184,166,0.15)' },             // medical — teal
  'doctor': { icon: '#06B6D4', bg: 'rgba(6,182,212,0.15)' },                    // doctor — cyan
  'bed': { icon: '#F97316', bg: 'rgba(249,115,22,0.15)' },                      // hebergement — orange
  'school': { icon: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },                   // education — blue
  'shopping': { icon: '#A855F7', bg: 'rgba(168,85,247,0.15)' },                 // shopping — purple
  'car-key': { icon: '#64748B', bg: 'rgba(100,116,139,0.15)' },                 // car rental — slate
  'bank': { icon: '#6366F1', bg: 'rgba(99,102,241,0.15)' },                     // bank — indigo
  'briefcase-account': { icon: '#F43F5E', bg: 'rgba(244,63,94,0.15)' },         // job/freelancer — rose
  'truck-delivery': { icon: '#FB923C', bg: 'rgba(251,146,60,0.15)' },           // delivery — orange
  'dots-horizontal-circle-outline': { icon: '#94A3B8', bg: 'rgba(148,163,184,0.15)' }, // other — gray
};

const DEFAULT_COLOR = { icon: colors.neonPurple, bg: 'rgba(168,85,247,0.1)' };

interface CategoryCardProps {
  category: CategoryEntity;
  onPress: (categoryId: string) => void;
  isSelected?: boolean;
}

const CategoryCardComponent: React.FC<CategoryCardProps> = ({ category, onPress, isSelected = false }) => {
  const theme = useTheme();
  const colorSet = ICON_COLORS[category.icon] || DEFAULT_COLOR;

  return (
    <Pressable
      onPress={() => onPress(category.id)}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.card,
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? colorSet.icon : 'rgba(255,255,255,0.05)',
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
      accessibilityLabel={`${category.name}${isSelected ? ', selected' : ''}`}
      accessibilityRole="checkbox"
    >
      {/* Checkmark badge */}
      {isSelected && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: colorSet.icon,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
        </View>
      )}
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: category.logoUrl ? 'transparent' : colorSet.bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
          overflow: 'hidden',
        }}
      >
        {category.logoUrl ? (
          <Image
            source={{ uri: category.logoUrl }}
            style={{ width: 56, height: 56, borderRadius: 28 }}
            resizeMode="cover"
          />
        ) : (
          <MaterialCommunityIcons
            name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={28}
            color={colorSet.icon}
          />
        )}
      </View>
      <AppText
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: theme.text,
          textAlign: 'center',
        }}
      >
        {category.name}
      </AppText>
    </Pressable>
  );
};

export const CategoryCard = React.memo(CategoryCardComponent);
