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
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { WishlistItemEntity } from '@/domain/wishlist/entities/wishlistItemEntity';

// ─── Wishlist Card ────────────────────────────────────────────────────────────

interface WishlistCardProps {
  item: WishlistItemEntity;
  onRemove: (itemId: string) => void;
  onPress: (item: WishlistItemEntity) => void;
}

const WishlistCard = React.memo(({ item, onRemove, onPress }: WishlistCardProps) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
        opacity: pressed ? 0.75 : 1,
      })}
      accessibilityLabel={`View ${item.placeName}`}
      accessibilityRole="button"
    >
      {/* Place image */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: theme.card,
          flexShrink: 0,
        }}
      >
        {item.placeImageUrl ? (
          <Image
            source={{ uri: item.placeImageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            accessibilityLabel={item.placeName}
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.border,
            }}
          >
            <MaterialCommunityIcons name="store" size={24} color={theme.textMuted} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <AppText
          style={{ fontSize: 13, fontWeight: '700', color: theme.text, lineHeight: 18 }}
          numberOfLines={1}
        >
          {item.placeName}
        </AppText>

        {/* Rating row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name="star" size={10} color={colors.ratingGold} />
          <AppText style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>
            {item.rating.toFixed(1)}
          </AppText>
          <AppText style={{ fontSize: 9, color: theme.textSecondary, marginLeft: 2 }}>
            ({item.reviewCount})
          </AppText>
        </View>

        {/* Location row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
          <MaterialCommunityIcons name="map-marker" size={10} color={theme.textMuted} style={{ marginTop: 1 }} />
          <AppText
            style={{ fontSize: 9, color: theme.textSecondary, flex: 1, lineHeight: 13 }}
            numberOfLines={1}
          >
            {item.location}
          </AppText>
        </View>
      </View>

      {/* Heart / remove button */}
      <Pressable
        onPress={() => onRemove(item.id)}
        style={({ pressed }) => ({
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: colors.neonPurple,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          shadowColor: colors.neonPurple,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
          opacity: pressed ? 0.7 : 1,
        })}
        accessibilityLabel={`Remove ${item.placeName} from wishlist`}
        accessibilityRole="button"
        hitSlop={6}
      >
        <MaterialCommunityIcons name="heart" size={20} color={colors.textWhite} />
      </Pressable>
    </Pressable>
  );
});

WishlistCard.displayName = 'WishlistCard';

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => {
  const { t } = useTranslation();
  const theme = useTheme();
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
      <MaterialCommunityIcons name="heart-off-outline" size={64} color={theme.textMuted} />
      <AppText
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: theme.text,
          marginTop: 16,
          textAlign: 'center',
        }}
      >
        {t('wishlist.empty')}
      </AppText>
      <AppText
        style={{
          fontSize: 14,
          color: theme.textSecondary,
          marginTop: 8,
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
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
  const theme = useTheme();
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 16,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            padding: 4,
            borderRadius: 20,
            backgroundColor: theme.isDark ? 'rgba(30,41,59,0.5)' : 'rgba(148,163,184,0.2)',
            opacity: pressed ? 0.7 : 1,
          })}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.text} />
        </Pressable>
        <AppText style={{ fontSize: 17, fontWeight: '600', color: theme.text }}>
          {t('wishlist.title')}
        </AppText>
        <View style={{ width: 32 }} />
      </View>

      {/* Heart hero */}
      <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 24 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(168,85,247,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="heart" size={40} color={colors.neonPurple} />
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.textMuted} />
          <AppText style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginTop: 12 }}>
            {error}
          </AppText>
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {/* Section header */}
          {items.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                paddingHorizontal: 4,
              }}
            >
              <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, letterSpacing: -0.3 }}>
                {t('wishlist.allResults')}
              </AppText>
              <Pressable
                style={({ pressed }) => ({
                  padding: 6,
                  borderRadius: 8,
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                })}
                accessibilityLabel="Filter wishlist"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="tune" size={18} color={colors.neonPurple} />
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
