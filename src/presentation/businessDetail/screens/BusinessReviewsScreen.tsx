import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, FlatList, Pressable, Image, ScrollView, RefreshControl, Modal } from 'react-native';
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

type SortOption = 'newest' | 'oldest' | 'mostRelevant';
type FilterOption = 0 | 1 | 2 | 3 | 4 | 5; // 0 = no filter

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

const SORT_OPTIONS: { key: SortOption; label: string; icon: string }[] = [
  { key: 'newest', label: 'Newest first', icon: 'clock-outline' },
  { key: 'oldest', label: 'Oldest first', icon: 'clock-time-two-outline' },
  { key: 'mostRelevant', label: 'Most relevant', icon: 'fire' },
];

interface ReviewItemProps {
  review: ReviewEntity;
  businessName: string;
  onPress: () => void;
}

const ReviewItem = React.memo<ReviewItemProps>(
  ({ review, businessName: _businessName, onPress }) => {
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

// ─── Sort Modal ──────────────────────────────────────────────────────────────

interface SortModalProps {
  visible: boolean;
  current: SortOption;
  onSelect: (opt: SortOption) => void;
  onClose: () => void;
}

const SortModal = React.memo<SortModalProps>(({ visible, current, onSelect, onClose }) => {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        onPress={onClose}
        accessibilityLabel="Close sort menu"
        accessibilityRole="button"
      >
        <Pressable
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 8,
            paddingBottom: 36,
          }}
          onPress={() => {}}
        >
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingBottom: 16, paddingTop: 8 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
          </View>
          <AppText style={{ fontSize: 15, fontWeight: '700', color: theme.text, paddingHorizontal: 20, marginBottom: 12 }}>
            Sort by
          </AppText>
          {SORT_OPTIONS.map((opt) => {
            const isActive = current === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => { onSelect(opt.key); onClose(); }}
                accessibilityLabel={opt.label}
                accessibilityRole="radio"
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  backgroundColor: pressed ? 'rgba(139,92,246,0.08)' : 'transparent',
                })}
              >
                <MaterialCommunityIcons
                  name={opt.icon as never}
                  size={20}
                  color={isActive ? colors.neonPurple : theme.textMuted}
                />
                <AppText style={{ flex: 1, fontSize: 15, color: isActive ? colors.neonPurple : theme.text, fontWeight: isActive ? '600' : '400' }}>
                  {opt.label}
                </AppText>
                {isActive && (
                  <MaterialCommunityIcons name="check" size={18} color={colors.neonPurple} />
                )}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
});

// ─── Filter Modal ─────────────────────────────────────────────────────────────

interface FilterModalProps {
  visible: boolean;
  current: FilterOption;
  onSelect: (opt: FilterOption) => void;
  onClose: () => void;
}

const STAR_OPTIONS: FilterOption[] = [5, 4, 3, 2, 1];

