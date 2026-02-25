import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { StarRating } from './BusinessCoverSection';
import { SectionCard } from './SectionCard';
import {
  CategoryRating,
  RatingDistribution,
} from '@/domain/business/entities/businessDetailEntity';
import { ReviewEntity } from '@/domain/business/entities/reviewEntity';

interface ReviewsSectionProps {
  rating: number;
  ratingDistribution: RatingDistribution[];
  categoryRatings: CategoryRating[];
  reviews: ReviewEntity[];
  onViewAllReviews?: () => void;
}

const CATEGORY_ICON_MAP: Record<string, string> = {
  cooking: 'silverware-fork-knife',
  cleanliness: 'broom',
  service: 'room-service-outline',
};

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

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  rating,
  ratingDistribution,
  categoryRatings,
  reviews,
  onViewAllReviews,
}) => {
  const { t } = useTranslation();

  return (
    <View
      style={{
        backgroundColor: colors.cardDark,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        position: 'relative',
      }}
    >
      {/* Purple accent bar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          backgroundColor: colors.neonPurple,
          shadowColor: colors.neonPurple,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 5,
        }}
      />

      <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
        {/* Header */}
        <AppText style={{ fontWeight: '700', fontSize: 20, color: colors.neonPurple, letterSpacing: 0.5, marginBottom: 24 }}>
          {t('businessDetail.reviews')}
        </AppText>

        {/* Rating Overview */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
          {/* Big Rating Number */}
          <View
            style={{
              backgroundColor: '#0b101e',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
              width: '33%',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <AppText style={{ fontSize: 48, fontWeight: '700', color: colors.white, marginBottom: 4 }}>
              {rating.toFixed(1)}
            </AppText>
            <StarRating rating={rating} size={10} color={colors.neonPurple} />
          </View>

          {/* Rating Distribution Bars */}
          <View style={{ flex: 1, justifyContent: 'center', gap: 8 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const dist = ratingDistribution.find((d) => d.stars === star);
              const percentage = dist?.percentage ?? 0;
              return (
                <View key={star} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AppText style={{ width: 10, fontSize: 10, fontWeight: '500', color: colors.textSlate400 }}>
                    {star}
                  </AppText>
                  <View style={{ flex: 1, height: 6, backgroundColor: '#0b101e', borderRadius: 3, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: colors.neonPurple,
                        borderRadius: 3,
                        opacity: star >= 4 ? 1 : star === 3 ? 0.7 : 0.4,
                        ...(star === 5 && {
                          shadowColor: colors.neonPurple,
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.6,
                          shadowRadius: 4,
                        }),
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Category Ratings */}
        {categoryRatings.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            {categoryRatings.map((cr) => (
              <View
                key={cr.name}
                style={{
                  flex: 1,
                  backgroundColor: '#263346',
                  borderRadius: 16,
                  padding: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#3c2a52',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 4,
                  }}
                >
                  <MaterialCommunityIcons
                    name={(CATEGORY_ICON_MAP[cr.icon] || cr.icon) as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={20}
                    color={colors.neonPurple}
                  />
                </View>
                <AppText style={{ fontSize: 10, fontWeight: '700', color: colors.neonPurple, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {cr.name}
                </AppText>
                <StarRating rating={cr.rating} size={8} color={colors.neonPurple} />
              </View>
            ))}
          </View>
        )}

        {/* Recent Reviews */}
        {reviews.length > 0 && (
          <View
            style={{
              backgroundColor: '#0f172a',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <AppText style={{ fontWeight: '700', fontSize: 16, color: colors.white }}>
                {t('businessDetail.recentReviews')}
              </AppText>
              {onViewAllReviews && (
                <Pressable
                  onPress={onViewAllReviews}
                  accessibilityLabel={t('businessDetail.viewAll')}
                  accessibilityRole="button"
                >
                  <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.neonPurple }}>
                    {t('businessDetail.viewAll')}
                  </AppText>
                </Pressable>
              )}
            </View>

            {reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    shadowColor: colors.neonPurple,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 5,
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
                        backgroundColor: colors.cardDark,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.neonPurple }}>
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
                        <StarRating rating={review.rating} size={10} color={colors.neonPurple} />
                      </View>
                    </View>
                    <View style={{ backgroundColor: colors.cardDark, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                      <AppText style={{ fontSize: 10, color: colors.textSlate500 }}>
                        {formatTimeAgo(review.createdAt)}
                      </AppText>
                    </View>
                  </View>
                  <AppText
                    style={{ fontSize: 12, color: colors.textSlate400, lineHeight: 18, marginTop: 4 }}
                    numberOfLines={3}
                  >
                    {review.text}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
