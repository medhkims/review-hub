import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  ListRenderItemInfo,
  StyleSheet,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useWishlist } from '../hooks/useWishlist';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { WishlistItemEntity } from '@/domain/wishlist/entities/wishlistItemEntity';

const NEON_PURPLE = '#A855F7';
const MIDNIGHT = '#0F172A';
const CARD_BG = '#1E293B';
const BORDER = '#334155';

// ─── Wishlist Card ────────────────────────────────────────────────────────────

interface WishlistCardProps {
  item: WishlistItemEntity;
  onRemove: (itemId: string) => void;
  onPress: (item: WishlistItemEntity) => void;
}

const WishlistCard = React.memo(({ item, onRemove, onPress }: WishlistCardProps) => {
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}
      accessibilityLabel={`View ${item.placeName}`}
      accessibilityRole="button"
    >
      {/* Place image */}
      <View style={styles.imageContainer}>
        {item.placeImageUrl ? (
          <Image
            source={{ uri: item.placeImageUrl }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={item.placeName}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name="store" size={24} color="#64748B" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.placeName} numberOfLines={1}>
          {item.placeName}
        </Text>

        {/* Rating row */}
        <View style={styles.ratingRow}>
          <MaterialCommunityIcons name="star" size={10} color="#FBBF24" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCountText}>({item.reviewCount})</Text>
        </View>

        {/* Location row */}
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={10} color="#64748B" style={{ marginTop: 1 }} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      </View>

      {/* Heart / remove button */}
      <Pressable
        onPress={() => onRemove(item.id)}
        style={({ pressed }) => [styles.heartButton, pressed && { opacity: 0.7 }]}
        accessibilityLabel={`Remove ${item.placeName} from wishlist`}
        accessibilityRole="button"
        hitSlop={6}
      >
        <MaterialCommunityIcons name="heart" size={20} color="#FFFFFF" />
      </Pressable>
    </Pressable>
  );
});

WishlistCard.displayName = 'WishlistCard';

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="heart-off-outline" size={64} color="#334155" />
      <Text style={styles.emptyTitle}>{t('wishlist.empty')}</Text>
      <Text style={styles.emptyDesc}>{t('wishlist.emptyDescription')}</Text>
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

  const handlePress = useCallback(
    (item: WishlistItemEntity) => {
      router.push(`/(main)/(feed)/business/${item.placeId}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<WishlistItemEntity>) => (
      <WishlistCard item={item} onRemove={handleRemove} onPress={handlePress} />
    ),
    [handleRemove, handlePress]
  );

  const keyExtractor = useCallback((item: WishlistItemEntity) => item.id, []);

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { backgroundColor: '#1E293B' }]}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('wishlist.title')}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Heart hero */}
      <View style={styles.heroContainer}>
        <View style={styles.heroCircle}>
          <MaterialCommunityIcons name="heart" size={40} color={NEON_PURPLE} />
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={NEON_PURPLE} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#64748B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          {/* Section header */}
          {items.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('wishlist.allResults')}</Text>
              <Pressable
                style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.7 }]}
                accessibilityLabel="Filter wishlist"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="tune" size={18} color={NEON_PURPLE} />
              </Pressable>
            </View>
          )}

          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={<EmptyState />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              items.length === 0 ? { flex: 1 } : { paddingBottom: 100 }
            }
          />
        </View>
      )}
    </ScreenLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(30,41,59,0.5)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Hero
  heroContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(168,85,247,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section header
  listWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  filterButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.3)',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
  },
  infoContainer: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  placeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewCountText: {
    fontSize: 9,
    color: '#94A3B8',
    marginLeft: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  locationText: {
    fontSize: 9,
    color: '#94A3B8',
    flex: 1,
    lineHeight: 13,
  },

  // Heart button
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: NEON_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: NEON_PURPLE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // States
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
