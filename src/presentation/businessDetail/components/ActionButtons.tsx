import React from 'react';
import { View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

interface ActionButtonsProps {
  isFavorite: boolean;
  onAddReview: () => void;
  onToggleFavorite: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isFavorite,
  onAddReview,
  onToggleFavorite,
}) => {
  const { t } = useTranslation();

  return (
    <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 24, marginTop: 24, marginBottom: 32 }}>
      <Pressable
        onPress={onAddReview}
        accessibilityLabel={t('businessDetail.addReview')}
        accessibilityRole="button"
        style={({ pressed }) => ({
          flex: 1,
          backgroundColor: pressed ? '#9333EA' : colors.neonPurple,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          shadowColor: colors.neonPurple,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 8,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <MaterialCommunityIcons name="pencil-box-outline" size={20} color={colors.white} />
        <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white }}>
          {t('businessDetail.addReview')}
        </AppText>
      </Pressable>

      <Pressable
        onPress={onToggleFavorite}
        accessibilityLabel={isFavorite ? t('businessDetail.removeFromFavorites') : t('businessDetail.addToFavorites')}
        accessibilityRole="button"
        style={({ pressed }) => ({
          width: 56,
          backgroundColor: colors.cardDark,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <MaterialCommunityIcons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          color={isFavorite ? colors.error : colors.white}
        />
      </Pressable>
    </View>
  );
};
