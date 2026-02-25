import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

interface BusinessCoverSectionProps {
  coverImageUrl: string | null;
  logoUrl: string | null;
  name: string;
  categoryName: string;
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  onBackPress: () => void;
}

const StarRating: React.FC<{ rating: number; size?: number; color?: string }> = ({
  rating,
  size = 14,
  color = colors.ratingGold,
}) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<MaterialCommunityIcons key={i} name="star" size={size} color={color} />);
    } else if (rating >= i - 0.5) {
      stars.push(<MaterialCommunityIcons key={i} name="star-half-full" size={size} color={color} />);
    } else {
      stars.push(<MaterialCommunityIcons key={i} name="star-outline" size={size} color={color} />);
    }
  }
  return <View style={{ flexDirection: 'row', gap: 1 }}>{stars}</View>;
};

export { StarRating };

export const BusinessCoverSection: React.FC<BusinessCoverSectionProps> = ({
  coverImageUrl,
  logoUrl,
  name,
  categoryName,
  isOpen,
  rating,
  reviewCount,
  onBackPress,
}) => {
  const { t } = useTranslation();

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Cover Photo */}
      <View style={{ width: '100%', height: 256, overflow: 'hidden' }}>
        {coverImageUrl ? (
          <Image
            source={{ uri: coverImageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            accessibilityLabel={t('businessDetail.coverPhoto')}
          />
        ) : (
          <View style={{ width: '100%', height: '100%', backgroundColor: colors.cardDark }} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.6)', colors.midnight]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}
        />

        {/* Back Button */}
        <Pressable
          onPress={onBackPress}
          accessibilityLabel={t('common.cancel')}
          accessibilityRole="button"
          style={{
            position: 'absolute',
            top: 56,
            left: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.white} />
        </Pressable>
      </View>

      {/* Logo */}
      <View
        style={{
          marginTop: -48,
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.midnight,
          padding: 4,
          shadowColor: colors.neonPurple,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 25,
          elevation: 20,
        }}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 44,
            overflow: 'hidden',
            backgroundColor: colors.midnight,
            borderWidth: 2,
            borderColor: colors.neonPurple,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              accessibilityLabel={`${name} logo`}
            />
          ) : (
            <MaterialCommunityIcons name="store" size={32} color={colors.neonPurple} />
          )}
        </View>
      </View>

      {/* Business Name */}
      <AppText
        style={{
          marginTop: 16,
          fontSize: 24,
          fontWeight: '700',
          color: colors.white,
          textAlign: 'center',
          letterSpacing: -0.3,
        }}
      >
        {name}
      </AppText>

      {/* Category & Open Status */}
      <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <AppText style={{ fontSize: 14, fontWeight: '300', color: colors.textSlate400 }}>
          {categoryName}
        </AppText>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSlate600 }} />
        <AppText style={{ fontSize: 14, fontWeight: '500', color: isOpen ? colors.success : colors.error }}>
          {isOpen ? t('businessDetail.openNow') : t('businessDetail.closed')}
        </AppText>
      </View>

      {/* Rating */}
      <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <StarRating rating={rating} />
        <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>
          {rating.toFixed(1)}
        </AppText>
        <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>
          ({reviewCount} {t('businessDetail.reviews')})
        </AppText>
      </View>
    </View>
  );
};
