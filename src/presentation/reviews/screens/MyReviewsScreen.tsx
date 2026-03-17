import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, FlatList, Pressable, Modal, ActivityIndicator, ListRenderItemInfo, Animated } from 'react-native';
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
import { UserReviewEntity } from '@/domain/reviews/entities/userReviewEntity';
import { useMyReviews, ReviewTab } from '../hooks/useMyReviews';

// ── Constants ─────────────────────────────────────────────────────────────────

const NEON_PURPLE = colors.neonPurple;
const SLATE_600 = '#475569';
const SLATE_700 = '#334155';
const CARD_DARK = '#1E293B';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Star Rating ───────────────────────────────────────────────────────────────

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
        color={i <= Math.round(rating) ? NEON_PURPLE : SLATE_600}
      />,
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

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor: string;
  value: number;
  label: string;
}

const StatCard = React.memo(({ icon, iconColor, value, label }: StatCardProps) => {
  const formatted = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
  return (
    <Card style={{ flex: 1, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8 }}>
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
      <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white, textAlign: 'center' }}>
        {formatted}
      </AppText>
      <AppText style={{ fontSize: 10, color: colors.textSlate400, marginTop: 2, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </AppText>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

// ── Tab Bar ───────────────────────────────────────────────────────────────────

interface TabBarProps {
  activeTab: ReviewTab;
  tabCounts: Record<ReviewTab, number>;
  onTabChange: (tab: ReviewTab) => void;
}

const TAB_CONFIG: { key: ReviewTab; labelKey: string; activeColor: string }[] = [
  { key: 'posted', labelKey: 'myReviews.tabPosted', activeColor: colors.neonPurple },
  { key: 'pending', labelKey: 'myReviews.tabPending', activeColor: colors.yellow },
  { key: 'declined', labelKey: 'myReviews.tabDeclined', activeColor: colors.orange },
  { key: 'removed', labelKey: 'myReviews.tabRemoved', activeColor: colors.red },
];

interface AnimatedTabProps {
  tabKey: ReviewTab;
  labelKey: string;
  activeColor: string;
  isActive: boolean;
  count: number;
  onPress: () => void;
}

const AnimatedTab = ({ tabKey, labelKey, activeColor, isActive, count, onPress }: AnimatedTabProps) => {
  const { t } = useTranslation();
  const anim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isActive, anim]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', `${activeColor}18`],
  });

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', `${activeColor}50`],
  });

  const textColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textSlate500, activeColor],
  });

  const countColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SLATE_600, activeColor],
  });

  return (
    <Pressable
      key={tabKey}
      onPress={onPress}
      style={{ flex: 1 }}
      accessibilityLabel={t(labelKey)}
      accessibilityRole="tab"
    >
      <Animated.View
        style={{
          paddingVertical: 9,
          paddingHorizontal: 4,
          borderRadius: 10,
          alignItems: 'center',
          backgroundColor,
          borderWidth: 1,
          borderColor,
        }}
      >
        <Animated.Text
          style={{
            fontSize: 12,
            fontWeight: isActive ? '700' : '500',
            color: textColor,
            fontFamily: undefined,
          }}
        >
          {t(labelKey)}
        </Animated.Text>
        <Animated.Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: countColor,
            marginTop: 2,
            fontFamily: undefined,
          }}
        >
          {String(count)}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const TabBar = React.memo(({ activeTab, tabCounts, onTabChange }: TabBarProps) => (
  <View
    style={{
      flexDirection: 'row',
      backgroundColor: CARD_DARK,
      borderRadius: 14,
      padding: 4,
      marginBottom: 20,
      gap: 4,
    }}
  >
    {TAB_CONFIG.map(({ key, labelKey, activeColor }) => (
      <AnimatedTab
        key={key}
        tabKey={key}
        labelKey={labelKey}
        activeColor={activeColor}
        isActive={activeTab === key}
        count={tabCounts[key]}
        onPress={() => onTabChange(key)}
      />
    ))}
  </View>
));

TabBar.displayName = 'TabBar';

// ── Review Card ───────────────────────────────────────────────────────────────

interface ReviewCardProps {
  review: UserReviewEntity;
  onDeleteRequest: (reviewId: string) => void;
}

