import React from 'react';
import { View, Pressable, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

interface CoverPhotoSectionProps {
  onCoverPress?: () => void;
  onLogoPress?: () => void;
  onNamePress?: () => void;
  onCategoryPress?: () => void;
  onBackPress?: () => void;
  businessName?: string;
  categoryName?: string;
  coverImageUri?: string;
  logoImageUri?: string;
  populated?: boolean;
}

export const CoverPhotoSection: React.FC<CoverPhotoSectionProps> = ({
  onCoverPress,
  onLogoPress,
  onNamePress,
  onCategoryPress,
  onBackPress,
  businessName,
  categoryName,
  coverImageUri,
  logoImageUri,
  populated = false,
}) => {
  const { t } = useTranslation();

  if (populated) {
    return (
      <View style={{ alignItems: 'center' }}>
        {/* Cover Photo with gradient */}
        <View style={{ width: '100%', height: 220, overflow: 'hidden' }}>
          {coverImageUri ? (
            <Image
              source={{ uri: coverImageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              accessibilityLabel={t('businessOwner.companyProfile.addCoverPhoto')}
            />
          ) : (
            <View style={{ width: '100%', height: '100%', backgroundColor: colors.cardDark }} />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.6)', colors.midnight]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}
          />

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
        </View>

        {/* Logo with purple border */}
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
            {logoImageUri ? (
              <Image
                source={{ uri: logoImageUri }}
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

        {/* Business Name */}
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

        {/* Category */}
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <AppText style={{ fontSize: 14, fontWeight: '300', color: colors.textSlate400 }}>
            {categoryName || t('businessOwner.companyProfile.selectCategory')}
          </AppText>
        </View>
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
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: colors.borderDark,
          backgroundColor: `${colors.cardDark}80`,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <MaterialCommunityIcons name="camera-plus" size={32} color={colors.textSlate400} />
        <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.textSlate400 }}>
          {t('businessOwner.companyProfile.addCoverPhoto')}
        </AppText>
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
            backgroundColor: colors.cardDark,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: `${colors.neonPurple}80`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="upload" size={24} color={colors.neonPurple} />
          <AppText style={{ fontSize: 10, fontWeight: '500', color: colors.neonPurple, marginTop: 4 }}>
            {t('businessOwner.companyProfile.logo')}
          </AppText>
        </View>
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
