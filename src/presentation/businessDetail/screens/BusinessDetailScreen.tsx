import React from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/core/theme/colors';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { BusinessCoverSection } from '../components/BusinessCoverSection';
import { ActionButtons } from '../components/ActionButtons';
import { ReviewsSection } from '../components/ReviewsSection';
import { InformationSection } from '../components/InformationSection';
import { DeliverySection } from '../components/DeliverySection';
import { MenuSection } from '../components/MenuSection';
import { useBusinessDetail } from '../hooks/useBusinessDetail';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';

interface BusinessDetailScreenProps {
  businessId: string;
}

export default function BusinessDetailScreen({ businessId }: BusinessDetailScreenProps) {
  useAnalyticsScreen(AnalyticsScreens.BUSINESS_DETAIL);
  const router = useRouter();
  const { t } = useTranslation();
  const { business, reviews, isLoading, error, toggleFavorite, refresh } = useBusinessDetail(businessId);

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

  const handleAddReview = () => {
    // TODO: Navigate to add review screen
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.midnight }}>
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
          name={business.name}
          categoryName={business.categoryName}
          isOpen={business.isOpen}
          rating={business.rating}
          reviewCount={business.reviewCount}
          onBackPress={() => router.back()}
        />

        {/* Action Buttons */}
        <ActionButtons
          isFavorite={business.isFavorite}
          onAddReview={handleAddReview}
          onToggleFavorite={toggleFavorite}
        />

        {/* Sections */}
        <View style={{ paddingHorizontal: 20, gap: 32 }}>
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
          />

          {/* Delivery Section */}
          <DeliverySection deliveryServices={business.deliveryServices} />

          {/* Menu Section */}
          <MenuSection menuCategories={business.menuCategories} />
        </View>
      </ScrollView>
    </View>
  );
}