const ReviewCard = React.memo(({ review, onDeleteRequest }: ReviewCardProps) => {
  const initials = getInitials(review.businessName);
  const timeAgo = getTimeAgo(review.createdAt);

  return (
    <Card style={{ padding: 16, marginBottom: 12, overflow: 'visible' }}>
      {/* Top row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        {/* Business initials square */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            backgroundColor: SLATE_700,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
            borderWidth: 1,
            borderColor: '#475569',
          }}
        >
          <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.textSlate200 }}>
            {initials}
          </AppText>
        </View>

        {/* Name + subtitle */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText
            style={{ fontSize: 14, fontWeight: '700', color: colors.white }}
            numberOfLines={1}
          >
            {review.businessName}
          </AppText>
        </View>

        {/* Time ago pill */}
        <View
          style={{
            backgroundColor: `${CARD_DARK}99`,
            borderRadius: 20,
            paddingHorizontal: 8,
            paddingVertical: 3,
            marginLeft: 8,
          }}
        >
          <AppText style={{ fontSize: 10, color: colors.textSlate500 }}>{timeAgo}</AppText>
        </View>

        {/* Delete button — hidden for already-removed reviews */}
        {review.status !== 'removed' && (
          <Pressable
            style={{ padding: 10, marginLeft: 6 }}
            onPress={() => onDeleteRequest(review.id)}
            accessibilityLabel={`Delete review for ${review.businessName}`}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.red} />
          </Pressable>
        )}
      </View>

      {/* Stars */}
      <View style={{ marginBottom: 8 }}>
        <StarRating rating={review.overallRating} />
      </View>

      {/* Text */}
      <AppText
        style={{ fontSize: 13, color: colors.textSlate200, lineHeight: 19, marginBottom: 12 }}
        numberOfLines={3}
      >
        {review.reviewText}
      </AppText>

      {/* Footer: likes + views */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: '#1E293B',
          paddingTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name="heart" size={13} color={colors.red} />
          <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>{review.likesCount}</AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name="eye" size={13} color={colors.textSlate500} />
          <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>{review.viewsCount}</AppText>
        </View>
      </View>
    </Card>
  );
});

ReviewCard.displayName = 'ReviewCard';

// ── Empty State ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  activeTab: ReviewTab;
}

