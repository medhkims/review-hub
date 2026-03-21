import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Pressable, Image, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { ReviewEntity } from '@/domain/business/entities/reviewEntity';
import { StarRating } from '../components/BusinessCoverSection';

interface BusinessReviewsScreenProps {
  businessId: string;
  businessName: string;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

interface ReviewItemProps {
  review: ReviewEntity;
}

const ReviewItem = React.memo<ReviewItemProps>(({ review }) => (
  <View
    style={{
      flexDirection: 'row',
      gap: 12,
      backgroundColor: colors.cardDark,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
    }}
  >
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: colors.neonPurple,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        flexShrink: 0,
      }}
    >
      {review.authorAvatarUrl ? (
        <Image
          source={{ uri: review.authorAvatarUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          accessibilityLabel={review.authorName}
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1e293b',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.neonPurple }}>
            {review.authorName.charAt(0).toUpperCase()}
          </AppText>
        </View>
      )}
    </View>

    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <View>
          <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>
            {review.authorName}
          </AppText>
          <View style={{ marginTop: 2 }}>
            <StarRating rating={review.rating} size={12} color={colors.neonPurple} />
          </View>
        </View>
        <View style={{ backgroundColor: '#0b101e', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
          <AppText style={{ fontSize: 10, color: colors.textSlate500 }}>
            {formatTimeAgo(review.createdAt)}
          </AppText>
        </View>
      </View>
      {review.text ? (
        <AppText style={{ fontSize: 13, color: colors.textSlate400, lineHeight: 20, marginTop: 6 }}>
          {review.text}
        </AppText>
      ) : null}
    </View>
  </View>
));

export default function BusinessReviewsScreen({ businessId, businessName }: BusinessReviewsScreenProps) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ReviewEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await container.getBusinessReviewsUseCase.execute(businessId);
    result.fold(
      (failure) => setError(failure.message),
      (data) => setReviews(data),
    );
    setIsLoading(false);
  }, [businessId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.midnight }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 56,
          paddingBottom: 16,
          paddingHorizontal: 20,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.white} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>{t('businessDetail.allReviews')}</AppText>
          <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>{businessName}</AppText>
        </View>
      </View>

      {isLoading && reviews.length === 0 ? (
        <LoadingIndicator />
      ) : error && reviews.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ErrorView message={error} onRetry={fetchReviews} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReviewItem review={item} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchReviews}
              tintColor={colors.neonPurple}
              colors={[colors.neonPurple]}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}>
              <MaterialCommunityIcons name="star-off-outline" size={48} color={colors.textSlate500} />
              <AppText style={{ fontSize: 16, color: colors.textSlate400 }}>{t('businessDetail.noReviews')}</AppText>
            </View>
          }
        />
      )}
    </View>
  );
}