const FilterModal = React.memo<FilterModalProps>(({ visible, current, onSelect, onClose }) => {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        onPress={onClose}
        accessibilityLabel="Close filter menu"
        accessibilityRole="button"
      >
        <Pressable
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 8,
            paddingBottom: 36,
          }}
          onPress={() => {}}
        >
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingBottom: 16, paddingTop: 8 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
          </View>
          <AppText style={{ fontSize: 15, fontWeight: '700', color: theme.text, paddingHorizontal: 20, marginBottom: 12 }}>
            Filter by rating
          </AppText>
          {/* All option */}
          <Pressable
            onPress={() => { onSelect(0); onClose(); }}
            accessibilityLabel="All ratings"
            accessibilityRole="radio"
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 14,
              paddingHorizontal: 20,
              backgroundColor: pressed ? 'rgba(139,92,246,0.08)' : 'transparent',
            })}
          >
            <MaterialCommunityIcons name="star-outline" size={20} color={current === 0 ? colors.neonPurple : theme.textMuted} />
            <AppText style={{ flex: 1, fontSize: 15, color: current === 0 ? colors.neonPurple : theme.text, fontWeight: current === 0 ? '600' : '400' }}>
              All ratings
            </AppText>
            {current === 0 && <MaterialCommunityIcons name="check" size={18} color={colors.neonPurple} />}
          </Pressable>
          {STAR_OPTIONS.map((stars) => {
            const isActive = current === stars;
            return (
              <Pressable
                key={stars}
                onPress={() => { onSelect(stars); onClose(); }}
                accessibilityLabel={`${stars} star`}
                accessibilityRole="radio"
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  backgroundColor: pressed ? 'rgba(139,92,246,0.08)' : 'transparent',
                })}
              >
                <View style={{ flexDirection: 'row', gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <MaterialCommunityIcons
                      key={i}
                      name={i < stars ? 'star' : 'star-outline'}
                      size={18}
                      color={isActive ? colors.neonPurple : i < stars ? '#f59e0b' : theme.textMuted}
                    />
                  ))}
                </View>
                <AppText style={{ flex: 1, fontSize: 15, color: isActive ? colors.neonPurple : theme.text, fontWeight: isActive ? '600' : '400' }}>
                  {stars} {stars === 1 ? 'star' : 'stars'}
                </AppText>
                {isActive && <MaterialCommunityIcons name="check" size={18} color={colors.neonPurple} />}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BusinessReviewsScreen({ businessId, businessName, businessLogoUrl }: BusinessReviewsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [reviews, setReviews] = useState<ReviewEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>(0);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

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

  const displayedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter: Math.floor(rating) must equal the selected star count
    if (filterOption !== 0) {
      result = result.filter((r) => Math.floor(r.rating) === filterOption);
    }

    // Sort
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'mostRelevant':
        result.sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount));
        break;
    }

    return result;
  }, [reviews, sortOption, filterOption]);

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

  const sortLabel = SORT_OPTIONS.find((o) => o.key === sortOption)?.label ?? 'Sort';
  const isFilterActive = filterOption !== 0;

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
            width: 44,
            height: 44,
            borderRadius: 22,
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

      {/* Sort & Filter bar */}
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        {/* Sort button */}
        <Pressable
          onPress={() => setShowSortModal(true)}
          accessibilityLabel={`Sort by: ${sortLabel}`}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 9,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: pressed ? 'rgba(139,92,246,0.12)' : theme.card,
            borderWidth: 1,
            borderColor: 'rgba(139,92,246,0.3)',
          })}
        >
          <MaterialCommunityIcons name="sort" size={16} color={colors.neonPurple} />
          <AppText style={{ fontSize: 13, color: colors.neonPurple, fontWeight: '600' }} numberOfLines={1}>
            Sort
          </AppText>
          <MaterialCommunityIcons name="chevron-down" size={14} color={colors.neonPurple} />
        </Pressable>

        {/* Filter button */}
        <Pressable
          onPress={() => setShowFilterModal(true)}
          accessibilityLabel={isFilterActive ? `Filter: ${filterOption} stars` : 'Filter by rating'}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 9,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: isFilterActive
              ? colors.neonPurple
              : pressed
              ? 'rgba(139,92,246,0.12)'
              : theme.card,
            borderWidth: 1,
            borderColor: 'rgba(139,92,246,0.3)',
          })}
        >
          <MaterialCommunityIcons
            name="filter-outline"
            size={16}
            color={isFilterActive ? '#fff' : colors.neonPurple}
          />
          <AppText
            style={{
              fontSize: 13,
              color: isFilterActive ? '#fff' : colors.neonPurple,
              fontWeight: '600',
            }}
          >
            {isFilterActive ? `${filterOption} ★` : 'Filter'}
          </AppText>
          {isFilterActive && (
            <Pressable
              onPress={(e) => { e.stopPropagation(); setFilterOption(0); }}
              accessibilityLabel="Clear filter"
              accessibilityRole="button"
              hitSlop={8}
              style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialCommunityIcons name="close-circle" size={14} color="#fff" />
            </Pressable>
          )}
          {!isFilterActive && <MaterialCommunityIcons name="chevron-down" size={14} color={colors.neonPurple} />}
        </Pressable>
      </View>

      {/* Results count */}
      {!isLoading && reviews.length > 0 && (
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 2 }}>
          <AppText style={{ fontSize: 12, color: theme.textMuted }}>
            {displayedReviews.length} {displayedReviews.length === 1 ? 'review' : 'reviews'}
            {isFilterActive ? ` with ${filterOption} ★` : ''}
          </AppText>
        </View>
      )}

      {isLoading && reviews.length === 0 ? (
        <LoadingIndicator />
      ) : error && reviews.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ErrorView message={error} onRetry={fetchReviews} />
        </View>
      ) : (
        <FlatList
          data={displayedReviews}
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
              <AppText style={{ fontSize: 16, color: theme.textSecondary }}>
                {isFilterActive ? `No ${filterOption}-star reviews` : t('businessDetail.noReviews')}
              </AppText>
              {isFilterActive && (
                <Pressable
                  onPress={() => setFilterOption(0)}
                  accessibilityLabel="Clear filter"
                  accessibilityRole="button"
                  style={{
                    marginTop: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.neonPurple,
                  }}
                >
                  <AppText style={{ fontSize: 13, color: colors.neonPurple }}>Clear filter</AppText>
                </Pressable>
              )}
            </View>
          }
        />
      )}

      <SortModal
        visible={showSortModal}
        current={sortOption}
        onSelect={setSortOption}
        onClose={() => setShowSortModal(false)}
      />
      <FilterModal
        visible={showFilterModal}
        current={filterOption}
        onSelect={setFilterOption}
        onClose={() => setShowFilterModal(false)}
      />
    </View>
  );
}
