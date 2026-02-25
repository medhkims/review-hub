import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useWishlist } from '../hooks/useWishlist';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { WishlistItemEntity } from '@/domain/wishlist/entities/wishlistItemEntity';

const NEON_PURPLE = '#A855F7';

// ─── Wishlist Card ────────────────────────────────────────────────────────────

interface WishlistCardProps {
  item: WishlistItemEntity;
  onRemove: (itemId: string) => void;
  onReview: (item: WishlistItemEntity) => void;
}

const WishlistCard = React.memo(({ item, onRemove, onReview }: WishlistCardProps) => {
  return (
    <View
      className="bg-card-dark rounded-xl p-2.5 flex-row gap-3 mb-3 border border-border-dark/30 items-center"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Place image */}
      <View className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0">
        {item.placeImageUrl ? (
          <Image
            source={{ uri: item.placeImageUrl }}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityLabel={item.placeName}
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-slate-700">
            <MaterialCommunityIcons name="store" size={28} color="#64748B" />
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 min-w-0 gap-0.5">
        <AppText
          className="text-sm font-bold text-white leading-tight"
          numberOfLines={1}
        >
          {item.placeName}
        </AppText>

        {/* Rating row */}
        <View className="flex-row items-center gap-1">
          <MaterialCommunityIcons name="star" size={12} color="#FBBF24" />
          <AppText className="text-xs font-bold text-white">{item.rating.toFixed(1)}</AppText>
          <AppText className="text-xs text-slate-400">({item.reviewCount})</AppText>
        </View>

        {/* Location row */}
        <View className="flex-row items-start gap-0.5">
          <MaterialCommunityIcons
            name="map-marker"
            size={12}
            color="#64748B"
            style={{ marginTop: 1 }}
          />
          <AppText className="text-xs text-slate-400 flex-1" numberOfLines={2}>
            {item.location}
          </AppText>
        </View>
      </View>

      {/* Action button */}
      <Pressable
        onPress={() => onReview(item)}
        onLongPress={() => onRemove(item.id)}
        className="w-[50px] h-[50px] rounded-lg items-center justify-center shrink-0"
        style={{
          backgroundColor: NEON_PURPLE,
          shadowColor: NEON_PURPLE,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 6,
        }}
        accessibilityLabel={`Review ${item.placeName}`}
        accessibilityRole="button"
        accessibilityHint="Long press to remove from wishlist"
      >
        <MaterialCommunityIcons name="bookmark" size={18} color="#FFFFFF" />
        <AppText className="text-white leading-none mt-0.5" style={{ fontSize: 8 }}>
          Review
        </AppText>
      </Pressable>
    </View>
  );
});

WishlistCard.displayName = 'WishlistCard';

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <MaterialCommunityIcons name="heart-off-outline" size={64} color="#334155" />
      <AppText className="text-white font-bold text-lg mt-4 text-center">
        {t('wishlist.empty')}
      </AppText>
      <AppText className="text-slate-400 text-sm mt-2 text-center leading-relaxed">
        {t('wishlist.emptyDescription')}
      </AppText>
    </View>
  );
};

// ─── WishlistScreen ───────────────────────────────────────────────────────────

export default function WishlistScreen() {
  useAnalyticsScreen(AnalyticsScreens.WISHLIST);
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();

  const { items, isLoading, error, removeFromWishlist } = useWishlist(user?.id);

  const handleRemove = useCallback(
    (itemId: string) => {
      if (!user?.id) return;
      removeFromWishlist(user.id, itemId);
    },
    [user?.id, removeFromWishlist]
  );

  const handleReview = useCallback((_item: WishlistItemEntity) => {
    // TODO: navigate to place details / review screen when available
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<WishlistItemEntity>) => (
      <WishlistCard item={item} onRemove={handleRemove} onReview={handleReview} />
    ),
    [handleRemove, handleReview]
  );

  const keyExtractor = useCallback((item: WishlistItemEntity) => item.id, []);

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="px-6 pt-3 pb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="p-1 rounded-full bg-slate-800/30 active:bg-slate-800/50"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
        </Pressable>
        <AppText className="text-white font-semibold" style={{ fontSize: 17 }}>
          {t('wishlist.title')}
        </AppText>
        <View className="w-8" />
      </View>

      {/* Neon heart hero */}
      <View className="items-center py-6">
        <View className="relative">
          {/* Glow blur layer */}
          <View
            className="absolute rounded-full bg-neon-purple/20"
            style={{
              width: 120,
              height: 120,
              top: -12,
              left: -12,
            }}
          />
          {/* Icon container */}
          <View
            className="w-24 h-24 rounded-full border border-neon-purple/50 bg-midnight items-center justify-center"
            style={{
              shadowColor: NEON_PURPLE,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <MaterialCommunityIcons name="heart" size={40} color={NEON_PURPLE} />
          </View>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={NEON_PURPLE} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#64748B" />
          <AppText className="text-slate-400 text-sm mt-3 text-center">{error}</AppText>
        </View>
      ) : (
        <View className="flex-1 px-5">
          {/* Section header */}
          {items.length > 0 && (
            <View className="flex-row items-center justify-between mb-5 px-1">
              <AppText className="text-xl font-bold text-white tracking-tight">
                {t('wishlist.allResults')}
              </AppText>
              <Pressable
                className="p-2 rounded-lg bg-card-dark border border-border-dark/50"
                accessibilityLabel="Filter wishlist"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="tune" size={20} color={NEON_PURPLE} />
              </Pressable>
            </View>
          )}

          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={<EmptyState />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
          />
        </View>
      )}
    </ScreenLayout>
  );
}
