import React, { useState } from 'react';
import { View, Image, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { Card } from '@/presentation/shared/components/ui/Card';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { BusinessEntity, BusinessStatus, BusinessOpeningHours } from '@/domain/business/entities/businessEntity';
import { getCategoryDefaultCover, getCategoryDefaultLogo } from '@/core/utils/categoryDefaultImages';
import { ImageSourcePropType } from 'react-native';
import { useCategoryDefaultStore } from '@/presentation/shared/store/categoryDefaultStore';

const DAY_INDEX = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getTodayInfo(hours: BusinessOpeningHours, visible?: boolean): {
  openStatus: boolean | null;
  timeRange: string | null;
} {
  // visible=false means owner hid the hours — no badge
  if (visible === false) return { openStatus: null, timeRange: null };
  const schedule = hours[DAY_INDEX[new Date().getDay()]];
  if (!schedule) return { openStatus: null, timeRange: null };
  if (!schedule.isOpen) return { openStatus: false, timeRange: null };
  const timeRange = `${schedule.openTime} – ${schedule.closeTime}`;
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  const [oh, om] = schedule.openTime.split(':').map(Number);
  const [ch, cm] = schedule.closeTime.split(':').map(Number);
  const isNowOpen = cur >= oh * 60 + om && cur < ch * 60 + cm;
  return { openStatus: isNowOpen, timeRange };
}

const STATUS_CONFIG: Record<BusinessStatus, { color: string; bg: string; icon: string }> = {
  active: { color: '#14532D', bg: '#22C55E', icon: 'check-circle-outline' },
  pending: { color: '#1C1917', bg: '#F59E0B', icon: 'clock-outline' },
  rejected: { color: '#fff', bg: '#EF4444', icon: 'close-circle-outline' },
  blocked: { color: '#fff', bg: '#7C3AED', icon: 'cancel' },
  suspended: { color: '#fff', bg: '#64748B', icon: 'pause-circle-outline' },
};

interface BusinessCardProps {
  business: BusinessEntity;
  onPress: () => void;
  onWishlistPress: () => void;
  isWishlisted: boolean;
  showWishlist?: boolean;
  showStatus?: boolean;
  variant?: 'full' | 'compact';
  isNew?: boolean;
}

const BusinessCardComponent: React.FC<BusinessCardProps> = ({
  business,
  onPress,
  onWishlistPress,
  isWishlisted,
  showWishlist = true,
  showStatus = false,
  variant = 'full',
  isNew = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const remoteDefaults = useCategoryDefaultStore((s) => s.defaults[business.categoryId]);

  const { openStatus, timeRange } = business.openingHours
    ? getTodayInfo(business.openingHours, business.openingHoursVisible)
    : { openStatus: null, timeRange: null };

  const statusLabel: Record<BusinessStatus, string> = {
    active: t('businessOwner.pendingBadge.activeLabel'),
    pending: t('businessOwner.pendingBadge.buttonLabel'),
    rejected: t('businessOwner.pendingBadge.rejectedLabel'),
    blocked: t('businessOwner.pendingBadge.blockedLabel'),
    suspended: t('businessOwner.pendingBadge.blockedLabel'),
  };

  const renderStatusBadge = (position: 'cover' | 'inline') => {
    if (!showStatus) return null;
    const cfg = STATUS_CONFIG[business.status];
    const label = statusLabel[business.status];
    if (position === 'cover') {
      return (
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: cfg.bg,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <MaterialCommunityIcons name={cfg.icon as never} size={12} color={cfg.color} />
          <AppText style={{ fontSize: 10, fontWeight: '700', color: cfg.color }}>{label}</AppText>
        </View>
      );
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 3,
          backgroundColor: cfg.bg,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 8,
          alignSelf: 'flex-start',
          marginTop: 4,
        }}
      >
        <MaterialCommunityIcons name={cfg.icon as never} size={10} color={cfg.color} />
        <AppText style={{ fontSize: 9, fontWeight: '700', color: cfg.color }}>{label}</AppText>
      </View>
    );
  };
  const coverSource: ImageSourcePropType | null = business.coverImageUrl
    ? { uri: business.coverImageUrl }
    : remoteDefaults?.coverImageUrl
      ? { uri: remoteDefaults.coverImageUrl }
      : getCategoryDefaultCover(business.categoryId) ?? getCategoryDefaultLogo(business.categoryId);
  const logoSource: ImageSourcePropType | null = business.logoUrl
    ? { uri: business.logoUrl }
    : business.coverImageUrl
      ? { uri: business.coverImageUrl }
      : remoteDefaults?.profileImageUrl
        ? { uri: remoteDefaults.profileImageUrl }
        : getCategoryDefaultLogo(business.categoryId) ?? getCategoryDefaultCover(business.categoryId);

  if (variant === 'compact') {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.card,
          borderRadius: 18,
          marginBottom: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        {/* Main tappable area (thumbnail + text) */}
        <Pressable
          onPress={onPress}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            gap: 14,
          }}
          accessibilityLabel={business.name}
          accessibilityRole="button"
        >
          {/* Thumbnail */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 14,
              overflow: 'hidden',
              backgroundColor: theme.border,
            }}
          >
            {logoSource !== null && !logoError ? (
              <Image
                source={logoSource}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                accessibilityLabel={business.name}
                onError={() => setLogoError(true)}
              />
            ) : (
              <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="store" size={32} color={colors.textSlate500} />
              </View>
            )}

            {/* NEW badge overlaid on thumbnail */}
            {isNew && (
              <View
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 6,
                  backgroundColor: colors.neonPurple,
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <AppText style={{ color: colors.white, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 }}>
                  NEW
                </AppText>
              </View>
            )}
          </View>

          {/* Text info */}
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <AppText
              style={{ fontSize: 15, fontWeight: '700', color: theme.text }}
              numberOfLines={1}
            >
              {business.name}
            </AppText>
            <AppText
              style={{ fontSize: 12, color: theme.textSecondary }}
              numberOfLines={1}
            >
              {business.location}{business.categoryName ? ` • ${business.categoryName}` : ''}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MaterialCommunityIcons name="star" size={13} color={colors.ratingGold} />
              <AppText style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>
                {business.rating.toFixed(1)}
              </AppText>
              <AppText style={{ fontSize: 12, color: theme.textSecondary }}>
                ({business.reviewCount} reviews)
              </AppText>
              {openStatus !== null && (
                <>
                  <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textSlate600 }} />
                  <AppText style={{ fontSize: 11, fontWeight: '600', color: openStatus ? colors.success : colors.error }}>
                    {openStatus ? t('businessDetail.openNow') : t('businessDetail.closed')}
                  </AppText>
                </>
              )}
            </View>
            {renderStatusBadge('inline')}
          </View>
        </Pressable>

        {/* Heart — sibling of the main Pressable, never nested inside it */}
        {showWishlist && (
          <Pressable
            onPress={onWishlistPress}
            hitSlop={8}
            style={{ paddingHorizontal: 14 }}
            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={isWishlisted ? colors.red : colors.textSlate500}
            />
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Card>
        {/* Cover Image — tappable to navigate */}
        <Pressable
          onPress={onPress}
          accessibilityLabel={business.name}
          accessibilityRole="button"
        >
          <View style={{ height: 192, width: '100%', overflow: 'hidden' }}>
            {coverSource !== null && !coverError ? (
              <Image
                source={coverSource}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                onError={() => setCoverError(true)}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: theme.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="store" size={48} color={colors.textSlate500} />
              </View>
            )}

            {/* Gradient overlay */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                backgroundColor: 'transparent',
              }}
            />

            {/* Status badge */}
            {renderStatusBadge('cover')}

            {/* Rating badge */}
            <View
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <MaterialCommunityIcons
                name="star"
                size={14}
                color={colors.ratingGold}
                style={{ marginRight: 4 }}
              />
              <AppText
                style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}
              >
                {business.rating.toFixed(1)}
              </AppText>
            </View>
          </View>
        </Pressable>

        {/* Card Body */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 8,
            }}
          >
            {/* Text info — tappable to navigate */}
            <Pressable onPress={onPress} style={{ flex: 1, marginRight: 8 }}>
              <AppText
                style={{ fontSize: 18, fontWeight: '700', color: theme.text }}
              >
                {business.name}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <AppText style={{ fontSize: 12, color: theme.textSecondary }}>
                  {business.location} • {business.categoryName}
                </AppText>
                {openStatus !== null && (
                  <>
                    <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textSlate600 }} />
                    <AppText style={{ fontSize: 12, fontWeight: '600', color: openStatus ? colors.success : colors.error }}>
                      {openStatus ? t('businessDetail.openNow') : t('businessDetail.closed')}
                    </AppText>
                  </>
                )}
              </View>
            </Pressable>

            {/* Action buttons — siblings of nav Pressable, never nested inside it */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {showWishlist && (
                <Pressable
                  onPress={onWishlistPress}
                  hitSlop={8}
                  accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons
                    name={isWishlisted ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isWishlisted ? colors.red : colors.textSlate500}
                  />
                </Pressable>
              )}
            </View>
          </View>

          {/* Today's hours badge — only when hours are set and visible */}
          {openStatus !== null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: openStatus ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: openStatus ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: openStatus ? colors.success : colors.error }} />
                <AppText style={{ fontSize: 12, fontWeight: '700', color: openStatus ? colors.success : colors.error }}>
                  {openStatus ? t('businessDetail.openNow') : t('businessDetail.closed')}
                </AppText>
              </View>
              {timeRange && (
                <AppText style={{ fontSize: 13, color: theme.textSecondary }}>
                  {timeRange}
                </AppText>
              )}
            </View>
          )}
        </View>
      </Card>
    </View>
  );
};

export const BusinessCard = React.memo(BusinessCardComponent);
