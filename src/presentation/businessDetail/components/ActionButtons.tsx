import React from 'react';
import { View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

interface ActionButtonsProps {
  isWishlisted: boolean;
  onAddReview: () => void;
  onToggleWishlist: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isWishlisted,
  onAddReview,
  onToggleWishlist,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginTop: 24, marginBottom: 32 }}>
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
        <MaterialCommunityIcons name="pencil-box-outline" size={20} color="#FFFFFF" />
        <AppText style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
          {t('businessDetail.addReview')}
        </AppText>
      </Pressable>

      <Pressable
        onPress={onToggleWishlist}
        accessibilityLabel={isWishlisted ? t('businessDetail.removeFromWishlist') : t('businessDetail.addToWishlist')}
        accessibilityRole="button"
        style={({ pressed }) => ({
          width: 56,
          backgroundColor: theme.card,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isWishlisted ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)',
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <MaterialCommunityIcons
          name={isWishlisted ? 'heart' : 'heart-outline'}
          size={24}
          color={isWishlisted ? colors.error : theme.text}
        />
      </Pressable>
    </View>
  );
};
