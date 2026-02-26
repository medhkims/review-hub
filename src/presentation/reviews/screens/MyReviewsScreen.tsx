import React, { useCallback } from 'react';
import { View, FlatList, Pressable, ListRenderItemInfo } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { Card } from '@/presentation/shared/components/ui/Card';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

// ── Mock Data ────────────────────────────────────────────────────────────────

interface ReviewItem {
  id: string;
  businessName: string;
  businessCategory: string;
  businessLocation: string;
  rating: number;
  text: string;
  timeAgo: string;
  hearts: number;
  views: number;
  businessImage: string | null;
}

interface ReviewStats {
  reviews: number;
  likes: number;
  seen: number;
}

const MOCK_STATS: ReviewStats = { reviews: 12, likes: 48, seen: 1200 };

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: '1',
    businessName: 'Pasta Cosi',
    businessCategory: 'Italian',
    businessLocation: 'Lac 2, Tunis',
    rating: 5,
    text: 'Absolutely loved the carbonara! Authentic taste and the ambiance was perfect for a date night. Highly...',
    timeAgo: '2 days ago',
    hearts: 15,
    views: 120,
    businessImage: null,
  },
  {
    id: '2',
    businessName: 'Gourmet Store',
    businessCategory: 'Grocery',
    businessLocation: 'Marsa',
    rating: 3,
    text: 'Decent selection but prices are quite high compared to alternatives.',
    timeAgo: '1 week ago',
    hearts: 5,
    views: 45,
    businessImage: null,
  },
];

const NEON_PURPLE = colors.neonPurple;
const SLATE_600 = '#475569';
const SLATE_700 = '#334155';

// ── Toggle flag for empty vs full state ──────────────────────────────────────

const showEmpty = false;

// ── Star Rating Component ────────────────────────────────────────────────────

interface StarRatingProps {
  rating: number;
  size?: number;
}

const StarRating = React.memo(({ rating, size = 14 }: StarRatingProps) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <MaterialCommunityIcons
        key={i}
        name="star"
        size={size}
        color={i <= rating ? NEON_PURPLE : SLATE_600}
      />
    );
  }
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
      accessibilityLabel={`${rating} out of 5 stars`}
      accessibilityRole="text"
    >
      {stars}
    </View>
  );
});

StarRating.displayName = 'StarRating';

// ── Stat Card Component ──────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor: string;
  value: number;
  label: string;
}

