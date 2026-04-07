import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Pressable, Image, ScrollView, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { container } from '@/core/di/container';
import { ReviewEntity } from '@/domain/business/entities/reviewEntity';
import { StarRating } from '../components/BusinessCoverSection';

interface BusinessReviewsScreenProps {
  businessId: string;
  businessName: string;
  businessLogoUrl?: string | null;
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
  businessName: string;
  onPress: () => void;
}

const ReviewItem = React.memo<ReviewItemProps>(
  ({ review, businessName, onPress }) => {
    const theme = useTheme();
    return (
      <Pressable
        onPress={onPress}
        accessibilityLabel={`Review by ${review.authorName}`}
        accessibilityRole="button"
        style={({ pressed }) => ({
          flexDirection: 'row',
          gap: 12,
          backgroundColor: pressed ? 'rgba(139, 92, 246, 0.08)' : theme.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
        })}
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
                backgroundColor: theme.card,
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
              <AppText style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>
                {review.authorName}
              </AppText>
              <View style={{ marginTop: 2 }}>
                <StarRating rating={review.rating} size={12} color={colors.neonPurple} />
              </View>
            </View>
            <View style={{ backgroundColor: theme.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
              <AppText style={{ fontSize: 10, color: theme.textMuted }}>
                {formatTimeAgo(review.createdAt)}
              </AppText>
            </View>
          </View>

          {review.text ? (
            <AppText
              style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 20, marginTop: 6 }}
              numberOfLines={3}
            >
              {review.text}
            </AppText>
          ) : null}

          {review.photoUrls && review.photoUrls.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10 }}
              contentContainerStyle={{ gap: 6 }}
            >
              {review.photoUrls.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={{ width: 80, height: 80, borderRadius: 8 }}
                  resizeMode="cover"
                  accessibilityLabel={`Review photo ${index + 1}`}
                />
              ))}
            </ScrollView>
          )}

          {/* Stats row */}
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons
                name={review.isLikedByCurrentUser ? 'thumb-up' : 'thumb-up-outline'}
                size={14}
                color={review.isLikedByCurrentUser ? '#3b82f6' : theme.textMuted}
              />
              <AppText style={{ fontSize: 12, color: theme.textMuted }}>{review.likeCount}</AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons
                name={review.isDislikedByCurrentUser ? 'thumb-down' : 'thumb-down-outline'}
                size={14}
                color={review.isDislikedByCurrentUser ? '#ef4444' : theme.textMuted}
              />
              <AppText style={{ fontSize: 12, color: theme.textMuted }}>{review.dislikeCount}</AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons name="eye-outline" size={14} color={theme.textMuted} />
              <AppText style={{ fontSize: 12, color: theme.textMuted }}>{review.viewCount}</AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons name="comment-outline" size={14} color={theme.textMuted} />
              <AppText style={{ fontSize: 12, color: theme.textMuted }}>{review.commentCount}</AppText>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <AppText style={{ fontSize: 11, color: colors.neonPurple }}>Tap to open →</AppText>
            </View>
          </View>
        </View>
      </Pressable>
    );
  },
);

export default function BusinessReviewsScreen({ businessId, businessName, businessLogoUrl }: BusinessReviewsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
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

  const openReview = useCallback((review: ReviewEntity) => {
    router.push({
      pathname: '/(main)/(feed)/review-detail',
      params: {
        reviewId: review.id,
        businessName,
        businessId,
        reviewData: JSON.stringify({
          id: review.id,
          authorId: review.authorId,
          authorName: review.authorName,
          authorAvatarUrl: review.authorAvatarUrl,
          rating: review.rating,
          text: review.text,
          photoUrls: review.photoUrls,
          createdAtMs: review.createdAt.getTime(),
          likeCount: review.likeCount,
          viewCount: review.viewCount,
          commentCount: review.commentCount,
          isLikedByCurrentUser: review.isLikedByCurrentUser,
          dislikeCount: review.dislikeCount,
          isDislikedByCurrentUser: review.isDislikedByCurrentUser,
          businessId,
          businessLogoUrl: businessLogoUrl ?? null,
        }),
      },
    });
  }, [businessName, businessId, businessLogoUrl]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
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
          borderBottomColor: theme.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.card,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>{t('businessDetail.allReviews')}</AppText>
          <AppText style={{ fontSize: 12, color: theme.textSecondary }}>{businessName}</AppText>
        </View>
        {businessLogoUrl ? (
          <Pressable
            onPress={() => router.push(`/(main)/(feed)/business/${businessId}` as Parameters<typeof router.push>[0])}
            accessibilityLabel={`View ${businessName} profile`}
            accessibilityRole="button"
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.3)',
            }}
          >
            <Image
              source={{ uri: businessLogoUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              accessibilityLabel={`${businessName} logo`}
            />
          </Pressable>
        ) : null}
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
          renderItem={({ item }) => (
            <ReviewItem review={item} businessName={businessName} onPress={() => openReview(item)} />
          )}
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
              <MaterialCommunityIcons name="star-off-outline" size={48} color={theme.textMuted} />
              <AppText style={{ fontSize: 16, color: theme.textSecondary }}>{t('businessDetail.noReviews')}</AppText>
            </View>
          }
        />
      )}
    </View>
  );
}