const EmptyState = ({ activeTab }: EmptyStateProps) => {
  const { t } = useTranslation();

  const config: Record<ReviewTab, { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; titleKey: string; descKey: string; showWrite: boolean }> = {
    posted: { icon: 'star', titleKey: 'myReviews.emptyTitle', descKey: 'myReviews.emptyDescription', showWrite: true },
    pending: { icon: 'clock-outline', titleKey: 'myReviews.emptyPendingTitle', descKey: 'myReviews.emptyPendingDescription', showWrite: false },
    declined: { icon: 'close-circle-outline', titleKey: 'myReviews.emptyDeclinedTitle', descKey: 'myReviews.emptyDeclinedDescription', showWrite: false },
    removed: { icon: 'trash-can-outline', titleKey: 'myReviews.emptyRemovedTitle', descKey: 'myReviews.emptyRemovedDescription', showWrite: false },
  };

  const { icon, titleKey, descKey, showWrite } = config[activeTab];

  return (
    <Card style={{ alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          backgroundColor: `${NEON_PURPLE}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <MaterialCommunityIcons name={icon} size={30} color={NEON_PURPLE} />
      </View>
      <AppText
        style={{ fontSize: 16, fontWeight: '700', color: colors.white, textAlign: 'center', marginBottom: 6 }}
      >
        {t(titleKey)}
      </AppText>
      <AppText
        style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center', lineHeight: 19, marginBottom: 20 }}
      >
        {t(descKey)}
      </AppText>
      {showWrite && (
        <AppButton
          title={t('myReviews.writeReview')}
          variant="primary"
          size="md"
          shape="pill"
          accessibilityLabel="Write a review"
          accessibilityRole="button"
          style={{ minWidth: 160 }}
        />
      )}
    </Card>
  );
};

// ── Hero Header ───────────────────────────────────────────────────────────────

const HeroHeader = () => {
  const { t } = useTranslation();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: `${NEON_PURPLE}20`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name="star" size={38} color={NEON_PURPLE} />
      </View>
      <AppText
        style={{ fontSize: 22, fontWeight: '700', color: colors.white, textAlign: 'center', marginTop: 14 }}
      >
        {t('myReviews.title')}
      </AppText>
      <AppText
        style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center', marginTop: 4 }}
      >
        {t('myReviews.subtitle')}
      </AppText>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function MyReviewsScreen() {
  useAnalyticsScreen(AnalyticsScreens.MY_REVIEWS);
  const { t } = useTranslation();
  const { reviews, isLoading, error, stats, tabCounts, activeTab, setActiveTab, deleteReview } = useMyReviews();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDeleteId) return;
    setConfirmDeleteId(null);
    await deleteReview(confirmDeleteId);
  }, [confirmDeleteId, deleteReview]);

  const renderReviewItem = useCallback(
    ({ item }: ListRenderItemInfo<UserReviewEntity>) => (
      <ReviewCard review={item} onDeleteRequest={setConfirmDeleteId} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: UserReviewEntity) => item.id, []);

  const ListHeaderComponent = useCallback(
    () => (
      <View>
        <HeroHeader />

        {/* Statistics */}
        <View style={{ marginBottom: 20 }}>
          <SectionHeader title={t('myReviews.statisticsSection')} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard icon="chat-outline" iconColor={colors.cyan} value={stats.reviews} label={t('myReviews.statReviews')} />
            <StatCard icon="thumb-up-outline" iconColor={colors.green} value={stats.likes} label={t('myReviews.statLikes')} />
            <StatCard icon="eye-outline" iconColor={colors.yellow} value={stats.seen} label={t('myReviews.statSeen')} />
          </View>
        </View>

        {/* Tab switcher */}
        <TabBar activeTab={activeTab} tabCounts={tabCounts} onTabChange={setActiveTab} />

        {/* Loading */}
        {isLoading && (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <ActivityIndicator color={NEON_PURPLE} />
          </View>
        )}

        {/* Error */}
        {!isLoading && error && (
          <Card style={{ alignItems: 'center', padding: 24 }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={32} color={colors.red} />
            <AppText style={{ fontSize: 13, color: colors.textSlate400, marginTop: 8, textAlign: 'center' }}>
              {error}
            </AppText>
          </Card>
        )}
      </View>
    ),
    [t, stats, tabCounts, activeTab, setActiveTab, isLoading, error],
  );

  return (
    <ScreenLayout>
      <FlatList
        data={!isLoading && !error ? reviews : []}
        renderItem={renderReviewItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={!isLoading && !error ? <EmptyState activeTab={activeTab} /> : null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={confirmDeleteId !== null}
        animationType="fade"
        onRequestClose={() => setConfirmDeleteId(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 32 }}
          onPress={() => setConfirmDeleteId(null)}
        >
          <Pressable
            style={{ backgroundColor: '#1E293B', borderRadius: 16, padding: 24, width: '100%', borderWidth: 1, borderColor: '#334155' }}
            onPress={() => {}}
          >
            <AppText style={{ fontSize: 17, fontWeight: '700', color: '#F1F5F9', marginBottom: 8 }}>
              {t('myReviews.deleteConfirmTitle')}
            </AppText>
            <AppText style={{ fontSize: 14, color: '#94A3B8', lineHeight: 20, marginBottom: 24 }}>
              {t('myReviews.deleteConfirmMessage')}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                style={{ flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' }}
                onPress={() => setConfirmDeleteId(null)}
                accessibilityLabel="Cancel delete"
                accessibilityRole="button"
              >
                <AppText style={{ color: '#94A3B8', fontWeight: '600', fontSize: 15 }}>
                  {t('common.cancel')}
                </AppText>
              </Pressable>
              <Pressable
                style={{ flex: 1, paddingVertical: 13, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: colors.red, alignItems: 'center' }}
                onPress={handleDeleteConfirm}
                accessibilityLabel="Confirm delete review"
                accessibilityRole="button"
              >
                <AppText style={{ color: colors.red, fontWeight: '700', fontSize: 15 }}>
                  {t('myReviews.deleteConfirmYes')}
                </AppText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenLayout>
  );
}
