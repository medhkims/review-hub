import React, { useState } from 'react';
import { ScrollView, View, RefreshControl, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { BusinessCoverSection } from '../components/BusinessCoverSection';
import { ActionButtons } from '../components/ActionButtons';
import { ReviewsSection } from '../components/ReviewsSection';
import { InformationSection } from '../components/InformationSection';
import { DeliverySection } from '../components/DeliverySection';
import { MenuSection } from '../components/MenuSection';
import { DescriptionSection } from '../components/DescriptionSection';
import { useBusinessDetail } from '../hooks/useBusinessDetail';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { OpeningHours, DayKey } from '@/domain/business/entities/businessDetailEntity';

const DAY_INDEX: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function computeIsOpen(hours: OpeningHours): boolean {
  const now = new Date();
  const schedule = hours[DAY_INDEX[now.getDay()]];
  if (!schedule?.isOpen) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = schedule.openTime.split(':').map(Number);
  const [ch, cm] = schedule.closeTime.split(':').map(Number);
  return cur >= oh * 60 + om && cur < ch * 60 + cm;
}

interface BusinessDetailScreenProps {
  businessId: string;
}

export default function BusinessDetailScreen({ businessId }: BusinessDetailScreenProps) {
  useAnalyticsScreen(AnalyticsScreens.BUSINESS_DETAIL);
  const router = useRouter();
  const { t } = useTranslation();
  const { business, reviews, isLoading, error, toggleWishlist, isWishlisted, checkHasReviewed, refresh } = useBusinessDetail(businessId);
  const [alreadyReviewedVisible, setAlreadyReviewedVisible] = useState(false);

  if (isLoading && !business) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.midnight }}>
        <LoadingIndicator />
      </View>
    );
  }

  if (error && !business) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.midnight, justifyContent: 'center' }}>
        <ErrorView message={error} onRetry={refresh} />
      </View>
    );
  }

  if (!business) return null;

  // Badge only shown when hours are set AND visible to users
  const openStatus: boolean | null =
    business.openingHours && business.openingHoursVisible !== false
      ? computeIsOpen(business.openingHours)
      : null;

  const handleAddReview = async () => {
    const hasReviewed = await checkHasReviewed();
    if (hasReviewed) {
      setAlreadyReviewedVisible(true);
      return;
    }
    router.push({
      pathname: '/(main)/(feed)/write-review' as const,
      params: {
        businessId: business.id,
        businessName: business.name,
        categoryId: business.categoryId,
      },
    } as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.midnight }}>
      {/* Already Reviewed Modal */}
      <Modal
        visible={alreadyReviewedVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlreadyReviewedVisible(false)}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderRadius: 24,
              padding: 28,
              width: '100%',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: `${colors.neonPurple}20`,
                borderWidth: 1,
                borderColor: `${colors.neonPurple}40`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                shadowColor: colors.neonPurple,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <MaterialCommunityIcons name="star-check" size={30} color={colors.neonPurple} />
            </View>

            {/* Title */}
            <AppText
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.white,
                textAlign: 'center',
                marginBottom: 10,
              }}
            >
              {t('businessDetail.alreadyReviewed.title')}
            </AppText>

            {/* Message */}
            <AppText
              style={{
                fontSize: 14,
                color: colors.textSlate400,
                textAlign: 'center',
                lineHeight: 20,
                marginBottom: 24,
              }}
            >
              {t('businessDetail.alreadyReviewed.message', { businessName: business.name })}
            </AppText>

            {/* Buttons */}
            <View style={{ width: '100%', gap: 10 }}>
              <AppButton
                title={t('businessDetail.alreadyReviewed.seeMyReview')}
                variant="primary"
                size="md"
                shape="pill"
                accessibilityLabel={t('businessDetail.alreadyReviewed.seeMyReview')}
                accessibilityRole="button"
                onPress={() => {
                  setAlreadyReviewedVisible(false);
                  router.push('/(main)/(reviews)' as never);
                }}
              />
              <Pressable
                onPress={() => {
                  setAlreadyReviewedVisible(false);
                  router.replace('/(main)/(feed)' as never);
                }}
                accessibilityLabel={t('businessDetail.alreadyReviewed.goHome')}
                accessibilityRole="button"
                style={{ paddingVertical: 12, alignItems: 'center' }}
              >
                <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textSlate400 }}>
                  {t('businessDetail.alreadyReviewed.goHome')}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.neonPurple}
            colors={[colors.neonPurple]}
          />
        }
      >
        {/* Cover + Logo + Name + Rating */}
        <BusinessCoverSection
          coverImageUrl={business.coverImageUrl}
          logoUrl={business.logoUrl}
          categoryId={business.categoryId}
          name={business.name}
          categoryName={business.categoryName}
          openStatus={openStatus}
          rating={business.rating}
          reviewCount={business.reviewCount}
          onBackPress={() => router.back()}
        />

        {/* Action Buttons */}
        <ActionButtons
          isWishlisted={isWishlisted(business.id)}
          onAddReview={handleAddReview}
          onToggleWishlist={toggleWishlist}
        />

        {/* Sections */}
        <View style={{ paddingHorizontal: 20, gap: 32 }}>
          {/* Description Section */}
          <DescriptionSection description={business.description} />

          {/* Reviews Section */}
          <ReviewsSection
            rating={business.rating}
            ratingDistribution={business.ratingDistribution}
            categoryRatings={business.categoryRatings}
            reviews={reviews}
          />

          {/* Information Section */}
          <InformationSection
            location={business.location}
            contact={business.contact}
            isOnline={business.isOnline}
            businessId={business.id}
            openingHours={business.openingHours}
            openingHoursVisible={business.openingHoursVisible}
          />

          {/* Delivery Section */}
          <DeliverySection deliveryServices={business.deliveryServices} businessId={business.id} />

          {/* Menu Section */}
          <MenuSection menuCategories={business.menuCategories} businessId={business.id} />
        </View>
      </ScrollView>
    </View>
  );
}
