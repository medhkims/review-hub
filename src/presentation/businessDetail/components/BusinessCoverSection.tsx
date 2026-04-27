import React, { useState } from 'react';
import { View, Image, Pressable, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { ImageSourcePropType } from 'react-native';
import { useCategoryDefaultStore } from '@/presentation/shared/store/categoryDefaultStore';

interface BusinessCoverSectionProps {
  coverImageUrl: string | null;
  logoUrl: string | null;
  categoryId: string;
  name: string;
  categoryName: string;
  subcategoryNames?: string[];
  /** null = no badge; true/false = open/closed badge */
  openStatus: boolean | null;
  rating: number;
  reviewCount: number;
  isOwnerVerified?: boolean;
  isImported?: boolean;
  isClaimed?: boolean;
  onBackPress: () => void;
  onRatingPress?: () => void;
  onSharePress?: () => void;
  onReportPress?: () => void;
  onClaimPress?: () => void;
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
  categoryId,
  name,
  categoryName,
  subcategoryNames = [],
  openStatus,
  rating,
  reviewCount,
  isOwnerVerified = false,
  isImported = false,
  isClaimed = false,
  onBackPress,
  onRatingPress,
  onSharePress,
  onReportPress,
  onClaimPress,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const remoteDefaults = useCategoryDefaultStore((s) => s.defaults[categoryId]);

  const isValidUrl = (url: string | null): boolean =>
    !!url && (url.startsWith('http://') || url.startsWith('https://'));

  const coverSource: ImageSourcePropType | null = isValidUrl(coverImageUrl)
    ? { uri: coverImageUrl! }
    : remoteDefaults?.coverImageUrl
      ? { uri: remoteDefaults.coverImageUrl }
      : null;

  const logoSource: ImageSourcePropType | null = isValidUrl(logoUrl)
    ? { uri: logoUrl! }
    : remoteDefaults?.profileImageUrl
      ? { uri: remoteDefaults.profileImageUrl }
      : null;

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Cover Photo */}
      <View style={Platform.OS === 'web'
        ? { width: '100%', aspectRatio: 16 / 9, maxHeight: 320, overflow: 'hidden', backgroundColor: theme.card }
        : { width: '100%', height: 256, overflow: 'hidden', backgroundColor: theme.card }}>
        {coverSource !== null && !coverError ? (
          <Image
            source={coverSource}
            style={{ width: '100%', height: '100%' }}
            resizeMode={Platform.OS === 'web' ? 'cover' : 'contain'}
            accessibilityLabel={t('businessDetail.coverPhoto')}
            onError={() => setCoverError(true)}
          />
        ) : (
          <View style={{ width: '100%', height: '100%', backgroundColor: theme.card }} />
        )}

        {/* Back Button */}
        <Pressable
          onPress={onBackPress}
          accessibilityLabel={t('common.back')}
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
          <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Top-right action buttons: Share + Report */}
        <View
          style={{
            position: 'absolute',
            top: 56,
            right: 20,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          {onSharePress && (
            <Pressable
              onPress={onSharePress}
              accessibilityLabel={t('businessDetail.share')}
              accessibilityRole="button"
              style={{
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
              <MaterialCommunityIcons name="share-variant" size={20} color="#FFFFFF" />
            </Pressable>
          )}
          {onReportPress && (
            <Pressable
              onPress={onReportPress}
              accessibilityLabel={t('businessDetail.report')}
              accessibilityRole="button"
              style={{
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
              <MaterialCommunityIcons name="flag-outline" size={20} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Logo */}
      <View
        style={{
          marginTop: -48,
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: theme.background,
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
            backgroundColor: theme.background,
            borderWidth: 2,
            borderColor: colors.neonPurple,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {logoSource !== null && !logoError ? (
            <Image
              source={logoSource}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              accessibilityLabel={`${name} logo`}
              onError={() => setLogoError(true)}
            />
          ) : (
            <MaterialCommunityIcons name="store" size={32} color={colors.neonPurple} />
          )}
        </View>
      </View>

      {/* Business Name */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 6, paddingHorizontal: 20 }}>
        <AppText
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: theme.text,
            textAlign: 'center',
            letterSpacing: -0.3,
            flexShrink: 1,
          }}
        >
          {name}
        </AppText>
        {isOwnerVerified && (
          <MaterialCommunityIcons name="check-decagram" size={22} color={colors.blue} />
        )}
      </View>

      {/* Category & Open Status */}
      <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <AppText style={{ fontSize: 14, fontWeight: '300', color: theme.textSecondary }}>
          {categoryName}
        </AppText>
        {subcategoryNames.length > 0 && (
          <>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSlate600 }} />
            <AppText style={{ fontSize: 14, fontWeight: '400', color: colors.neonPurple }}>
              {subcategoryNames.join(', ')}
            </AppText>
          </>
        )}
        {openStatus !== null && (
          <>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSlate600 }} />
            <AppText style={{ fontSize: 14, fontWeight: '500', color: openStatus ? colors.success : colors.error }}>
              {openStatus ? t('businessDetail.openNow') : t('businessDetail.closed')}
            </AppText>
          </>
        )}
      </View>

      {/* Claim Business — subtle link under name, for owners */}
      {isImported && !isClaimed && onClaimPress && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('businessDetail.claimBusiness')}
          onPress={onClaimPress}
          style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <AppText style={{ fontSize: 12, color: theme.textMuted, textDecorationLine: 'underline' }}>
            {t('businessDetail.claimBusiness')}
          </AppText>
          <MaterialCommunityIcons name="store-check-outline" size={12} color={theme.textMuted} />
        </Pressable>
      )}

      {/* Rating */}
      <Pressable
        onPress={onRatingPress}
        accessibilityRole="button"
        accessibilityLabel={`${rating.toFixed(1)} ${t('businessDetail.reviews')}`}
        style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
      >
        <StarRating rating={rating} />
        <AppText style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>
          {rating.toFixed(1)}
        </AppText>
        <AppText style={{ fontSize: 12, color: theme.textSecondary }}>
          ({reviewCount} {t('businessDetail.reviews')})
        </AppText>
      </Pressable>
    </View>
  );
};
