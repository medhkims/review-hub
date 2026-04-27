import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  ListRenderItemInfo,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { SortBySheet, SortOption } from '@/presentation/shared/components/SortBySheet';
import { FilterBySheet, FilterState, DEFAULT_FILTER_STATE } from '@/presentation/shared/components/FilterBySheet';
import { LocationFilterSheet, LocationFilter } from '@/presentation/shared/components/LocationFilterSheet';
import { getMunicipalitiesForGovernorate } from '@/core/constants/tunisiaLocations';
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
          width: 44,
          height: 44,
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

// ─── Location Sheet ───────────────────────────────────────────────────────────

interface LocationSheetProps {
  visible: boolean;
  selectedFilter: LocationFilter;
  onClose: () => void;
  onApply: (filter: LocationFilter) => void;
}

const LocationSheet: React.FC<LocationSheetProps> = ({ visible, selectedFilter, onClose, onApply }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        onPress={onClose}
        accessibilityLabel={t('common.close')}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 40,
            paddingTop: 12,
            maxHeight: '85%',
            borderTopWidth: 1,
            borderColor: theme.border,
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: theme.textMuted,
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 20,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 24,
              marginBottom: 12,
            }}
          >
            <AppText style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>
              {t('wishlist.location')}
            </AppText>
            <Pressable onPress={onClose} accessibilityLabel={t('common.close')} accessibilityRole="button">
              <MaterialCommunityIcons name="close" size={24} color={theme.textSecondary} />
            </Pressable>
          </View>

          <LocationFilterSheet
            visible
            initialFilter={selectedFilter}
            onApply={(filter) => {
              onApply(filter);
              onClose();
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
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

  // ── Sheet visibility ─────────────────────────────────────────────────────
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  // ── Applied filter state ─────────────────────────────────────────────────
  const [sortOption, setSortOption] = useState<SortOption | null>(null);
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<LocationFilter>({ governorates: [], municipalities: [] });

  // ── Active indicators ─────────────────────────────────────────────────────
  const isSortActive = sortOption !== null;
  const isFilterActive = filterState.minRating > 0;
  const isLocationActive = selectedLocationFilter.governorates.length > 0 || selectedLocationFilter.municipalities.length > 0;

  // ── Derived list ─────────────────────────────────────────────────────────
  const displayedItems = useMemo(() => {
    let result = [...items];

    // Location filter — municipalities take priority over governorates
    if (selectedLocationFilter.municipalities.length > 0) {
      result = result.filter((item) => {
        const loc = item.location.toLowerCase();
        return selectedLocationFilter.municipalities.some((mun) => loc.includes(mun.toLowerCase()));
      });
    } else if (selectedLocationFilter.governorates.length > 0) {
      result = result.filter((item) => {
        const loc = item.location.toLowerCase();
        return selectedLocationFilter.governorates.some((gov) => {
          if (loc.includes(gov.toLowerCase())) return true;
          return getMunicipalitiesForGovernorate(gov).some((m) => loc.includes(m.toLowerCase()));
        });
      });
    }

    // Rating filter
    if (filterState.minRating > 0) {
      result = result.filter((item) => item.rating >= filterState.minRating);
    }

    // Sort
    switch (sortOption) {
      case 'top_rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'top_result':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'new_businesses':
        result.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
        break;
    }

    return result;
  }, [items, selectedLocationFilter, filterState, sortOption]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleRemove = useCallback(
    (itemId: string) => {
      if (!user?.id) return;
      removeFromWishlist(user.id, itemId);
    },
    [user?.id, removeFromWishlist],
  );

  const handlePress = useCallback(
    (item: WishlistItemEntity) => {
      router.push(`/(main)/(feed)/business/${item.placeId}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<WishlistItemEntity>) => (
      <WishlistCard item={item} onRemove={handleRemove} onPress={handlePress} />
    ),
    [handleRemove, handlePress],
  );

  const keyExtractor = useCallback((item: WishlistItemEntity) => item.id, []);

  // ── Pill style helper ─────────────────────────────────────────────────────
  const pillStyle = (active: boolean, pressed: boolean) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: active ? colors.neonPurple : theme.card,
    borderWidth: 1,
    borderColor: active ? colors.neonPurple : theme.border,
    opacity: pressed ? 0.7 : 1,
  });

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
            <View style={{ marginBottom: 16, paddingHorizontal: 4, gap: 10 }}>
              <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, letterSpacing: -0.3 }}>
                {t('wishlist.allResults')}
              </AppText>

              {/* Pill buttons */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {/* Sort by */}
                <Pressable
                  onPress={() => setSortOpen(true)}
                  style={({ pressed }) => pillStyle(isSortActive, pressed)}
                  accessibilityLabel={t('wishlist.sortBy')}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons name="sort" size={14} color={isSortActive ? '#fff' : colors.neonPurple} />
                  <AppText style={{ fontSize: 12, fontWeight: '600', color: isSortActive ? '#fff' : theme.text }}>
                    {t('wishlist.sortBy')}
                  </AppText>
                </Pressable>

                {/* Filter */}
                <Pressable
                  onPress={() => setFilterOpen(true)}
                  style={({ pressed }) => pillStyle(isFilterActive, pressed)}
                  accessibilityLabel={t('wishlist.filter')}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons name="tune" size={14} color={isFilterActive ? '#fff' : colors.neonPurple} />
                  <AppText style={{ fontSize: 12, fontWeight: '600', color: isFilterActive ? '#fff' : theme.text }}>
                    {t('wishlist.filter')}
                  </AppText>
                </Pressable>

                {/* Location */}
                <Pressable
                  onPress={() => setLocationOpen(true)}
                  style={({ pressed }) => pillStyle(isLocationActive, pressed)}
                  accessibilityLabel={t('wishlist.location')}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons name="map-marker-outline" size={14} color={isLocationActive ? '#fff' : colors.neonPurple} />
                  <AppText style={{ fontSize: 12, fontWeight: '600', color: isLocationActive ? '#fff' : theme.text }}>
                    {t('wishlist.location')}
                  </AppText>
                </Pressable>
              </View>
            </View>
          )}

          <FlatList
            data={displayedItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={<EmptyState />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              displayedItems.length === 0 ? { flex: 1 } : { paddingBottom: 100 }
            }
          />
        </View>
      )}

      {/* ── Bottom Sheets ── */}
      <SortBySheet
        visible={sortOpen}
        initialValue={sortOption}
        onClose={() => setSortOpen(false)}
        onApply={(opt) => {
          setSortOption(opt);
          setSortOpen(false);
        }}
      />

      <FilterBySheet
        visible={filterOpen}
        initialFilters={filterState}
        showCategories={false}
        onClose={() => setFilterOpen(false)}
        onApply={(filters) => {
          setFilterState(filters);
          setFilterOpen(false);
        }}
      />

      <LocationSheet
        visible={locationOpen}
        selectedFilter={selectedLocationFilter}
        onClose={() => setLocationOpen(false)}
        onApply={(filter) => setSelectedLocationFilter(filter)}
      />
    </ScreenLayout>
  );
}
