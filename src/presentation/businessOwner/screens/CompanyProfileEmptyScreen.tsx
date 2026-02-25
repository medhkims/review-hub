import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { CoverPhotoSection } from '../components/CoverPhotoSection';
import { DescriptionCard } from '../components/DescriptionCard';
import { InformationCard } from '../components/InformationCard';
import { DeliveryCard } from '../components/DeliveryCard';
import { PriceListCard } from '../components/PriceListCard';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

export default function CompanyProfileEmptyScreen() {
  useAnalyticsScreen(AnalyticsScreens.COMPANY_PROFILE_EMPTY);
  const { t } = useTranslation();
  const router = useRouter();

  const handleSaveChanges = () => {
    // TODO: implement save logic
  };

  const handleCoverPress = () => {
    // TODO: open image picker for cover photo
  };

  const handleLogoPress = () => {
    // TODO: open image picker for logo
  };

  const handleNamePress = () => {
    // TODO: open business name editor
  };

  const handleCategoryPress = () => {
    // TODO: open category selector
  };

  const handleDescriptionPress = () => {
    // TODO: open description editor
  };

  const handleLocationPress = () => {
    // TODO: open map/location picker
  };

  const handleContactPress = (type: string) => {
    // TODO: open contact editor for the given type
  };

  const handleAddLink = (serviceId: string) => {
    // TODO: open link editor for delivery service
  };

  const handleAddCategory = () => {
    // TODO: open add category flow for price list
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('common.cancel')}
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.cardDark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.white} />
        </Pressable>

        <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
          {t('businessOwner.companyProfile.title')}
        </AppText>

        <Pressable
          accessibilityLabel={t('common.ok')}
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.cardDark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.white} />
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140, gap: 24 }}
      >
        <CoverPhotoSection
          onCoverPress={handleCoverPress}
          onLogoPress={handleLogoPress}
          onNamePress={handleNamePress}
          onCategoryPress={handleCategoryPress}
        />

        <DescriptionCard onPress={handleDescriptionPress} />

        <InformationCard
          onEditAll={() => {}}
          onLocationPress={handleLocationPress}
          onContactPress={handleContactPress}
        />

        <DeliveryCard onAddLink={handleAddLink} />

        <PriceListCard onAddCategory={handleAddCategory} />
      </ScrollView>

      {/* Bottom Save Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.midnight,
          borderTopWidth: 1,
          borderTopColor: colors.cardDark,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
        }}
      >
        <AppButton
          title={t('businessOwner.companyProfile.saveChanges')}
          onPress={handleSaveChanges}
          shape="rounded"
          size="lg"
          accessibilityLabel={t('businessOwner.companyProfile.saveChanges')}
          style={{
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 10,
          }}
        />
      </View>
    </ScreenLayout>
  );
}
