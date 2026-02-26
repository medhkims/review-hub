import React, { useCallback } from 'react';
import { View, FlatList, ActivityIndicator, ListRenderItemInfo } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { PostEntity } from '@/domain/feed/entities/postEntity';
import { useFeed } from '../hooks/useFeed';
import { PostCard } from '../components/PostCard';

const NEON_PURPLE = colors.neonPurple;

const EmptyState = () => (
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
        name="post-outline"
        size={36}
        color={colors.textSlate500}
      />
    </View>
    <AppText
      style={{
        fontSize: 18,
        fontWeight: '700',
        color: colors.textWhite,
        textAlign: 'center',
        marginBottom: 8,
      }}
    >
      No posts yet
    </AppText>
    <AppText
      style={{
        fontSize: 14,
        color: colors.textSlate400,
        textAlign: 'center',
        lineHeight: 20,
      }}
    >
      Be the first to share something with the community.
    </AppText>
  </View>
);

interface FooterProps {
  isLoading: boolean;
  hasMore: boolean;
}

const ListFooter = React.memo(({ isLoading, hasMore }: FooterProps) => {
  if (!isLoading || !hasMore) return null;
  return (
    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
      <ActivityIndicator size="small" color={colors.neonPurple} />
    </View>
  );
});

ListFooter.displayName = 'ListFooter';

export default function FeedScreen() {
  useAnalyticsScreen(AnalyticsScreens.FEED);

  const {
    posts,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    refresh,
    loadMore,
    toggleLike,
  } = useFeed();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PostEntity>) => (
      <PostCard post={item} onLike={toggleLike} />
    ),
    [toggleLike],
  );

  const keyExtractor = useCallback((item: PostEntity) => item.id, []);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  // Initial loading state (no posts yet)
  if (isLoading && posts.length === 0 && !error) {
    return (
      <ScreenLayout>
        <LoadingIndicator />
      </ScreenLayout>
    );
  }

  // Error state with no data to show
  if (error && posts.length === 0) {
    return (
      <ScreenLayout>
        <ErrorView message={error} onRetry={refresh} />
      </ScreenLayout>
    );
  }

  const ListHeaderComponent = useCallback(
    () => (
      <View style={{ paddingTop: 16, paddingBottom: 8 }}>
        <AppText
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.textWhite,
          }}
        >
          Feed
        </AppText>
        <AppText
          style={{
            fontSize: 14,
            color: colors.textSlate400,
            marginTop: 4,
            marginBottom: 16,
          }}
        >
          See what the community is sharing
        </AppText>
      </View>
    ),
    [],
  );

  return (
    <ScreenLayout>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={<EmptyState />}
        ListFooterComponent={
          <ListFooter isLoading={isLoading} hasMore={hasMore} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onRefresh={refresh}
        refreshing={isRefreshing}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      />
    </ScreenLayout>
  );
}
