import React from 'react';
import { View, Pressable, Image, ImageSourcePropType, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { getCategoryDefaultCover, getCategoryDefaultLogo } from '@/core/utils/categoryDefaultImages';
import { useCategoryDefaultStore } from '@/presentation/shared/store/categoryDefaultStore';

interface CoverPhotoSectionProps {
  onCoverPress?: () => void;
  onLogoPress?: () => void;
  onNamePress?: () => void;
  onCategoryPress?: () => void;
  onBackPress?: () => void;
  onPendingBadgePress?: () => void;
  onEditPress?: () => void;
  onSavePress?: () => void;
  onCancelPress?: () => void;
  isEditMode?: boolean;
  businessName?: string;
  categoryName?: string;
  categoryId?: string;
  coverImageUri?: string;
  logoImageUri?: string;
  populated?: boolean;
  isPending?: boolean;
  businessStatus?: 'pending' | 'active' | 'rejected' | 'blocked';
}

export const CoverPhotoSection: React.FC<CoverPhotoSectionProps> = ({
  onCoverPress,
  onLogoPress,
  onNamePress,
  onCategoryPress,
  onBackPress,
  onPendingBadgePress,
  onEditPress,
  onSavePress,
  onCancelPress,
  isEditMode = false,
  businessName,
  categoryName,
  categoryId,
  coverImageUri,
  logoImageUri,
  populated = false,
  isPending = false,
  businessStatus,
}) => {
  const { t } = useTranslation();
  const remoteDefaults = useCategoryDefaultStore((s) => categoryId ? s.defaults[categoryId] : undefined);

  const isValidUrl = (url: string | undefined): boolean =>
    !!url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://'));

  const coverSource: ImageSourcePropType | null = isValidUrl(coverImageUri)
    ? { uri: coverImageUri! }
    : remoteDefaults?.coverImageUrl
      ? { uri: remoteDefaults.coverImageUrl }
      : (categoryId ? getCategoryDefaultCover(categoryId) : null);

  const logoSource: ImageSourcePropType | null = isValidUrl(logoImageUri)
    ? { uri: logoImageUri! }
    : remoteDefaults?.profileImageUrl
      ? { uri: remoteDefaults.profileImageUrl }
      : (categoryId ? getCategoryDefaultLogo(categoryId) : null);

  if (populated) {
    return (
      <View style={{ alignItems: 'center' }}>
        {/* Cover Photo with gradient */}
        <View style={Platform.OS === 'web'
          ? { width: '100%', aspectRatio: 16 / 9, maxHeight: 320, overflow: 'hidden', backgroundColor: colors.cardDark }
          : { width: '100%', height: 220, overflow: 'hidden', backgroundColor: colors.cardDark }}>
          {coverSource ? (
            <Image
              source={coverSource}
              style={{ width: '100%', height: '100%' }}
              resizeMode={Platform.OS === 'web' ? 'cover' : 'contain'}
              accessibilityLabel={t('businessOwner.companyProfile.addCoverPhoto')}
            />
          ) : (
            <View style={{ width: '100%', height: '100%', backgroundColor: colors.cardDark }} />
          )}

          {/* Back Button */}
          {onBackPress && (
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
          )}

          {/* Cover edit button — bottom-right, only in edit mode */}
          {onCoverPress && (
            <Pressable
              onPress={onCoverPress}
              accessibilityLabel={t('businessOwner.companyProfile.addCoverPhoto')}
              accessibilityRole="button"
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.neonPurple,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.midnight,
              }}
            >
              <MaterialCommunityIcons name="pencil" size={16} color={colors.white} />
            </Pressable>
          )}

          {/* Top-right area: edit/save/cancel controls + status badge */}
          <View style={{ position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {isEditMode ? (
              <>
                {/* Cancel */}
                <Pressable
                  onPress={onCancelPress}
                  accessibilityLabel={t('common.cancel')}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: 'rgba(30,41,59,0.85)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.15)',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <MaterialCommunityIcons name="close" size={13} color={colors.textSlate400} />
                  <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.textSlate400 }}>
                    {t('common.cancel')}
                  </AppText>
                </Pressable>
                {/* Save */}
                <Pressable
                  onPress={onSavePress}
                  accessibilityLabel={t('common.done')}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: '#22C55E',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <MaterialCommunityIcons name="check" size={13} color="#14532D" />
                  <AppText style={{ fontSize: 11, fontWeight: '700', color: '#14532D' }}>
                    {t('common.done')}
                  </AppText>
                </Pressable>
              </>
            ) : (
              <>
                {/* Status badge */}
                {businessStatus && (() => {
                  const statusMap: Record<string, { bg: string; textColor: string; icon: string; label: string }> = {
                    pending:  { bg: '#F59E0B', textColor: '#1C1917', icon: 'clock-outline',       label: t('businessOwner.pendingBadge.buttonLabel') },
                    active:   { bg: '#22C55E', textColor: '#14532D', icon: 'check-circle-outline', label: t('businessOwner.pendingBadge.activeLabel') },
                    rejected: { bg: '#EF4444', textColor: '#fff',    icon: 'close-circle-outline', label: t('businessOwner.pendingBadge.rejectedLabel') },
                    blocked:  { bg: '#7C3AED', textColor: '#fff',    icon: 'cancel',               label: t('businessOwner.pendingBadge.blockedLabel') },
                  };
                  const cfg = statusMap[businessStatus];
                  if (!cfg) return null;
                  return (
                    <Pressable
                      onPress={onPendingBadgePress}
                      accessibilityLabel={cfg.label}
                      accessibilityRole="button"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        backgroundColor: cfg.bg,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 20,
                      }}
                    >
                      <MaterialCommunityIcons name={cfg.icon as never} size={13} color={cfg.textColor} />
                      <AppText style={{ fontSize: 11, fontWeight: '700', color: cfg.textColor }}>
                        {cfg.label}
                      </AppText>
                    </Pressable>
                  );
                })()}
                {/* Pencil edit button */}
                {onEditPress && (
                  <Pressable
                    onPress={onEditPress}
                    accessibilityLabel={t('businessOwner.companyProfile.editProfile')}
                    accessibilityRole="button"
                    style={({ pressed }) => ({
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: 'rgba(30,41,59,0.85)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.2)',
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    <MaterialCommunityIcons name="pencil" size={15} color={colors.white} />
                  </Pressable>
                )}
              </>
            )}
          </View>
        </View>

        {/* Logo with purple border */}
        {onLogoPress ? (
          <Pressable
            onPress={onLogoPress}
            accessibilityLabel={t('businessOwner.companyProfile.logo')}
            accessibilityRole="button"
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
              {logoSource ? (
                <Image
                  source={logoSource}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons name="store" size={32} color={colors.neonPurple} />
              )}
            </View>
            {/* Edit badge */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.neonPurple,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.midnight,
              }}
            >
              <MaterialCommunityIcons name="pencil" size={12} color={colors.white} />
            </View>
          </Pressable>
        ) : (
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
              {logoSource ? (
                <Image
                  source={logoSource}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons name="store" size={32} color={colors.neonPurple} />
              )}
            </View>
          </View>
        )}

        {/* Business Name */}
        {onNamePress ? (
          <Pressable
            onPress={onNamePress}
            accessibilityLabel={businessName || t('businessOwner.companyProfile.businessName')}
            accessibilityRole="button"
            style={{ marginTop: 16 }}
          >
            <AppText style={{ fontSize: 24, fontWeight: '700', color: colors.white, textAlign: 'center', letterSpacing: -0.3 }}>
              {businessName || t('businessOwner.companyProfile.businessName')}
            </AppText>
          </Pressable>
        ) : (
          <AppText style={{ fontSize: 24, fontWeight: '700', color: colors.white, textAlign: 'center', letterSpacing: -0.3, marginTop: 16 }}>
            {businessName}
          </AppText>
        )}

        {/* Category */}
        {onCategoryPress ? (
          <Pressable
            onPress={onCategoryPress}
            accessibilityLabel={t('businessOwner.companyProfile.selectCategory')}
            accessibilityRole="button"
            style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <AppText style={{ fontSize: 14, fontWeight: '300', color: colors.textSlate400 }}>
              {categoryName || t('businessOwner.companyProfile.selectCategory')}
            </AppText>
            <MaterialCommunityIcons name="chevron-down" size={16} color={colors.textSlate400} />
          </Pressable>
        ) : (
          <AppText style={{ fontSize: 14, fontWeight: '300', color: colors.textSlate400, marginTop: 8 }}>
            {categoryName}
          </AppText>
        )}
      </View>
    );
  }

  // Empty state (original)
  return (
    <View style={{ alignItems: 'center' }}>
      {/* Cover Photo Placeholder */}
      <Pressable
        onPress={onCoverPress}
        accessibilityLabel={t('businessOwner.companyProfile.addCoverPhoto')}
        accessibilityRole="button"
        style={{
          width: '100%',
          height: 160,
          borderRadius: 16,
          borderWidth: coverSource ? 0 : 2,
          borderStyle: 'dashed',
          borderColor: colors.borderDark,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {coverSource ? (
          <>
            <Image
              source={coverSource}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            {/* Pencil badge */}
            <View
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.neonPurple,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.midnight,
              }}
            >
              <MaterialCommunityIcons name="pencil" size={14} color={colors.white} />
            </View>
          </>
        ) : (
          <>
            <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: `${colors.cardDark}80` }} />
            <MaterialCommunityIcons name="camera-plus" size={32} color={colors.textSlate400} />
            <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.textSlate400 }}>
              {t('businessOwner.companyProfile.addCoverPhoto')}
            </AppText>
          </>
        )}
      </Pressable>

      {/* Logo Placeholder */}
      <Pressable
        onPress={onLogoPress}
        accessibilityLabel={t('businessOwner.companyProfile.logo')}
        accessibilityRole="button"
        style={{
          marginTop: -48,
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.midnight,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.neonPurple,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 20,
        }}
      >
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            overflow: 'hidden',
            backgroundColor: colors.cardDark,
            borderWidth: 2,
            borderColor: logoSource ? colors.neonPurple : `${colors.neonPurple}80`,
            borderStyle: logoSource ? 'solid' : 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {logoSource ? (
            <Image
              source={logoSource}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <>
              <MaterialCommunityIcons name="upload" size={24} color={colors.neonPurple} />
              <AppText style={{ fontSize: 10, fontWeight: '500', color: colors.neonPurple, marginTop: 4 }}>
                {t('businessOwner.companyProfile.logo')}
              </AppText>
            </>
          )}
        </View>

        {/* Pencil badge — shown when a default image is displayed */}
        {logoSource && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: colors.neonPurple,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: colors.midnight,
            }}
          >
            <MaterialCommunityIcons name="pencil" size={12} color={colors.white} />
          </View>
        )}
      </Pressable>

      {/* Business Name */}
      <Pressable
        onPress={onNamePress}
        accessibilityLabel={businessName || t('businessOwner.companyProfile.businessName')}
        accessibilityRole="button"
        style={{ marginTop: 16 }}
      >
        <AppText style={{ fontSize: 24, fontWeight: '700', color: colors.textSlate400, textAlign: 'center' }}>
          {businessName || t('businessOwner.companyProfile.businessName')}
        </AppText>
      </Pressable>

      {/* Category Selector */}
      <Pressable
        onPress={onCategoryPress}
        accessibilityLabel={t('businessOwner.companyProfile.selectCategory')}
        accessibilityRole="button"
        style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}
      >
        <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.neonPurple }}>
          {categoryName || t('businessOwner.companyProfile.selectCategory')}
        </AppText>
        <MaterialCommunityIcons name="chevron-down" size={16} color={colors.neonPurple} />
      </Pressable>
    </View>
  );
};