const StatCard = React.memo(({ icon, iconColor, value, label }: StatCardProps) => {
  const formattedValue = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

  return (
    <Card
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${iconColor}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <AppText
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: colors.white,
          textAlign: 'center',
        }}
      >
        {formattedValue}
      </AppText>
      <AppText
        style={{
          fontSize: 12,
          color: colors.textSlate400,
          marginTop: 2,
          textAlign: 'center',
        }}
      >
        {label}
      </AppText>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

// ── Review Card Component ────────────────────────────────────────────────────

interface ReviewCardProps {
  review: ReviewItem;
  onDelete: (id: string) => void;
}

const ReviewCard = React.memo(({ review, onDelete }: ReviewCardProps) => {
  const initials = review.businessName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card
      style={{
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Top row: avatar, info, time, delete */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        {/* Business initial circle */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: SLATE_700,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          <AppText
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: colors.textSlate200,
            }}
          >
            {initials}
          </AppText>
        </View>

        {/* Name + category/location */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText
            className="text-sm font-bold text-white"
            style={{ fontSize: 14, fontWeight: '700', color: colors.white }}
            numberOfLines={1}
          >
            {review.businessName}
          </AppText>
          <AppText
            style={{
              fontSize: 12,
              color: colors.textSlate400,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {review.businessCategory} - {review.businessLocation}
          </AppText>
        </View>

        {/* Time ago */}
        <AppText
          style={{
            fontSize: 11,
            color: colors.textSlate500,
            marginRight: 8,
          }}
        >
          {review.timeAgo}
        </AppText>

        {/* Delete button */}
        <Pressable
          onPress={() => onDelete(review.id)}
          style={{
            padding: 4,
            borderRadius: 8,
          }}
          accessibilityLabel={`Delete review for ${review.businessName}`}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color={colors.textSlate500}
          />
        </Pressable>
      </View>

      {/* Star rating */}
      <View style={{ marginBottom: 8 }}>
        <StarRating rating={review.rating} />
      </View>

      {/* Review text */}
      <AppText
        style={{
          fontSize: 13,
          color: colors.textSlate200,
          lineHeight: 19,
          marginBottom: 12,
        }}
        numberOfLines={3}
      >
        {review.text}
      </AppText>

      {/* Bottom row: hearts + views */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name="heart" size={14} color={colors.red} />
          <AppText
            style={{ fontSize: 12, color: colors.textSlate400 }}
          >
            {review.hearts}
          </AppText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name="eye" size={14} color={colors.textSlate500} />
          <AppText
            style={{ fontSize: 12, color: colors.textSlate400 }}
          >
            {review.views}
          </AppText>
        </View>
      </View>
    </Card>
  );
});

ReviewCard.displayName = 'ReviewCard';

// ── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => {
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 64,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: `${NEON_PURPLE}15`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <MaterialCommunityIcons
          name="silverware-fork-knife"
          size={36}
          color={colors.textSlate500}
        />
      </View>

      <AppText
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.white,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {t('myReviews.emptyTitle')}
      </AppText>

      <AppText
        style={{
          fontSize: 14,
          color: colors.textSlate400,
          textAlign: 'center',
          lineHeight: 20,
          marginBottom: 24,
        }}
      >
        {t('myReviews.emptyDescription')}
      </AppText>

      <AppButton
        title={t('myReviews.writeReview')}
        variant="primary"
        size="lg"
        shape="pill"
        accessibilityLabel="Write a review"
        accessibilityRole="button"
        style={{ minWidth: 180 }}
      />
    </View>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function MyReviewsScreen() {
  useAnalyticsScreen(AnalyticsScreens.MY_REVIEWS);
  const { t } = useTranslation();

  const handleDelete = useCallback((_reviewId: string) => {
    // TODO: wire up delete use case
  }, []);

  const renderReviewItem = useCallback(
    ({ item }: ListRenderItemInfo<ReviewItem>) => (
      <ReviewCard review={item} onDelete={handleDelete} />
    ),
    [handleDelete]
  );

  const keyExtractor = useCallback((item: ReviewItem) => item.id, []);

  if (showEmpty) {
    return (
      <ScreenLayout>
        {/* Header */}
        <View
          style={{
            alignItems: 'center',
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          {/* Neon star hero icon */}
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <View style={{ position: 'relative' }}>
              {/* Glow blur layer */}
              <View
                style={{
                  position: 'absolute',
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: `${NEON_PURPLE}20`,
                  top: -12,
                  left: -12,
                }}
              />
              {/* Icon container */}
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  borderWidth: 1,
                  borderColor: `${NEON_PURPLE}50`,
                  backgroundColor: colors.midnight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: NEON_PURPLE,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                <MaterialCommunityIcons name="star" size={40} color={NEON_PURPLE} />
              </View>
            </View>
          </View>

          {/* Title + Subtitle */}
          <AppText
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: colors.white,
              textAlign: 'center',
            }}
          >
            {t('myReviews.title')}
          </AppText>
          <AppText
            style={{
              fontSize: 14,
              color: colors.textSlate400,
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            {t('myReviews.subtitle')}
          </AppText>
        </View>

        <EmptyState />
      </ScreenLayout>
    );
  }

  const ListHeaderComponent = useCallback(
    () => (
      <View>
        {/* Neon star hero icon */}
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <View style={{ position: 'relative' }}>
            {/* Glow blur layer */}
            <View
              style={{
                position: 'absolute',
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: `${NEON_PURPLE}20`,
                top: -12,
                left: -12,
              }}
            />
            {/* Icon container */}
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 1,
                borderColor: `${NEON_PURPLE}50`,
                backgroundColor: colors.midnight,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: NEON_PURPLE,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <MaterialCommunityIcons name="star" size={40} color={NEON_PURPLE} />
            </View>
          </View>
        </View>

        {/* Title + Subtitle */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <AppText
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: colors.white,
              textAlign: 'center',
            }}
          >
            {t('myReviews.title')}
          </AppText>
          <AppText
            style={{
              fontSize: 14,
              color: colors.textSlate400,
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            {t('myReviews.subtitle')}
          </AppText>
        </View>

        {/* Statistics Section */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader title={t('myReviews.statisticsSection')} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard
              icon="chat-outline"
              iconColor={colors.cyan}
              value={MOCK_STATS.reviews}
              label={t('myReviews.statReviews')}
            />
            <StatCard
              icon="thumb-up-outline"
              iconColor={colors.green}
              value={MOCK_STATS.likes}
              label={t('myReviews.statLikes')}
            />
            <StatCard
              icon="eye-outline"
              iconColor={colors.yellow}
              value={MOCK_STATS.seen}
              label={t('myReviews.statSeen')}
            />
          </View>
        </View>

        {/* Recent Reviews Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <SectionHeader title={t('myReviews.recentReviewsSection')} />
          <Pressable
            accessibilityLabel="View all reviews"
            accessibilityRole="button"
          >
            <AppText
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: NEON_PURPLE,
              }}
            >
              {t('myReviews.viewAll')}
            </AppText>
          </Pressable>
        </View>
      </View>
    ),
    [t]
  );

  return (
    <ScreenLayout>
      <FlatList
        data={MOCK_REVIEWS}
        renderItem={renderReviewItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      />
    </ScreenLayout>
  );
}
